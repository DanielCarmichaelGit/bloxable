import { createClient } from "@supabase/supabase-js";
import { apiCache } from "./apiCache";

const supabaseUrl = "https://nzbbzzenziwwxoiisjoz.supabase.co";
const supabaseAnonKey = "sb_publishable_pXQbw4-W9-JNpB0jbtfyxA_GVkmycmU";

// Get the base URL for redirects
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // Fallback for SSR
  return process.env.NODE_ENV === "production"
    ? "https://bloxable.io"
    : "http://localhost:5174";
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Remove PKCE flow for email confirmations - they use simple code exchange
    // flowType: "pkce", // Commented out for email confirmations
    // Ensure proper handling of email confirmations
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

// Export the base URL for use in auth flows
export const getAuthRedirectUrl = () => `${getBaseUrl()}/auth/callback`;

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

export interface UsageTier {
  id: string;
  minUsage: number;
  maxUsage?: number;
  pricePerUnit: number;
}

export interface MarketplaceItem {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  price: number;
  is_free: boolean;
  billing_period:
    | "one_time"
    | "monthly"
    | "yearly"
    | "lifetime"
    | "usage_based";
  source_code_r?: number; // source_code_price
  source_code_format?: "json" | "provided_in_chat" | "url"; // source_code_format
  source_code_url?: string; // source_code_url
  rating: number;
  setup_time?: string;
  installation_url?: string;
  webhook_url?: string;
  tags: string[];
  demo_link?: string;
  stripe_product?: string;
  stripe_price_id?: string;
  stripe_customer?: string;
  status: "draft" | "pending_review" | "active" | "inactive" | "rejected";
  is_public: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string;
  metadata: Record<string, any>;
  // Usage-based pricing fields (now as actual columns)
  usage_pricing_type?: "flat_rate" | "tiered";
  usage_tiers?: UsageTier[];
  flat_usage_price?: number;
  usage_test_completed?: boolean;
}

