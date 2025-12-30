import { TaskMode, TaskType } from "@heygen/streaming-avatar";
import { useCallback } from "react";

import { useStreamingAvatarContext } from "./context";

export const useTextChat = () => {
  const { avatarRef, addUserMessage } = useStreamingAvatarContext();

  const sendMessage = useCallback(
    (message: string) => {
      if (!avatarRef.current) return;

      // Add user message to history for text chat
      addUserMessage(message);

      avatarRef.current.speak({
        text: message,
        taskType: TaskType.TALK,
        taskMode: TaskMode.ASYNC,
      });
    },
    [avatarRef, addUserMessage],
  );

  const sendMessageSync = useCallback(
    async (message: string) => {
      if (!avatarRef.current) return;

      // Add user message to history for text chat
      addUserMessage(message);

      return await avatarRef.current?.speak({
        text: message,
        taskType: TaskType.TALK,
        taskMode: TaskMode.SYNC,
      });
    },
    [avatarRef, addUserMessage],
  );

  const repeatMessage = useCallback(
    (message: string) => {
      if (!avatarRef.current) return;

      // Add user message to history for text chat
      addUserMessage(message);

      return avatarRef.current?.speak({
        text: message,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.ASYNC,
      });
    },
    [avatarRef, addUserMessage],
  );

  const repeatMessageSync = useCallback(
    async (message: string) => {
      if (!avatarRef.current) return;

      // Add user message to history for text chat
      addUserMessage(message);

      return await avatarRef.current?.speak({
        text: message,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC,
      });
    },
    [avatarRef, addUserMessage],
  );

  return {
    sendMessage,
    sendMessageSync,
    repeatMessage,
    repeatMessageSync,
  };
};
