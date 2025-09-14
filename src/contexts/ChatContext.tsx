import { createContext, useContext, useState, ReactNode } from "react";
import { ChatSession } from "@/lib/supabase";

interface ChatContextType {
  currentSession: ChatSession | null;
  setCurrentSession: (session: ChatSession | null) => void;
  refreshSessions: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null
  );

  const refreshSessions = () => {
    // This will be used to refresh the session list when needed
    // For now, it's a placeholder for future functionality
  };

  return (
    <ChatContext.Provider
      value={{
        currentSession,
        setCurrentSession,
        refreshSessions,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
