import { useCallback } from "react";

import { useStreamingAvatarContext } from "./context";

export const useTextChat = () => {
  const {
    avatarRef,
    addUserMessage,
    messages,
    userProfile,
    selectedScenario,
    handleStreamingTalkingMessage,
    handleEndMessage
  } = useStreamingAvatarContext();

  const sendMessage = useCallback(
    async (message: string) => {
      if (!avatarRef.current) return;

      // Construct history prior to adding the new message to avoid state update delays
      const history = messages.map((msg) => ({
        role: msg.sender === "CLIENT" ? "user" : "assistant",
        content: msg.content,
      }));

      // Add user message to history for text chat
      addUserMessage(message);

      try {
        const res = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: message,
            userProfile,
            scenario: selectedScenario,
            history,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");
        
        // Add AI response to history
        handleStreamingTalkingMessage({ text: data.reply });
        handleEndMessage();
        
        avatarRef.current.repeat(data.reply);
      } catch (error) {
        console.error("Gemini fetch error:", error);
      }
    },
    [avatarRef, addUserMessage, messages, userProfile, selectedScenario, handleStreamingTalkingMessage, handleEndMessage],
  );

  const sendMessageSync = useCallback(
    async (message: string) => {
      if (!avatarRef.current) return;

      const history = messages.map((msg) => ({
        role: msg.sender === "CLIENT" ? "user" : "assistant",
        content: msg.content,
      }));

      // Add user message to history for text chat
      addUserMessage(message);

      try {
        const res = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: message,
            userProfile,
            scenario: selectedScenario,
            history,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");
        
        // Add AI response to history
        handleStreamingTalkingMessage({ text: data.reply });
        handleEndMessage();
        
        return avatarRef.current?.repeat(data.reply);
      } catch (error) {
        console.error("Gemini fetch error:", error);
      }
    },
    [avatarRef, addUserMessage, messages, userProfile, selectedScenario, handleStreamingTalkingMessage, handleEndMessage],
  );

  const repeatMessage = useCallback(
    (message: string) => {
      if (!avatarRef.current) return;

      // Add user message to history for text chat
      addUserMessage(message);

      return avatarRef.current?.repeat(message);
    },
    [avatarRef, addUserMessage],
  );

  const repeatMessageSync = useCallback(
    async (message: string) => {
      if (!avatarRef.current) return;

      // Add user message to history for text chat
      addUserMessage(message);

      return avatarRef.current?.repeat(message);
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
