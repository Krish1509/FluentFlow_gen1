
import React, { forwardRef, useEffect } from "react";
import { ConnectionQuality } from "@heygen/liveavatar-web-sdk";

import { useConnectionQuality } from "../logic/useConnectionQuality";
import { useStreamingAvatarSession } from "../logic/useStreamingAvatarSession";
import { useStreamingAvatarContext } from "../logic/context";
import { StreamingAvatarSessionState } from "../logic";
import { CloseIcon } from "../Icons";
import { Button } from "../Button";

export const AvatarVideo = forwardRef<HTMLVideoElement>(({ }, ref) => {
  const { sessionState, stopAvatar, avatarRef } = useStreamingAvatarSession();
  const { connectionQuality } = useConnectionQuality();

  const isLoaded = sessionState === StreamingAvatarSessionState.CONNECTED;

  // Connect the stream to the video element
  useEffect(() => {
    if (ref && 'current' in ref && ref.current && isLoaded && avatarRef.current && typeof avatarRef.current.attach === 'function') {
      console.log('Attaching stream to video element');
      avatarRef.current.attach(ref.current);

      const savedSpeaker = localStorage.getItem('selected-speaker');
      if (savedSpeaker && 'setSinkId' in ref.current) {
        (ref.current as any).setSinkId(savedSpeaker)
          .then(() => console.log('Successfully set speaker output on main video:', savedSpeaker))
          .catch((err: any) => console.error('Failed to set speaker output on main video:', err));
      }
    }
  }, [isLoaded, ref, avatarRef]);

  return (
    <>
      {isLoaded && (
        <Button
          className="absolute top-3 right-3 !p-2 bg-zinc-700 bg-opacity-50 z-10"
          onClick={stopAvatar}
        >
          <CloseIcon />
        </Button>
      )}
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      >
        <track kind="captions" />
      </video>
      {sessionState === StreamingAvatarSessionState.CONNECTING && (
        <div className="w-full h-full flex items-center justify-center absolute top-0 left-0 bg-black">
          <div className="text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-white text-lg font-bold">Connecting Coach...</p>
            <p className="text-zinc-400 text-xs mt-2">Setting up your personalized session</p>
          </div>
        </div>
      )}
    </>
  );
});
AvatarVideo.displayName = "AvatarVideo";
