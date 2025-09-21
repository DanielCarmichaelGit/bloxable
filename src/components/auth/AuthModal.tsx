import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, CheckCircle, User, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useAccount } from "@/contexts/AccountProvider";
import Logo from "@/components/Logo";

// Helper functions for better readability
const getLoadingText = (mode: "login" | "signup") => {
  return mode === "login" ? "Signing In..." : "Creating Account...";
};

const getButtonText = (
  mode: "login" | "signup",
  userType: "seller" | "buyer"
) => {
  if (mode === "login") {
    return "Sign In";
  }
  return `Create ${userType === "seller" ? "Seller" : "Buyer"} Account`;
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "signup";
  defaultUserType?: "seller" | "buyer";
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultMode = "login",
  defaultUserType = "buyer",
  onSuccess,
}: AuthModalProps) {
  const { createProfile } = useAccount();
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [userType, setUserType] = useState<"seller" | "buyer">(defaultUserType);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        onSuccess?.();
        onClose();
      } else {
        // Sign up
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords don't match");
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Create the appropriate profile
          const success = await createProfile(
            userType,
            formData.fullName,
            userType === "seller" ? { company_name: "" } : {}
          );

          if (!success) {
            throw new Error("Failed to create user profile");
          }

          if (!data.user.email_confirmed_at) {
            setError("success");
          } else {
            onSuccess?.();
            onClose();
          }
        }
      }
    } catch (error: any) {
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      fullName: "",
      confirmPassword: "",
    });
    setError("");
  };

  const handleModeChange = (newMode: "login" | "signup") => {
    setMode(newMode);
    resetForm();
  };

  const handleUserTypeChange = (newUserType: "seller" | "buyer") => {
    setUserType(newUserType);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-0 shadow-2xl">
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-4 h-8 w-8 p-0"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="text-center">
                <Logo size="md" className="mx-auto mb-4" />
                <CardTitle className="text-2xl">
                  {mode === "login" ? "Welcome Back" : "Create Account"}
                </CardTitle>
                <CardDescription>
                  {mode === "login"
                    ? "Sign in to your account"
                    : "Join our community and get started"}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* User Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">I want to:</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={userType === "buyer" ? "default" : "outline"}
                    className="h-12 flex flex-col items-center space-y-1"
                    onClick={() => handleUserTypeChange("buyer")}
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm">Buy & Use</span>
                  </Button>
                  <Button
                    type="button"
                    variant={userType === "seller" ? "default" : "outline"}
                    className="h-12 flex flex-col items-center space-y-1"
                    onClick={() => handleUserTypeChange("seller")}
                  >
                    <Store className="h-5 w-5" />
                    <span className="text-sm">Sell & Earn</span>
                  </Button>
                </div>
              </div>

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      placeholder="Enter your full name"
                      required={mode === "signup"}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Enter your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {mode === "signup" && (
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      placeholder="Confirm your password"
                      required={mode === "signup"}
                    />
                  </div>
                )}

                {error && (
                  <div
                    className={`text-sm p-3 rounded-md ${
                      error === "success"
                        ? "text-green-600 bg-green-50 dark:bg-green-900/20"
                        : "text-red-600 bg-red-50 dark:bg-red-900/20"
                    }`}
                  >
                    {error === "success"
                      ? "Please check your email and click the confirmation link to complete your registration."
                      : error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div
                        className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
                        aria-hidden="true"
                      ></div>
                      <span>{getLoadingText(mode)}</span>
                    </div>
                  ) : (
                    getButtonText(mode, userType)
                  )}
                </Button>
              </form>

              {/* Mode Toggle */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {mode === "login"
                    ? "Don't have an account?"
                    : "Already have an account?"}
                  <Button
                    variant="link"
                    className="p-0 ml-1 h-auto"
                    onClick={() =>
                      handleModeChange(mode === "login" ? "signup" : "login")
                    }
                  >
                    {mode === "login" ? "Sign up" : "Sign in"}
                  </Button>
                </p>
              </div>

              {/* Benefits for each user type */}
              <div className="pt-4 border-t">
                <div className="space-y-3">
                  {userType === "seller" ? (
                    <>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Low 3% commission on sales</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Global marketplace reach</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Complete analytics dashboard</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Access to automation workflows</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>One-click setup and deployment</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>24/7 community support</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
