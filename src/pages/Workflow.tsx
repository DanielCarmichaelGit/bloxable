import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Clock,
  DollarSign,
  CheckCircle,
  MessageCircle,
  Send,
  Share2,
  Heart,
  Download,
  Play,
  Pause,
  Copy,
  Check,
  Info,
  Zap,
  Shield,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { api, type Workflow } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function Workflow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "setup" | "reviews">(
    "overview"
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!id) return;

      try {
        const data = await api.getWorkflow(id);
        setWorkflow(data);
      } catch (error) {
        console.error("Failed to fetch workflow:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflow();
  }, [id]);

  const handlePurchase = async () => {
    if (!workflow) return;

    // Check if user is authenticated
    if (!user) {
      // Redirect to buyer auth page with current workflow as redirect
      navigate(`/auth?redirect=${encodeURIComponent(`/workflow/${id}`)}`);
      return;
    }

    setIsPurchasing(true);
    try {
      const result = await api.purchaseWorkflow(workflow.id, {});
      if (result.success) {
        setPurchaseSuccess(true);
      }
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatMessage.trim()) return;

    // Check if user is authenticated
    if (!user) {
      // Redirect to buyer auth page with current workflow as redirect
      navigate(`/auth?redirect=${encodeURIComponent(`/workflow/${id}`)}`);
      return;
    }

    setIsSendingMessage(true);
    try {
      // Here you would typically send the message to your backend
      console.log("Sending message:", chatMessage);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setChatMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleFavorite = () => {
    if (!user) {
      // Redirect to buyer auth page with current workflow as redirect
      navigate(`/auth?redirect=${encodeURIComponent(`/workflow/${id}`)}`);
      return;
    }
    setIsFavorited(!isFavorited);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: workflow?.title,
          text: workflow?.description,
          url: window.location.href,
        });
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback to copy link
      navigator.clipboard.writeText(window.location.href);
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowSuccessNotification(true);
    setTimeout(() => setShowSuccessNotification(false), 3000);
  };

  const handleDownload = () => {
    if (!user) {
      // Redirect to buyer auth page with current workflow as redirect
      navigate(`/auth?redirect=${encodeURIComponent(`/workflow/${id}`)}`);
      return;
    }
    // Simulate download
    console.log("Downloading workflow...");
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Workflow not found
          </h1>
          <Button asChild>
            <Link to="/marketplace">Back to Marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (purchaseSuccess) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Purchase Successful!
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your workflow has been purchased and is ready to deploy. You'll
              receive setup instructions via email.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/marketplace">Browse More Workflows</Link>
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/marketplace">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Workflow Info */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Workflow Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {workflow.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-current text-yellow-500" />
                      <span>4.8</span>
                      <span className="text-sm">(127 reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{workflow.setupTime || "1hr"} setup</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>2.3k users</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {workflow.triggerType}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFavorite}
                    className={isFavorited ? "text-red-500" : ""}
                  >
                    <Heart
                      className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className={isShared ? "text-green-500" : ""}
                  >
                    {isShared ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Share2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Description with expand/collapse */}
              <div className="mb-6">
                <p
                  className={`text-lg text-muted-foreground ${
                    !showFullDescription ? "line-clamp-3" : ""
                  }`}
                >
                  {workflow.description}
                </p>
                {workflow.description.length > 200 && (
                  <Button
                    variant="link"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="p-0 h-auto mt-2"
                  >
                    {showFullDescription ? "Show less" : "Show more"}
                  </Button>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {workflow.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!user}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={handlePlayPause}>
                  {isPlaying ? (
                    <Pause className="h-4 w-4 mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {isPlaying ? "Pause" : "Demo"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Tabbed Content */}
            <div className="mb-8">
              <div className="flex space-x-1 mb-6 border-b">
                {[
                  { id: "overview", label: "Overview", icon: Info },
                  { id: "setup", label: "Setup Guide", icon: Zap },
                  { id: "reviews", label: "Reviews", icon: Star },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px]">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* What You'll Need */}
                    {workflow.configRequirements.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Shield className="h-5 w-5 mr-2" />
                            What You'll Need
                          </CardTitle>
                          <CardDescription>
                            Required credentials and accounts to set up this
                            workflow
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {workflow.configRequirements.map((requirement) => (
                              <div
                                key={requirement.id}
                                className="flex items-start space-x-3 p-3 rounded-lg border"
                              >
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">
                                    {requirement.label}
                                  </p>
                                  {requirement.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {requirement.description}
                                    </p>
                                  )}
                                  {requirement.placeholder && (
                                    <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted px-2 py-1 rounded">
                                      {requirement.placeholder}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Features */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Features</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            "One-click deployment",
                            "Real-time monitoring",
                            "Error handling",
                            "Custom notifications",
                            "Data validation",
                            "API integration",
                          ].map((feature) => (
                            <div
                              key={feature}
                              className="flex items-center space-x-2"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === "setup" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Setup Instructions
                        </CardTitle>
                        <CardDescription>
                          Follow these steps to get your workflow running
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            "Download the workflow configuration file",
                            "Set up your required accounts and get API keys",
                            "Configure the workflow with your credentials",
                            "Test the workflow with sample data",
                            "Deploy to your production environment",
                            "Monitor and maintain your workflow",
                          ].map((step, index) => (
                            <div
                              key={index}
                              className="flex items-start space-x-3"
                            >
                              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                {index + 1}
                              </div>
                              <p className="text-sm">{step}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Customer Reviews
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-2xl font-bold">4.8</span>
                        <span className="text-muted-foreground">
                          (127 reviews)
                        </span>
                      </div>
                    </div>

                    {/* Mock Reviews */}
                    {[
                      {
                        name: "Sarah Johnson",
                        rating: 5,
                        comment:
                          "This workflow saved me hours every week. Setup was super easy!",
                      },
                      {
                        name: "Mike Chen",
                        rating: 5,
                        comment:
                          "Perfect for our small business. Customer inquiries are now automatically tracked.",
                      },
                      {
                        name: "Emily Davis",
                        rating: 4,
                        comment:
                          "Great workflow, just wish the documentation was a bit clearer.",
                      },
                    ].map((review, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {review.name[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {review.name}
                              </p>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {review.comment}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Purchase Card */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="sticky top-24 border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl">
                      ${workflow.price}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      One-time purchase
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>
                <CardDescription>
                  Lifetime access • No recurring fees
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Instant download & setup support</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>

                {/* Seller Info */}
                <div className="border-t pt-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {workflow.seller.name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        Sold by {workflow.seller.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Verified seller
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardContent className="pt-0">
                {/* Chat Section */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>Ask a question</span>
                  </div>

                  <div className="space-y-2">
                    <Textarea
                      placeholder={
                        user
                          ? "Type your question here..."
                          : "Sign in to ask questions..."
                      }
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      disabled={!user}
                      className="min-h-[60px] resize-none"
                    />
                    <Button
                      onClick={handleChatSubmit}
                      disabled={
                        !chatMessage.trim() || isSendingMessage || !user
                      }
                      className="w-full"
                      size="sm"
                    >
                      {isSendingMessage ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          <span>Sending...</span>
                        </div>
                      ) : (
                        <>
                          <Send className="h-3 w-3 mr-2" />
                          {user ? "Send Message" : "Sign in to Send Message"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="w-full"
                  size="lg"
                >
                  {isPurchasing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Purchasing...</span>
                    </div>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      {user
                        ? `Purchase $${workflow.price}`
                        : `Sign in to Purchase $${workflow.price}`}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccessNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="flex items-center space-x-2 p-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Link copied to clipboard!
              </span>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
