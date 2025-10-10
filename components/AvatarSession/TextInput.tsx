import { TaskType, TaskMode } from "@heygen/streaming-avatar";
import React, { useCallback, useEffect, useState } from "react";
import { usePrevious } from "ahooks";
import { motion } from "framer-motion";

import { Select } from "../Select";
import { Button } from "../Button";
import { SendIcon } from "../Icons";
import { useTextChat } from "../logic/useTextChat";
import { Input } from "../Input";
import { useConversationState } from "../logic/useConversationState";

export const TextInput: React.FC = () => {
  const { sendMessage, sendMessageSync, repeatMessage, repeatMessageSync } =
    useTextChat();
  const { startListening, stopListening } = useConversationState();
  const [taskType, setTaskType] = useState<TaskType>(TaskType.TALK);
  const [taskMode, setTaskMode] = useState<TaskMode>(TaskMode.ASYNC);
  const [message, setMessage] = useState("");

  const handleSend = useCallback(() => {
    if (message.trim() === "") {
      return;
    }
    if (taskType === TaskType.TALK) {
      taskMode === TaskMode.SYNC
        ? sendMessageSync(message)
        : sendMessage(message);
    } else {
      taskMode === TaskMode.SYNC
        ? repeatMessageSync(message)
        : repeatMessage(message);
    }
    setMessage("");
  }, [
    taskType,
    taskMode,
    message,
    sendMessage,
    sendMessageSync,
    repeatMessage,
    repeatMessageSync,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleSend();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSend]);

  const previousText = usePrevious(message);

  useEffect(() => {
    if (!previousText && message) {
      startListening();
    } else if (previousText && !message) {
      stopListening();
    }
  }, [message, previousText, startListening, stopListening]);

  return (
    <div className="bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700/50">
      {/* TALK / ASYNC Dropdowns */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-xs text-purple-600 dark:text-purple-400 mb-2 font-medium">TALK</label>
          <Select
            isSelected={(option) => option === taskType}
            options={Object.values(TaskType)}
            renderOption={(option) => option.toUpperCase()}
            value={taskType.toUpperCase()}
            onSelect={setTaskType}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-purple-600 dark:text-purple-400 mb-2 font-medium">ASYNC</label>
          <Select
            isSelected={(option) => option === taskMode}
            options={Object.values(TaskMode)}
            renderOption={(option) => option.toUpperCase()}
            value={taskMode.toUpperCase()}
            onSelect={setTaskMode}
          />
        </div>
      </div>

      {/* Text Input Area */}
      <div className="flex gap-3 items-center">
        <Input
          className="flex-1"
          placeholder={`Type something for the avatar to ${taskType === TaskType.REPEAT ? "repeat" : "respond"}...`}
          value={message}
          onChange={setMessage}
        />
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            className="!p-3 !bg-purple-600 hover:!bg-purple-700 !text-white rounded-lg shadow-lg" 
            onClick={handleSend}
            disabled={!message.trim()}
          >
            <SendIcon size={20} />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
