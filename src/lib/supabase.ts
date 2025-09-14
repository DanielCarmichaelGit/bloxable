import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nzbbzzenziwwxoiisjoz.supabase.co";
const supabaseAnonKey = "sb_publishable_pXQbw4-W9-JNpB0jbtfyxA_GVkmycmU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Agent {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "paused";
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  agent_id?: string;
  session_name: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// Agent API functions
export const agentApi = {
  // Create a new agent
  async createAgent(
    userId: string,
    name: string,
    description?: string
  ): Promise<Agent | null> {
    try {
      const { data, error } = await supabase
        .from("agents")
        .insert({
          user_id: userId,
          name,
          description,
          status: "active",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating agent:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error creating agent:", error);
      return null;
    }
  },

  // Get all agents for a user
  async getAgents(userId: string): Promise<Agent[]> {
    try {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching agents:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching agents:", error);
      return [];
    }
  },

  // Update agent
  async updateAgent(
    agentId: string,
    updates: Partial<Agent>
  ): Promise<Agent | null> {
    try {
      const { data, error } = await supabase
        .from("agents")
        .update(updates)
        .eq("id", agentId)
        .select()
        .single();

      if (error) {
        console.error("Error updating agent:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error updating agent:", error);
      return null;
    }
  },

  // Delete agent
  async deleteAgent(agentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("agents")
        .delete()
        .eq("id", agentId);

      if (error) {
        console.error("Error deleting agent:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting agent:", error);
      return false;
    }
  },
};

// Chat API functions
export const chatApi = {
  // Create a new chat session
  async createSession(
    userId: string,
    sessionName: string
  ): Promise<ChatSession | null> {
    try {
      console.log("📡 API: Creating session", { userId, sessionName });

      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: userId,
          session_name: sessionName,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ API Error creating chat session:", error);
        return null;
      }

      console.log("✅ API: Session created successfully", data);
      return data;
    } catch (error) {
      console.error("❌ API Exception creating chat session:", error);
      return null;
    }
  },

  // Get all chat sessions for a user
  async getSessions(userId: string): Promise<ChatSession[]> {
    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching chat sessions:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      return [];
    }
  },

  // Get messages for a specific session
  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  },

  // Save a message
  async saveMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          role,
          content,
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving message:", error);
        return null;
      }

      // Update session updated_at timestamp
      await supabase
        .from("chat_sessions")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", sessionId);

      return data;
    } catch (error) {
      console.error("Error saving message:", error);
      return null;
    }
  },

  // Update session name
  async updateSessionName(
    sessionId: string,
    sessionName: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("chat_sessions")
        .update({
          session_name: sessionName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (error) {
        console.error("Error updating session name:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error updating session name:", error);
      return false;
    }
  },

  // Delete a chat session
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      // First delete all messages in the session
      const { error: messagesError } = await supabase
        .from("chat_messages")
        .delete()
        .eq("session_id", sessionId);

      if (messagesError) {
        console.error("Error deleting messages:", messagesError);
        return false;
      }

      // Then delete the session
      const { error: sessionError } = await supabase
        .from("chat_sessions")
        .delete()
        .eq("id", sessionId);

      if (sessionError) {
        console.error("Error deleting session:", sessionError);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting session:", error);
      return false;
    }
  },
};
