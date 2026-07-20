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
  User,
  LayoutDashboard,
  Activity,
  Star,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronUp,
  LogOut,
  Globe,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Maximize,
  Minimize,
  Captions
} from "lucide-react";

import { ConnectionQuality } from "@heygen/liveavatar-web-sdk";

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
import { StreamingAvatarProvider, useStreamingAvatarContext, StreamingAvatarSessionState, MessageSender } from "@/components/logic/context";
import { useStreamingAvatarSession } from "@/components/logic/useStreamingAvatarSession";
import { useVoiceChat } from "@/components/logic/useVoiceChat";
import { StartAvatarRequest, AvatarQuality, VoiceChatTransport } from "@/components/logic/types";
import { CONVERSATION_SCENARIOS, generatePersonalizedScenarios, STT_LANGUAGE_LIST } from "@/app/lib/constants";

const MENTOR_PRESETS = [
  { name: "Ann", avatarName: "Ann_Therapist_public", role: "Supportive mentor", imagePath: "/Ann.png" },
  { name: "Shawn", avatarName: "Shawn_Therapist_public", role: "Confidence coach", imagePath: "/Shawn.png" },
];

// A bridge component to expose the context's message handlers and sync voice chat state
function ContextBridge({ 
  handlerRef,
  isVoiceChatActive,
  setIsVoiceChatActive
}: { 
  handlerRef: React.MutableRefObject<{
    handleUserTalkingMessage: (event: any) => void;
    handleStreamingTalkingMessage: (event: any) => void;
    handleEndMessage: () => void;
  } | null>,
  isVoiceChatActive: boolean,
  setIsVoiceChatActive: (val: boolean) => void
}) {
  const ctx = useStreamingAvatarContext();
  const lastSyncedRef = useRef(isVoiceChatActive);

  // Sync parent state -> context state
  useEffect(() => {
    if (isVoiceChatActive !== lastSyncedRef.current) {
      lastSyncedRef.current = isVoiceChatActive;
      if (ctx.isVoiceChatActive !== isVoiceChatActive) {
        ctx.setIsVoiceChatActive(isVoiceChatActive);
      }
    }
  }, [isVoiceChatActive, ctx.isVoiceChatActive, ctx.setIsVoiceChatActive]);

  // Sync context state -> parent state
  useEffect(() => {
    if (ctx.isVoiceChatActive !== lastSyncedRef.current) {
      lastSyncedRef.current = ctx.isVoiceChatActive;
      if (isVoiceChatActive !== ctx.isVoiceChatActive) {
        setIsVoiceChatActive(ctx.isVoiceChatActive);
      }
    }
  }, [ctx.isVoiceChatActive, isVoiceChatActive, setIsVoiceChatActive]);

  useEffect(() => {
    handlerRef.current = {
      handleUserTalkingMessage: ctx.handleUserTalkingMessage,
      handleStreamingTalkingMessage: ctx.handleStreamingTalkingMessage,
      handleEndMessage: ctx.handleEndMessage
    };
    return () => {
      handlerRef.current = null;
    };
  }, [ctx.handleUserTalkingMessage, ctx.handleStreamingTalkingMessage, ctx.handleEndMessage, handlerRef]);

  return null;
}

