import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ChatSession, ChatMessage } from "./supabase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Cache utility functions
const CACHE_KEYS = {
  SESSION: "bloxable_session_cache",
  MESSAGES: "bloxable_messages_cache",
  CACHE_TIMESTAMP: "bloxable_cache_timestamp",
} as const;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const cacheUtils = {
  // Save session data to localStorage
  saveSession: (sessionId: string, session: ChatSession) => {
    try {
      const cacheData = {
        sessionId,
        session,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEYS.SESSION, JSON.stringify(cacheData));
    } catch (error) {
      console.warn("Failed to save session to cache:", error);
    }
  },

  // Get session data from localStorage
  getSession: (sessionId: string): ChatSession | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.SESSION);
      if (!cached) return null;

      const {
        sessionId: cachedSessionId,
        session,
        timestamp,
      } = JSON.parse(cached);

      // Check if it's the same session and not expired
      if (
        cachedSessionId === sessionId &&
        Date.now() - timestamp < CACHE_DURATION
      ) {
        return session;
      }

      return null;
    } catch (error) {
      console.warn("Failed to get session from cache:", error);
      return null;
    }
  },

  // Save messages data to localStorage
  saveMessages: (sessionId: string, messages: ChatMessage[]) => {
    try {
      const cacheData = {
        sessionId,
        messages,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEYS.MESSAGES, JSON.stringify(cacheData));
    } catch (error) {
      console.warn("Failed to save messages to cache:", error);
    }
  },

  // Get messages data from localStorage
  getMessages: (sessionId: string): ChatMessage[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.MESSAGES);
      if (!cached) return null;

      const {
        sessionId: cachedSessionId,
        messages,
        timestamp,
      } = JSON.parse(cached);

      // Check if it's the same session and not expired
      if (
        cachedSessionId === sessionId &&
        Date.now() - timestamp < CACHE_DURATION
      ) {
        return messages;
      }

      return null;
    } catch (error) {
      console.warn("Failed to get messages from cache:", error);
      return null;
    }
  },

  // Clear all cache data
  clearCache: () => {
    try {
      localStorage.removeItem(CACHE_KEYS.SESSION);
      localStorage.removeItem(CACHE_KEYS.MESSAGES);
      localStorage.removeItem(CACHE_KEYS.CACHE_TIMESTAMP);
    } catch (error) {
      console.warn("Failed to clear cache:", error);
    }
  },

  // Check if cache is valid for a session
  isCacheValid: (sessionId: string): boolean => {
    try {
      const sessionCache = localStorage.getItem(CACHE_KEYS.SESSION);
      const messagesCache = localStorage.getItem(CACHE_KEYS.MESSAGES);

      if (!sessionCache || !messagesCache) return false;

      const sessionData = JSON.parse(sessionCache);
      const messagesData = JSON.parse(messagesCache);

      return (
        sessionData.sessionId === sessionId &&
        messagesData.sessionId === sessionId &&
        Date.now() - sessionData.timestamp < CACHE_DURATION &&
        Date.now() - messagesData.timestamp < CACHE_DURATION
      );
    } catch (error) {
      return false;
    }
  },
};

// Webhook utility for sending chat data to n8n
export const webhookUtils = {
  // Send chat data to n8n webhook
  sendChatData: async (
    sessionId: string,
    userId: string,
    message: string,
    timestamp: Date
  ) => {
    try {
      const webhookUrl =
        "https://daniel-testing.app.n8n.cloud/webhook-test/chat";

      const payload = {
        sessionId,
        userId,
        message,
        timestamp: timestamp.toISOString(),
      };

      console.log("📤 Sending chat data to webhook:", payload);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Webhook request failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("✅ Webhook response:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to send chat data to webhook:", error);
      // Don't throw error - we don't want webhook failures to break the chat
      return null;
    }
  },
};
