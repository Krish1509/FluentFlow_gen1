"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Settings, 
  User, 
  Sparkles,
  Mic,
  MicOff,
  Brain,
  MessageSquare
} from "lucide-react";
import InteractiveAvatar from "./InteractiveAvatar";

interface AnimatedAvatarProps {
  currentText: string;
  isSpeaking: boolean;
  isListening: boolean;
  onStartSession: () => void;
  onStopSession: () => void;
  isSessionActive: boolean;
}

export default function AnimatedAvatar({
  currentText,
  isSpeaking,
  isListening,
  onStartSession,
  onStopSession,
  isSessionActive
}: AnimatedAvatarProps) {
  const [showControls, setShowControls] = useState(false);
  const [avatarMood, setAvatarMood] = useState<'happy' | 'listening' | 'thinking' | 'speaking'>('happy');

  useEffect(() => {
    if (isSpeaking) {
      setAvatarMood('speaking');
    } else if (isListening) {
      setAvatarMood('listening');
    } else if (currentText) {
      setAvatarMood('thinking');
    } else {
      setAvatarMood('happy');
    }
  }, [isSpeaking, isListening, currentText]);

  const getMoodColor = () => {
    switch (avatarMood) {
      case 'speaking': return 'from-green-400 to-blue-500';
      case 'listening': return 'from-purple-400 to-pink-500';
      case 'thinking': return 'from-yellow-400 to-orange-500';
      default: return 'from-blue-400 to-purple-500';
    }
  };

  const getMoodIcon = () => {
    switch (avatarMood) {
      case 'speaking': return Volume2;
      case 'listening': return Mic;
      case 'thinking': return Brain;
      default: return Sparkles;
    }
  };

  const MoodIcon = getMoodIcon();

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 flex flex-col">
      {/* Avatar Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-xl border-b border-white/20 p-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ 
                scale: isSpeaking ? [1, 1.1, 1] : 1,
                rotate: avatarMood === 'thinking' ? [0, 5, -5, 0] : 0
              }}
              transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
              className={`w-12 h-12 bg-gradient-to-r ${getMoodColor()} rounded-2xl flex items-center justify-center shadow-lg`}
            >
              <MoodIcon className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Coach
              </h2>
              <p className="text-sm text-gray-600 capitalize">{avatarMood} mode</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowControls(!showControls)}
            className="p-2 rounded-xl bg-white/60 hover:bg-white/80 shadow-md"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>
      </motion.div>

      {/* Avatar Display */}
      <div className="flex-1 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative h-full bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden"
        >
          {/* Avatar Container */}
          <div className="h-full flex items-center justify-center">
            <motion.div
              animate={{
                scale: isSpeaking ? [1, 1.05, 1] : 1,
                rotate: avatarMood === 'listening' ? [0, 2, -2, 0] : 0
              }}
              transition={{ duration: 0.6, repeat: isSpeaking ? Infinity : 0 }}
              className="w-full h-full"
            >
              <InteractiveAvatar />
            </motion.div>
          </div>

          {/* Status Overlay */}
          <AnimatePresence>
            {isSpeaking && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="w-2 h-2 bg-white rounded-full"
                />
                <span>Speaking</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-4 right-4 bg-purple-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="w-2 h-2 bg-white rounded-full"
                />
                <span>Listening</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current Text Display */}
          <AnimatePresence>
            {currentText && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-white/50"
              >
                <div className="flex items-start space-x-2">
                  <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 leading-relaxed">{currentText}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white/80 backdrop-blur-xl border-t border-white/20 overflow-hidden"
          >
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Avatar Controls</h3>
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isSessionActive ? onStopSession : onStartSession}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                    isSessionActive
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white'
                  }`}
                >
                  {isSessionActive ? (
                    <>
                      <Pause className="w-4 h-4 inline mr-2" />
                      Stop Session
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 inline mr-2" />
                      Start Session
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/60 backdrop-blur-sm border-t border-white/20 p-4"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">12</div>
            <div className="text-xs text-gray-600">Sessions</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">4.8</div>
            <div className="text-xs text-gray-600">Rating</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">95%</div>
            <div className="text-xs text-gray-600">Progress</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