export function FluentFlowApp({ initialMode = 'dashboard' }: { initialMode?: 'dashboard' | 'gemini-chat' | 'avatar-chat' }) {
  const { isAvatarTalking, setIsAvatarTalking } = useStreamingAvatarContext();
  const isAvatarTalkingRef = useRef(false);
  useEffect(() => {
    isAvatarTalkingRef.current = isAvatarTalking;
  }, [isAvatarTalking]);

  const [showConfig, setShowConfig] = useState(false);
  const [showMessages, setShowMessages] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showUserVideo, setShowUserVideo] = useState(false);
  const [currentMode, setCurrentModeState] = useState<'dashboard' | 'gemini-chat' | 'avatar-chat'>(initialMode);

  const setCurrentMode = useCallback((mode: 'dashboard' | 'gemini-chat' | 'avatar-chat') => {
    setCurrentModeState(mode);
    if (typeof window !== "undefined") {
      let newUrl = '/dashboard';
      if (mode === 'avatar-chat') newUrl = '/dashboard/avatar';
      else if (mode === 'gemini-chat') newUrl = '/dashboard/chat';
      if (window.location.pathname !== newUrl) {
        window.history.pushState({ mode }, '', newUrl);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      if (pathname.includes('/avatar')) {
        setCurrentModeState('avatar-chat');
      } else if (pathname.includes('/chat')) {
        setCurrentModeState('gemini-chat');
      } else {
        const searchMode = new URLSearchParams(window.location.search).get('mode');
        if (searchMode === 'avatar-chat' || searchMode === 'gemini-chat' || searchMode === 'dashboard') {
          setCurrentModeState(searchMode as any);
        } else if (initialMode) {
          setCurrentModeState(initialMode);
        }
      }

      const handlePopState = (event: PopStateEvent) => {
        if (event.state?.mode) {
          setCurrentModeState(event.state.mode);
        } else {
          const path = window.location.pathname;
          if (path.includes('/avatar')) setCurrentModeState('avatar-chat');
          else if (path.includes('/chat')) setCurrentModeState('gemini-chat');
          else setCurrentModeState('dashboard');
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [initialMode]);

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
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    
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

  // Load user profile from backend API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUserProfile(data.user);
            localStorage.setItem('fluentflow-user-profile', JSON.stringify(data.user));
            
            // If onboarding is not complete, show the profile modal automatically
            if (!data.user.onboardingComplete) {
              setShowUserProfile(true);
            }
          }
        } else {
          // Fallback to local storage if API fails
          const savedProfile = localStorage.getItem('fluentflow-user-profile');
          if (savedProfile) {
            setUserProfile(JSON.parse(savedProfile));
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };
    
    fetchProfile();
  }, []);

  const handleProfileSave = async (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('fluentflow-user-profile', JSON.stringify(profile));
    
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
    } catch (error) {
      console.error('Error saving profile to database:', error);
    }
  };
  
  
  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [talkMode, setTalkMode] = useState("voice");
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(true);
  const [asyncMode, setAsyncMode] = useState("realtime");
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [showScenarios, setShowScenarios] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [isSessionStarting, setIsSessionStarting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [latestAvatarSpeech, setLatestAvatarSpeech] = useState<string>("");
  const latestAvatarSpeechRef = useRef<string>("");
  const avatarSpeechCooldownRef = useRef<number>(0); // timestamp when avatar stopped speaking
  useEffect(() => {
    latestAvatarSpeechRef.current = latestAvatarSpeech;
  }, [latestAvatarSpeech]);

  const isVoiceChatActiveRef = useRef(isVoiceChatActive);
  const isMutedRef = useRef(isMuted);
  const currentModeRef = useRef(currentMode);

  useEffect(() => { isVoiceChatActiveRef.current = isVoiceChatActive; }, [isVoiceChatActive]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { currentModeRef.current = currentMode; }, [currentMode]);
  const [messages, setMessages] = useState<Array<{id: string, type: 'user'|'ai', text: string, timestamp: Date}>>([]);
  const recognitionRef = useRef<any>(null);
  const isSTTStartingOrRunningRef = useRef(false);
  const silenceTimerRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef<string>("");
  const lastSentVoiceTextRef = useRef<{ text: string, time: number }>({ text: "", time: 0 });
  const recentAiMessagesRef = useRef<string[]>([]);
  const contextMessagesHandlerRef = useRef<{
    handleUserTalkingMessage: (event: any) => void;
    handleStreamingTalkingMessage: (event: any) => void;
    handleEndMessage: () => void;
  } | null>(null);
  
  // Default avatar configuration
  const [avatarConfig, setAvatarConfig] = useState<StartAvatarRequest>({
    avatarName: "Ann_Therapist_public",
    language: "en",
    quality: AvatarQuality.Medium,
    voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  });
  const selectedMentor =
    MENTOR_PRESETS.find((mentor) => mentor.avatarName === avatarConfig.avatarName) ?? MENTOR_PRESETS[0];

  // Keep avatar mode manual-start only for better user control
  useEffect(() => {
    if (currentMode === 'gemini-chat') {
      setIsVoiceChatActive(false);
      setIsMuted(false);
    }
  }, [currentMode]);

  // Generate initial greeting for avatar based on profile, scenario, and language
  const generateInitialGreeting = useCallback(() => {
    if (!userProfile) return null;

    const lang = avatarConfig.language || 'en';
    const isHindi = lang.toLowerCase().startsWith('hi');
    const isSpanish = lang.toLowerCase().startsWith('es');

    const userName = userProfile.name ? ` ${userProfile.name}` : "";

    if (selectedScenario) {
      const scenarioName = selectedScenario.name || "Practice";
      const isSoftware = scenarioName.toLowerCase().includes("software") || selectedScenario.id?.includes("software");
      const isDoctor = scenarioName.toLowerCase().includes("doctor") || scenarioName.toLowerCase().includes("consultation") || selectedScenario.id?.includes("doctor");

      if (isHindi) {
        if (isSoftware) {
          return `नमस्ते${userName}! आपके सॉफ्टवेयर इंजीनियर इंटरव्यू में आपका स्वागत है। मैं आज आपका इंटरव्यूअर हूँ। अभ्यास शुरू करने के लिए, क्या आप कृपया अपना परिचय दे सकते हैं और अपने तकनीकी अनुभव के बारे में बता सकते हैं?`;
        } else if (isDoctor) {
          return `नमस्ते${userName}! आपकी डॉक्टर कंसल्टेशन में आपका स्वागत है। मैं आपका मेडिकल एडवाइजर हूँ। आज आप कैसा महसूस कर रहे हैं और आपको क्या समस्या है?`;
        } else {
          return `नमस्ते${userName}! हमारे ${scenarioName} अभ्यास में आपका स्वागत है। मैं आपका AI कोच हूँ। आज आप किस बारे में बात करना चाहेंगे?`;
        }
      } else if (isSpanish) {
        if (isSoftware) {
          return `¡Hola${userName}! Bienvenido a tu entrevista de Ingeniería de Software. Seré tu entrevistador hoy. Para comenzar, ¿podrías presentarte y contarme sobre tu experiencia técnica?`;
        }
      }

      if (isSoftware) {
        return `Hello${userName}! Welcome to your Software Engineering Interview practice. I'll be your interviewer today. To get started, could you please introduce yourself and tell me briefly about your technical background and experience?`;
      } else if (isDoctor) {
        return `Hello${userName}! Welcome to your Doctor Consultation practice. I'm your medical advisor today. How are you feeling, and what brings you in for a consultation today?`;
      } else {
        return `Hello${userName}! Welcome to our ${scenarioName} practice session. I'm your AI coach today. To get started, what would you like to focus on first?`;
      }
    } else {
      if (isHindi) {
        return `नमस्ते${userName}! आपके सामान्य बातचीत अभ्यास में आपका स्वागत है। मैं यहाँ आपके साथ हिंदी में बातचीत करने और आपकी मदद करने के लिए तैयार हूँ। आज आप किस बारे में बात करना चाहेंगे?`;
      }
      return `Hello${userName}! Welcome to your General Conversation practice. I'm here to chat, answer questions, and help you practice. How can I assist you today?`;
    }
  }, [userProfile, selectedScenario, avatarConfig.language]);

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

const getSpeechLang = (langCode?: string) => {
  if (typeof window !== 'undefined' && !langCode) {
    return navigator.language || 'en-US';
  }
  if (!langCode) return 'en-US';
  const code = langCode.toLowerCase();
  if (code.startsWith('hi')) return 'hi-IN';
  if (code.startsWith('es')) return 'es-ES';
  if (code.startsWith('fr')) return 'fr-FR';
  if (code.startsWith('de')) return 'de-DE';
  if (code.startsWith('zh')) return 'zh-CN';
  if (code.startsWith('ja')) return 'ja-JP';
  return 'en-US';
};

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = getSpeechLang(avatarConfig?.language);

        recognitionRef.current.onstart = () => {
          isSTTStartingOrRunningRef.current = true;
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event: any) => {
          // Ignore STT input while avatar is speaking or mic is muted
          if (isAvatarTalkingRef.current || isMutedRef.current) {
            return;
          }

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

          const fullText = (finalTranscript || interimTranscript).trim();
          if (fullText) {
            setVoiceText(fullText);
            accumulatedTranscriptRef.current = fullText;

            // Reset 700ms VAD silence timer: when user pauses speaking for 0.7s, send full sentence!
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              if (accumulatedTranscriptRef.current && !isAvatarTalkingRef.current) {
                const textToSend = accumulatedTranscriptRef.current;
                accumulatedTranscriptRef.current = "";
                handleVoiceSend(textToSend);
              }
            }, 700);
          }
        };

        recognitionRef.current.onend = () => {
          isSTTStartingOrRunningRef.current = false;
          setIsListening(false);

          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          if (accumulatedTranscriptRef.current && !isAvatarTalkingRef.current) {
            const textToSend = accumulatedTranscriptRef.current;
            accumulatedTranscriptRef.current = "";
            handleVoiceSend(textToSend);
          }

          // Continuous loop: auto-restart recognition immediately if voice chat is active & avatar is not talking
          if (isVoiceChatActiveRef.current && !isMutedRef.current && !isAvatarTalkingRef.current && currentModeRef.current === 'avatar-chat') {
            startListening();
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          isSTTStartingOrRunningRef.current = false;
          setIsListening(false);

          // Ignore aborted and no-speech events silently
          if (event.error === 'aborted' || event.error === 'no-speech') {
            return;
          }
          console.warn('Speech recognition notice:', event.error);

          if (isVoiceChatActiveRef.current && !isMutedRef.current && !isAvatarTalkingRef.current && currentModeRef.current === 'avatar-chat') {
            startListening();
          }
        };
      }
    }
  }, [asyncMode]);

  // Keep recognition language updated when avatarConfig language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = getSpeechLang(avatarConfig?.language);
    }
  }, [avatarConfig?.language]);

  const startListening = useCallback(() => {
    setIsVoiceChatActive(true);
    setIsMuted(false);
    if (isAvatarTalkingRef.current) {
      return;
    }
    if (recognitionRef.current && !isSTTStartingOrRunningRef.current) {
      setVoiceText("");
      isSTTStartingOrRunningRef.current = true;
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        isSTTStartingOrRunningRef.current = false;
        setIsListening(false);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    isSTTStartingOrRunningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  }, []);

  // Stop speech recognition immediately when mic is muted or voice mode disabled
  useEffect(() => {
    if (!isVoiceChatActive || isMuted) {
      stopListening();
    }
  }, [isVoiceChatActive, isMuted, stopListening]);

  const isEchoOfRecentSpeech = useCallback((input: string) => {
    const normInput = input.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
    if (!normInput || normInput.length < 2) return true;

    // Echo only occurs within 2.5 seconds after avatar stops speaking out loud
    const timeSinceAvatarSpoke = Date.now() - avatarSpeechCooldownRef.current;
    if (timeSinceAvatarSpoke > 2500) {
      return false;
    }

    const aiTexts = [...recentAiMessagesRef.current];
    if (latestAvatarSpeechRef.current) aiTexts.push(latestAvatarSpeechRef.current);

    for (const aiText of aiTexts) {
      const normAi = aiText.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
      if (!normAi) continue;

      // 1. Exact sentence match
      if (normAi === normInput) {
        console.log("🔇 Blocked speaker echo (exact match):", input);
        return true;
      }

      // 2. Block only if 4+ consecutive words match the AI sentence in exact sequence
      const inputWords = normInput.split(/\s+/).filter(Boolean);
      if (inputWords.length >= 4) {
        for (let i = 0; i <= inputWords.length - 4; i++) {
          const quadGram = inputWords.slice(i, i + 4).join(" ");
          if (normAi.includes(quadGram)) {
            console.log("🔇 Blocked speaker echo (4-word sequence match):", quadGram);
            return true;
          }
        }
      }
    }

    return false;
  }, []);

  // Auto-resume speech recognition when avatar finishes speaking out loud
  useEffect(() => {
    if (!isAvatarTalking && isVoiceChatActive && !isMuted && currentMode === 'avatar-chat') {
      const timer = setTimeout(() => {
        if (!isAvatarTalkingRef.current && isVoiceChatActiveRef.current && !isMutedRef.current && !isSTTStartingOrRunningRef.current) {
          startListening();
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isAvatarTalking, isVoiceChatActive, isMuted, currentMode, startListening]);

  const handleVoiceSend = useCallback(async (text: string) => {
    const textTrimmed = text.trim();
    if (!textTrimmed) return;

    // Filter out duplicate rapid voice messages (within 3 seconds)
    const now = Date.now();
    if (
      lastSentVoiceTextRef.current.text === textTrimmed.toLowerCase() &&
      now - lastSentVoiceTextRef.current.time < 3000
    ) {
      console.log("🔇 Blocked rapid duplicate voice input:", textTrimmed);
      setVoiceText("");
      return;
    }
    lastSentVoiceTextRef.current = { text: textTrimmed.toLowerCase(), time: now };

    // Filter out speaker feedback echo
    if (isAvatarTalkingRef.current || isEchoOfRecentSpeech(textTrimmed)) {
      console.log("🔇 Blocked self-echo input matching recent AI speech:", textTrimmed);
      setVoiceText("");
      return;
    }

    // CRITICAL: Update ref synchronously BEFORE stopListening()
    // This prevents the recognition onend handler from auto-restarting the mic during TTS
    isAvatarTalkingRef.current = true;
    setIsAvatarTalking(true);
    
    // Clear any pending timers and buffers before stopping
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    accumulatedTranscriptRef.current = "";
    stopListening();

    console.log('Sending text to AI:', textTrimmed);
    setVoiceText("");
    
    // Update local messages for UI
    const userMessage = { id: Date.now().toString(), type: 'user' as const, text: textTrimmed, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);

    // Update context messages via bridge
    if (contextMessagesHandlerRef.current) {
      contextMessagesHandlerRef.current.handleUserTalkingMessage({ text: textTrimmed });
      contextMessagesHandlerRef.current.handleEndMessage();
    }

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textTrimmed,
          userProfile,
          scenario: selectedScenario || null,
          language: avatarConfig?.language || "en"
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      
      // Add AI response to local messages
      const aiMessage = { id: (Date.now() + 1).toString(), type: 'ai' as const, text: data.reply, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);

      // Update context messages via bridge
      if (contextMessagesHandlerRef.current) {
        contextMessagesHandlerRef.current.handleStreamingTalkingMessage({ text: data.reply });
        contextMessagesHandlerRef.current.handleEndMessage();
      }

      // Store the reply so AvatarChatMode can pick it up and speak it
      recentAiMessagesRef.current.push(data.reply);
      if (recentAiMessagesRef.current.length > 5) recentAiMessagesRef.current.shift();
      setLatestAvatarSpeech(data.reply);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setIsAvatarTalking(false);
    }
  }, [userProfile, selectedScenario, avatarConfig?.language, stopListening, isEchoOfRecentSpeech, setIsAvatarTalking]);

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
    // Do not auto-start call; user must click Start Session manually
    setIsVoiceChatActive(false);
  }, [currentMode]);

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
      <StreamingAvatarProvider userProfile={userProfile} selectedScenario={selectedScenario}>
        <ContextBridge 
          handlerRef={contextMessagesHandlerRef} 
          isVoiceChatActive={isVoiceChatActive}
          setIsVoiceChatActive={setIsVoiceChatActive}
        />
        {/* Ambient mesh background */}
        <div className="animated-mesh" />
        <div className="h-screen w-full flex flex-col overflow-hidden" style={{background:'var(--color-bg)',color:'var(--color-text)'}}>

          {/* ── TOP NAV ── */}
          <motion.header
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-50 flex items-center justify-between px-5 py-3 border-b"
            style={{background:'var(--topbar-bg)',backdropFilter:'blur(24px)',borderColor:'var(--color-border)'}}
          >
            {/* Logo + Title */}
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{background:'linear-gradient(135deg,#a855f7,#6366f1)'}}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text leading-none">FluentFlow</h1>
                <p className="text-xs theme-text-subtle">
                  {userProfile?.name ? `Welcome back, ${userProfile.name}` : 'AI Communication Coach'}
                </p>
              </div>
            </div>

            {/* Nav Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                onClick={cycleTheme}
                className="btn-ghost !p-2"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                <span className="text-lg leading-none">{getThemeIcon()}</span>
              </motion.button>

              {/* Profile */}
              <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                onClick={() => setShowUserProfile(true)}
                className="btn-ghost flex items-center gap-2 px-3 py-2 text-sm"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{background:'linear-gradient(135deg,#a855f7,#6366f1)'}}>
                  {userProfile?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                </div>
                <span className="hidden sm:block">{userProfile?.name || 'Profile'}</span>
              </motion.button>

              {/* Analytics */}
              <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                onClick={() => setShowAnalytics(true)}
                className="btn-ghost !p-2"
                title="Analytics"
              >
                <TrendingUp className="w-4 h-4" />
              </motion.button>

              {/* Achievements */}
              <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                onClick={() => setShowAchievements(true)}
                className="btn-ghost !p-2"
                title="Achievements"
              >
                <Trophy className="w-4 h-4" />
              </motion.button>

              {/* Mute */}
              <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                onClick={() => setIsMuted(!isMuted)}
                className={`btn-ghost !p-2 ${isMuted ? 'text-red-400 border-red-500/30' : ''}`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </motion.button>

              {/* Sidebar toggle */}
              {currentMode !== "avatar-chat" && (
                <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                  onClick={() => setShowSidebar(!showSidebar)}
                  className={`btn-ghost !p-2 ${showSidebar ? 'text-violet-400 border-violet-500/30' : ''}`}
                  title="Toggle sidebar"
                >
                  <Menu className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </motion.header>

          {/* ── BODY: SIDEBAR + CONTENT ── */}
          <div className="flex flex-1 min-h-0 overflow-hidden">

            {/* SIDEBAR */}
            <AnimatePresence>
              {showSidebar && currentMode !== 'avatar-chat' && (
                <motion.aside
                  initial={{ x: -280, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -280, opacity: 0 }}
                  transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                  className="w-64 flex-shrink-0 flex flex-col border-r custom-scrollbar overflow-y-auto fixed lg:relative h-[calc(100vh-57px)] z-40"
                  style={{background:'var(--color-surface)',borderColor:'rgba(255,255,255,0.06)'}}
                >
                  {/* Mobile close */}
                  <button onClick={() => setShowSidebar(false)}
                    className="lg:hidden absolute top-3 right-3 btn-ghost !p-1.5"
                  ><X className="w-4 h-4" /></button>

                  {/* SECTION: Modes */}
                  <div className="p-4">
                    <p className="section-label mb-3">Mode</p>
                    <div className="space-y-1.5">
                      <button onClick={() => setCurrentMode('dashboard')}
                        className={`nav-item w-full ${currentMode === 'dashboard' ? 'active' : ''}`}
                      >
                        <LayoutDashboard className="nav-icon w-4 h-4" />
                        <div className="text-left">
                          <div className="font-semibold text-sm">Dashboard</div>
                          <div className="text-xs" style={{color:'var(--color-text-subtle)'}}>Overview & Stats</div>
                        </div>
                      </button>

                      <button onClick={() => setCurrentMode('gemini-chat')}
                        className={`nav-item w-full ${currentMode === 'gemini-chat' ? 'active' : ''}`}
                      >
                        <MessageSquare className="nav-icon w-4 h-4" />
                        <div className="text-left">
                          <div className="font-semibold text-sm">AI Chat</div>
                          <div className="text-xs" style={{color:'var(--color-text-subtle)'}}>Text conversation</div>
                        </div>
                      </button>

                      <button onClick={() => { setCurrentMode('avatar-chat'); setIsVoiceChatActive(false); }}
                        className={`nav-item w-full ${(currentMode as string) === 'avatar-chat' ? 'active' : ''}`}
                      >
                        <Video className="nav-icon w-4 h-4" />
                        <div className="text-left flex-1">
                          <div className="font-semibold text-sm">Live Avatar</div>
                          <div className="text-xs" style={{color:'var(--color-text-subtle)'}}>Real-time video</div>
                        </div>
                        {isVoiceChatActive && (currentMode as string) === 'avatar-chat' && (
                          <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="divider" />

                  {/* SECTION: Scenarios */}
                  <div className="p-4">
                    <p className="section-label mb-3">Scenarios</p>
                    <button onClick={() => setShowScenarios(!showScenarios)}
                      className={`nav-item w-full ${showScenarios ? 'active' : ''}`}
                    >
                      <span className="text-base">🎭</span>
                      <div className="text-left">
                        <div className="font-semibold text-sm">Practice Scenarios</div>
                        <div className="text-xs truncate max-w-[120px]" style={{color:'var(--color-text-subtle)'}}>
                          {selectedScenario ? selectedScenario.name : 'Choose a scenario'}
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {showScenarios && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-2"
                        >
                          <div className="max-h-60 overflow-y-auto custom-scrollbar rounded-xl" style={{background:'var(--color-surface-2)'}}>
                            <ConversationScenarios
                              onScenarioSelect={handleScenarioSelect}
                              currentScenario={selectedScenario}
                              userProfile={userProfile}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>



                </motion.aside>
              )}
            </AnimatePresence>

            {/* Mobile overlay */}
            <AnimatePresence>
              {showSidebar && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                  onClick={() => setShowSidebar(false)}
                />
              )}
            </AnimatePresence>


            {/* MAIN CONTENT */}
            <motion.div
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {currentMode === 'dashboard' ? (
                <DashboardMode userProfile={userProfile} setCurrentMode={setCurrentMode} setShowScenarios={setShowScenarios} />
              ) : currentMode === 'gemini-chat' ? (
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
                  setAvatarConfig={setAvatarConfig}
                  selectedMentorName={selectedMentor.name}
                  isSessionStarting={isSessionStarting}
                  setIsSessionStarting={setIsSessionStarting}
                  userProfile={userProfile}
                  selectedScenario={selectedScenario}
                  setSelectedScenario={setSelectedScenario}
                  generateInitialGreeting={generateInitialGreeting}
                  latestAvatarSpeech={latestAvatarSpeech}
                  setLatestAvatarSpeech={setLatestAvatarSpeech}
                  avatarSpeechCooldownRef={avatarSpeechCooldownRef}
                />
              )}
            </motion.div>

          </div>{/* end body */}
        </div>{/* end h-screen */}

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
function AvatarWelcomeMessage({
  userProfile,
  selectedScenario,
  setSelectedScenario,
  avatarConfig,
  setAvatarConfig,
  generateInitialGreeting,
  isVoiceChatActive,
  onStartSession,
  isStarting,
  errorMessage,
  onClearError,
  onStartSimulated,
  onBackToDashboard
}: {
  userProfile: any,
  selectedScenario: any,
  setSelectedScenario: (scenario: any) => void,
  avatarConfig: StartAvatarRequest,
  setAvatarConfig: (config: StartAvatarRequest) => void,
  generateInitialGreeting: () => string | null,
  isVoiceChatActive: boolean,
  onStartSession: (mic: boolean, cam: boolean, spk: boolean) => void,
  isStarting: boolean,
  errorMessage: string | null,
  onClearError: () => void,
  onStartSimulated: (mic: boolean) => void,
  onBackToDashboard: () => void
}) {
  const { sessionState } = useStreamingAvatarContext();

  if (sessionState === 'connected') return null;

  const initialGreeting = generateInitialGreeting();
  const showConnecting = sessionState === 'connecting' || isStarting;

  // Generate list of all scenarios
  const personalizedScenarios = userProfile ? generatePersonalizedScenarios(userProfile) : [];
  const allScenarios = [...CONVERSATION_SCENARIOS, ...personalizedScenarios];
  const selectedMentor = MENTOR_PRESETS.find((mentor) => mentor.avatarName === avatarConfig.avatarName) ?? MENTOR_PRESETS[0];

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("");
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const hasFetchedDevices = useRef(false);

  useEffect(() => {
    if (hasFetchedDevices.current) return;
    hasFetchedDevices.current = true;

    navigator.mediaDevices.enumerateDevices()
      .then((deviceInfos) => {
        setDevices(deviceInfos);
        const mic = deviceInfos.find(d => d.kind === 'audioinput');
        const speaker = deviceInfos.find(d => d.kind === 'audiooutput');
        const camera = deviceInfos.find(d => d.kind === 'videoinput');
        if (mic) setSelectedMic(mic.deviceId);
        if (speaker) setSelectedSpeaker(speaker.deviceId);
        if (camera) setSelectedCamera(camera.deviceId);
      })
      .catch((err) => {
        console.error("Error enumerating devices:", err);
      });
  }, []);

  useEffect(() => {
    if (selectedSpeaker) {
      const videoEl = document.querySelector('video');
      if (videoEl && 'setSinkId' in videoEl) {
        (videoEl as any).setSinkId(selectedSpeaker)
          .then(() => console.log('Speaker routed successfully:', selectedSpeaker))
          .catch((err: any) => console.error('Failed to set speaker:', err));
      }
    }
  }, [selectedSpeaker]);

  const mics = devices.filter(d => d.kind === 'audioinput');
  const speakers = devices.filter(d => d.kind === 'audiooutput');
  const cameras = devices.filter(d => d.kind === 'videoinput');

  const [isMicActive, setIsMicActive] = useState(true);
  const [isCamActive, setIsCamActive] = useState(false);
  const [isSpkActive, setIsSpkActive] = useState(true);
  const [activePopover, setActivePopover] = useState<'mic' | 'cam' | 'spk' | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let localStream: MediaStream | null = null;
    if (isCamActive) {
      navigator.mediaDevices.getUserMedia({ 
        video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true, 
        audio: false 
      })
        .then((stream) => {
          localStream = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Error starting camera preview:", err);
          setIsCamActive(false);
        });
    }
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCamActive, selectedCamera]);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-br from-zinc-950 via-purple-950/20 to-black z-30 overflow-y-auto">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-8">
        
        {/* LEFT COLUMN: Camera/Video Preview Setup */}
        <div className="md:col-span-7">
          <div className="relative w-full aspect-[4/3] md:h-[460px] rounded-3xl overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl flex flex-col justify-between p-6">
            <img 
              src={selectedMentor.imagePath} 
              alt={selectedMentor.name} 
              className="absolute inset-0 w-full h-full object-cover opacity-75"
            />
            {/* Ambient decoration */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/40 pointer-events-none" />
            
            {/* User Camera Preview - Top Right */}
            {isCamActive && (
              <div className="absolute top-4 right-4 w-40 h-28 bg-zinc-950 rounded-2xl overflow-hidden border border-white/20 shadow-xl z-10">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Top Bar inside card */}
            <div className="relative z-10 flex items-center justify-between w-full">
              <div className="bg-purple-600/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-purple-400/25 text-white font-bold text-xs shadow-lg">
                Coach: {selectedMentor.name}
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                <div className={`w-1.5 h-1.5 rounded-full ${isMicActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span>Mic {isMicActive ? 'Active' : 'Muted'}</span>
              </div>
            </div>

            {/* Middle connecting text or Error panel */}
            {errorMessage ? (
              <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-red-500/10 animate-pulse">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Connection Failed</h3>
                <div className="bg-red-500/15 border border-red-500/25 text-red-200 text-xs rounded-2xl px-4 py-3 max-w-sm mb-4 leading-relaxed backdrop-blur-md">
                  {errorMessage}
                </div>
                <div className="flex gap-3 flex-wrap justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClearError}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold transition-colors"
                  >
                    Dismiss
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onClearError();
                      onStartSession(isMicActive, isCamActive, isSpkActive);
                    }}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry Connection
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onStartSimulated(isMicActive)}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-purple-500/25 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                    Try Free Voice Practice
                  </motion.button>
                </div>
              </div>
            ) : showConnecting ? (
              <div className="relative z-10 flex flex-col items-center justify-center flex-1">
                <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/25 animate-pulse mb-4">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg font-bold text-white">Connecting Session...</h3>
                <p className="text-xs text-gray-400 mt-1">Please wait while we connect your avatar coach...</p>
              </div>
            ) : (
              <div className="flex-1" /> /* Spacer */
            )}

            {/* Bottom Google Meet / Zoom style Controls Bar */}
            {!showConnecting && !errorMessage && (
              <div className="relative z-10 flex flex-col items-center gap-3 w-full">

                <div className="flex items-center gap-3 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-xl p-2 sm:p-2.5 rounded-full border border-zinc-200/50 dark:border-white/10 shadow-lg relative max-w-full">
                  
                  {/* Microphone Group */}
                  <div className="relative flex items-center bg-zinc-100/60 hover:bg-zinc-100/90 dark:bg-zinc-950/40 dark:hover:bg-zinc-950/65 rounded-full border border-zinc-200/40 dark:border-white/5 pr-1 pl-0.5 py-0.5 transition-colors">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsMicActive(!isMicActive)}
                      className={`p-2 rounded-full transition-all ${
                        isMicActive 
                          ? "bg-purple-600 hover:bg-purple-700 text-white" 
                          : "bg-red-500/85 hover:bg-red-600 text-white"
                      }`}
                      title={isMicActive ? "Mute Microphone" : "Unmute Microphone"}
                    >
                      {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </motion.button>
                    {mics.length > 0 && (
                      <button
                        onClick={() => setActivePopover(activePopover === 'mic' ? null : 'mic')}
                        className={`p-1 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors ml-0.5 rounded-full hover:bg-zinc-200/50 dark:hover:bg-white/10 ${
                          activePopover === 'mic' ? 'text-zinc-800 bg-zinc-200/50 dark:text-white dark:bg-white/10' : ''
                        }`}
                        title="Microphone settings"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    
                    {/* Mic Popover */}
                    {activePopover === 'mic' && (
                      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white dark:bg-zinc-950/95 border border-zinc-200 dark:border-white/10 rounded-2xl p-3 shadow-2xl z-20 min-w-[220px] max-w-[280px] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                        {/* Triangle arrow at the bottom */}
                        <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white dark:bg-zinc-950 border-r border-b border-zinc-200 dark:border-white/10 rotate-45" />
                        
                        <div className="text-[11px] font-bold text-zinc-500 dark:text-gray-400 mb-2 px-1 text-center">Select Microphone</div>
                        <div className="space-y-1 max-h-[160px] overflow-y-auto custom-scrollbar relative z-10">
                          {mics.map((mic) => (
                            <button
                              key={mic.deviceId}
                              onClick={() => {
                                setSelectedMic(mic.deviceId);
                                setActivePopover(null);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors truncate ${
                                selectedMic === mic.deviceId 
                                  ? "bg-purple-600 text-white font-semibold" 
                                  : "text-zinc-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-white/5"
                              }`}
                            >
                              {mic.label || "Microphone"}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Camera Group */}
                  <div className="relative flex items-center bg-zinc-100/60 hover:bg-zinc-100/90 dark:bg-zinc-950/40 dark:hover:bg-zinc-950/65 rounded-full border border-zinc-200/40 dark:border-white/5 pr-1 pl-0.5 py-0.5 transition-colors">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsCamActive(!isCamActive)}
                      className={`p-2 rounded-full transition-all ${
                        isCamActive 
                          ? "bg-purple-600 hover:bg-purple-700 text-white" 
                          : "bg-red-500/85 hover:bg-red-600 text-white"
                      }`}
                      title={isCamActive ? "Turn Camera Off" : "Turn Camera On"}
                    >
                      {isCamActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </motion.button>
                    {cameras.length > 0 && (
                      <button
                        onClick={() => setActivePopover(activePopover === 'cam' ? null : 'cam')}
                        className={`p-1 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors ml-0.5 rounded-full hover:bg-zinc-200/50 dark:hover:bg-white/10 ${
                          activePopover === 'cam' ? 'text-zinc-800 bg-zinc-200/50 dark:text-white dark:bg-white/10' : ''
                        }`}
                        title="Camera settings"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Camera Popover */}
                    {activePopover === 'cam' && (
                      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white dark:bg-zinc-950/95 border border-zinc-200 dark:border-white/10 rounded-2xl p-3 shadow-2xl z-20 min-w-[220px] max-w-[280px] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                        {/* Triangle arrow at the bottom */}
                        <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white dark:bg-zinc-950 border-r border-b border-zinc-200 dark:border-white/10 rotate-45" />

                        <div className="text-[11px] font-bold text-zinc-500 dark:text-gray-400 mb-2 px-1 text-center">Select Camera</div>
                        <div className="space-y-1 max-h-[160px] overflow-y-auto custom-scrollbar relative z-10">
                          {cameras.map((cam) => (
                            <button
                              key={cam.deviceId}
                              onClick={() => {
                                setSelectedCamera(cam.deviceId);
                                setActivePopover(null);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors truncate ${
                                selectedCamera === cam.deviceId 
                                  ? "bg-purple-600 text-white font-semibold" 
                                  : "text-zinc-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-white/5"
                              }`}
                            >
                              {cam.label || "Camera"}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Speaker Group */}
                  <div className="relative flex items-center bg-zinc-100/60 hover:bg-zinc-100/90 dark:bg-zinc-950/40 dark:hover:bg-zinc-950/65 rounded-full border border-zinc-200/40 dark:border-white/5 pr-1 pl-0.5 py-0.5 transition-colors">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsSpkActive(!isSpkActive)}
                      className={`p-2 rounded-full transition-all ${
                        isSpkActive 
                          ? "bg-purple-600 hover:bg-purple-700 text-white" 
                          : "bg-red-500/85 hover:bg-red-600 text-white"
                      }`}
                      title={isSpkActive ? "Mute Speakers" : "Unmute Speakers"}
                    >
                      {isSpkActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </motion.button>
                    {speakers.length > 0 && (
                      <button
                        onClick={() => setActivePopover(activePopover === 'spk' ? null : 'spk')}
                        className={`p-1 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors ml-0.5 rounded-full hover:bg-zinc-200/50 dark:hover:bg-white/10 ${
                          activePopover === 'spk' ? 'text-zinc-800 bg-zinc-200/50 dark:text-white dark:bg-white/10' : ''
                        }`}
                        title="Speaker settings"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Speaker Popover */}
                    {activePopover === 'spk' && (
                      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white dark:bg-zinc-950/95 border border-zinc-200 dark:border-white/10 rounded-2xl p-3 shadow-2xl z-20 min-w-[220px] max-w-[280px] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                        {/* Triangle arrow at the bottom */}
                        <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white dark:bg-zinc-950 border-r border-b border-zinc-200 dark:border-white/10 rotate-45" />

                        <div className="text-[11px] font-bold text-zinc-500 dark:text-gray-400 mb-2 px-1 text-center">Select Speaker</div>
                        <div className="space-y-1 max-h-[160px] overflow-y-auto custom-scrollbar relative z-10">
                          {speakers.map((spk) => (
                            <button
                              key={spk.deviceId}
                              onClick={() => {
                                setSelectedSpeaker(spk.deviceId);
                                setActivePopover(null);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors truncate ${
                                selectedSpeaker === spk.deviceId 
                                  ? "bg-purple-600 text-white font-semibold" 
                                  : "text-zinc-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-white/5"
                              }`}
                            >
                              {spk.label || "Speaker"}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                    {/* Start Session / Join */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onStartSession(isMicActive, isCamActive, isSpkActive)}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      Start Session
                    </motion.button>

                    {/* Free Simulation Mode */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onStartSimulated(isMicActive)}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-purple-500/25 flex items-center gap-1.5"
                      title="Start simulated voice practice without HeyGen credits"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-white animate-pulse" />
                      Free Voice Call
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>

               {/* RIGHT COLUMN: Settings Card */}
        <div className="md:col-span-5 relative group">
          {/* Ambient Glow behind Card */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-[2.2rem] blur-2xl opacity-15 dark:opacity-20 pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative rounded-[2rem] border border-zinc-200/60 dark:border-white/10 bg-white/70 dark:bg-zinc-950/45 p-6 md:p-8 backdrop-blur-2xl shadow-xl dark:shadow-2xl shadow-purple-950/5 space-y-6 z-10"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-600 dark:text-purple-400 text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Live Coach Setup
                </div>
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-white tracking-tight">Personalize Call</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Configure your mentor and scenario details below.</p>
              </div>

              {/* Back button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBackToDashboard}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-all"
                title="Go back to Dashboard"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="divider h-px w-full bg-zinc-200/60 dark:bg-white/5" />

            {/* Mentor Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block">Choose Mentor</label>
              <div className="grid grid-cols-2 gap-3">
                {MENTOR_PRESETS.map((mentor) => {
                  const active = mentor.avatarName === avatarConfig.avatarName;
                  return (
                    <button
                      key={mentor.avatarName}
                      disabled={showConnecting}
                      onClick={() => setAvatarConfig({ ...avatarConfig, avatarName: mentor.avatarName })}
                      className={`flex items-center gap-3 rounded-2xl border p-2.5 text-left transition-all duration-300 ${
                        active
                          ? "border-purple-500 bg-purple-500/15 dark:bg-purple-500/20 shadow-lg shadow-purple-500/10 text-purple-750 dark:text-purple-305 font-bold"
                          : "border-zinc-200 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <img 
                        src={mentor.imagePath} 
                        alt={mentor.name} 
                        className="w-10 h-10 rounded-full object-cover border border-white/10 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate">{mentor.name}</div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight truncate">{mentor.role}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block">Language</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-3.5 w-4 h-4 text-purple-500 dark:text-purple-400" />
                <select
                  disabled={showConnecting}
                  value={avatarConfig.language}
                  onChange={(e) => setAvatarConfig({...avatarConfig, language: e.target.value})}
                  className="w-full bg-white/70 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-zinc-800 dark:text-white focus:outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer"
                >
                  {STT_LANGUAGE_LIST.map((lang) => (
                    <option key={lang.value} value={lang.value} className="bg-zinc-100 dark:bg-zinc-950 text-zinc-800 dark:text-white">
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scenario Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block">Practice Scenario</label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-3.5 w-4 h-4 text-purple-500 dark:text-purple-400" />
                <select
                  disabled={showConnecting}
                  value={selectedScenario ? selectedScenario.id : "none"}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "none") {
                      setSelectedScenario(null);
                    } else {
                      const found = allScenarios.find(s => s.id === val);
                      if (found) setSelectedScenario(found);
                    }
                  }}
                  className="w-full bg-white/70 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-zinc-800 dark:text-white focus:outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer h-11"
                >
                  <option value="none" className="bg-zinc-100 dark:bg-zinc-950 text-zinc-800 dark:text-white">General Conversation (No Scenario)</option>
                  {allScenarios.map((scenario) => (
                    <option key={scenario.id} value={scenario.id} className="bg-zinc-100 dark:bg-zinc-950 text-zinc-800 dark:text-white">
                      {scenario.emoji} {scenario.name} ({scenario.difficulty})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scenario description if active */}
            {selectedScenario ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/15 dark:border-purple-500/20 rounded-2xl p-4 text-xs space-y-2 relative z-10"
              >
                <div className="font-semibold text-purple-600 dark:text-purple-300">Active Scenario: {selectedScenario.emoji} {selectedScenario.name}</div>
                <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{selectedScenario.description}</div>
                {initialGreeting && (
                  <div className="bg-white/80 dark:bg-black/30 p-2.5 rounded-lg border border-zinc-200/50 dark:border-white/5 text-[11px]">
                    <span className="text-zinc-500 dark:text-zinc-400 block mb-1">Mentor initial greeting:</span>
                    <span className="text-zinc-850 dark:text-white italic">"{initialGreeting}"</span>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-500/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 text-xs space-y-2 relative z-10"
              >
                <div className="font-semibold text-purple-600 dark:text-purple-300">Active Mode: 💬 General Conversation</div>
                <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Practice natural English conversation, speak freely about any topic, and get speech-coach recommendations as you talk.
                </div>
                {initialGreeting && (
                  <div className="bg-white/80 dark:bg-black/30 p-2.5 rounded-lg border border-zinc-200/50 dark:border-white/5 text-[11px]">
                    <span className="text-zinc-500 dark:text-zinc-400 block mb-1">Mentor initial greeting:</span>
                    <span className="text-zinc-850 dark:text-white italic">"{initialGreeting}"</span>
                  </div>
                )}
              </motion.div>
            )}
            
          </motion.div>
        </div>

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
      // Use Gemini for free NLP chat
      const res = await fetch("/api/gemini", {
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
    <div className="flex-1 flex flex-col" style={{background:'var(--color-bg)'}}>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 relative"
              style={{background:'linear-gradient(135deg,#a855f7,#6366f1)'}}
              animate={{ rotate: [0, 4, -4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute inset-0 rounded-3xl blur-2xl opacity-50" style={{background:'linear-gradient(135deg,#a855f7,#6366f1)'}} />
              <MessageSquare className="w-9 h-9 text-white relative z-10" />
            </motion.div>
            <h2 className="text-3xl font-bold gradient-text mb-3">
              {userProfile?.name ? `Hey, ${userProfile.name}!` : 'Start Practicing'}
            </h2>
            <p className="text-base max-w-md mb-8" style={{color:'var(--color-text-muted)'}}>
              {userProfile?.name
                ? `Your personalized AI coach is ready. Let's practice your communication skills!`
                : 'Chat with your AI English coach. Get corrections, tips and real-time feedback.'}
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-sm w-full">
              {['Tell me about yourself', 'Correct my English', 'Practice job interview', 'Help me speak fluently'].map(prompt => (
                <button key={prompt}
                  onClick={() => { setInputText(prompt); }}
                  className="btn-ghost text-left text-sm p-3 rounded-xl"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {message.type === 'ai' && (
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                style={{background:'linear-gradient(135deg,#a855f7,#6366f1)'}}>
                AI
              </div>
            )}
            <div className={`max-w-[75%] px-5 py-3.5 ${
              message.type === 'user' ? 'bubble-user' : 'bubble-ai'
            }`}>
              <p className="leading-relaxed">{message.text}</p>
              <p className="text-xs mt-2 opacity-50">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {message.type === 'user' && (
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                style={{background:'rgba(168,85,247,0.2)',border:'1px solid rgba(168,85,247,0.3)',color:'#c084fc'}}>
                {userProfile?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </motion.div>
        ))}

        {loading && (
          <motion.div className="flex justify-start items-end gap-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
              style={{background:'linear-gradient(135deg,#a855f7,#6366f1)'}}>AI</div>
            <div className="bubble-ai px-5 py-4">
              <div className="flex items-center gap-1.5">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <motion.div key={i} className="w-2 h-2 rounded-full"
                    style={{background:'#a855f7'}}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{background:'var(--color-surface)',borderColor:'rgba(255,255,255,0.06)'}}>
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder={userProfile?.name ? `Message your coach, ${userProfile.name}...` : 'Type your message...'}
            className="input-dark flex-1"
            disabled={loading}
          />
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleSendMessage}
            disabled={loading || !inputText.trim()}
            className="btn-brand px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : 'Send'}
          </motion.button>
        </div>
        <p className="text-center text-xs mt-2" style={{color:'var(--color-text-subtle)'}}>
          Press Enter to send • Powered by Groq AI
        </p>
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
  avatarConfig,
  setAvatarConfig,
  selectedMentorName,
  isSessionStarting,
  setIsSessionStarting,
  userProfile,
  selectedScenario,
  setSelectedScenario,
  generateInitialGreeting,
  latestAvatarSpeech,
  setLatestAvatarSpeech,
  avatarSpeechCooldownRef
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
  setCurrentMode: (mode: 'dashboard' | 'gemini-chat' | 'avatar-chat') => void,
  showSidebar: boolean,
  setShowSidebar: (show: boolean) => void,
  avatarConfig: StartAvatarRequest,
  setAvatarConfig: (config: StartAvatarRequest) => void,
  selectedMentorName: string,
  isSessionStarting: boolean,
  setIsSessionStarting: (value: boolean) => void,
  userProfile: any,
  selectedScenario: any,
  setSelectedScenario: (scenario: any) => void,
  generateInitialGreeting: () => string | null,
  latestAvatarSpeech: string,
  setLatestAvatarSpeech: (speech: string) => void,
  avatarSpeechCooldownRef: React.MutableRefObject<number>
}) {
  const { 
    sessionState, 
    setSessionState, 
    avatarRef,
    isAvatarTalking,
    setIsAvatarTalking,
    handleStreamingTalkingMessage,
    handleEndMessage,
    isUserTalking,
    messages,
    connectionQuality
  } = useStreamingAvatarContext();
  const { startAvatar, stopAvatar } = useStreamingAvatarSession();
  const { 
    startVoiceChat, 
    stopVoiceChat, 
    muteInputAudio, 
    unmuteInputAudio 
  } = useVoiceChat();
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const isSessionConnected = sessionState === StreamingAvatarSessionState.CONNECTED || isSimulated;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const getSubtitleText = () => {
    if (isAvatarTalking) {
      if (latestAvatarSpeech) return latestAvatarSpeech;
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.sender === MessageSender.AVATAR) {
        return lastMsg.content;
      }
      return "";
    }
    if (isListening || isUserTalking) {
      if (voiceText) return voiceText;
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.sender === MessageSender.CLIENT) {
        return lastMsg.content;
      }
      return "";
    }
    return "";
  };

  const subtitleText = getSubtitleText();
  const showSubtitle = showCaptions && !!subtitleText && (isAvatarTalking || isListening || isUserTalking);

  const handleToggleMic = async () => {
    if (isSimulated) {
      if (isVoiceChatActive && !isMuted) {
        stopListening();
        setIsVoiceChatActive(false);
        setIsMuted(true);
      } else {
        setIsVoiceChatActive(true);
        setIsMuted(false);
        startListening();
      }
    } else {
      if (isVoiceChatActive && !isMuted) {
        stopVoiceChat();
      } else {
        await startVoiceChat(false);
      }
    }
  };

  const handleToggleMute = async () => {
    if (isSimulated) {
      if (isMuted) {
        setIsMuted(false);
        if (isVoiceChatActive) {
          startListening();
        }
      } else {
        setIsMuted(true);
        stopListening();
      }
    } else {
      if (isMuted) {
        await unmuteInputAudio();
      } else {
        await muteInputAudio();
      }
    }
  };

  // Auto-start Voice Chat when session state connects
  useEffect(() => {
    if (sessionState === StreamingAvatarSessionState.CONNECTED && !isSimulated && isVoiceChatActive) {
      console.log("[Auto-Start] Automatically initializing Live voice chat stream...");
      startVoiceChat(isMuted);
    }
  }, [sessionState, isSimulated]);

  const handleStartSimulated = (mic: boolean = true) => {
    setErrorMessage(null);
    setIsSimulated(true);
    setIsVoiceChatActive(mic);
    setSessionState(StreamingAvatarSessionState.CONNECTED);
    
    // Create dummy avatarRef
    avatarRef.current = {
      stop: async () => {
        window.speechSynthesis.cancel();
      },
      repeat: (text: string) => {
        setLatestAvatarSpeech(text);
      },
      voiceChat: {
        start: async () => {
          startListening();
        },
        stop: async () => {
          stopListening();
        },
        mute: async () => {},
        unmute: async () => {}
      }
    } as any;

    // Trigger initial greeting response
    const greeting = generateInitialGreeting() || `Hello! I am your AI coach ${selectedMentorName}. How can I assist you today?`;
    
    // Add greeting to messaging UI via context
    handleStreamingTalkingMessage({ text: greeting });
    handleEndMessage();
    
    // Make avatar speak the initial greeting and lock STT until speech ends
    setIsAvatarTalking(true);
    setLatestAvatarSpeech(greeting);
  };

  // Web Speech Synthesis effect for simulated mode
  useEffect(() => {
    if (latestAvatarSpeech && isSimulated) {
      // Cancel previous speak if any
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(latestAvatarSpeech);
      
      // Select best local voice matches
      const voices = window.speechSynthesis.getVoices();
      const isAnn = selectedMentorName.toLowerCase().includes("ann");
      const preferredVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        if (isAnn) {
          return name.includes("female") || name.includes("google us english") || name.includes("zira") || name.includes("samantha") || name.includes("english");
        } else {
          return name.includes("male") || name.includes("david") || name.includes("google") || name.includes("english");
        }
      });
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      setIsAvatarTalking(true);
      
      utterance.onend = () => {
        // Set cooldown timestamp for echo detection
        avatarSpeechCooldownRef.current = Date.now();
        setIsAvatarTalking(false);
        // NOTE: Do NOT call startListening() here — the parent's auto-resume
        // useEffect watches isAvatarTalking and handles mic restart properly
      };
      utterance.onerror = () => {
        avatarSpeechCooldownRef.current = Date.now();
        setIsAvatarTalking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  }, [latestAvatarSpeech, isSimulated, selectedMentorName, setIsAvatarTalking]);

  useEffect(() => {
    if (sessionState === StreamingAvatarSessionState.INACTIVE) {
      setIsSimulated(false);
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    }
  }, [sessionState]);

  const handleStart = async (mic: boolean, cam: boolean, spk: boolean) => {
    setIsStarting(true);
    setIsSessionStarting(true);
    setErrorMessage(null);
    try {
      console.log("Starting avatar session with config:", avatarConfig);
      const response = await fetch("/api/get-access-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(avatarConfig),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
      }
      const token = await response.text();
      await startAvatar(avatarConfig, token);
      setIsVoiceChatActive(mic);
      setIsMuted(!spk);
      setShowUserVideo(cam);
    } catch (error: unknown) {
      console.error("Failed to start avatar:", error);
      const errStr = error instanceof Error ? error.message : String(error);
      setErrorMessage(errStr);
    } finally {
      setIsStarting(false);
      setIsSessionStarting(false);
    }
  };

  useEffect(() => {
    if (latestAvatarSpeech && sessionState === StreamingAvatarSessionState.CONNECTED && avatarRef.current) {
      avatarRef.current.repeat(latestAvatarSpeech);
    }
  }, [latestAvatarSpeech, sessionState, avatarRef]);

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden relative transition-colors duration-300" style={{ background: "var(--color-bg)" }}>
      {/* Main Avatar Video - Full Screen */}
      <div className="flex-1 relative">
        {isSimulated ? (
          <div className="w-full h-full relative overflow-hidden bg-zinc-950 flex flex-col items-center justify-center">
            {/* Background Coach Video - Full Cover Screen */}
            <img 
              src={MENTOR_PRESETS.find(m => m.name === selectedMentorName)?.imagePath || "/Ann.png"} 
              alt={selectedMentorName} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 pointer-events-none"
            />
            {/* Dark Gradient Overlay for subtitle & controls readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none" />

            {/* Speaking Visualizer Border Overlay */}
            {isAvatarTalking && (
              <div className="absolute inset-0 border-8 border-purple-500/60 animate-pulse pointer-events-none z-10" />
            )}
          </div>
        ) : (
          <AvatarVideo ref={videoRef} />
        )}
        
        {/* Avatar Status Overlay */}
        {isSessionConnected && <AvatarStatusOverlay />}
        
        {/* Welcome Message when not connected */}
        <AvatarWelcomeMessage
          userProfile={userProfile}
          selectedScenario={selectedScenario}
          setSelectedScenario={setSelectedScenario}
          avatarConfig={avatarConfig}
          setAvatarConfig={setAvatarConfig}
          generateInitialGreeting={generateInitialGreeting}
          isVoiceChatActive={isVoiceChatActive}
          onStartSession={handleStart}
          isStarting={isStarting}
          errorMessage={errorMessage}
          onClearError={() => setErrorMessage(null)}
          onStartSimulated={handleStartSimulated}
          onBackToDashboard={() => setCurrentMode('dashboard')}
        />

        {isSessionStarting && !isSessionConnected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="rounded-xl border border-white/20 bg-black/50 px-4 py-2 text-white text-sm backdrop-blur-md flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Preparing avatar session...
            </div>
          </div>
        )}

        {isSessionConnected && (
          <motion.div
            className="absolute top-5 left-5 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold backdrop-blur-xl flex items-center gap-2.5 z-20 text-white shadow-lg"
            style={{ background: "rgba(0,0,0,0.45)" }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>Chatting with {selectedMentorName}</span>
            </div>
            
            <div className="w-px h-3 bg-white/25" />
            
            <span className="text-[10px] text-gray-300 font-medium uppercase tracking-wider">
              {isSimulated ? "Free Sim" : "Live WebRTC"}
            </span>

            {connectionQuality !== ConnectionQuality.UNKNOWN && !isSimulated && (
              <>
                <div className="w-px h-3 bg-white/25" />
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                  connectionQuality === ConnectionQuality.GOOD ? 'bg-green-500/25 text-green-400 border border-green-500/20' : 'bg-red-500/25 text-red-400 border border-red-500/20'
                }`}>
                  {connectionQuality}
                </span>
              </>
            )}
          </motion.div>
        )}

        {isSessionConnected && (
          <motion.button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className="absolute top-5 right-5 z-30 p-2.5 md:p-3 rounded-2xl bg-black/45 border border-white/20 text-white hover:bg-black/70 backdrop-blur-xl transition-all shadow-xl flex items-center gap-2 text-xs font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={showRightPanel ? "Collapse Chat Panel" : "Expand Chat Panel"}
          >
            {showRightPanel ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            <span className="hidden sm:inline">{showRightPanel ? "Hide Chat" : "Open Chat"}</span>
          </motion.button>
        )}

        {/* User Video - Picture in Picture */}
        {showUserVideo && (
          <div className="absolute top-16 right-5 w-48 h-36 bg-gray-800 dark:bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-white/20 transition-colors duration-300 z-20 shadow-xl">
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
        {isSessionConnected && (
          <motion.div
            className="absolute bottom-4 md:bottom-6 left-[35%] transform -translate-x-1/2 flex items-center gap-2 bg-black/35 backdrop-blur-xl rounded-3xl p-2.5 md:p-3 border border-white/20 shadow-2xl w-[calc(100%-1.25rem)] md:w-auto justify-center z-30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {/* Microphone Status Indicator */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-2xl border border-white/10">
              <motion.div
                className={`w-3 h-3 rounded-full ${
                  isAvatarTalking
                    ? "bg-purple-400"
                    : isVoiceChatActive && !isMuted
                    ? "bg-emerald-400"
                    : "bg-gray-400"
                }`}
                animate={isAvatarTalking || (isVoiceChatActive && !isMuted) ? { scale: [1, 1.25, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-sm font-medium text-white">
                {isAvatarTalking
                  ? "AI Speaking (Mic Off)"
                  : isVoiceChatActive && !isMuted
                  ? "Mic Active"
                  : "Mic Muted"}
              </span>
            </div>

            {/* Mic Toggle */}
            <motion.button
              onClick={handleToggleMic}
              className={`p-3 rounded-2xl transition-all duration-300 shadow-lg ${
                isVoiceChatActive && !isMuted
                  ? "bg-emerald-500/85 text-white hover:bg-emerald-600/85"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={isVoiceChatActive && !isMuted ? "Turn Mic Off" : "Turn Mic On"}
            >
              {isVoiceChatActive && !isMuted ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </motion.button>

            {/* User Video Toggle (Camera Off by Default) */}
            <motion.button
              onClick={() => setShowUserVideo(!showUserVideo)}
              className={`p-3 rounded-2xl transition-all duration-300 shadow-lg ${
                showUserVideo
                  ? "bg-blue-500/80 text-white hover:bg-blue-600/80"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={showUserVideo ? "Turn Camera Off" : "Turn Camera On"}
            >
              {showUserVideo ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </motion.button>

            {/* Voice Mute/Unmute Toggle */}
            <motion.button
              onClick={handleToggleMute}
              className={`p-3 rounded-2xl transition-all duration-300 shadow-lg ${
                isMuted
                  ? "bg-red-500/80 text-white hover:bg-red-600/80"
                  : "bg-green-500/80 text-white hover:bg-green-600/80"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={isMuted ? "Unmute Speaker" : "Mute Speaker"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </motion.button>

            {/* Captions Toggle (On by Default) */}
            <motion.button
              onClick={() => setShowCaptions(!showCaptions)}
              className={`p-3 rounded-2xl transition-all duration-300 shadow-lg ${
                showCaptions
                  ? "bg-purple-500/80 text-white hover:bg-purple-600/80"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={showCaptions ? "Hide Captions" : "Show Captions"}
            >
              <Captions className="w-5 h-5" />
            </motion.button>

            {/* Fullscreen Toggle */}
            <motion.button
              onClick={toggleFullscreen}
              className="p-3 rounded-2xl bg-white/20 text-white hover:bg-white/30 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </motion.button>

            {/* End Call Button */}
            <motion.button
              onClick={() => {
                setIsVoiceChatActive(false);
                setIsMuted(true);
                stopAvatar();
                setCurrentMode("dashboard");
              }}
              className="p-3 rounded-2xl bg-red-500/80 hover:bg-red-600/80 text-white transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="End Call"
            >
              <Phone className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {/* Scenario Info Overlay */}
        {selectedScenario && isSessionConnected && (
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
        {/* Unified Glassmorphic Subtitle Overlay */}
        {showSubtitle && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-28 left-4 right-4 md:left-10 md:right-10 bg-black/65 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center max-w-2xl mx-auto z-20 shadow-2xl flex flex-col items-center gap-1"
          >
            <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400">
              {isAvatarTalking ? selectedMentorName : "You"}
            </span>
            <span className="text-white text-sm md:text-base font-medium leading-relaxed italic">
              "{subtitleText}"
            </span>
          </motion.div>
        )}
      </div>

      {/* Right Side - Options Panel */}
      {isSessionConnected && showRightPanel && (
        <div className="w-[320px] xl:w-[360px] border-l min-h-0 hidden lg:flex flex-col transition-all duration-300 relative z-30" style={{borderColor:'var(--color-border)', background:'var(--color-surface)'}}>
          {/* Panel Header */}
          <div className="p-4 border-b flex items-center justify-between" style={{borderColor:'var(--color-border)'}}>
            <div>
              <h3 className="text-lg font-semibold theme-text-primary">Live Call Controls</h3>
              <p className="text-sm theme-text-muted">Mentor: {selectedMentorName}</p>
            </div>
            <button
              onClick={() => setShowRightPanel(false)}
              className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
              title="Collapse Panel"
            >
              <PanelRightClose className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Controls */}
          <div className="p-4 border-b" style={{borderColor:'var(--color-border)'}}>
            <AvatarControls />
          </div>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <MessageHistory />
          </div>
        </div>
      )}

      {/* Mobile Conversation Toggle */}
      {isSessionConnected && (
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMessages(!showMessages)}
            className="p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        </div>
      )}

      {/* Mobile Conversation Panel */}
      {showMessages && isSessionConnected && (
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



// Dashboard Mode Component
function DashboardMode({ userProfile, setCurrentMode, setShowScenarios }: { userProfile: any, setCurrentMode: any, setShowScenarios: any }) {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-10 relative" style={{background:'var(--color-bg)'}}>
      {/* Background ambient effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-teal-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-10 relative z-10">
        
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-[2rem] overflow-hidden p-8 sm:p-10 lg:p-12 shadow-2xl theme-card"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-teal-500/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 backdrop-blur-md"
              >
                <Zap className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-medium text-gray-200">Your Daily Goal: 15 mins</span>
              </motion.div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight theme-text-primary">
                Welcome back, <br className="hidden sm:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-400 to-emerald-400">
                  {userProfile?.name || 'Explorer'}
                </span>
              </h1>
              <p className="text-lg sm:text-xl theme-text-muted mb-8 leading-relaxed">
                {userProfile?.learningGoals?.length > 0
                  ? `Ready to master your ${userProfile.learningGoals.slice(0, 2).join(' and ').toLowerCase()}? Your personalized AI coach is tailored for your ${userProfile.targetLanguages?.[0] || 'language'} journey at the ${userProfile.proficiencyLevel?.split(' ')[0] || 'current'} level.`
                  : "Ready to elevate your communication skills today? Dive into a personalized AI coaching session or continue your previous scenarios."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setCurrentMode('avatar-chat')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg bg-gradient-to-r from-teal-400 to-blue-500 text-white hover:from-teal-500 hover:to-blue-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_-10px_rgba(45,212,191,0.5)] border border-teal-400/20"
                >
                  <Video className="w-6 h-6" />
                  Open Live Call
                </button>
                <button 
                  onClick={() => setCurrentMode('gemini-chat')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg bg-gradient-to-r from-purple-600/50 to-blue-600/50 text-white hover:from-purple-500/50 hover:to-blue-500/50 border border-purple-500/30 backdrop-blur-md transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]"
                >
                  <MessageSquare className="w-6 h-6" />
                  Text Practice
                </button>
              </div>
            </div>
            <div className="hidden lg:block relative perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/40 to-teal-400/40 rounded-full blur-[80px]" />
              <motion.div
                initial={{ rotateY: -20, rotateX: 10, y: 20 }}
                animate={{ rotateY: [-20, 0, -20], y: [20, 0, 20] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-64 h-[28rem] bg-gray-900 border-[8px] border-gray-800 rounded-[3rem] shadow-2xl overflow-hidden shadow-teal-500/20"
              >
                {/* Phone Notch */}
                <div className="absolute top-0 inset-x-0 h-6 bg-gray-800 rounded-b-2xl w-1/2 mx-auto z-20" />
                
                {/* Animated Screen Content */}
                <div className="absolute inset-0 bg-black overflow-hidden flex flex-col p-4 pt-10">
                  <div className="text-center mb-6">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 bg-gradient-to-tr from-teal-400 to-blue-500 rounded-full mx-auto mb-3 shadow-[0_0_30px_rgba(45,212,191,0.5)] flex items-center justify-center"
                    >
                      <Video className="w-8 h-8 text-white" />
                    </motion.div>
                    <div className="text-white font-bold text-lg">AI Coach Active</div>
                    <div className="text-teal-400 text-xs">Listening...</div>
                  </div>
                  
                  {/* Scrolling Chat Animation */}
                  <div className="flex-1 relative">
                    <motion.div
                      animate={{ y: [0, -100] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="space-y-4"
                    >
                      <div className="bg-gray-800/80 p-3 rounded-2xl rounded-tl-none w-3/4 shadow-sm border border-gray-700">
                        <div className="h-2 w-1/2 bg-gray-600 rounded mb-2"></div>
                        <div className="h-2 w-full bg-gray-600 rounded"></div>
                      </div>
                      <div className="bg-teal-500/20 p-3 rounded-2xl rounded-tr-none w-3/4 ml-auto border border-teal-500/30">
                        <div className="h-2 w-3/4 bg-teal-400/50 rounded mb-2 ml-auto"></div>
                        <div className="h-2 w-full bg-teal-400/50 rounded"></div>
                      </div>
                      <div className="bg-gray-800/80 p-3 rounded-2xl rounded-tl-none w-3/4 shadow-sm border border-gray-700">
                        <div className="h-2 w-full bg-gray-600 rounded mb-2"></div>
                        <div className="h-2 w-2/3 bg-gray-600 rounded"></div>
                      </div>
                      <div className="bg-teal-500/20 p-3 rounded-2xl rounded-tr-none w-3/4 ml-auto border border-teal-500/30">
                        <div className="h-2 w-full bg-teal-400/50 rounded mb-2"></div>
                        <div className="h-2 w-1/2 bg-teal-400/50 rounded ml-auto"></div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Audio Wave Animation */}
                  <div className="h-12 flex items-center justify-center gap-1 border-t border-gray-800 pt-4">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ height: ['20%', '100%', '20%'] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                        className="w-1.5 bg-teal-400 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Total Sessions', value: '12', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-500/20' },
            { label: 'Practice Time', value: '4.5h', icon: Clock, color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-500/20' },
            { label: 'Avg Fluency', value: '85%', icon: Star, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-500/20' },
            { label: 'Scenarios Done', value: '8', icon: Trophy, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-500/20' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 * i }}
              className={`p-6 rounded-[1.5rem] border theme-card transition-all cursor-default ${stat.border}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} shadow-inner`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-sm font-medium theme-text-muted">{stat.label}</div>
                  <div className="text-3xl font-extrabold theme-text-primary">{stat.value}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recommended Scenarios & Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold theme-text-primary flex items-center gap-2">
                <Star className="w-6 h-6 text-teal-400" /> Recommended Scenarios
              </h2>
              <button 
                onClick={() => setShowScenarios(true)}
                className="text-sm font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-teal-400/10"
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {[
                { title: 'Job Interview', desc: 'Practice for a tech role', tag: 'Professional', glowClass: 'bg-blue-500/10 group-hover:bg-blue-500/20' },
                { title: 'Coffee Shop', desc: 'Casual everyday conversation', tag: 'Social', glowClass: 'bg-teal-500/10 group-hover:bg-teal-500/20' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="p-6 rounded-[1.5rem] border theme-card cursor-pointer group transition-all relative overflow-hidden"
                  onClick={() => setCurrentMode('avatar-chat')}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 transition-colors ${item.glowClass}`} />
                  <div className="relative z-10">
                    <div className="text-xs font-semibold px-3 py-1.5 rounded-full mb-4 inline-block border theme-text-muted" style={{background:'var(--panel-soft)', borderColor:'var(--color-border)'}}>
                      {item.tag}
                    </div>
                    <h3 className="text-xl font-bold mb-2 theme-text-primary group-hover:text-teal-400 transition-colors">{item.title}</h3>
                    <p className="text-sm theme-text-muted leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold theme-text-primary flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-400" /> Recent Activity
            </h2>
            <div className="rounded-[1.5rem] border theme-card p-6 sm:p-8 space-y-8 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
              {[
                { action: 'Completed "Airport Check-in"', time: '2 hours ago', icon: Trophy, color: 'text-amber-400' },
                { action: 'Earned "Fast Talker" badge', time: 'Yesterday', icon: Zap, color: 'text-teal-400' },
                { action: 'Updated User Profile', time: '2 days ago', icon: User, color: 'text-blue-400' }
              ].map((activity, i) => (
                <div key={i} className="flex gap-5 items-start relative z-10">
                  {i !== 2 && <div className="absolute left-[1.1rem] top-10 w-0.5 h-12 bg-white/10" />}
                  <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${activity.color}`} style={{borderColor:'var(--color-border)', background:'var(--panel-soft)'}}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="pt-1.5">
                    <p className="text-sm sm:text-base font-semibold theme-text-primary">{activity.action}</p>
                    <p className="text-xs sm:text-sm theme-text-muted mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default FluentFlowApp;