export interface ChatSession {
  id: string;
  user_id: string;
  agent_id?: string;
  session_name: string;
  created_at: string;
  updated_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  company_name?: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
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

// Agent API functions - Mock implementation (agents table doesn't exist)
export const agentApi = {
  // Create a new agent
  async createAgent(
    _userId: string,
    _name: string,
    _description?: string
  ): Promise<Agent | null> {
    console.log("Agent creation requested but agents table doesn't exist");
    return null;
  },

  // Get all agents for a user
  async getAgents(_userId: string): Promise<Agent[]> {
    console.log("Agent fetch requested but agents table doesn't exist");
    return [];
  },

  // Update agent
  async updateAgent(
    _agentId: string,
    _updates: Partial<Agent>
  ): Promise<Agent | null> {
    console.log("Agent update requested but agents table doesn't exist");
    return null;
  },

  // Delete agent
  async deleteAgent(_agentId: string): Promise<boolean> {
    console.log("Agent deletion requested but agents table doesn't exist");
    return false;
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

// Marketplace Items API functions
export const marketplaceApi = {
  // Create a new marketplace item
  async createItem(
    sellerId: string,
    itemData: Omit<
      MarketplaceItem,
      | "id"
      | "seller_id"
      | "is_free"
      | "rating"
      | "status"
      | "is_public"
      | "created_at"
      | "updated_at"
      | "published_at"
      | "metadata"
    >
  ): Promise<MarketplaceItem | null> {
    try {
      const { data, error } = await supabase
        .from("marketplace_items")
        .insert({
          seller_id: sellerId,
          ...itemData,
          metadata: {},
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating marketplace item:", error);
        return null;
      }

      // Invalidate relevant caches
      apiCache.clear("marketplace_items_public");
      apiCache.clear(`marketplace_items_seller_${sellerId}`);

      return data;
    } catch (error) {
      console.error("Error creating marketplace item:", error);
      return null;
    }
  },

  // Get all marketplace items (public active items)
  async getPublicItems(): Promise<MarketplaceItem[]> {
    return apiCache.get(
      "marketplace_items_public",
      async () => {
        try {
          const { data, error } = await supabase
            .from("marketplace_items")
            .select("*")
            .eq("is_public", true)
            .eq("status", "active")
            .order("published_at", { ascending: false });

          if (error) {
            console.error("Error fetching public marketplace items:", error);
            return [];
          }

          return data || [];
        } catch (error) {
          console.error("Error fetching public marketplace items:", error);
          return [];
        }
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  },

  // Get marketplace items by seller
  async getItemsBySeller(sellerId: string): Promise<MarketplaceItem[]> {
    return apiCache.get(
      `marketplace_items_seller_${sellerId}`,
      async () => {
        try {
          const { data, error } = await supabase
            .from("marketplace_items")
            .select("*")
            .eq("seller_id", sellerId)
            .order("updated_at", { ascending: false });

          if (error) {
            console.error("Error fetching seller marketplace items:", error);
            return [];
          }

          return data || [];
        } catch (error) {
          console.error("Error fetching seller marketplace items:", error);
          return [];
        }
      },
      2 * 60 * 1000 // 2 minutes cache for seller items
    );
  },

  // Get marketplace item by ID
  async getItemById(itemId: string): Promise<MarketplaceItem | null> {
    try {
      const { data, error } = await supabase
        .from("marketplace_items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (error) {
        console.error("Error fetching marketplace item:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching marketplace item:", error);
      return null;
    }
  },

  // Update marketplace item
  async updateItem(
    itemId: string,
    updates: Partial<
      Omit<
        MarketplaceItem,
        | "id"
        | "seller_id"
        | "is_free"
        | "created_at"
        | "updated_at"
        | "published_at"
      >
    >
  ): Promise<MarketplaceItem | null> {
    try {
      const { data, error } = await supabase
        .from("marketplace_items")
        .update(updates)
        .eq("id", itemId)
        .select()
        .single();

      if (error) {
        console.error("Error updating marketplace item:", error);
        return null;
      }

      // Invalidate relevant caches
      apiCache.clear("marketplace_items_public");
      apiCache.clear(`marketplace_items_seller_${data.seller_id}`);

      return data;
    } catch (error) {
      console.error("Error updating marketplace item:", error);
      return null;
    }
  },

  // Delete marketplace item
  async deleteItem(itemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("marketplace_items")
        .delete()
        .eq("id", itemId);

      if (error) {
        console.error("Error deleting marketplace item:", error);
        return false;
      }

      // Invalidate all marketplace caches since we don't know the seller_id
      apiCache.clear("marketplace_items_public");
      // Clear all seller caches (this is a bit aggressive but ensures consistency)
      apiCache.clearAll();

      return true;
    } catch (error) {
      console.error("Error deleting marketplace item:", error);
      return false;
    }
  },

  // Publish marketplace item
  async publishItem(itemId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc("publish_marketplace_item", {
        item_id: itemId,
      });

      if (error) {
        console.error("Error publishing marketplace item:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error publishing marketplace item:", error);
      return false;
    }
  },

  // Unpublish marketplace item
  async unpublishItem(itemId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc("unpublish_marketplace_item", {
        item_id: itemId,
      });

      if (error) {
        console.error("Error unpublishing marketplace item:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error unpublishing marketplace item:", error);
      return false;
    }
  },

  // Search marketplace items
  async searchItems(
    query: string,
    tags?: string[]
  ): Promise<MarketplaceItem[]> {
    try {
      let supabaseQuery = supabase
        .from("marketplace_items")
        .select("*")
        .eq("is_public", true)
        .eq("status", "active");

      if (query) {
        supabaseQuery = supabaseQuery.or(
          `name.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      if (tags && tags.length > 0) {
        supabaseQuery = supabaseQuery.overlaps("tags", tags);
      }

      const { data, error } = await supabaseQuery.order("published_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error searching marketplace items:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error searching marketplace items:", error);
      return [];
    }
  },

  // Configuration management functions
  async saveConfiguration(
    marketplaceItemId: string,
    configData: any
  ): Promise<boolean> {
    try {
      // Use the secure upsert function that handles RLS properly
      const { error } = await supabase.rpc("upsert_marketplace_item_config", {
        p_marketplace_item_id: marketplaceItemId,
        p_platform: configData.platform || "n8n",
        p_trigger_type: configData.trigger_type || "manual",
        p_trigger_config: configData.trigger_config || {},
        p_connection_keys: configData.connection_keys || [],
        p_environment_variables: configData.environment_variables || [],
        p_reporting_webhook: configData.reporting_webhook || null,
        p_execution_timeout: configData.execution_timeout || 300,
        p_retry_config: configData.retry_config || {
          max_retries: 3,
          retry_delay: 1000,
          exponential_backoff: true,
          debounce_enabled: false,
          debounce_value: 1,
          debounce_unit: "minutes",
        },
      });

      if (error) {
        console.error("Error saving configuration:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error saving configuration:", error);
      return false;
    }
  },

  async getConfiguration(
    marketplaceItemId: string
  ): Promise<Record<string, any> | null> {
    try {
      const { data, error } = await supabase
        .from("marketplace_item_configs")
        .select("*")
        .eq("marketplace_item_id", marketplaceItemId)
        .single();

      if (error) {
        console.error("Error fetching configuration:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching configuration:", error);
      return null;
    }
  },

  async deleteConfiguration(marketplaceItemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("marketplace_item_configs")
        .delete()
        .eq("marketplace_item_id", marketplaceItemId);

      if (error) {
        console.error("Error deleting configuration:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting configuration:", error);
      return false;
    }
  },

  // Generate reporting webhook for new configurations
  async generateReportingWebhook(
    marketplaceItemId: string,
    ownerUserId: string
  ): Promise<string | null> {
    console.log("🚀 Starting webhook generation...");
    console.log("Marketplace Item ID:", marketplaceItemId);
    console.log("Owner User ID:", ownerUserId);

    try {
      const payload = {
        marketplace_item_id: marketplaceItemId,
        owner_user_id: ownerUserId,
      };

      console.log("📤 Sending payload to n8n webhook:", payload);

      const response = await fetch(
        "https://daniel-testing.app.n8n.cloud/webhook/generate-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log("📥 Response status:", response.status);
      console.log(
        "📥 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "❌ Failed to generate reporting webhook:",
          response.status,
          errorText
        );
        return null;
      }

      const data = await response.json();
      console.log("📥 Response data:", data);

      const webhookUrl =
        data.webhook_url ||
        data.url ||
        data.webhookUrl ||
        data.reporting_webhook;
      console.log("🔗 Extracted webhook URL:", webhookUrl);

      return webhookUrl || null;
    } catch (error) {
      console.error("❌ Error generating reporting webhook:", error);
      return null;
    }
  },
};

// Contact Form API functions
export const contactApi = {
  // Submit a new contact form
  async submitContactForm(
    data: Omit<ContactSubmission, "id" | "status" | "created_at" | "updated_at">
  ): Promise<ContactSubmission | null> {
    try {
      const { data: submission, error } = await supabase
        .from("contact_submissions")
        .insert([
          {
            name: data.name,
            email: data.email,
            phone: data.phone,
            company_name: data.company_name || null,
            message: data.message,
            status: "new",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error submitting contact form:", error);
        throw error;
      }

      console.log("✅ Contact form submitted successfully:", submission);
      return submission;
    } catch (error) {
      console.error("❌ Error submitting contact form:", error);
      return null;
    }
  },

  // Get all contact submissions (for admin dashboard)
  async getAllSubmissions(): Promise<ContactSubmission[]> {
    try {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching contact submissions:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("❌ Error fetching contact submissions:", error);
      return [];
    }
  },

  // Get submission by ID
  async getSubmissionById(id: string): Promise<ContactSubmission | null> {
    try {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching contact submission:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("❌ Error fetching contact submission:", error);
      return null;
    }
  },

  // Update submission status
  async updateSubmissionStatus(
    id: string,
    status: ContactSubmission["status"]
  ): Promise<ContactSubmission | null> {
    try {
      const { data, error } = await supabase
        .from("contact_submissions")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating contact submission:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("❌ Error updating contact submission:", error);
      return null;
    }
  },
};
