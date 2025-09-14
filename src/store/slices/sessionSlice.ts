import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatSession } from "@/lib/supabase";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SessionState {
  currentSession: ChatSession | null;
  messages: Message[];
  sessionName: string;
  isLoading: boolean;
  isTyping: boolean;
  isInitialized: boolean; // Track if session has been initialized
  forceNewSession: boolean; // Force creation of new session
}

const initialState: SessionState = {
  currentSession: null,
  messages: [],
  sessionName: "",
  isLoading: false,
  isTyping: false,
  isInitialized: false,
  forceNewSession: false,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setCurrentSession: (state, action: PayloadAction<ChatSession | null>) => {
      state.currentSession = action.payload;
      if (action.payload) {
        state.sessionName = action.payload.session_name;
      }
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setSessionName: (state, action: PayloadAction<string>) => {
      state.sessionName = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setIsTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    clearSession: (state) => {
      state.currentSession = null;
      state.messages = [];
      state.sessionName = "";
      state.isLoading = false;
      state.isTyping = false;
      state.isInitialized = false;
      state.forceNewSession = false;
    },
    setForceNewSession: (state, action: PayloadAction<boolean>) => {
      state.forceNewSession = action.payload;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    updateSessionName: (state, action: PayloadAction<string>) => {
      if (state.currentSession) {
        state.currentSession.session_name = action.payload;
        state.sessionName = action.payload;
      }
    },
  },
});

export const {
  setCurrentSession,
  setMessages,
  addMessage,
  setSessionName,
  setIsLoading,
  setIsTyping,
  clearSession,
  setForceNewSession,
  setInitialized,
  updateSessionName,
} = sessionSlice.actions;

export default sessionSlice.reducer;
