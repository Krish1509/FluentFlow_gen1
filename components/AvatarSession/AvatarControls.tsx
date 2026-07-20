import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, Sparkles, StopCircle } from "lucide-react";
import { useVoiceChat } from "../logic/useVoiceChat";
import { useTextChat } from "../logic/useTextChat";
import { useInterrupt } from "../logic/useInterrupt";
import { useStreamingAvatarContext } from "../logic/context";

export const AvatarControls: React.FC = () => {
  const { sessionState, isUserTalking, isAvatarTalking } = useStreamingAvatarContext();
  const { sendMessage } = useTextChat();
  const {
    isVoiceChatLoading,
    isVoiceChatActive,
    startVoiceChat,
    stopVoiceChat,
  } = useVoiceChat();
  const { interrupt } = useInterrupt();

  const [message, setMessage] = useState("");

  const handleSend = useCallback(() => {
    if (!message.trim()) return;
    sendMessage(message);
    setMessage("");
  }, [message, sendMessage]);

  // Handle enter key to send message
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && sessionState === "connected" && !isVoiceChatActive) {
        handleSend();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSend, sessionState, isVoiceChatActive]);

  if (sessionState !== "connected") {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md">
        <Sparkles className="w-8 h-8 text-purple-400 mb-3 animate-pulse" />
        <h4 className="text-sm font-semibold text-white mb-1">Session Inactive</h4>
        <p className="text-xs text-gray-400 max-w-[200px]">
          Click "Start Session" on the main video screen to start your coaching call.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Active Session Info / Interruption */}
      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3">
        <div className="flex items-center gap-2">
          {isVoiceChatActive ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-emerald-400">Voice Mode Active</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              <span className="text-xs font-medium text-blue-400">Keyboard Chat Mode</span>
            </>
          )}
        </div>
        
        {isAvatarTalking && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={interrupt}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-xs font-semibold text-red-400 transition-all"
            title="Interrupt avatar speaking"
          >
            <StopCircle className="w-3.5 h-3.5" />
            Interrupt
          </motion.button>
        )}
      </div>

      {/* Main Mode View */}
      <AnimatePresence mode="wait">
        {isVoiceChatActive ? (
          /* VOICE MODE ACTIVE VISUALIZER */
          <motion.div
            key="voice"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-4 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
          >
            <div className="text-center">
              <p className="text-sm font-semibold text-white mb-1">
                {isUserTalking ? "Listening to you..." : isAvatarTalking ? "Avatar is speaking" : "Ready for you to speak..."}
              </p>
              <p className="text-[11px] text-purple-300/80">
                Your microphone is capturing voice input.
              </p>
            </div>

            {/* Pulsing Visualizer Bars */}
            <div className="flex items-end justify-center gap-1 h-10 my-1">
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 rounded-full bg-gradient-to-t from-purple-400 to-indigo-400 animate-pulse"
                  style={{ height: "14px" }}
                  animate={isUserTalking || isAvatarTalking ? {
                    height: isUserTalking
                      ? [10, Math.random() * 35 + 10, 10]
                      : [10, Math.random() * 25 + 10, 10],
                  } : {}}
                  transition={{
                    duration: 0.5 + i * 0.08,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Button to stop voice mode and switch back to text */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={stopVoiceChat}
              disabled={isVoiceChatLoading}
              className="flex items-center justify-center gap-2 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
            >
              <MicOff className="w-4 h-4" />
              Switch to Text Input
            </motion.button>
          </motion.div>
        ) : (
          /* TEXT CHAT INPUT BAR */
          <motion.div
            key="text"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-2 w-full"
          >
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-2.5 shadow-inner focus-within:border-purple-500/50 transition-all duration-300">
              {/* Mic Button on the left inside input */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={isVoiceChatLoading}
                onClick={() => startVoiceChat()}
                className="p-2.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-400 hover:text-purple-300 transition-all"
                title="Start Voice Chat"
              >
                {isVoiceChatLoading ? (
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </motion.button>

              <input
                className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-gray-400/70 py-1.5 px-2"
                placeholder="Type something to respond..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              {/* Send Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!message.trim()}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                  message.trim()
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25"
                    : "bg-white/5 text-gray-500 cursor-not-allowed"
                }`}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
            <p className="text-[10px] text-gray-500 text-center mt-1">
              Press Enter to send. Use the mic button to start voice mode.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
