import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import {
  initializeAuth,
  handleAuthChange,
  loadUserProfiles,
  switchProfile,
  createProfile,
  signOut,
  selectUser,
  selectSession,
  selectCurrentProfile,
  selectAvailableProfiles,
  selectIsLoading,
  selectIsInitialized,
  selectIsSeller,
  selectIsBuyer,
  selectError,
} from "@/store/slices/authSlice";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://nzbbzzenziwwxoiisjoz.supabase.co",
  "sb_publishable_pXQbw4-W9-JNpB0jbtfyxA_GVkmycmU"
);

export interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  signOut: () => Promise<void>;
  currentProfile: any;
  availableProfiles: any[];
  switchProfile: (profileType: "seller" | "buyer") => Promise<boolean>;
  createProfile: (
    profileType: "seller" | "buyer",
    fullName?: string,
    additionalData?: Record<string, any>
  ) => Promise<boolean>;
  isSeller: boolean;
  isBuyer: boolean;
  refreshProfiles: () => Promise<void>;
  error: string | null;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function ReduxAuthProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector(selectUser);
  const session = useSelector(selectSession);
  const currentProfile = useSelector(selectCurrentProfile);
  const availableProfiles = useSelector(selectAvailableProfiles);
  const loading = useSelector(selectIsLoading);
  const isInitialized = useSelector(selectIsInitialized);
  const isSeller = useSelector(selectIsSeller);
  const isBuyer = useSelector(selectIsBuyer);
  const error = useSelector(selectError);

  const createBuyerProfile = async (userId: string, fullName?: string) => {
    const { error } = await supabase.from("user_profiles").insert({
      user_id: userId,
      profile_type: "buyer",
      full_name: fullName,
      preferences: {},
      is_active: true,
    });
    return !error;
  };

  const createSellerProfile = async (userId: string, fullName?: string) => {
    const { error } = await supabase.from("user_profiles").insert({
      user_id: userId,
      profile_type: "seller",
      full_name: fullName,
      company_name: "",
      is_active: false,
    });
    return !error;
  };

  // Initialize auth on mount
  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized]);

  // Listen for auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);

      dispatch(handleAuthChange({ event, session }));

      // If user signed in and has no profiles, create both
      if (event === "SIGNED_IN" && session?.user) {
        // Wait a moment for the auth state to update
        setTimeout(async () => {
          try {
            const { data: existingProfiles } = await supabase
              .from("user_profiles")
              .select("*")
              .eq("user_id", session.user.id);

            if (!existingProfiles || existingProfiles.length === 0) {
              console.log(
                "No existing profiles found, creating both buyer and seller profiles"
              );

              // Create both profiles
              const buyerSuccess = await createBuyerProfile(
                session.user.id,
                session.user.user_metadata?.full_name
              );
              const sellerSuccess = await createSellerProfile(
                session.user.id,
                session.user.user_metadata?.full_name
              );

              if (buyerSuccess && sellerSuccess) {
                console.log("Both profiles created successfully");
                // Reload profiles
                dispatch(initializeAuth());
              }
            }
          } catch (error) {
            console.error("Error creating profiles:", error);
          }
        }, 500);
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  const signOutHandler = async () => {
    await dispatch(signOut());
  };

  const switchProfileHandler = async (
    profileType: "seller" | "buyer"
  ): Promise<boolean> => {
    try {
      const result = await dispatch(switchProfile(profileType));
      return result.type.endsWith("fulfilled");
    } catch (error) {
      console.error("Error switching profile:", error);
      return false;
    }
  };

  const createProfileHandler = async (
    profileType: "seller" | "buyer",
    fullName?: string,
    additionalData?: Record<string, any>
  ): Promise<boolean> => {
    try {
      const result = await dispatch(
        createProfile({ profileType, fullName, additionalData })
      );
      return result.type.endsWith("fulfilled");
    } catch (error) {
      console.error("Error creating profile:", error);
      return false;
    }
  };

  const refreshProfiles = async () => {
    if (user?.id) {
      await dispatch(loadUserProfiles(user.id));
    }
  };

  const contextValue: AuthContextType = useMemo(
    () => ({
      user,
      session,
      loading,
      signOut: signOutHandler,
      currentProfile,
      availableProfiles,
      switchProfile: switchProfileHandler,
      createProfile: createProfileHandler,
      isSeller,
      isBuyer,
      refreshProfiles,
      error,
    }),
    [
      user,
      session,
      loading,
      signOutHandler,
      currentProfile,
      availableProfiles,
      switchProfileHandler,
      createProfileHandler,
      isSeller,
      isBuyer,
      refreshProfiles,
      error,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a ReduxAuthProvider");
  }
  return context;
}

export { supabase };
