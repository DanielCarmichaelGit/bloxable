import React, { useState } from "react";
import { useAccount } from "@/contexts/AccountProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, User, Store, Check } from "lucide-react";

export default function AccountSwitcher() {
  const {
    currentProfile,
    availableProfiles,
    switchProfile,
    isSeller,
    isBuyer,
  } = useAccount();
  const [isOpen, setIsOpen] = useState(false);

  const handleSwitchProfile = async (profileType: "seller" | "buyer") => {
    const success = await switchProfile(profileType);
    if (success) {
      // Update localStorage to persist the choice
      localStorage.setItem("lastAccountType", profileType);
      console.log("Account switched to:", profileType);
    }
    setIsOpen(false);
  };

  if (!currentProfile || availableProfiles.length <= 1) {
    return null; // Don't show switcher if no profile or only one profile
  }

  return (
    <div className="relative">
      {/* Switcher Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        {isSeller ? (
          <Store className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {isSeller ? "Seller" : "Buyer"}
        </span>
        <ChevronDown className="h-3 w-3" />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-50">
          <div className="py-1">
            {availableProfiles.map((profile) => {
              const isActive = profile.id === currentProfile.id;
              const isProfileSeller = profile.profile_type === "seller";

              return (
                <button
                  key={profile.id}
                  onClick={() => handleSwitchProfile(profile.profile_type)}
                  className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-accent transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    {isProfileSeller ? (
                      <Store className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="capitalize">{profile.profile_type}</span>
                    {isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  {isActive && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
