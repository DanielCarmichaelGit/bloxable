import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Store, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

interface RoleSwitcherProps {
  onRoleChange?: (role: "seller" | "buyer") => void;
  className?: string;
}

export default function RoleSwitcher({
  onRoleChange,
  className = "",
}: RoleSwitcherProps) {
  const { currentProfile, availableProfiles, switchProfile, createProfile } =
    useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRoleSwitch = async (role: "seller" | "buyer") => {
    setLoading(true);

    try {
      // Check if user already has this profile type
      const existingProfile = availableProfiles.find(
        (p) => p.profile_type === role
      );

      if (existingProfile) {
        // Switch to existing profile
        const success = await switchProfile(role);
        if (success) {
          onRoleChange?.(role);
          setIsOpen(false);
        }
      } else {
        // Create new profile
        const success = await createProfile(role, currentProfile?.full_name);
        if (success) {
          onRoleChange?.(role);
          setIsOpen(false);
        }
      }
    } catch (error) {
      console.error("Error switching role:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: "seller" | "buyer") => {
    return role === "seller" ? Store : User;
  };

  const getRoleLabel = (role: "seller" | "buyer") => {
    return role === "seller" ? "Seller" : "Buyer";
  };

  const getRoleDescription = (role: "seller" | "buyer") => {
    return role === "seller"
      ? "Sell workflows and earn money"
      : "Buy and use automation workflows";
  };

  if (!currentProfile) return null;

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
      >
        <div className="flex items-center space-x-2">
          {React.createElement(getRoleIcon(currentProfile.profile_type), {
            className: "h-4 w-4",
          })}
          <span>{getRoleLabel(currentProfile.profile_type)}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 z-50"
        >
          <Card className="border shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Switch Role</CardTitle>
              <CardDescription className="text-xs">
                Choose how you want to use Bloxable
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(["seller", "buyer"] as const).map((role) => {
                const Icon = getRoleIcon(role);
                const isCurrentRole = currentProfile.profile_type === role;
                const hasProfile = availableProfiles.some(
                  (p) => p.profile_type === role
                );

                return (
                  <Button
                    key={role}
                    variant={isCurrentRole ? "default" : "ghost"}
                    className="w-full justify-start h-auto p-3"
                    onClick={() => handleRoleSwitch(role)}
                    disabled={loading || isCurrentRole}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <Icon className="h-5 w-5" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{getRoleLabel(role)}</div>
                        <div className="text-xs text-muted-foreground">
                          {getRoleDescription(role)}
                        </div>
                      </div>
                      {isCurrentRole && <Check className="h-4 w-4" />}
                      {!hasProfile && !isCurrentRole && (
                        <span className="text-xs text-muted-foreground">
                          New
                        </span>
                      )}
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
