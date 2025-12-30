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
  Phone,
  Trophy,
  TrendingUp,
  User
} from "lucide-react";

// Import your existing components
import { AvatarConfig } from "@/components/AvatarConfig";
import { AvatarVideo } from "@/components/AvatarSession/AvatarVideo";
import { AvatarControls } from "@/components/AvatarSession/AvatarControls";
import { MessageHistory } from "@/components/AvatarSession/MessageHistory";
import { ConversationScenarios } from "@/components/ConversationScenarios";
import { PerformanceAnalytics } from "@/components/PerformanceAnalytics";
import { Achievements } from "@/components/Achievements";
import { UserProfileComponent, type UserProfile } from "@/components/UserProfile";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StreamingAvatarProvider, useStreamingAvatarContext } from "@/components/logic/context";
import { useStreamingAvatarSession } from "@/components/logic/useStreamingAvatarSession";
import { StartAvatarRequest, AvatarQuality, VoiceChatTransport } from "@heygen/streaming-avatar";
import { CONVERSATION_SCENARIOS, generatePersonalizedScenarios } from "@/app/lib/constants";

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

  // Load user profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('fluentflow-user-profile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    }
  }, []);

  const handleProfileSave = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('fluentflow-user-profile', JSON.stringify(profile));
  };
  
  
  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [talkMode, setTalkMode] = useState("voice");
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [asyncMode, setAsyncMode] = useState("realtime");
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [showScenarios, setShowScenarios] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
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
      // Auto-enable microphone for avatar chat
      setIsVoiceChatActive(true);
      // Use a more reliable approach - wait for the component to be ready
      const checkAndStart = () => {
        const startButton = document.querySelector('[data-auto-start="true"]') as HTMLButtonElement;
        if (startButton && !startButton.disabled) {
          startButton.click();
          return true;
        }
        return false;
      };

      // Try immediately
      if (!checkAndStart()) {
        // If not ready, try again after a short delay
        setTimeout(() => {
          if (!checkAndStart()) {
            // If still not ready, try one more time with longer delay
            setTimeout(checkAndStart, 1000);
          }
        }, 500);
      }
    } else if (currentMode === 'gemini-chat') {
      setAutoStartAttempted(false);
      setIsVoiceChatActive(false);
    }
  }, [currentMode, autoStartAttempted, setIsVoiceChatActive]);

  // Generate initial greeting for avatar based on profile and scenario
  const generateInitialGreeting = useCallback(() => {
    if (!userProfile || !selectedScenario) return null;

    let greeting = "";

    if (userProfile.name) {
      greeting += `Hello ${userProfile.name}! `;
    }

    greeting += `Welcome to our ${selectedScenario.name.toLowerCase()}. `;

    if (userProfile.nativeLanguage && userProfile.nativeLanguage !== 'English') {
      greeting += `I see you're a ${userProfile.nativeLanguage} speaker. `;
    }

    if (selectedScenario.category === 'Personal') {
      greeting += `I'm here to help you practice ${selectedScenario.learningGoals?.[0] || 'communication skills'}. `;
    } else if (selectedScenario.category === 'Professional') {
      greeting += `Let's work on your ${selectedScenario.learningGoals?.[0] || 'professional communication'}. `;
    } else if (selectedScenario.category === 'Health') {
      greeting += `I'm here to assist you with ${selectedScenario.learningGoals?.[0] || 'health-related communication'}. `;
    }

    greeting += `I'm ${userProfile.communicationStyle?.toLowerCase() || 'friendly'} and ready to help you improve. How can I assist you today?`;

    return greeting;
  }, [userProfile, selectedScenario]);

  // Send initial greeting when avatar session starts with a scenario
  useEffect(() => {
    if (selectedScenario && userProfile && currentMode === 'avatar-chat') {
      const greeting = generateInitialGreeting();
      if (greeting) {
        // Small delay to ensure avatar is ready
        const timer = setTimeout(() => {
          // This would normally send to the avatar API
          console.log('Avatar would speak:', greeting);
          // In a real implementation, you'd send this to the avatar service
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  }, [selectedScenario, userProfile, currentMode, generateInitialGreeting]);

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

  const handleScenarioSelect = useCallback((scenario: any) => {
    setSelectedScenario(scenario);
    // Auto-select the appropriate avatar for the scenario
    if (scenario.avatar) {
      setAvatarConfig(prev => ({ ...prev, avatarName: scenario.avatar }));
    }
    setShowScenarios(false);
    // Switch to avatar chat mode and auto-start session
    if (currentMode !== 'avatar-chat') {
      setCurrentMode('avatar-chat');
    }
    // Auto-enable voice chat for scenarios
    setIsVoiceChatActive(true);
    // Reset auto-start flag to trigger new session
    setAutoStartAttempted(false);
  }, [currentMode, setIsVoiceChatActive]);

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
    <ErrorBoundary>
      <StreamingAvatarProvider>
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white overflow-x-hidden flex flex-col transition-all duration-500">
        {/* Top Navigation */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative bg-gradient-to-r from-white/95 via-white/90 to-white/95 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95 backdrop-blur-3xl border-b border-gray-200/30 dark:border-gray-700/30 px-6 py-4 shadow-2xl transition-all duration-500 overflow-hidden"
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Subtle animated border */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
            animate={{
              backgroundPosition: ["-200% 0", "200% 0"],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          <div className="relative flex items-center justify-between max-w-7xl mx-auto">
            <motion.div
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Enhanced logo with multiple layers */}
              <motion.div
                className="relative"
                animate={{
                  rotate: [0, 3, -3, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatDelay: 8
                }}
              >
                {/* Outer glow ring */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-2xl opacity-60 blur-xl scale-110"></div>

                {/* Main logo container */}
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden">
                  {/* Animated inner gradient */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 rounded-2xl"
                    animate={{
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />

                  {/* Inner glow */}
                  <div className="absolute inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>

                  {/* Icon */}
                  <Zap className="w-6 h-6 text-white relative z-10 drop-shadow-lg" />
                </div>
              </motion.div>

              {/* Enhanced title section */}
              <div className="hidden sm:block">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                    FluentFlow
                  </h1>
                  <motion.p
                    className="text-sm text-gray-600 dark:text-gray-400 font-medium tracking-wide"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {userProfile?.name ? `✨ Welcome back, ${userProfile.name}!` : '🚀 Your AI Communication Coach'}
                  </motion.p>
                </motion.div>
              </div>

              {/* Mobile Title */}
              <div className="sm:hidden">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                    FluentFlow
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {userProfile?.name ? `✨ ${userProfile.name}` : '🚀 AI Coach'}
                  </p>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* User Profile Button */}
              <div className="relative">
                <motion.button
                  whileHover={{
                    scale: 1.08,
                    rotate: [0, -3, 3, 0],
                    boxShadow: "0 20px 25px -5px rgba(34, 197, 94, 0.3), 0 10px 10px -5px rgba(34, 197, 94, 0.2)"
                  }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setShowUserProfile(true)}
                  className="relative p-3 rounded-2xl bg-gradient-to-br from-green-500/25 to-teal-500/25 hover:from-green-500/35 hover:to-teal-500/35 text-green-400 hover:text-green-300 transition-all duration-500 border border-green-500/40 hover:border-green-500/60 shadow-lg hover:shadow-2xl backdrop-blur-sm group overflow-hidden"
                  title="Personalize Your Experience"
                >
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <User className="w-5 h-5 relative z-10" />
                </motion.button>

                {/* Enhanced profile indicator */}
                {userProfile && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-gray-900 shadow-lg"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, delay: 0.5 }}
                  >
                    <div className="absolute inset-0 bg-green-300 rounded-full animate-ping opacity-75"></div>
                    <div className="relative w-full h-full bg-green-400 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Dark Mode Toggle */}
              <motion.button
                whileHover={{
                  scale: 1.08,
                  rotate: [0, -3, 3, 0],
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                whileTap={{ scale: 0.92 }}
                onClick={cycleTheme}
                className="relative p-3 rounded-2xl bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-500 shadow-lg hover:shadow-2xl backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 group overflow-hidden"
                title={`Current theme: ${getThemeLabel()}`}
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 dark:from-blue-400/10 dark:to-purple-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <span className="text-lg relative z-10 transition-transform duration-300 group-hover:scale-110">
                  {getThemeIcon()}
                </span>
              </motion.button>

              {/* Achievements Button */}
              <motion.button
                whileHover={{
                  scale: 1.08,
                  rotate: [0, -3, 3, 0],
                  boxShadow: "0 20px 25px -5px rgba(245, 158, 11, 0.3), 0 10px 10px -5px rgba(245, 158, 11, 0.2)"
                }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setShowAchievements(true)}
                className="relative p-3 rounded-2xl bg-gradient-to-br from-yellow-500/25 to-orange-500/25 hover:from-yellow-500/35 hover:to-orange-500/35 text-yellow-400 hover:text-yellow-300 transition-all duration-500 border border-yellow-500/40 hover:border-yellow-500/60 shadow-lg hover:shadow-2xl backdrop-blur-sm group overflow-hidden"
                title="View Achievements"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <Trophy className="w-5 h-5 relative z-10" />
              </motion.button>

              {/* Analytics Button */}
              <motion.button
                whileHover={{
                  scale: 1.08,
                  rotate: [0, -3, 3, 0],
                  boxShadow: "0 20px 25px -5px rgba(147, 51, 234, 0.3), 0 10px 10px -5px rgba(147, 51, 234, 0.2)"
                }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setShowAnalytics(true)}
                className="relative p-3 rounded-2xl bg-gradient-to-br from-purple-500/25 to-pink-500/25 hover:from-purple-500/35 hover:to-pink-500/35 text-purple-400 hover:text-purple-300 transition-all duration-500 border border-purple-500/40 hover:border-purple-500/60 shadow-lg hover:shadow-2xl backdrop-blur-sm group overflow-hidden"
                title="View Performance Analytics"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <TrendingUp className="w-5 h-5 relative z-10" />
              </motion.button>

              {/* Sidebar Toggle */}
              <motion.button
                whileHover={{
                  scale: 1.1,
                  rotate: [0, -4, 4, -3, 3, 0],
                  boxShadow: showSidebar
                    ? "0 20px 25px -5px rgba(59, 130, 246, 0.4), 0 10px 10px -5px rgba(59, 130, 246, 0.3)"
                    : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setShowSidebar(!showSidebar)}
                className={`relative p-3 rounded-2xl transition-all duration-500 shadow-lg hover:shadow-2xl backdrop-blur-sm border group overflow-hidden ${
                  showSidebar
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white border-blue-400/60 shadow-blue-500/30'
                    : 'bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200/60 dark:border-gray-700/60'
                }`}
                title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
                animate={showSidebar ? {
                  boxShadow: [
                    "0 4px 6px -1px rgba(59, 130, 246, 0.2)",
                    "0 10px 15px -3px rgba(59, 130, 246, 0.2)",
                    "0 4px 6px -1px rgba(59, 130, 246, 0.2)"
                  ]
                } : {}}
                transition={{ duration: 2, repeat: showSidebar ? Infinity : 0 }}
              >
                {/* Button glow effect */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  showSidebar
                    ? 'bg-gradient-to-br from-blue-400/30 to-purple-400/30'
                    : 'bg-gradient-to-br from-gray-400/10 to-gray-500/10 dark:from-gray-600/10 dark:to-gray-500/10'
                }`}></div>

                <motion.div
                  animate={showSidebar ? { rotate: 180 } : { rotate: 0 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                  className="relative z-10"
                >
                  <BarChart3 className="w-5 h-5" />
                </motion.div>
              </motion.button>

              {/* Mute Toggle */}
              <motion.button
                whileHover={{
                  scale: 1.08,
                  rotate: [0, -3, 3, 0],
                  boxShadow: isMuted
                    ? "0 20px 25px -5px rgba(239, 68, 68, 0.3), 0 10px 10px -5px rgba(239, 68, 68, 0.2)"
                    : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsMuted(!isMuted)}
                className={`relative p-3 rounded-2xl transition-all duration-500 shadow-lg hover:shadow-2xl backdrop-blur-sm border group overflow-hidden ${
                  isMuted
                    ? 'bg-red-500/25 text-red-400 hover:bg-red-500/35 border-red-500/40 hover:border-red-500/60'
                    : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 border-gray-200/60 dark:border-gray-700/60'
                }`}
              >
                {/* Button glow effect */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  isMuted
                    ? 'bg-red-400/20'
                    : 'bg-gray-400/10 dark:bg-gray-600/10'
                }`}></div>

                <div className="relative z-10">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </div>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-120px)] lg:h-[calc(100vh-120px)] relative">
          {/* Sidebar */}
          <AnimatePresence>
            {showSidebar && (
              <motion.div
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-80 sm:w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-r border-gray-200/50 dark:border-gray-800/50 shadow-2xl flex flex-col fixed lg:relative h-full z-40 transition-all duration-500"
                style={{
                  boxShadow: showSidebar ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)' : undefined
                }}
              >
                {/* Sidebar drag handle for mobile */}
                <motion.div
                  className="lg:hidden w-12 h-1 bg-gradient-to-r from-transparent via-gray-400 dark:via-gray-500 to-transparent rounded-full mx-auto my-3 cursor-grab active:cursor-grabbing"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.1}
                  onDragEnd={(event, info) => {
                    if (info.offset.x < -50) {
                      setShowSidebar(false);
                    }
                  }}
                />
                {/* Sidebar Header */}
                <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-900/10 dark:to-purple-900/10 relative">
                  {/* Mobile close button */}
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="lg:hidden absolute top-4 right-4 p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="pr-12 lg:pr-0"
                  >
                    <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Communication Modes
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Choose your interaction style
                    </p>
                  </motion.div>
                </div>

                {/* Mode Selection */}
                <div className="p-4 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentMode('gemini-chat')}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 border backdrop-blur-sm ${
                      currentMode === 'gemini-chat'
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 shadow-lg shadow-blue-500/10'
                        : 'bg-gray-100/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-gray-200/80 dark:hover:bg-gray-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        currentMode === 'gemini-chat'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg'
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
                    onClick={() => {
                      setCurrentMode('avatar-chat');
                      setIsVoiceChatActive(true);
                    }}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 border backdrop-blur-sm ${
                      currentMode === 'avatar-chat'
                        ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/30 shadow-lg shadow-green-500/10'
                        : 'bg-gray-100/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-gray-200/80 dark:hover:bg-gray-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        currentMode === 'avatar-chat'
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 shadow-lg'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <Video className="w-5 h-5 text-gray-700 dark:text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Live Call with Avatar</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Real-time avatar communication</p>
                          </div>
                          {isVoiceChatActive && currentMode === 'avatar-chat' && (
                            <motion.div
                              className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 rounded-full border border-green-500/30"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                            >
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-xs font-medium text-green-400">Mic On</span>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                </div>

                {/* Scenario Selection */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowScenarios(!showScenarios)}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                      showScenarios
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                        : 'bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        showScenarios
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        🎭
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Practice Scenarios</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {selectedScenario ? selectedScenario.name : 'Choose a conversation scenario'}
                        </p>
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
                            <optgroup label="Professional & Therapeutic">
                              <option value="Ann_Therapist_public">👩‍⚕️ Ann Therapist - Professional counseling</option>
                              <option value="Shawn_Therapist_public">👨‍⚕️ Shawn Therapist - Mental health support</option>
                            </optgroup>
                            <optgroup label="Health & Fitness">
                              <option value="Bryan_FitnessCoach_public">💪 Bryan Fitness Coach - Motivational wellness</option>
                              <option value="Dexter_Doctor_Standing2_public">👨‍⚕️ Dexter Doctor - Medical consultations</option>
                            </optgroup>
                            <optgroup label="Technology & Business">
                              <option value="Elenora_IT_Sitting_public">👩‍💻 Elenora Tech Expert - Technical discussions</option>
                              <option value="Emma_public">👩‍💼 Emma Interviewer - HR & recruitment</option>
                            </optgroup>
                            <optgroup label="Communication & Education">
                              <option value="Anna_public">🎤 Anna Presenter - Public speaking</option>
                              <option value="Michael_public">👨‍🏫 Michael Professor - Academic discussions</option>
                            </optgroup>
                            <optgroup label="Customer Service & Sales">
                              <option value="David_public">🤝 David Sales Pro - Negotiation practice</option>
                              <option value="Sarah_public">💬 Sarah Customer Care - Support role-play</option>
                            </optgroup>
                            <optgroup label="Personal Development">
                              <option value="Lisa_public">🌟 Lisa Coach - Life coaching</option>
                              <option value="Priya_public">🎓 Priya Mentor - Career guidance</option>
                              <option value="Carlos_public">🌍 Carlos Cultural Guide - International communication</option>
                            </optgroup>
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

                {/* Scenarios Panel */}
                <AnimatePresence>
                  {showScenarios && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200 dark:border-gray-800 overflow-hidden"
                    >
                      <div className="max-h-96 overflow-y-auto">
                        <ConversationScenarios
                          onScenarioSelect={handleScenarioSelect}
                          currentScenario={selectedScenario}
                          userProfile={userProfile}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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
          <AnimatePresence>
            {showSidebar && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-30 lg:hidden"
                onClick={() => setShowSidebar(false)}
              />
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden bg-gradient-to-br from-gray-50/50 via-white/30 to-gray-100/50 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50 transition-all duration-300 ${
            showSidebar ? 'lg:ml-0' : ''
          } lg:ml-0`}>
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {currentMode === 'gemini-chat' ? (
                <GeminiChatMode userProfile={userProfile} selectedScenario={selectedScenario} />
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
                  userProfile={userProfile}
                  selectedScenario={selectedScenario}
                  generateInitialGreeting={generateInitialGreeting}
                />
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Performance Analytics Modal */}
      <PerformanceAnalytics
        isVisible={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        currentSession={sessionData}
      />

      {/* Achievements Modal */}
      <Achievements
        isVisible={showAchievements}
        onClose={() => setShowAchievements(false)}
        stats={{
          totalConversations: 0, // These would be tracked in a real app
          totalDuration: 0,
          scenariosCompleted: 0,
          confidenceScore: 0
        }}
      />

      {/* User Profile Modal */}
      <UserProfileComponent
        isVisible={showUserProfile}
        onClose={() => setShowUserProfile(false)}
        onSave={handleProfileSave}
        currentProfile={userProfile}
      />
      </StreamingAvatarProvider>
    </ErrorBoundary>
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
function AvatarWelcomeMessage({ userProfile, selectedScenario, generateInitialGreeting, isVoiceChatActive }: {
  userProfile: any,
  selectedScenario: any,
  generateInitialGreeting: () => string | null,
  isVoiceChatActive: boolean
}) {
  const { sessionState } = useStreamingAvatarContext();

  if (sessionState === 'connected') return null;

  const initialGreeting = generateInitialGreeting();

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50 dark:bg-black/50 backdrop-blur-sm">
      <div className="text-center p-8 max-w-2xl">
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

        <motion.h3
          className="text-2xl font-bold text-white mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {sessionState === 'connecting' ? 'Connecting...' : 'Starting Avatar Session...'}
        </motion.h3>

        <motion.p
          className="text-gray-300 mb-4 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {sessionState === 'connecting'
            ? 'Setting up your personalized AI communication coach...'
            : 'Initializing your avatar session...'
          }
        </motion.p>

        {selectedScenario && userProfile && (
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-lg font-semibold text-white mb-2">
              🎭 {selectedScenario.name}
            </h4>
            <p className="text-sm text-gray-200 mb-3">
              {selectedScenario.description}
            </p>
            {initialGreeting && (
              <div className="text-left bg-white/10 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-gray-300 mb-1">AI will start by saying:</p>
                <p className="text-sm text-white italic">"{initialGreeting}"</p>
              </div>
            )}
          </motion.div>
        )}

        {sessionState === 'connecting' && (
          <motion.div
            className="flex justify-center space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </motion.div>
        )}

        <motion.div
          className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isVoiceChatActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <span>Mic {isVoiceChatActive ? 'Active' : 'Inactive'}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Gemini Chat Mode Component
function GeminiChatMode({ userProfile, selectedScenario }: { userProfile: any, selectedScenario: any }) {
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
      const res = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          userProfile: userProfile,
          scenario: selectedScenario || null
        }),
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
    } catch (err: any) {
      console.error('Error:', err);
      // Add error message to chat with specific error details
      let errorText = "Sorry, I'm having trouble connecting right now. ";
      if (err.message?.includes('quota')) {
        errorText += "It seems we've reached the API limit. Please try again later or upgrade your plan.";
      } else if (err.message?.includes('key')) {
        errorText += "There might be an issue with the API configuration. Please check your settings.";
      } else {
        errorText += "Please try again in a moment.";
      }

      const errorMessage = {
        id: (Date.now() + 2).toString(),
        type: 'ai' as const,
        text: errorText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-white/80 via-gray-50/50 to-white/60 dark:from-gray-900/80 dark:via-gray-800/50 dark:to-gray-900/60 backdrop-blur-sm">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="relative w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-3xl opacity-80 blur-lg"></div>
              <MessageSquare className="w-10 h-10 text-white relative z-10" />
            </motion.div>
            <motion.h2
              className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {userProfile?.name ? `Hello, ${userProfile.name}!` : 'Start Your Conversation'}
            </motion.h2>
            <motion.p
              className="text-gray-600 dark:text-gray-400 text-lg mb-6 max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {userProfile?.name
                ? `Ready to practice your communication skills? Let's start a personalized conversation!`
                : 'Chat with FluentFlow for communication practice'
              }
            </motion.p>
            {userProfile && (
              <motion.div
                className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-4 max-w-lg border border-blue-200/50 dark:border-blue-800/50 shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  💡 <strong>Personalized for you:</strong> I'll adapt to your {userProfile.proficiencyLevel} level and focus on your goals in {userProfile.targetLanguages?.join(', ')}.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div className={`max-w-[85%] lg:max-w-[75%] rounded-3xl p-5 shadow-xl ${
              message.type === 'user'
                ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white ml-12'
                : 'bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white mr-12 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm'
            }`}>
              <p className="text-base leading-relaxed">{message.text}</p>
              <p className={`text-xs mt-3 opacity-70 ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-3xl p-5 shadow-xl mr-12 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <motion.div
        className="p-6 border-t border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder={userProfile?.name ? `Hi ${userProfile.name}, what would you like to practice?` : "Type your message..."}
                className="w-full p-4 pr-12 bg-white/80 dark:bg-gray-800/80 border border-gray-300/50 dark:border-gray-700/50 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 shadow-lg backdrop-blur-sm"
                disabled={loading}
              />
              {inputText && (
                <button
                  onClick={() => setInputText('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={loading || !inputText.trim()}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Send'
              )}
            </motion.button>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
            <span>Press Enter to send, Shift+Enter for new line</span>
            {userProfile?.targetLanguages && (
              <span className="flex items-center space-x-1">
                <span>🎯</span>
                <span>Practicing: {userProfile.targetLanguages.join(', ')}</span>
              </span>
            )}
          </div>
        </div>
      </motion.div>
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
  avatarConfig,
  userProfile,
  selectedScenario,
  generateInitialGreeting
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
  avatarConfig: StartAvatarRequest,
  userProfile: any,
  selectedScenario: any,
  generateInitialGreeting: () => string | null
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
        <AvatarWelcomeMessage
          userProfile={userProfile}
          selectedScenario={selectedScenario}
          generateInitialGreeting={generateInitialGreeting}
          isVoiceChatActive={isVoiceChatActive}
        />

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
        <motion.div
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 bg-black/30 backdrop-blur-xl rounded-3xl p-3 border border-white/20 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {/* Microphone Status Indicator */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-2xl border border-white/10">
            <motion.div
              className={`w-3 h-3 rounded-full ${isVoiceChatActive ? 'bg-green-400' : 'bg-gray-400'}`}
              animate={isVoiceChatActive ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 2, repeat: isVoiceChatActive ? Infinity : 0 }}
            />
            <span className="text-sm font-medium text-white">
              {isVoiceChatActive ? 'Mic Active' : 'Mic Off'}
            </span>
          </div>

          {/* User Video Toggle */}
          <motion.button
            onClick={() => setShowUserVideo(!showUserVideo)}
            className={`p-3 rounded-2xl transition-all duration-300 shadow-lg ${
              showUserVideo
                ? 'bg-blue-500/80 text-white hover:bg-blue-600/80'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={showUserVideo ? 'Hide Your Video' : 'Show Your Video'}
          >
            {showUserVideo ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </motion.button>

          {/* Voice Toggle */}
          <motion.button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-2xl transition-all duration-300 shadow-lg ${
              isMuted
                ? 'bg-red-500/80 text-white hover:bg-red-600/80'
                : isVoiceChatActive
                ? 'bg-green-500/80 text-white hover:bg-green-600/80'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </motion.button>

          {/* End Call */}
          <motion.button
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
            className="p-3 rounded-2xl bg-red-500/80 hover:bg-red-600/80 text-white transition-all duration-300 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="End Call"
          >
            <Phone className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Scenario Info Overlay */}
        {selectedScenario && (
          <motion.div
            className="absolute top-6 left-6 bg-black/30 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-lg max-w-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{selectedScenario.emoji}</span>
              <h4 className="text-white font-semibold">{selectedScenario.name}</h4>
            </div>
            <p className="text-gray-300 text-sm">{selectedScenario.description}</p>
          </motion.div>
        )}
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