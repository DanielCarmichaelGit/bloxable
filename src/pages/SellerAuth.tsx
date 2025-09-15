import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  Star,
  Users,
  DollarSign,
} from "lucide-react";
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
import Logo from "@/components/Logo";

export default function SellerAuth() {
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

        // Redirect to seller dashboard
        navigate("/seller/dashboard");
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
              user_type: "seller", // Tag the user as a seller
            },
          },
        });

        if (error) throw error;

        if (data.user && !data.user.email_confirmed_at) {
          setError(
            "Please check your email and click the confirmation link to complete your registration."
          );
        } else {
          navigate("/seller/dashboard");
        }
      }
    } catch (error: any) {
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sellerBenefits = [
    {
      icon: DollarSign,
      title: "Earn 80% Revenue Share",
      description: "Keep 80% of every sale you make",
    },
    {
      icon: Users,
      title: "Global Marketplace",
      description: "Reach customers worldwide",
    },
    {
      icon: Star,
      title: "Top Seller Support",
      description: "Dedicated support for sellers",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Button variant="ghost" asChild>
          <Link to="/seller">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Seller Info
          </Link>
        </Button>
      </div>

      <div className="flex min-h-screen">
        {/* Left Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <Logo size="lg" className="mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {isLogin ? "Welcome Back" : "Join as a Seller"}
              </h1>
              <p className="text-muted-foreground">
                {isLogin
                  ? "Sign in to your seller account"
                  : "Create your seller account and start earning"}
              </p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-center">
                  {isLogin ? "Sign In" : "Create Account"}
                </CardTitle>
                <CardDescription className="text-center">
                  {isLogin
                    ? "Enter your credentials to access your dashboard"
                    : "Fill in your details to get started"}
                </CardDescription>
              </CardHeader>
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
                    <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                      {error}
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
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-purple-600 p-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white max-w-lg"
          >
            <h2 className="text-4xl font-bold mb-6">
              Start Your Journey as a Seller
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of successful sellers who are already earning from
              their automation expertise.
            </p>

            <div className="space-y-6">
              {sellerBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <benefit.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      {benefit.title}
                    </h3>
                    <p className="opacity-90">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">What happens next?</span>
              </div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Complete your seller profile</li>
                <li>• Create your first workflow</li>
                <li>• Start earning from day one</li>
                <li>• Access seller tools and analytics</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
