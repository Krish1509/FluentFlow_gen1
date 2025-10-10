import React from "react";
import { motion } from "framer-motion";

import { useVoiceChat } from "../logic/useVoiceChat";
import { Button } from "../Button";
import { LoadingIcon, MicIcon, MicOffIcon } from "../Icons";
import { useConversationState } from "../logic/useConversationState";

export const AudioInput: React.FC = () => {
  const { muteInputAudio, unmuteInputAudio, isMuted, isVoiceChatLoading, isVoiceChatActive } =
    useVoiceChat();
  const { isUserTalking } = useConversationState();

  const handleMuteClick = () => {
    if (isMuted) {
      unmuteInputAudio();
    } else {
      muteInputAudio();
    }
  };

  return (
    <div className="bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700/50">
      <div className="flex flex-col items-center gap-4">
        {/* Voice Status */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {isVoiceChatLoading ? "Starting voice chat..." : 
             !isVoiceChatActive ? "Voice chat not active" :
             isMuted ? "Microphone muted" : 
             isUserTalking ? "Listening..." : "Ready to listen"}
          </p>
        </div>

        {/* Voice Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <Button
            className={`!p-4 relative rounded-full transition-all duration-200 ${
              isMuted 
                ? "!bg-red-600 hover:!bg-red-700" 
                : isUserTalking 
                  ? "!bg-green-600 hover:!bg-green-700" 
                  : "!bg-blue-600 hover:!bg-blue-700"
            } !text-white shadow-lg`}
            disabled={isVoiceChatLoading}
            onClick={handleMuteClick}
          >
            {/* Animated Ring */}
            <div
              className={`absolute inset-0 rounded-full border-2 ${
                isUserTalking 
                  ? "border-green-400 animate-ping" 
                  : "border-blue-400"
              }`}
            />
            
            {/* Icon */}
            {isVoiceChatLoading ? (
              <LoadingIcon className="animate-spin" size={24} />
            ) : isMuted ? (
              <MicOffIcon size={24} />
            ) : (
              <MicIcon size={24} />
            )}
          </Button>
        </motion.div>

        {/* Voice Instructions */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isMuted ? "Click to unmute microphone" : "Click to mute microphone"}
          </p>
        </div>
      </div>
    </div>
  );
};
