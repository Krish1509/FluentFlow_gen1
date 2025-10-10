import React, { forwardRef, useEffect } from "react";
import { ConnectionQuality } from "@heygen/streaming-avatar";

import { useConnectionQuality } from "../logic/useConnectionQuality";
import { useStreamingAvatarSession } from "../logic/useStreamingAvatarSession";
import { useStreamingAvatarContext } from "../logic/context";
import { StreamingAvatarSessionState } from "../logic";
import { CloseIcon } from "../Icons";
import { Button } from "../Button";

export const AvatarVideo = forwardRef<HTMLVideoElement>(({}, ref) => {
  const { sessionState, stopAvatar, stream } = useStreamingAvatarSession();
  const { connectionQuality } = useConnectionQuality();

  const isLoaded = sessionState === StreamingAvatarSessionState.CONNECTED;

  // Connect the stream to the video element
  useEffect(() => {
    if (ref && 'current' in ref && ref.current && stream) {
      console.log('Connecting stream to video element:', stream);
      ref.current.srcObject = stream;
      ref.current.play().catch((error) => {
        console.error('Error playing video:', error);
      });
    } else {
      console.log('Video connection conditions:', {
        hasRef: !!ref,
        hasCurrent: ref && 'current' in ref,
        hasVideoElement: ref && 'current' in ref && !!ref.current,
        hasStream: !!stream
      });
    }
  }, [stream, ref]);

  return (
    <>
      {connectionQuality !== ConnectionQuality.UNKNOWN && (
        <div className="absolute top-3 left-3 bg-black text-white rounded-lg px-3 py-2">
          Connection Quality: {connectionQuality}
        </div>
      )}
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
      {!isLoaded && (
        <div className="w-full h-full flex items-center justify-center absolute top-0 left-0 bg-black">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-white text-lg">Loading Avatar...</p>
            <p className="text-gray-400 text-sm mt-2">Setting up your AI coach</p>
          </div>
        </div>
      )}
    </>
  );
});
AvatarVideo.displayName = "AvatarVideo";
