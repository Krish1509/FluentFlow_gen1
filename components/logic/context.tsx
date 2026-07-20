import {
  ConnectionQuality,
  LiveAvatarSession
} from "@heygen/liveavatar-web-sdk";
import React, { useRef, useState } from "react";

export enum StreamingAvatarSessionState {
  INACTIVE = "inactive",
  CONNECTING = "connecting",
  CONNECTED = "connected",
}

export enum MessageSender {
  CLIENT = "CLIENT",
  AVATAR = "AVATAR",
}

export interface Message {
  id: string;
  sender: MessageSender;
  content: string;
}

type StreamingAvatarContextProps = {
  avatarRef: React.MutableRefObject<LiveAvatarSession | null>;
  basePath?: string;

  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
  isVoiceChatLoading: boolean;
  setIsVoiceChatLoading: (isVoiceChatLoading: boolean) => void;
  isVoiceChatActive: boolean;
  setIsVoiceChatActive: (isVoiceChatActive: boolean) => void;

  sessionState: StreamingAvatarSessionState;
  setSessionState: (sessionState: StreamingAvatarSessionState) => void;
  stream: MediaStream | null;
  setStream: (stream: MediaStream | null) => void;

  messages: Message[];
  clearMessages: () => void;
  handleUserTalkingMessage: (event: any) => void;
  handleStreamingTalkingMessage: (event: any) => void;
  handleEndMessage: () => void;
  addUserMessage: (message: string) => void;

  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
  isUserTalking: boolean;
  setIsUserTalking: (isUserTalking: boolean) => void;
  isAvatarTalking: boolean;
  setIsAvatarTalking: (isAvatarTalking: boolean) => void;

  connectionQuality: ConnectionQuality;
  setConnectionQuality: (connectionQuality: ConnectionQuality) => void;

  userProfile?: any;
  selectedScenario?: any;
};

const StreamingAvatarContext = React.createContext<StreamingAvatarContextProps>(
  {
    avatarRef: { current: null },
    isMuted: true,
    setIsMuted: () => {},
    isVoiceChatLoading: false,
    setIsVoiceChatLoading: () => {},
    sessionState: StreamingAvatarSessionState.INACTIVE,
    setSessionState: () => {},
    isVoiceChatActive: false,
    setIsVoiceChatActive: () => {},
    stream: null,
    setStream: () => {},
    messages: [],
    clearMessages: () => {},
    handleUserTalkingMessage: () => {},
    handleStreamingTalkingMessage: () => {},
    handleEndMessage: () => {},
    addUserMessage: () => {},
    isListening: false,
    setIsListening: () => {},
    isUserTalking: false,
    setIsUserTalking: () => {},
    isAvatarTalking: false,
    setIsAvatarTalking: () => {},
    connectionQuality: ConnectionQuality.UNKNOWN,
    setConnectionQuality: () => {},
    userProfile: null,
    selectedScenario: null,
  },
);

const useStreamingAvatarSessionState = () => {
  const [sessionState, setSessionState] = useState(
    StreamingAvatarSessionState.INACTIVE,
  );
  const [stream, setStream] = useState<MediaStream | null>(null);

  return {
    sessionState,
    setSessionState,
    stream,
    setStream,
  };
};

const useStreamingAvatarVoiceChatState = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [isVoiceChatLoading, setIsVoiceChatLoading] = useState(false);
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(true);

  return {
    isMuted,
    setIsMuted,
    isVoiceChatLoading,
    setIsVoiceChatLoading,
    isVoiceChatActive,
    setIsVoiceChatActive,
  };
};

const useStreamingAvatarMessageState = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const currentSenderRef = useRef<MessageSender | null>(null);

  const handleUserTalkingMessage = (event: any) => {
    if (!event || typeof event.text !== "string") return;
    const text = event.text;
    if (!text) return;

    if (currentSenderRef.current === MessageSender.CLIENT) {
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const lastMsg = prev[prev.length - 1];
        const oldText = lastMsg.content;

        let newContent = text;
        if (oldText && !text.startsWith(oldText) && !oldText.startsWith(text)) {
          const separator = oldText.endsWith(" ") || text.startsWith(" ") ? "" : " ";
          newContent = `${oldText}${separator}${text}`;
        }

        return [
          ...prev.slice(0, -1),
          {
            ...lastMsg,
            content: newContent,
          },
        ];
      });
    } else {
      currentSenderRef.current = MessageSender.CLIENT;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: MessageSender.CLIENT,
          content: text,
        },
      ]);
    }
  };

  const handleStreamingTalkingMessage = (event: any) => {
    if (!event || typeof event.text !== "string") return;
    const text = event.text;
    if (!text) return;

    if (currentSenderRef.current === MessageSender.AVATAR) {
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const lastMsg = prev[prev.length - 1];
        const oldText = lastMsg.content;

        let newContent = text;
        if (oldText && !text.startsWith(oldText) && !oldText.startsWith(text)) {
          const separator = oldText.endsWith(" ") || text.startsWith(" ") ? "" : " ";
          newContent = `${oldText}${separator}${text}`;
        }

        return [
          ...prev.slice(0, -1),
          {
            ...lastMsg,
            content: newContent,
          },
        ];
      });
    } else {
      currentSenderRef.current = MessageSender.AVATAR;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: MessageSender.AVATAR,
          content: text,
        },
      ]);
    }
  };

  const handleEndMessage = () => {
    currentSenderRef.current = null;
  };

  const addUserMessage = (message: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: MessageSender.CLIENT,
        content: message,
      },
    ]);
  };

  return {
    messages,
    clearMessages: () => {
      setMessages([]);
      currentSenderRef.current = null;
    },
    handleUserTalkingMessage,
    handleStreamingTalkingMessage,
    handleEndMessage,
    addUserMessage,
  };
};

const useStreamingAvatarListeningState = () => {
  const [isListening, setIsListening] = useState(false);

  return { isListening, setIsListening };
};

const useStreamingAvatarTalkingState = () => {
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [isAvatarTalking, setIsAvatarTalking] = useState(false);

  return {
    isUserTalking,
    setIsUserTalking,
    isAvatarTalking,
    setIsAvatarTalking,
  };
};

const useStreamingAvatarConnectionQualityState = () => {
  const [connectionQuality, setConnectionQuality] = useState(
    ConnectionQuality.UNKNOWN,
  );

  return { connectionQuality, setConnectionQuality };
};

export const StreamingAvatarProvider = ({
  children,
  basePath,
  userProfile,
  selectedScenario,
}: {
  children: React.ReactNode;
  basePath?: string;
  userProfile?: any;
  selectedScenario?: any;
}) => {
  const avatarRef = React.useRef<LiveAvatarSession>(null);
  const voiceChatState = useStreamingAvatarVoiceChatState();
  const sessionState = useStreamingAvatarSessionState();
  const messageState = useStreamingAvatarMessageState();
  const listeningState = useStreamingAvatarListeningState();
  const talkingState = useStreamingAvatarTalkingState();
  const connectionQualityState = useStreamingAvatarConnectionQualityState();

  return (
    <StreamingAvatarContext.Provider
      value={{
        avatarRef,
        basePath,
        userProfile,
        selectedScenario,
        ...voiceChatState,
        ...sessionState,
        ...messageState,
        ...listeningState,
        ...talkingState,
        ...connectionQualityState,
      }}
    >
      {children}
    </StreamingAvatarContext.Provider>
  );
};

export const useStreamingAvatarContext = () => {
  return React.useContext(StreamingAvatarContext);
};
