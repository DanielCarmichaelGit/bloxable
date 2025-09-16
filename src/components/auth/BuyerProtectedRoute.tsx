import { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import RoleSwitcher from "./RoleSwitcher";

interface BuyerProtectedRouteProps {
  children: ReactNode;
}

export default function BuyerProtectedRoute({
  children,
}: BuyerProtectedRouteProps) {
  const {
    user,
    loading,
    currentProfile,
    availableProfiles,
    createProfile,
    switchProfile,
  } = useAuth();
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  useEffect(() => {
    const handleProfileCreation = async () => {
      if (!user || !currentProfile || currentProfile.profile_type === "buyer") {
        return;
      }

      const hasBuyerProfile = availableProfiles.some(
        (p) => p.profile_type === "buyer"
      );

      if (!hasBuyerProfile && !isCreatingProfile) {
        setIsCreatingProfile(true);
        try {
          const success = await createProfile(
            "buyer",
            user.user_metadata?.full_name,
            {
              preferences: {},
            }
          );
          if (success) {
            // Profile created successfully
          }
        } catch (error) {
          console.error("Error creating buyer profile:", error);
        } finally {
          setIsCreatingProfile(false);
        }
      } else if (hasBuyerProfile) {
        // Switch to existing buyer profile
        await switchProfile("buyer");
      }
    };

    handleProfileCreation();
  }, [
    user,
    currentProfile,
    availableProfiles,
    createProfile,
    switchProfile,
    isCreatingProfile,
  ]);

  if (loading || isCreatingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isCreatingProfile ? "Setting up buyer profile..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user doesn't have a buyer profile, show role switcher
  if (!currentProfile || currentProfile.profile_type !== "buyer") {
    const hasBuyerProfile = availableProfiles.some(
      (p) => p.profile_type === "buyer"
    );

    return (
      <div className="min-h-screen flex items-center justify-center py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {hasBuyerProfile
                ? "Switch to Buyer Mode"
                : "Create Buyer Profile"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {hasBuyerProfile
                ? "You already have a buyer profile. Switch to it to access buyer features."
                : "Create a buyer profile to start buying and using automation workflows."}
            </p>
            <div className="space-y-4">
              <RoleSwitcher
                onRoleChange={(role) => {
                  if (role === "buyer") {
                    window.location.reload(); // Refresh to update the route
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Or{" "}
                <a href="/" className="text-primary hover:underline">
                  go back to home
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
