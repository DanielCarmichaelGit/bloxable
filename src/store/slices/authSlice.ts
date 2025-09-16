import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://nzbbzzenziwwxoiisjoz.supabase.co",
  "sb_publishable_pXQbw4-W9-JNpB0jbtfyxA_GVkmycmU"
);

export interface UserProfile {
  id: string;
  user_id: string;
  profile_type: "seller" | "buyer";
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  company_name?: string;
  website?: string;
  phone?: string;
  address?: any;
  preferences: Record<string, any>;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface AuthState {
  user: User | null;
  session: any;
  currentProfile: UserProfile | null;
  availableProfiles: UserProfile[];
  loading: boolean;
  isInitialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  currentProfile: null,
  availableProfiles: [],
  loading: true,
  isInitialized: false,
  error: null,
};

// Local storage keys
const AUTH_STORAGE_KEY = "bloxable_auth";
const PROFILE_STORAGE_KEY = "bloxable_current_profile";

// Helper functions for local storage
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to save to localStorage:", error);
  }
};

const loadFromStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn("Failed to load from localStorage:", error);
    return null;
  }
};

const clearStorage = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear localStorage:", error);
  }
};

// Async thunks
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (session?.user) {
        // Load profiles for the user
        const { data: profiles, error: profilesError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .order("updated_at", { ascending: false });

        if (profilesError) {
          throw profilesError;
        }

        // Find active profile or default to first one
        const activeProfile =
          profiles?.find((p) => p.is_active) || profiles?.[0] || null;

        return {
          user: session.user,
          session,
          profiles: profiles || [],
          currentProfile: activeProfile,
        };
      }

      return {
        user: null,
        session: null,
        profiles: [],
        currentProfile: null,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadUserProfiles = createAsyncThunk(
  "auth/loadProfiles",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      const activeProfile = data?.find((p) => p.is_active) || data?.[0] || null;

      return {
        profiles: data || [],
        currentProfile: activeProfile,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const switchProfile = createAsyncThunk(
  "auth/switchProfile",
  async (profileType: "seller" | "buyer", { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const userId = state.auth.user?.id;

      if (!userId) {
        throw new Error("No user found");
      }

      const { error } = await supabase.rpc("switch_user_profile", {
        user_uuid: userId,
        new_profile_type: profileType,
      });

      if (error) {
        throw error;
      }

      // Reload profiles to get updated state
      const { data, error: profilesError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      const activeProfile = data?.find((p) => p.is_active) || data?.[0] || null;

      return {
        profiles: data || [],
        currentProfile: activeProfile,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProfile = createAsyncThunk(
  "auth/createProfile",
  async (
    {
      profileType,
      fullName,
      additionalData,
    }: {
      profileType: "seller" | "buyer";
      fullName?: string;
      additionalData?: Record<string, any>;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { auth: AuthState };
      const userId = state.auth.user?.id;

      if (!userId) {
        throw new Error("No user found");
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .eq("profile_type", profileType)
        .single();

      if (existingProfile) {
        // Switch to existing profile
        const { error } = await supabase.rpc("switch_user_profile", {
          user_uuid: userId,
          new_profile_type: profileType,
        });

        if (error) {
          throw error;
        }
      } else {
        // Create new profile
        const { error: rpcError } = await supabase.rpc("create_user_profile", {
          user_uuid: userId,
          profile_type: profileType,
          full_name: fullName,
          additional_data: additionalData || {},
        });

        if (rpcError) {
          // Fallback: Direct insert
          const { error: insertError } = await supabase
            .from("user_profiles")
            .insert({
              user_id: userId,
              profile_type: profileType,
              full_name: fullName,
              preferences: additionalData || {},
              is_active: true,
            });

          if (insertError) {
            throw insertError;
          }
        }
      }

      // Reload profiles
      const { data, error: profilesError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      const activeProfile = data?.find((p) => p.is_active) || data?.[0] || null;

      return {
        profiles: data || [],
        currentProfile: activeProfile,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signOut = createAsyncThunk(
  "auth/signOut",
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      clearStorage();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Handle auth state changes from Supabase
    handleAuthChange: (
      state,
      action: PayloadAction<{ event: string; session: any }>
    ) => {
      const { event, session } = action.payload;

      state.session = session;
      state.user = session?.user ?? null;

      if (event === "SIGNED_OUT") {
        state.currentProfile = null;
        state.availableProfiles = [];
        clearStorage();
      }
    },
    // Set current profile manually (for local storage restoration)
    setCurrentProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.currentProfile = action.payload;
      if (action.payload) {
        saveToStorage(PROFILE_STORAGE_KEY, action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.availableProfiles = action.payload.profiles;
        state.currentProfile = action.payload.currentProfile;
        state.error = null;

        // Save to localStorage
        if (action.payload.user) {
          saveToStorage(AUTH_STORAGE_KEY, {
            user: action.payload.user,
            session: action.payload.session,
          });
        }
        if (action.payload.currentProfile) {
          saveToStorage(PROFILE_STORAGE_KEY, action.payload.currentProfile);
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.error = action.payload as string;
      })

      // Load profiles
      .addCase(loadUserProfiles.fulfilled, (state, action) => {
        state.availableProfiles = action.payload.profiles;
        state.currentProfile = action.payload.currentProfile;
        if (action.payload.currentProfile) {
          saveToStorage(PROFILE_STORAGE_KEY, action.payload.currentProfile);
        }
      })
      .addCase(loadUserProfiles.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Switch profile
      .addCase(switchProfile.fulfilled, (state, action) => {
        state.availableProfiles = action.payload.profiles;
        state.currentProfile = action.payload.currentProfile;
        if (action.payload.currentProfile) {
          saveToStorage(PROFILE_STORAGE_KEY, action.payload.currentProfile);
        }
      })
      .addCase(switchProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Create profile
      .addCase(createProfile.fulfilled, (state, action) => {
        state.availableProfiles = action.payload.profiles;
        state.currentProfile = action.payload.currentProfile;
        if (action.payload.currentProfile) {
          saveToStorage(PROFILE_STORAGE_KEY, action.payload.currentProfile);
        }
      })
      .addCase(createProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Sign out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.session = null;
        state.currentProfile = null;
        state.availableProfiles = [];
        state.loading = false;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setLoading,
  setError,
  clearError,
  handleAuthChange,
  setCurrentProfile,
} = authSlice.actions;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectSession = (state: { auth: AuthState }) => state.auth.session;
export const selectCurrentProfile = (state: { auth: AuthState }) =>
  state.auth.currentProfile;
export const selectAvailableProfiles = (state: { auth: AuthState }) =>
  state.auth.availableProfiles;
export const selectIsLoading = (state: { auth: AuthState }) =>
  state.auth.loading;
export const selectIsInitialized = (state: { auth: AuthState }) =>
  state.auth.isInitialized;
export const selectError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsSeller = (state: { auth: AuthState }) =>
  state.auth.currentProfile?.profile_type === "seller";
export const selectIsBuyer = (state: { auth: AuthState }) =>
  state.auth.currentProfile?.profile_type === "buyer";

export default authSlice.reducer;
