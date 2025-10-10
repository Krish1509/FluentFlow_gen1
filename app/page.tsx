"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// TypeScript declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  BarChart3, 
  MessageSquare,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Menu,
  X,
  PanelRightClose,
  PanelRightOpen,
  Phone
} from "lucide-react";

// Import your existing components
import { AvatarConfig } from "@/components/AvatarConfig";
import { AvatarVideo } from "@/components/AvatarSession/AvatarVideo";
import { AvatarControls } from "@/components/AvatarSession/AvatarControls";
import { MessageHistory } from "@/components/AvatarSession/MessageHistory";
import { StreamingAvatarProvider, useStreamingAvatarContext } from "@/components/logic/context";
import { useStreamingAvatarSession } from "@/components/logic/useStreamingAvatarSession";
import { StartAvatarRequest, AvatarQuality, VoiceChatTransport } from "@heygen/streaming-avatar";

// Main App Component
function FluentFlowApp() {
  const [showConfig, setShowConfig] = useState(false);
  const [showMessages, setShowMessages] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showUserVideo, setShowUserVideo] = useState(false);
  const [currentMode, setCurrentMode] = useState<'gemini-chat' | 'avatar-chat'>('gemini-chat');
  const [autoStartAttempted, setAutoStartAttempted] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);

  // Theme management
  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('fluentflow-theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    
    // Save to localStorage
    localStorage.setItem('fluentflow-theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const getThemeIcon = () => {
    return theme === 'dark' ? '🌙' : '☀️';
  };

  const getThemeLabel = () => {
    return theme === 'dark' ? 'Dark' : 'Light';
  };
  
  
  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [talkMode, setTalkMode] = useState("voice");
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [asyncMode, setAsyncMode] = useState("realtime");
  const recognitionRef = useRef<any>(null);
  
  // Default avatar configuration
  const [avatarConfig, setAvatarConfig] = useState<StartAvatarRequest>({
    avatarName: "Ann_Therapist_public",
    language: "en",
    quality: AvatarQuality.High,
    voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  });

  // Auto-start avatar session when switching to avatar chat mode
  useEffect(() => {
    if (currentMode === 'avatar-chat' && !autoStartAttempted) {
      setAutoStartAttempted(true);
      // Small delay to ensure the component is mounted
      setTimeout(() => {
        const startButton = document.querySelector('[data-auto-start="true"]') as HTMLButtonElement;
        if (startButton) {
          startButton.click();
        }
      }, 500);
    } else if (currentMode === 'gemini-chat') {
      setAutoStartAttempted(false);
    }
  }, [currentMode, autoStartAttempted]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const fullText = finalTranscript || interimTranscript;
          setVoiceText(fullText);

          // Auto-send based on async mode setting
          if (asyncMode === "realtime" && finalTranscript) {
            handleVoiceSend(finalTranscript);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }
    }
  }, [asyncMode]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setVoiceText("");
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const handleVoiceSend = useCallback((text: string) => {
    if (text.trim()) {
      // Send to avatar or handle the text
      console.log('Sending voice text:', text);
      setVoiceText("");
      // You can integrate this with your avatar communication here
    }
  }, []);

  // Setup user video stream
  useEffect(() => {
    if (showUserVideo && userVideoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = stream;
          }
        })
        .catch(error => {
          console.error('Error accessing user video:', error);
        });
    }
  }, [showUserVideo]);

  return (
    <StreamingAvatarProvider>
      <div className="h-screen w-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white overflow-hidden flex flex-col transition-colors duration-300">
        {/* Top Navigation */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 p-4 shadow-lg transition-colors duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Zap className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  FluentFlow
                </h1>
                <p className="text-sm text-gray-400">AI Communication Coach</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Dark Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cycleTheme}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-200 flex items-center space-x-2"
                title={`Current theme: ${getThemeLabel()}`}
              >
                <span className="text-lg">{getThemeIcon()}</span>
                <span className="text-xs font-medium">{getThemeLabel()}</span>
              </motion.button>

              {/* Sidebar Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-200"
                title="Toggle Sidebar"
              >
                <BarChart3 className="w-5 h-5" />
              </motion.button>

              {/* Mute Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isMuted 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-80px)]">
          {/* Sidebar */}
          <AnimatePresence>
            {showSidebar && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="w-80 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 shadow-xl flex flex-col fixed lg:relative h-full z-30 transition-colors duration-300"
              >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Communication Modes</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Choose your interaction style</p>
                </div>

                {/* Mode Selection */}
                <div className="p-4 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentMode('gemini-chat')}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                      currentMode === 'gemini-chat'
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30'
                        : 'bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        currentMode === 'gemini-chat' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <MessageSquare className="w-5 h-5 text-gray-700 dark:text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">FluentFlow Chat</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Text conversation with AI</p>
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentMode('avatar-chat')}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                      currentMode === 'avatar-chat'
                        ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30'
                        : 'bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        currentMode === 'avatar-chat' 
                          ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <Video className="w-5 h-5 text-gray-700 dark:text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Live Call with Avatar</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Real-time avatar communication</p>
                      </div>
                    </div>
                  </motion.button>
                </div>

                {/* Avatar Configuration */}
                {currentMode === 'avatar-chat' && (
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4 flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Avatar Settings
                      </h3>
                      
                      {/* Avatar Selection */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block font-medium">Choose Avatar</label>
                          <select 
                            value={avatarConfig.avatarName}
                            onChange={(e) => setAvatarConfig({...avatarConfig, avatarName: e.target.value})}
                            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          >
                            <option value="Ann_Therapist_public">👩‍⚕️ Ann Therapist</option>
                            <option value="Shawn_Therapist_public">👨‍⚕️ Shawn Therapist</option>
                            <option value="Bryan_FitnessCoach_public">💪 Bryan Fitness Coach</option>
                            <option value="Dexter_Doctor_Standing2_public">👨‍⚕️ Dexter Doctor</option>
                            <option value="Elenora_IT_Sitting_public">👩‍💻 Elenora Tech Expert</option>
                          </select>
                        </div>
                        
                        {/* Language Selection */}
                        <div>
                          <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block font-medium">Language</label>
                          <select 
                            value={avatarConfig.language}
                            onChange={(e) => setAvatarConfig({...avatarConfig, language: e.target.value})}
                            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          >
                            <option value="en">🇺🇸 English</option>
                            <option value="es">🇪🇸 Spanish</option>
                            <option value="fr">🇫🇷 French</option>
                            <option value="de">🇩🇪 German</option>
                            <option value="zh">🇨🇳 Chinese</option>
                            <option value="ja">🇯🇵 Japanese</option>
                            <option value="ko">🇰🇷 Korean</option>
                            <option value="hi">🇮🇳 Hindi</option>
                          </select>
                        </div>

                        {/* Quality Selection */}
                        <div>
                          <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block font-medium">Video Quality</label>
                          <select 
                            value={avatarConfig.quality}
                            onChange={(e) => setAvatarConfig({...avatarConfig, quality: e.target.value as any})}
                            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          >
                            <option value="High">🟢 High Quality</option>
                            <option value="Medium">🟡 Medium Quality</option>
                            <option value="Low">🔴 Low Quality</option>
                          </select>
                        </div>

                        {/* Connection Status */}
                        <div className="p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Connection Status</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-400">Ready</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Session Controls */}
                {currentMode === 'avatar-chat' && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <AvatarSessionManager />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Sidebar Overlay */}
          {showSidebar && (
            <div 
              className="fixed inset-0 bg-gray-200/50 dark:bg-black/50 backdrop-blur-sm z-20 lg:hidden"
              onClick={() => setShowSidebar(false)}
            />
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {currentMode === 'gemini-chat' ? (
              <GeminiChatMode />
            ) : (
              <AvatarChatMode 
                videoRef={videoRef} 
                userVideoRef={userVideoRef}
                showMessages={showMessages} 
                setShowMessages={setShowMessages}
                isListening={isListening}
                isRealTimeMode={isRealTimeMode}
                setIsRealTimeMode={setIsRealTimeMode}
                voiceText={voiceText}
                setVoiceText={setVoiceText}
                startListening={startListening}
                stopListening={stopListening}
                handleVoiceSend={handleVoiceSend}
                talkMode={talkMode}
                setTalkMode={setTalkMode}
                asyncMode={asyncMode}
                setAsyncMode={setAsyncMode}
                showUserVideo={showUserVideo}
                setShowUserVideo={setShowUserVideo}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                isVoiceChatActive={isVoiceChatActive}
                setIsVoiceChatActive={setIsVoiceChatActive}
                setCurrentMode={setCurrentMode}
                showSidebar={showSidebar}
                setShowSidebar={setShowSidebar}
                avatarConfig={avatarConfig}
              />
            )}
          </div>
        </div>
      </div>
    </StreamingAvatarProvider>
  );
}

// Connection Status Component
function ConnectionStatus() {
  const { sessionState, connectionQuality } = useStreamingAvatarContext();
  
  const getStatusColor = () => {
    switch (sessionState) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (sessionState) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      default: return 'Disconnected';
    }
  };

  return (
    <div className="absolute top-4 left-4 flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
      <span className="text-sm text-gray-900 dark:text-white bg-white/80 dark:bg-black/50 px-2 py-1 rounded">
        {getStatusText()}
      </span>
      {connectionQuality !== 'UNKNOWN' && (
        <span className="text-xs text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-black/50 px-2 py-1 rounded">
          {connectionQuality}
        </span>
      )}
    </div>
  );
}

// Avatar Status Overlay Component
function AvatarStatusOverlay() {
  const { isUserTalking, isAvatarTalking, isListening } = useStreamingAvatarContext();

  return (
    <div className="absolute top-4 right-4 flex flex-col space-y-2">
      {isListening && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span>Listening</span>
        </motion.div>
      )}
      
      {isUserTalking && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span>You're speaking</span>
        </motion.div>
      )}
      
      {isAvatarTalking && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-purple-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span>Avatar speaking</span>
        </motion.div>
      )}
    </div>
  );
}

