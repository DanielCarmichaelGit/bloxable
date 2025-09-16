import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface SimpleBuyerProtectedRouteProps {
  children: ReactNode;
}

export default function SimpleBuyerProtectedRoute({
  children,
}: SimpleBuyerProtectedRouteProps) {
  const { user, loading, currentProfile, availableProfiles, switchProfile } =
    useAuth();
  const [hasAttemptedSwitch, setHasAttemptedSwitch] = useState(false);

  useEffect(() => {
    // Only attempt to switch profile once and only if we have a user and profiles
    if (
      user &&
      availableProfiles.length > 0 &&
      !hasAttemptedSwitch &&
      currentProfile?.profile_type !== "buyer"
    ) {
      const hasBuyerProfile = availableProfiles.some(
        (p) => p.profile_type === "buyer"
      );

      if (hasBuyerProfile) {
        console.log("SimpleBuyerProtectedRoute: Switching to buyer profile");
        setHasAttemptedSwitch(true);
        switchProfile("buyer");
      }
    }
  }, [
    user,
    currentProfile,
    availableProfiles,
    switchProfile,
    hasAttemptedSwitch,
  ]);

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
    return <Navigate to="/auth" replace />;
  }

  // If no buyer profile exists, redirect to auth (shouldn't happen with new flow)
  const hasBuyerProfile = availableProfiles.some(
    (p) => p.profile_type === "buyer"
  );
  if (!hasBuyerProfile) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
