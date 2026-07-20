import { useCallback } from "react";

import { useStreamingAvatarContext } from "./context";

export const useVoiceChat = () => {
  const {
    avatarRef,
    isMuted,
    setIsMuted,
    isVoiceChatActive,
    setIsVoiceChatActive,
    isVoiceChatLoading,
    setIsVoiceChatLoading,
  } = useStreamingAvatarContext();

  const startVoiceChat = useCallback(
    async (isInputAudioMuted?: boolean) => {
      if (!avatarRef.current) {
        console.error("Avatar ref is not available");
        return;
      }
      
      try {
        setIsVoiceChatLoading(true);
        console.log('Starting voice chat with muted:', isInputAudioMuted);
        await avatarRef.current.voiceChat.start();
        if (isInputAudioMuted) {
          await avatarRef.current.voiceChat.mute();
        }
        setIsVoiceChatLoading(false);
        setIsVoiceChatActive(true);
        setIsMuted(!!isInputAudioMuted);
        console.log('Voice chat started successfully');
      } catch (error) {
        console.error('Failed to start voice chat:', error);
        setIsVoiceChatLoading(false);
        setIsVoiceChatActive(false);
        // Show user-friendly error message
        alert('Failed to start voice chat. Please check your microphone permissions and try again.');
      }
    },
    [avatarRef, setIsMuted, setIsVoiceChatActive, setIsVoiceChatLoading],
  );

  const stopVoiceChat = useCallback(() => {
    if (!avatarRef.current) return;
    if (typeof avatarRef.current.voiceChat?.stop === 'function') {
      avatarRef.current.voiceChat.stop();
    }
    setIsVoiceChatActive(false);
    setIsMuted(true);
  }, [avatarRef, setIsMuted, setIsVoiceChatActive]);

  const muteInputAudio = useCallback(async () => {
    if (!avatarRef.current) return;
    await avatarRef.current.voiceChat.mute();
    setIsMuted(true);
  }, [avatarRef, setIsMuted]);

  const unmuteInputAudio = useCallback(async () => {
    if (!avatarRef.current) return;
    await avatarRef.current.voiceChat.unmute();
    setIsMuted(false);
  }, [avatarRef, setIsMuted]);

  return {
    startVoiceChat,
    stopVoiceChat,
    muteInputAudio,
    unmuteInputAudio,
    isMuted,
    isVoiceChatActive,
    isVoiceChatLoading,
  };
};
