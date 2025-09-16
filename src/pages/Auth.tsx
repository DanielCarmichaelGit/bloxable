import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, CheckCircle, User, Store } from "lucide-react";
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
import { supabase, getAuthRedirectUrl } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";

export default function Auth() {
  const { createProfile } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const userType = searchParams.get("type") || "buyer"; // buyer or seller

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        // Redirect based on user type or default dashboard
        if (userType === "seller") {
          navigate("/seller/dashboard");
        } else {
          navigate("/dashboard");
        }
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
            emailRedirectTo: `${getAuthRedirectUrl()}?redirect=${encodeURIComponent(
              redirectTo
            )}`,
          },
        });

        if (error) throw error;

        if (data.user) {
          if (!data.user.email_confirmed_at) {
            // Show success message for email confirmation
            setError("success");
            // Both profiles will be created after email confirmation
          } else {
            // Create both profiles immediately if email is already confirmed
            await createBothProfiles(formData.fullName);

            // Redirect based on user type
            if (userType === "seller") {
              navigate("/seller/dashboard");
            } else {
              navigate("/dashboard");
            }
          }
        }
      }
    } catch (error: any) {
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createBothProfiles = async (fullName: string) => {
    try {
      // Create buyer profile
      await createProfile("buyer", fullName, {
        preferences: {},
      });

      // Create seller profile
      await createProfile("seller", fullName, {
        company_name: "",
      });

      console.log("Both buyer and seller profiles created successfully");
    } catch (error) {
      console.error("Error creating profiles:", error);
      throw new Error(
        "Failed to create user profiles. Please contact support."
      );
    }
  };

  const getPageTitle = () => {
    if (isLogin) {
      return userType === "seller" ? "Welcome Back, Seller" : "Welcome Back";
    }
    return userType === "seller" ? "Join as a Seller" : "Create Your Account";
  };

  const getPageDescription = () => {
    if (isLogin) {
      return userType === "seller"
        ? "Sign in to access your seller dashboard"
        : "Sign in to access your workflows";
    }
    return userType === "seller"
      ? "Create your account and start selling workflows"
      : "Create your account and start automating";
  };

  const getBenefits = () => {
    if (userType === "seller") {
      return [
        {
          icon: CheckCircle,
          title: "Low Commission Rates",
          description:
            "Only 3% on one-time purchases, 1% on recurring subscriptions",
        },
        {
          icon: Store,
          title: "Global Marketplace",
          description:
            "Reach customers worldwide with your automation workflows",
        },
        {
          icon: CheckCircle,
          title: "Complete Dashboard",
          description: "Track sales, manage workflows, and view analytics",
        },
      ];
    } else {
      return [
        {
          icon: CheckCircle,
          title: "One-Click Setup",
          description:
            "Deploy workflows instantly with our simple setup process",
        },
        {
          icon: User,
          title: "Community Support",
          description:
            "Get help from our active community and expert support team",
        },
        {
          icon: CheckCircle,
          title: "Proven Workflows",
          description:
            "Access tested and verified automation workflows from experts",
        },
      ];
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Button variant="ghost" asChild>
          <Link to={userType === "seller" ? "/seller" : "/"}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {userType === "seller" ? "Seller Info" : "Home"}
          </Link>
        </Button>
      </div>

      <div className="flex min-h-screen">
        {/* Left Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <Logo size="lg" className="mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {getPageTitle()}
              </h1>
              <p className="text-muted-foreground">{getPageDescription()}</p>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
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
                        required={!isLogin}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
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

                  {!isLogin && (
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
                        required={!isLogin}
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>
                          {isLogin ? "Signing In..." : "Creating Account..."}
                        </span>
                      </div>
                    ) : isLogin ? (
                      "Sign In"
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {isLogin
                      ? "Don't have an account?"
                      : "Already have an account?"}
                    <Button
                      variant="link"
                      className="p-0 ml-1 h-auto"
                      onClick={() => setIsLogin(!isLogin)}
                    >
                      {isLogin ? "Sign up" : "Sign in"}
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Side - Benefits */}
        <div className="hidden lg:flex flex-1 bg-muted/20 p-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-lg"
          >
            <h2 className="text-3xl font-bold text-foreground mb-6">
              {userType === "seller"
                ? "Start Your Journey as a Seller"
                : "Start Automating Today"}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {userType === "seller"
                ? "Join thousands of successful sellers who are already earning from their automation expertise."
                : "Join thousands of users who are already saving time and increasing productivity with our automation workflows."}
            </p>

            <div className="space-y-6">
              {getBenefits().map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <benefit.icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">
                  What happens next?
                </span>
              </div>
              <ul className="text-sm space-y-2 text-muted-foreground">
                {userType === "seller" ? (
                  <>
                    <li>• Complete your seller profile</li>
                    <li>• Create your first workflow</li>
                    <li>• Start earning from day one</li>
                    <li>• Access seller tools and analytics</li>
                  </>
                ) : (
                  <>
                    <li>• Browse our marketplace of workflows</li>
                    <li>• Purchase and deploy instantly</li>
                    <li>• Start saving time immediately</li>
                    <li>• Access your personal dashboard</li>
                  </>
                )}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
