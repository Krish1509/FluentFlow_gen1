import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useMessageHistory, MessageSender } from "../logic";

export const MessageHistory: React.FC = () => {
  const { messages } = useMessageHistory();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || messages.length === 0) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-y-auto flex flex-col gap-3 px-4 py-4 text-gray-900 dark:text-white max-h-[200px] custom-scrollbar"
    >
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`flex flex-col gap-2 max-w-[80%] ${
              message.sender === MessageSender.CLIENT
                ? "self-end items-end"
                : "self-start items-start"
            }`}
          >
            {/* Message Header */}
            <div className={`flex items-center gap-2 ${
              message.sender === MessageSender.CLIENT ? "flex-row-reverse" : "flex-row"
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                message.sender === MessageSender.AVATAR 
                  ? "bg-purple-600 text-white" 
                  : "bg-blue-600 text-white"
              }`}>
                {message.sender === MessageSender.AVATAR ? "A" : "U"}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {message.sender === MessageSender.AVATAR ? "Avatar" : "You"}
              </p>
            </div>

            {/* Message Content */}
            <div className={`rounded-2xl px-4 py-3 shadow-lg ${
              message.sender === MessageSender.CLIENT
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-lg"
                : "bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 text-gray-800 dark:text-gray-100 rounded-bl-lg"
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty State */}
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400"
        >
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
            <span className="text-2xl">💬</span>
          </div>
          <p className="text-sm">Start a conversation with your AI avatar</p>
        </motion.div>
      )}
    </div>
  );
};
