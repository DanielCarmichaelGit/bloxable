import { ReactNode, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAccount } from "@/contexts/AccountProvider";

interface SimpleSellerProtectedRouteProps {
  children: ReactNode;
}

export default function SimpleSellerProtectedRoute({
  children,
}: SimpleSellerProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { currentProfile, availableProfiles, switchProfile } = useAccount();

  useEffect(() => {
    // If user has profiles but not seller active, switch to seller
    if (
      user &&
      availableProfiles.length > 0 &&
      currentProfile?.profile_type !== "seller"
    ) {
      const hasSellerProfile = availableProfiles.some(
        (p) => p.profile_type === "seller"
      );
      if (hasSellerProfile) {
        switchProfile("seller");
      }
    }
  }, [user, currentProfile, availableProfiles, switchProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/seller/auth" replace />;
  }

  // If no seller profile exists, redirect to auth (shouldn't happen with new flow)
  const hasSellerProfile = availableProfiles.some(
    (p) => p.profile_type === "seller"
  );
  if (!hasSellerProfile) {
    return <Navigate to="/seller/auth" replace />;
  }

  return <>{children}</>;
}