// Avatar Welcome Message Component
function AvatarWelcomeMessage() {
  const { sessionState } = useStreamingAvatarContext();

  if (sessionState === 'connected') return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50 dark:bg-black/50 backdrop-blur-sm">
      <div className="text-center p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          {sessionState === 'connecting' ? (
            <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Video className="w-10 h-10 text-white" />
          )}
        </motion.div>
        
        <h3 className="text-2xl font-bold text-white mb-3">
          {sessionState === 'connecting' ? 'Connecting...' : 'Starting Avatar...'}
        </h3>
        
        <p className="text-gray-300 mb-6 max-w-md">
          {sessionState === 'connecting' 
            ? 'Setting up your AI communication coach...' 
            : 'Initializing avatar session...'
          }
        </p>
        
        {sessionState === 'connecting' && (
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        )}
      </div>
    </div>
  );
}

// Gemini Chat Mode Component
function GeminiChatMode() {
  const [messages, setMessages] = useState<Array<{id: string, type: 'user' | 'ai', text: string, timestamp: Date}>>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      text: inputText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        text: data.reply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100/50 dark:bg-gray-900/50 transition-colors duration-300">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Start a Conversation</h2>
            <p className="text-gray-400">Chat with FluentFlow for communication practice</p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              message.type === 'user' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                : 'bg-gray-800 text-white'
            }`}>
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <span className="text-sm text-gray-400 ml-2">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={loading || !inputText.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Send
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// Avatar Chat Mode Component
function AvatarChatMode({ 
  videoRef, 
  userVideoRef,
  showMessages, 
  setShowMessages,
  isListening,
  isRealTimeMode,
  setIsRealTimeMode,
  voiceText,
  setVoiceText,
  startListening,
  stopListening,
  handleVoiceSend,
  talkMode,
  setTalkMode,
  asyncMode,
  setAsyncMode,
  showUserVideo,
  setShowUserVideo,
  isMuted,
  setIsMuted,
  isVoiceChatActive,
  setIsVoiceChatActive,
  setCurrentMode,
  showSidebar,
  setShowSidebar,
  avatarConfig
}: { 
  videoRef: React.RefObject<HTMLVideoElement | null>, 
  userVideoRef: React.RefObject<HTMLVideoElement | null>,
  showMessages: boolean, 
  setShowMessages: (show: boolean) => void,
  isListening: boolean,
  isRealTimeMode: boolean,
  setIsRealTimeMode: (mode: boolean) => void,
  voiceText: string,
  setVoiceText: (text: string) => void,
  startListening: () => void,
  stopListening: () => void,
  handleVoiceSend: (text: string) => void,
  talkMode: string,
  setTalkMode: (mode: string) => void,
  asyncMode: string,
  setAsyncMode: (mode: string) => void,
  showUserVideo: boolean,
  setShowUserVideo: (show: boolean) => void,
  isMuted: boolean,
  setIsMuted: (muted: boolean) => void,
  isVoiceChatActive: boolean,
  setIsVoiceChatActive: (active: boolean) => void,
  setCurrentMode: (mode: 'gemini-chat' | 'avatar-chat') => void,
  showSidebar: boolean,
  setShowSidebar: (show: boolean) => void,
  avatarConfig: StartAvatarRequest
}) {
  return (
    <div className="flex-1 flex bg-gray-100 dark:bg-black min-h-0 overflow-hidden relative transition-colors duration-300">
      {/* Main Avatar Video - Full Screen */}
      <div className="flex-1 relative">
        <AvatarVideo ref={videoRef} />
        
        {/* Connection Status */}
        <ConnectionStatus />
        
        {/* Avatar Status Overlay */}
        <AvatarStatusOverlay />
        
        {/* Welcome Message when not connected */}
        <AvatarWelcomeMessage />

        {/* User Video - Picture in Picture */}
        {showUserVideo && (
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 dark:bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-white/20 transition-colors duration-300">
            <video
              ref={userVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Video Controls Overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
          {/* User Video Toggle */}
          <button
            onClick={() => setShowUserVideo(!showUserVideo)}
            className={`p-3 rounded-full transition-all duration-200 ${
              showUserVideo 
                ? 'bg-gray-700/80 hover:bg-gray-600/80' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {showUserVideo ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
          </button>

          {/* End Call */}
          <button
            onClick={() => {
              // Stop avatar session
              setIsVoiceChatActive(false);
              setIsMuted(true);
              // Stop the actual avatar session
              const stopButton = document.querySelector('[data-stop-avatar="true"]') as HTMLButtonElement;
              if (stopButton) {
                stopButton.click();
              }
              // Switch back to gemini chat
              setCurrentMode('gemini-chat');
            }}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200"
          >
            <Phone className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Right Side - Options Panel */}
      <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm min-h-0 hidden lg:flex flex-col transition-colors duration-300">
        {/* Panel Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Options</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avatar settings & controls</p>
          </div>
        </div>

        {/* Chat Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <AvatarControls />
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <MessageHistory />
        </div>

      </div>

      {/* Mobile Conversation Toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMessages(!showMessages)}
          className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
        >
          <MessageSquare className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Mobile Conversation Panel */}
      {showMessages && (
        <div className="lg:hidden fixed inset-0 bg-gray-200/50 dark:bg-black/50 backdrop-blur-sm z-40">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl max-h-[70vh] flex flex-col transition-colors duration-300"
          >
            {/* Mobile Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Chat</h3>
              <button
                onClick={() => setShowMessages(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Mobile Chat Controls */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <AvatarControls />
            </div>

            {/* Mobile Message History */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              <MessageHistory />
            </div>

          </motion.div>
        </div>
      )}
    </div>
  );
}

// Avatar Session Manager Component
function AvatarSessionManager() {
  const { sessionState, startAvatar, stopAvatar } = useStreamingAvatarSession();
  const [isStarting, setIsStarting] = useState(false);
  const [config, setConfig] = useState<StartAvatarRequest>({
    avatarName: "Ann_Therapist_public",
    language: "en",
    quality: AvatarQuality.High,
    voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  });

  const handleStart = async () => {
    setIsStarting(true);
    try {
      console.log('Starting avatar session with config:', config);
      // Get access token from your API
      const response = await fetch('/api/get-access-token', { method: 'POST' });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Access token API error:', response.status, errorText);
        throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
      }
      const token = await response.text();
      console.log('Got token, starting avatar...', token.substring(0, 50) + '...');
      console.log('Full token length:', token.length);
      console.log('Avatar config being sent:', JSON.stringify(config, null, 2));
      
      // Try to decode the token to see if it's valid
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        console.log('Decoded token payload:', decodedToken);
      } catch (e) {
        console.log('Token is not a JWT, raw token:', token);
      }
      
      const avatar = await startAvatar(config, token);
      console.log('Avatar started successfully:', avatar);
    } catch (error: unknown) {
      console.error('Failed to start avatar:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('Failed to start avatar session. Please check your API key and try again. Error: ' + errorMessage);
    } finally {
      setIsStarting(false);
    }
  };

  const getButtonText = () => {
    if (isStarting) return 'Starting...';
    if (sessionState === 'connecting') return 'Connecting...';
    if (sessionState === 'connected') return 'Stop Session';
    return 'Start Session';
  };

  const getButtonIcon = () => {
    if (isStarting || sessionState === 'connecting') {
      return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />;
    }
    if (sessionState === 'connected') {
      return <Pause className="w-4 h-4" />;
    }
    return <Play className="w-4 h-4" />;
  };

  const isDisabled = isStarting || sessionState === 'connecting';

  return (
    <div className="flex items-center space-x-2">
      <motion.button
        whileHover={{ scale: isDisabled ? 1 : 1.05 }}
        whileTap={{ scale: isDisabled ? 1 : 0.95 }}
        onClick={sessionState === 'connected' ? stopAvatar : handleStart}
        disabled={isDisabled}
        data-auto-start="true"
        data-stop-avatar={sessionState === 'connected' ? "true" : "false"}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          sessionState === 'connected'
            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
            : isDisabled
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
        }`}
      >
        {getButtonIcon()}
        <span>{getButtonText()}</span>
      </motion.button>
    </div>
  );
}

export default FluentFlowApp;