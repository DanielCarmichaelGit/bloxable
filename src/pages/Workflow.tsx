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
import AuthModal from "@/components/auth/AuthModal";

export default function Workflow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, showAuthModal, setShowAuthModal } = useAuth();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

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
      setShowAuthModal(true);
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
            {/* Workflow Details */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {workflow.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-current text-yellow-500" />
                      <span>4.8</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{workflow.setupTime || "1hr"} setup</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {workflow.triggerType}
                </Badge>
              </div>

              <p className="text-lg text-muted-foreground mb-6">
                {workflow.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {workflow.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                {workflow.tags.length > 4 && (
                  <Badge variant="outline">
                    +{workflow.tags.length - 4} more
                  </Badge>
                )}
              </div>

              {/* What You'll Need */}
              {workflow.configRequirements.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">What You'll Need</CardTitle>
                    <CardDescription>
                      Required credentials and accounts to set up this workflow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {workflow.configRequirements.map((requirement) => (
                        <div
                          key={requirement.id}
                          className="flex items-center space-x-3"
                        >
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          <div>
                            <p className="font-medium text-foreground">
                              {requirement.label}
                            </p>
                            {requirement.description && (
                              <p className="text-sm text-muted-foreground">
                                {requirement.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
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
                  <CardTitle className="text-2xl">${workflow.price}</CardTitle>
                  <div className="flex items-center space-x-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>
                <CardDescription>
                  One-time purchase • Lifetime access
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Instant download</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Setup support included</span>
                  </div>
                </div>
              </CardContent>

              <CardContent className="pt-0">
                {/* Chat Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>Ask a question about this workflow</span>
                  </div>

                  <div className="space-y-2">
                    <Textarea
                      placeholder="Type your question here..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <Button
                      onClick={handleChatSubmit}
                      disabled={!chatMessage.trim() || isSendingMessage}
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
                          Send Message
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
                      Purchase ${workflow.price}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign In to Chat"
        description="Please sign in to ask questions about this workflow."
      />
    </div>
  );
}
