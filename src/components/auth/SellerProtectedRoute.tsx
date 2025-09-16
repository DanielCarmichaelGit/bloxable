import { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAccount } from "@/contexts/AccountProvider";
import RoleSwitcher from "./RoleSwitcher";

interface SellerProtectedRouteProps {
  children: ReactNode;
}

export default function SellerProtectedRoute({
  children,
}: SellerProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { currentProfile, availableProfiles, createProfile, switchProfile } =
    useAccount();
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  useEffect(() => {
    const handleProfileCreation = async () => {
      if (
        !user ||
        !currentProfile ||
        currentProfile.profile_type === "seller"
      ) {
        return;
      }

      const hasSellerProfile = availableProfiles.some(
        (p) => p.profile_type === "seller"
      );

      if (!hasSellerProfile && !isCreatingProfile) {
        setIsCreatingProfile(true);
        try {
          const success = await createProfile(
            "seller",
            user.user_metadata?.full_name,
            {
              company_name: "",
            }
          );
          if (success) {
            // Profile created successfully
          }
        } catch (error) {
          console.error("Error creating seller profile:", error);
        } finally {
          setIsCreatingProfile(false);
        }
      } else if (hasSellerProfile) {
        // Switch to existing seller profile
        await switchProfile("seller");
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
            {isCreatingProfile ? "Setting up seller profile..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/seller/auth" replace />;
  }

  // If user doesn't have a seller profile, show role switcher
  if (!currentProfile || currentProfile.profile_type !== "seller") {
    const hasSellerProfile = availableProfiles.some(
      (p) => p.profile_type === "seller"
    );

    return (
      <div className="min-h-screen flex items-center justify-center py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {hasSellerProfile
                ? "Switch to Seller Mode"
                : "Create Seller Profile"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {hasSellerProfile
                ? "You already have a seller profile. Switch to it to access seller features."
                : "Create a seller profile to start selling workflows and earning money."}
            </p>
            <div className="space-y-4">
              <RoleSwitcher
                onRoleChange={(role) => {
                  if (role === "seller") {
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
