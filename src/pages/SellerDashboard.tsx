import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Upload,
  DollarSign,
  Tag,
  FileText,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, ConfigRequirement } from "@/lib/api";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function SellerDashboardContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    triggerType: "webhook" as "webhook" | "schedule" | "manual" | "event",
    tags: "",
    imageUrl: "",
    configRequirements: [] as ConfigRequirement[],
  });
  const [configRequirement, setConfigRequirement] = useState<ConfigRequirement>(
    {
      id: "",
      name: "",
      type: "text",
      label: "",
      description: "",
      required: true,
      placeholder: "",
    }
  );

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfigChange = (
    field: keyof ConfigRequirement,
    value: string | boolean
  ) => {
    setConfigRequirement((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addConfigRequirement = () => {
    if (!configRequirement.name || !configRequirement.label) return;

    const newRequirement: ConfigRequirement = {
      ...configRequirement,
      id: `config-${Date.now()}`,
      name: configRequirement.name.toLowerCase().replace(/\s+/g, ""),
    };

    setFormData((prev) => ({
      ...prev,
      configRequirements: [...prev.configRequirements, newRequirement],
    }));

    setConfigRequirement({
      id: "",
      name: "",
      type: "text",
      label: "",
      description: "",
      required: true,
      placeholder: "",
    });
  };

  const removeConfigRequirement = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      configRequirements: prev.configRequirements.filter(
        (req) => req.id !== id
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const workflowData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        triggerType: formData.triggerType,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        imageUrl: formData.imageUrl,
        configRequirements: formData.configRequirements,
        seller: {
          id: "seller-current",
          name: "Your Name",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
        },
        isActive: true,
      };

      await api.createWorkflow(workflowData);
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to create workflow:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Workflow Submitted!
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your workflow has been submitted for review. You'll be notified
              once it's approved and live on the marketplace.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => setSubmitted(false)} size="lg">
              Create Another Workflow
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => (window.location.href = "/marketplace")}
            >
              View Marketplace
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Seller Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Create and manage your automation workflows for the marketplace.
          </p>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Create New Workflow</span>
                </CardTitle>
                <CardDescription>
                  Fill in the details below to add your workflow to the
                  marketplace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Basic Information
                    </h3>

                    <div>
                      <Label htmlFor="title">Workflow Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        placeholder="e.g., Slack to Notion Integration"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Describe what your workflow does and how it helps users..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (USD) *</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={(e) =>
                              handleInputChange("price", e.target.value)
                            }
                            placeholder="29.99"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="triggerType">Trigger Type *</Label>
                        <Select
                          value={formData.triggerType}
                          onValueChange={(value) =>
                            handleInputChange("triggerType", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="webhook">Webhook</SelectItem>
                            <SelectItem value="schedule">Schedule</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="event">Event</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags (comma-separated) *</Label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="tags"
                          value={formData.tags}
                          onChange={(e) =>
                            handleInputChange("tags", e.target.value)
                          }
                          placeholder="slack, notion, productivity, automation"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="imageUrl">Image URL (optional)</Label>
                      <div className="relative">
                        <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="imageUrl"
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) =>
                            handleInputChange("imageUrl", e.target.value)
                          }
                          placeholder="https://example.com/image.jpg"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Configuration Requirements */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Configuration Requirements
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Define what information users need to provide to set up
                      your workflow.
                    </p>

                    {/* Add Config Requirement */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Add Configuration Field
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="configName">Field Name *</Label>
                            <Input
                              id="configName"
                              value={configRequirement.name}
                              onChange={(e) =>
                                handleConfigChange("name", e.target.value)
                              }
                              placeholder="slackWebhookUrl"
                            />
                          </div>
                          <div>
                            <Label htmlFor="configLabel">Display Label *</Label>
                            <Input
                              id="configLabel"
                              value={configRequirement.label}
                              onChange={(e) =>
                                handleConfigChange("label", e.target.value)
                              }
                              placeholder="Slack Webhook URL"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="configType">Field Type</Label>
                          <Select
                            value={configRequirement.type}
                            onValueChange={(value) =>
                              handleConfigChange("type", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="url">URL</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="select">Select</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="configDescription">
                            Description (optional)
                          </Label>
                          <Input
                            id="configDescription"
                            value={configRequirement.description}
                            onChange={(e) =>
                              handleConfigChange("description", e.target.value)
                            }
                            placeholder="The webhook URL from your Slack app"
                          />
                        </div>

                        <div>
                          <Label htmlFor="configPlaceholder">
                            Placeholder (optional)
                          </Label>
                          <Input
                            id="configPlaceholder"
                            value={configRequirement.placeholder}
                            onChange={(e) =>
                              handleConfigChange("placeholder", e.target.value)
                            }
                            placeholder="https://hooks.slack.com/services/..."
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="configRequired"
                            checked={configRequirement.required}
                            onChange={(e) =>
                              handleConfigChange("required", e.target.checked)
                            }
                            className="rounded border-input"
                          />
                          <Label htmlFor="configRequired" className="text-sm">
                            Required field
                          </Label>
                        </div>

                        <Button
                          type="button"
                          onClick={addConfigRequirement}
                          disabled={
                            !configRequirement.name || !configRequirement.label
                          }
                          className="w-full"
                        >
                          Add Configuration Field
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Existing Config Requirements */}
                    {formData.configRequirements.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">
                          Configuration Fields
                        </h4>
                        {formData.configRequirements.map((req) => (
                          <div
                            key={req.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <span className="font-medium">{req.label}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                ({req.type}){req.required && " • Required"}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeConfigRequirement(req.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t">
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !formData.title ||
                        !formData.description ||
                        !formData.price
                      }
                      className="w-full"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Creating Workflow...</span>
                        </div>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Workflow
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Tips Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Tips for Success</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <FileText className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Clear Description</p>
                    <p className="text-xs text-muted-foreground">
                      Explain what your workflow does and how it helps users
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Tag className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Relevant Tags</p>
                    <p className="text-xs text-muted-foreground">
                      Use specific tags to help users find your workflow
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Settings className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Easy Setup</p>
                    <p className="text-xs text-muted-foreground">
                      Make configuration requirements clear and simple
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Guidelines */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Pricing Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium mb-2">Suggested Price Ranges:</p>
                  <div className="space-y-1 text-muted-foreground">
                    <p>• Simple workflows: $5 - $15</p>
                    <p>• Medium complexity: $15 - $50</p>
                    <p>• Advanced workflows: $50+</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function SellerDashboard() {
  return (
    <ProtectedRoute>
      <SellerDashboardContent />
    </ProtectedRoute>
  );
}
