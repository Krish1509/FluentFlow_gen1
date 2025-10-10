"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Brain, 
  MessageCircle,
  Zap,
  Star,
  TrendingUp,
  Users,
  Award
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
  isSpeaking?: boolean;
}

interface AnimatedChatProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
  onSpeakMessage: (messageId: string, text: string) => void;
  speakingMessageId: string | null;
}

export default function AnimatedChat({
  messages,
  onSendMessage,
  onStartListening,
  onStopListening,
  isListening,
  isSpeaking,
  isLoading,
  onSpeakMessage,
  speakingMessageId
}: AnimatedChatProps) {
  const [inputText, setInputText] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText("");
    }
  };

  const quickActions = [
    { icon: MessageCircle, text: "Start a conversation", prompt: "Hello! Let's have a friendly chat." },
    { icon: Brain, text: "Practice speaking", prompt: "Help me practice my English speaking skills." },
    { icon: TrendingUp, text: "Improve vocabulary", prompt: "Teach me some new advanced vocabulary words." },
    { icon: Users, text: "Role play", prompt: "Let's do a role play interview scenario." },
    { icon: Award, text: "Get feedback", prompt: "Please give me feedback on my communication skills." },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-xl border-b border-white/20 p-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FluentFlow
              </h1>
              <p className="text-sm text-gray-600">AI Communication Coach</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="p-2 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg"
            >
              <Zap className="w-5 h-5" />
            </motion.button>
            
            <motion.div
              animate={{ scale: isListening ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
              className="flex items-center space-x-2"
            >
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {isListening ? 'Listening...' : 'Ready'}
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white/60 backdrop-blur-sm border-b border-white/20 overflow-hidden"
          >
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onSendMessage(action.prompt);
                      setShowQuickActions(false);
                    }}
                    className="p-3 rounded-xl bg-white/80 hover:bg-white shadow-md border border-white/50 text-left group"
                  >
                    <action.icon className="w-5 h-5 text-blue-500 mb-2 group-hover:text-purple-600 transition-colors" />
                    <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                      {action.text}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-white/90 backdrop-blur-sm border border-white/50'
                }`}
              >
                {message.type === 'ai' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                    >
                      <Brain className="w-3 h-3 text-white" />
                    </motion.div>
                    <span className="text-xs font-semibold text-gray-600">AI Coach</span>
                    <span className="text-xs text-gray-400">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                )}
                
                <p className="text-sm leading-relaxed">{message.text}</p>
                
                {message.type === 'ai' && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onSpeakMessage(message.id, message.text)}
                    className={`mt-2 p-2 rounded-full transition-colors ${
                      speakingMessageId === message.id
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    {speakingMessageId === message.id ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </motion.button>
                )}
                
                {message.type === 'user' && (
                  <p className="text-blue-100 text-xs mt-2 opacity-80">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                )}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                >
                  <Brain className="w-3 h-3 text-white" />
                </motion.div>
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-xl border-t border-white/20 p-4 shadow-lg"
      >
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <motion.textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message or practice speaking..."
              className="w-full p-4 pr-20 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 resize-none transition-all duration-200 bg-white/90 backdrop-blur-sm"
              rows={1}
              style={{ minHeight: '60px', maxHeight: '120px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (inputText.trim()) handleSubmit(e);
                }
              }}
            />
            
            {/* Voice Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={isListening ? onStopListening : onStartListening}
              className={`absolute right-3 bottom-3 p-3 rounded-full shadow-lg transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
