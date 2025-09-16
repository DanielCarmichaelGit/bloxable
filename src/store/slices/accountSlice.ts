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

interface AccountState {
  currentProfile: UserProfile | null;
  availableProfiles: UserProfile[];
  loading: boolean;
  error: string | null;
}

const initialState: AccountState = {
  currentProfile: null,
  availableProfiles: [],
  loading: false,
  error: null,
};

// Local storage keys
const PROFILE_STORAGE_KEY = "bloxable_current_profile";

// Helper functions for local storage
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to save to localStorage:", error);
  }
};

const clearStorage = () => {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear localStorage:", error);
  }
};

// Async thunks
export const loadUserProfiles = createAsyncThunk(
  "account/loadProfiles",
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
  "account/switchProfile",
  async (profileType: "seller" | "buyer", { getState, rejectWithValue }) => {
    try {
      const state = getState() as { account: AccountState };
      const currentProfile = state.account.currentProfile;

      if (!currentProfile) {
        throw new Error("No current profile found");
      }

      const userId = currentProfile.user_id;

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
  "account/createProfile",
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
      const state = getState() as { account: AccountState };
      const currentProfile = state.account.currentProfile;

      if (!currentProfile) {
        throw new Error("No current profile found");
      }

      const userId = currentProfile.user_id;

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

const accountSlice = createSlice({
  name: "account",
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
    clearAccount: (state) => {
      state.currentProfile = null;
      state.availableProfiles = [];
      clearStorage();
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
      // Load profiles
      .addCase(loadUserProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.availableProfiles = action.payload.profiles;
        state.currentProfile = action.payload.currentProfile;
        if (action.payload.currentProfile) {
          saveToStorage(PROFILE_STORAGE_KEY, action.payload.currentProfile);
        }
      })
      .addCase(loadUserProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Switch profile
      .addCase(switchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(switchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.availableProfiles = action.payload.profiles;
        state.currentProfile = action.payload.currentProfile;
        if (action.payload.currentProfile) {
          saveToStorage(PROFILE_STORAGE_KEY, action.payload.currentProfile);
          // Also update lastAccountType in localStorage
          localStorage.setItem(
            "lastAccountType",
            action.payload.currentProfile.profile_type
          );
        }
      })
      .addCase(switchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create profile
      .addCase(createProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.availableProfiles = action.payload.profiles;
        state.currentProfile = action.payload.currentProfile;
        if (action.payload.currentProfile) {
          saveToStorage(PROFILE_STORAGE_KEY, action.payload.currentProfile);
          // Also update lastAccountType in localStorage
          localStorage.setItem(
            "lastAccountType",
            action.payload.currentProfile.profile_type
          );
        }
      })
      .addCase(createProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setLoading,
  setError,
  clearError,
  clearAccount,
  setCurrentProfile,
} = accountSlice.actions;

// Selectors
export const selectCurrentProfile = (state: { account: AccountState }) =>
  state.account.currentProfile;
export const selectAvailableProfiles = (state: { account: AccountState }) =>
  state.account.availableProfiles;
export const selectIsLoading = (state: { account: AccountState }) =>
  state.account.loading;
export const selectError = (state: { account: AccountState }) =>
  state.account.error;
export const selectIsSeller = (state: { account: AccountState }) =>
  state.account.currentProfile?.profile_type === "seller";
export const selectIsBuyer = (state: { account: AccountState }) =>
  state.account.currentProfile?.profile_type === "buyer";

export default accountSlice.reducer;
