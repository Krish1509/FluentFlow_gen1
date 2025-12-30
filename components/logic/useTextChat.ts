import { TaskMode, TaskType } from "@heygen/streaming-avatar";
import { useCallback } from "react";

import { useStreamingAvatarContext, MessageSender } from "./context";

export const useTextChat = () => {
  const { avatarRef, messages, handleUserTalkingMessage } = useStreamingAvatarContext();

  const sendMessage = useCallback(
    (message: string) => {
      if (!avatarRef.current) return;

      // Add user message to history for text chat
      const userMessage = {
        detail: {
          message: message
        }
      };
      handleUserTalkingMessage(userMessage);

      avatarRef.current.speak({
        text: message,
        taskType: TaskType.TALK,
        taskMode: TaskMode.ASYNC,
      });
    },
    [avatarRef, handleUserTalkingMessage],
  );

  const sendMessageSync = useCallback(
    async (message: string) => {
      if (!avatarRef.current) return;

      // Add user message to history for text chat
      const userMessage = {
        detail: {
          message: message
        }
      };
      handleUserTalkingMessage(userMessage);

      return await avatarRef.current?.speak({
        text: message,
        taskType: TaskType.TALK,
        taskMode: TaskMode.SYNC,
      });
    },
    [avatarRef, handleUserTalkingMessage],
  );

  const repeatMessage = useCallback(
    (message: string) => {
      if (!avatarRef.current) return;

      // Add user message to history for text chat
      const userMessage = {
        detail: {
          message: message
        }
      };
      handleUserTalkingMessage(userMessage);

      return avatarRef.current?.speak({
        text: message,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.ASYNC,
      });
    },
    [avatarRef, handleUserTalkingMessage],
  );

  const repeatMessageSync = useCallback(
    async (message: string) => {
      if (!avatarRef.current) return;

      // Add user message to history for text chat
      const userMessage = {
        detail: {
          message: message
        }
      };
      handleUserTalkingMessage(userMessage);

      return await avatarRef.current?.speak({
        text: message,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC,
      });
    },
    [avatarRef, handleUserTalkingMessage],
  );

  return {
    sendMessage,
    sendMessageSync,
    repeatMessage,
    repeatMessageSync,
  };
};
