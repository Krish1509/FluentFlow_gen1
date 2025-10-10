import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useVoiceChat } from "../logic/useVoiceChat";
import { Button } from "../Button";
import { useInterrupt } from "../logic/useInterrupt";

import { AudioInput } from "./AudioInput";
import { TextInput } from "./TextInput";

export const AvatarControls: React.FC = () => {
  const {
    isVoiceChatLoading,
    isVoiceChatActive,
    startVoiceChat,
    stopVoiceChat,
  } = useVoiceChat();
  const { interrupt } = useInterrupt();

  return (
    <div className="flex flex-col gap-4 relative w-full items-center">
      {/* Modern Toggle Group */}
      <ToggleGroup
        className={`bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-1 border border-gray-200 dark:border-gray-700/50 ${isVoiceChatLoading ? "opacity-50" : ""}`}
        disabled={isVoiceChatLoading}
        type="single"
        value={isVoiceChatActive || isVoiceChatLoading ? "voice" : "text"}
        onValueChange={(value) => {
          if (value === "voice" && !isVoiceChatActive && !isVoiceChatLoading) {
            startVoiceChat();
          } else if (
            value === "text" &&
            isVoiceChatActive &&
            !isVoiceChatLoading
          ) {
            stopVoiceChat();
          }
        }}
      >
        <ToggleGroupItem
          className="data-[state=on]:bg-purple-600 data-[state=on]:text-white data-[state=on]:shadow-lg rounded-lg px-4 py-2 text-sm font-medium w-[100px] text-center transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
          value="voice"
        >
          🎤 Voice Chat
        </ToggleGroupItem>
        <ToggleGroupItem
          className="data-[state=on]:bg-purple-600 data-[state=on]:text-white data-[state=on]:shadow-lg rounded-lg px-4 py-2 text-sm font-medium w-[100px] text-center transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
          value="text"
        >
          💬 Text Chat
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Main Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        {isVoiceChatActive || isVoiceChatLoading ? <AudioInput /> : <TextInput />}
      </motion.div>

      {/* Interrupt Button */}
      <motion.div 
        className="absolute top-[-80px] right-3"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          className="!bg-red-600/90 hover:!bg-red-700 !text-white !px-4 !py-2 rounded-lg shadow-lg backdrop-blur-sm border border-red-500/30" 
          onClick={interrupt}
        >
          ⏹️ Interrupt
        </Button>
      </motion.div>
    </div>
  );
};
