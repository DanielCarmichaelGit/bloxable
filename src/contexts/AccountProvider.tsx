import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import {
  loadUserProfiles,
  switchProfile,
  createProfile,
  selectCurrentProfile,
  selectAvailableProfiles,
  selectIsLoading,
  selectIsSeller,
  selectIsBuyer,
  selectError,
  clearAccount,
} from "@/store/slices/accountSlice";
import { useAuth } from "./AuthContext";

export interface AccountContextType {
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
  loading: boolean;
  error: string | null;
  refreshProfiles: () => Promise<void>;
}

const AccountContext = React.createContext<AccountContextType | undefined>(
  undefined
);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();

  const currentProfile = useSelector(selectCurrentProfile);
  const availableProfiles = useSelector(selectAvailableProfiles);
  const loading = useSelector(selectIsLoading);
  const isSeller = useSelector(selectIsSeller);
  const isBuyer = useSelector(selectIsBuyer);
  const error = useSelector(selectError);

  // Load profiles when user changes
  useEffect(() => {
    if (user?.id) {
      dispatch(loadUserProfiles(user.id));
    } else {
      // Clear account data when user logs out
      dispatch(clearAccount());
    }
  }, [dispatch, user?.id]);

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

  const contextValue: AccountContextType = {
    currentProfile,
    availableProfiles,
    switchProfile: switchProfileHandler,
    createProfile: createProfileHandler,
    isSeller,
    isBuyer,
    loading,
    error,
    refreshProfiles,
  };

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = React.useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}
