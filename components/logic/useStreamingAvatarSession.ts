import {
  LiveAvatarSession,
  SessionEvent,
  AgentEventsEnum,
  ConnectionQuality,
} from "@heygen/liveavatar-web-sdk";
import { StartAvatarRequest } from "./types";
import { useCallback } from "react";

import {
  StreamingAvatarSessionState,
  useStreamingAvatarContext,
} from "./context";
import { useVoiceChat } from "./useVoiceChat";
import { useMessageHistory } from "./useMessageHistory";

export const useStreamingAvatarSession = () => {
  const {
    avatarRef,
    basePath,
    sessionState,
    setSessionState,
    stream,
    setStream,
    setIsListening,
    setIsUserTalking,
    setIsAvatarTalking,
    setConnectionQuality,
    handleUserTalkingMessage,
    handleStreamingTalkingMessage,
    handleEndMessage,
    clearMessages,
    messages,
    userProfile,
    selectedScenario,
  } = useStreamingAvatarContext();
  const { stopVoiceChat } = useVoiceChat();

  useMessageHistory();

  const init = useCallback(
    (token: string) => {
      avatarRef.current = new LiveAvatarSession(token);

      return avatarRef.current;
    },
    [basePath, avatarRef],
  );

  const handleStream = useCallback(
    () => {
      setSessionState(StreamingAvatarSessionState.CONNECTED);
    },
    [setSessionState],
  );

  const handleConnectionQuality = useCallback(
    (quality: ConnectionQuality) => setConnectionQuality(quality),
    [setConnectionQuality],
  );

  const handleUserSpeakStarted = useCallback(() => {
    setIsUserTalking(true);
  }, [setIsUserTalking]);

  const handleUserSpeakEnded = useCallback(() => {
    setIsUserTalking(false);
  }, [setIsUserTalking]);

  const handleAvatarSpeakStarted = useCallback(() => {
    setIsAvatarTalking(true);
  }, [setIsAvatarTalking]);

  const handleAvatarSpeakEnded = useCallback(() => {
    setIsAvatarTalking(false);
  }, [setIsAvatarTalking]);

  const handleUserTranscriptionFinal = useCallback(
    async (event: any) => {
      handleUserTalkingMessage(event);
      handleEndMessage();

      if (!event || typeof event.text !== "string") return;
      const text = event.text.trim();
      if (!text) return;

      console.log("[Voice Interaction] User speech final transcript:", text);

      // Construct conversation history prior to adding the new message to avoid state update delays
      const history = messages.map((msg) => ({
        role: msg.sender === "CLIENT" ? "user" : "assistant",
        content: msg.content,
      }));

      try {
        console.log("[Voice Interaction] Requesting response from Gemini for voice...");
        const res = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            userProfile,
            scenario: selectedScenario || null,
            history,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");
        
        console.log("[Voice Interaction] Received Gemini response:", data.reply);
        
        // Add AI reply to message history
        handleStreamingTalkingMessage({ text: data.reply });
        handleEndMessage();

        if (avatarRef.current) {
          avatarRef.current.repeat(data.reply);
        }
      } catch (error) {
        console.error("[Voice Interaction] Gemini response error:", error);
      }
    },
    [
      handleUserTalkingMessage,
      handleStreamingTalkingMessage,
      handleEndMessage,
      messages,
      userProfile,
      selectedScenario,
      avatarRef
    ],
  );

  const handleAvatarTranscriptionFinal = useCallback(
    (event: any) => {
      handleStreamingTalkingMessage(event);
      handleEndMessage();
    },
    [handleStreamingTalkingMessage, handleEndMessage],
  );

  const stop = useCallback(async () => {
    if (avatarRef.current) {
      if (typeof avatarRef.current.off === 'function') {
        avatarRef.current.off(SessionEvent.SESSION_STREAM_READY, handleStream);
        avatarRef.current.off(SessionEvent.SESSION_DISCONNECTED, stop);
        avatarRef.current.off(
          SessionEvent.SESSION_CONNECTION_QUALITY_CHANGED,
          handleConnectionQuality,
        );
        avatarRef.current.off(AgentEventsEnum.USER_SPEAK_STARTED, handleUserSpeakStarted);
        avatarRef.current.off(AgentEventsEnum.USER_SPEAK_ENDED, handleUserSpeakEnded);
        avatarRef.current.off(AgentEventsEnum.AVATAR_SPEAK_STARTED, handleAvatarSpeakStarted);
        avatarRef.current.off(AgentEventsEnum.AVATAR_SPEAK_ENDED, handleAvatarSpeakEnded);
        avatarRef.current.off(
          AgentEventsEnum.USER_TRANSCRIPTION_CHUNK,
          handleUserTalkingMessage,
        );
        avatarRef.current.off(
          AgentEventsEnum.AVATAR_TRANSCRIPTION_CHUNK,
          handleStreamingTalkingMessage,
        );
        avatarRef.current.off(
          AgentEventsEnum.USER_TRANSCRIPTION,
          handleUserTranscriptionFinal,
        );
        avatarRef.current.off(
          AgentEventsEnum.AVATAR_TRANSCRIPTION,
          handleAvatarTranscriptionFinal,
        );
      }
      if (typeof avatarRef.current.stop === 'function') {
        await avatarRef.current.stop();
      }
      avatarRef.current = null;
    }
    clearMessages();
    stopVoiceChat();
    setIsListening(false);
    setIsUserTalking(false);
    setIsAvatarTalking(false);
    setStream(null);
    setSessionState(StreamingAvatarSessionState.INACTIVE);
  }, [
    handleStream,
    setSessionState,
    setStream,
    avatarRef,
    setIsListening,
    stopVoiceChat,
    clearMessages,
    setIsUserTalking,
    setIsAvatarTalking,
    handleConnectionQuality,
    handleUserSpeakStarted,
    handleUserSpeakEnded,
    handleAvatarSpeakStarted,
    handleAvatarSpeakEnded,
    handleUserTalkingMessage,
    handleStreamingTalkingMessage,
    handleEndMessage,
    handleUserTranscriptionFinal,
    handleAvatarTranscriptionFinal,
  ]);

  const start = useCallback(
    async (config: StartAvatarRequest, token?: string) => {
      if (sessionState !== StreamingAvatarSessionState.INACTIVE) {
        throw new Error("There is already an active session");
      }

      if (!avatarRef.current) {
        if (!token) {
          throw new Error("Token is required");
        }
        init(token);
      }

      if (!avatarRef.current) {
        throw new Error("Avatar is not initialized");
      }

      setSessionState(StreamingAvatarSessionState.CONNECTING);
      avatarRef.current.on(SessionEvent.SESSION_STREAM_READY, handleStream);
      avatarRef.current.on(SessionEvent.SESSION_DISCONNECTED, stop);
      avatarRef.current.on(
        SessionEvent.SESSION_CONNECTION_QUALITY_CHANGED,
        handleConnectionQuality,
      );
      avatarRef.current.on(AgentEventsEnum.USER_SPEAK_STARTED, handleUserSpeakStarted);
      avatarRef.current.on(AgentEventsEnum.USER_SPEAK_ENDED, handleUserSpeakEnded);
      avatarRef.current.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, handleAvatarSpeakStarted);
      avatarRef.current.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, handleAvatarSpeakEnded);
      avatarRef.current.on(
        AgentEventsEnum.USER_TRANSCRIPTION_CHUNK,
        handleUserTalkingMessage,
      );
      avatarRef.current.on(
        AgentEventsEnum.AVATAR_TRANSCRIPTION_CHUNK,
        handleStreamingTalkingMessage,
      );
      avatarRef.current.on(
        AgentEventsEnum.USER_TRANSCRIPTION,
        handleUserTranscriptionFinal,
      );
      avatarRef.current.on(
        AgentEventsEnum.AVATAR_TRANSCRIPTION,
        handleAvatarTranscriptionFinal,
      );

      await avatarRef.current.start();

      return avatarRef.current;
    },
    [
      init,
      handleStream,
      stop,
      setSessionState,
      avatarRef,
      sessionState,
      handleConnectionQuality,
      handleUserSpeakStarted,
      handleUserSpeakEnded,
      handleAvatarSpeakStarted,
      handleAvatarSpeakEnded,
      handleUserTalkingMessage,
      handleStreamingTalkingMessage,
      handleEndMessage,
    ],
  );

  return {
    avatarRef,
    sessionState,
    stream,
    initAvatar: init,
    startAvatar: start,
    stopAvatar: stop,
  };
};
