import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { marketplaceApi, MarketplaceItem } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  CheckCircle,
  Circle,
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
} from "lucide-react";

interface WizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface MarketplaceItemFormData {
  name: string;
  description: string;
  price: number;
  billing_period: "one_time" | "monthly" | "yearly" | "lifetime";
  source_code_price?: number;
  source_code_format?: "json" | "provided_in_chat" | "url";
  source_code_url?: string;
  setup_time?: string;
  tags: string[];
  demo_link?: string;
}

const initialFormData: MarketplaceItemFormData = {
  name: "",
  description: "",
  price: 0,
  billing_period: "one_time",
  source_code_price: undefined,
  source_code_format: undefined,
  source_code_url: undefined,
  setup_time: "",
  tags: [],
  demo_link: "",
};

const wizardSteps: WizardStep[] = [
  {
    id: "basic-info",
    title: "Basic Information",
    description: "Tell us about your workflow",
    completed: false,
  },
  {
    id: "pricing",
    title: "Pricing & Billing",
    description: "Set your pricing strategy",
    completed: false,
  },
  {
    id: "source-code",
    title: "Source Code (Optional)",
    description: "Configure source code options",
    completed: false,
  },
  {
    id: "details",
    title: "Additional Details",
    description: "Add tags, setup time, and demo",
    completed: false,
  },
  {
    id: "review",
    title: "Review & Publish",
    description: "Review your listing and publish",
    completed: false,
  },
];

const setupTimeOptions = [
  { value: "15min", label: "15 minutes" },
  { value: "30min", label: "30 minutes" },
  { value: "1hr", label: "1 hour" },
  { value: "2hr", label: "2 hours" },
  { value: "4hr", label: "4 hours" },
  { value: "1day", label: "1 day" },
  { value: "2days", label: "2 days" },
  { value: "1week", label: "1 week" },
];

const commonTags = [
  "automation",
  "productivity",
  "small-business",
  "local-business",
  "e-commerce",
  "crm",
  "email",
  "social-media",
  "analytics",
  "inventory",
  "scheduling",
  "notifications",
  "data-processing",
  "integration",
  "workflow",
  "api",
];

export default function MarketplaceListingWizard() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] =
    useState<MarketplaceItemFormData>(initialFormData);
  const [steps, setSteps] = useState<WizardStep[]>(wizardSteps);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update step completion status
  useEffect(() => {
    const updatedSteps = steps.map((step, index) => {
      let completed = false;

      switch (step.id) {
        case "basic-info":
          completed =
            formData.name.trim() !== "" && formData.description.trim() !== "";
          break;
        case "pricing":
          completed = formData.price >= 0 && formData.billing_period !== "";
          break;
        case "source-code":
          completed = true; // Optional step
          break;
        case "details":
          completed = formData.setup_time !== "" || formData.tags.length > 0;
          break;
        case "review":
          completed = false; // Will be true when submitted
          break;
      }

      return { ...step, completed };
    });

    setSteps(updatedSteps);
  }, [formData]);

  const validateStep = (stepId: string): boolean => {
    const newErrors: Record<string, string> = {};

    switch (stepId) {
      case "basic-info":
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.description.trim())
          newErrors.description = "Description is required";
        if (formData.description.length < 50)
          newErrors.description = "Description must be at least 50 characters";
        break;
      case "pricing":
        if (formData.price < 0) newErrors.price = "Price cannot be negative";
        if (formData.price > 0 && formData.billing_period === "")
          newErrors.billing_period =
            "Billing period is required for paid items";
        break;
      case "source-code":
        if (
          formData.source_code_format === "url" &&
          !formData.source_code_url?.trim()
        ) {
          newErrors.source_code_url =
            "Source code URL is required when format is URL";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(steps[currentStep].id)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleInputChange = (
    field: keyof MarketplaceItemFormData,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const itemData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        billing_period: formData.billing_period,
        source_code_price: formData.source_code_price || undefined,
        source_code_format: formData.source_code_format || undefined,
        source_code_url: formData.source_code_url || undefined,
        setup_time: formData.setup_time || undefined,
        tags: formData.tags,
        demo_link: formData.demo_link || undefined,
        status: "draft" as const,
        is_public: false,
      };

      const createdItem = await marketplaceApi.createItem(user.id, itemData);

      if (createdItem) {
        // Mark the last step as completed
        setSteps((prev) =>
          prev.map((step, index) =>
            index === prev.length - 1 ? { ...step, completed: true } : step
          )
        );

        // Show success message or redirect
        alert(
          "Marketplace listing created successfully! You can now publish it from your seller dashboard."
        );
      } else {
        alert("Failed to create marketplace listing. Please try again.");
      }
    } catch (error) {
      console.error("Error creating marketplace listing:", error);
      alert("An error occurred while creating your listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case "basic-info":
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Workflow Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Customer Inquiry to CRM Automation"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe what your workflow does, who it's for, and what problem it solves..."
                rows={6}
                className={errors.description ? "border-red-500" : ""}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/50 characters minimum
              </p>
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        );

      case "pricing":
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  handleInputChange("price", parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-sm text-red-500 mt-1">{errors.price}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Set to 0 for free workflows
              </p>
            </div>

            {formData.price > 0 && (
              <div>
                <Label htmlFor="billing_period">Billing Period *</Label>
                <Select
                  value={formData.billing_period}
                  onValueChange={(value) =>
                    handleInputChange("billing_period", value)
                  }
                >
                  <SelectTrigger
                    className={errors.billing_period ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select billing period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One-time payment</SelectItem>
                    <SelectItem value="monthly">
                      Monthly subscription
                    </SelectItem>
                    <SelectItem value="yearly">Yearly subscription</SelectItem>
                    <SelectItem value="lifetime">Lifetime access</SelectItem>
                  </SelectContent>
                </Select>
                {errors.billing_period && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.billing_period}
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case "source-code":
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Source Code Options
              </h3>
              <p className="text-gray-600">
                These options are for future implementation with Stripe
                integration.
              </p>
            </div>

            <div>
              <Label htmlFor="source_code_price">
                Source Code Price (Optional)
              </Label>
              <Input
                id="source_code_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.source_code_price || ""}
                onChange={(e) =>
                  handleInputChange(
                    "source_code_price",
                    parseFloat(e.target.value) || undefined
                  )
                }
                placeholder="0.00"
              />
              <p className="text-sm text-gray-500 mt-1">
                Additional price for source code access
              </p>
            </div>

            <div>
              <Label htmlFor="source_code_format">Source Code Format</Label>
              <Select
                value={formData.source_code_format || ""}
                onValueChange={(value) =>
                  handleInputChange("source_code_format", value || undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON Configuration</SelectItem>
                  <SelectItem value="provided_in_chat">
                    Provided in Chat
                  </SelectItem>
                  <SelectItem value="url">Download URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.source_code_format === "url" && (
              <div>
                <Label htmlFor="source_code_url">Source Code URL *</Label>
                <Input
                  id="source_code_url"
                  type="url"
                  value={formData.source_code_url || ""}
                  onChange={(e) =>
                    handleInputChange("source_code_url", e.target.value)
                  }
                  placeholder="https://example.com/source-code.zip"
                  className={errors.source_code_url ? "border-red-500" : ""}
                />
                {errors.source_code_url && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.source_code_url}
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case "details":
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="setup_time">Setup Time</Label>
              <Select
                value={formData.setup_time || ""}
                onValueChange={(value) =>
                  handleInputChange("setup_time", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="How long does setup take?" />
                </SelectTrigger>
                <SelectContent>
                  {setupTimeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 mb-3">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddTag())
                  }
                />
                <Button type="button" onClick={handleAddTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-gray-500 mb-2">Common tags:</div>
              <div className="flex flex-wrap gap-2">
                {commonTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      if (!formData.tags.includes(tag)) {
                        setFormData((prev) => ({
                          ...prev,
                          tags: [...prev.tags, tag],
                        }));
                      }
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="demo_link">Demo Link (Optional)</Label>
              <Input
                id="demo_link"
                type="url"
                value={formData.demo_link || ""}
                onChange={(e) => handleInputChange("demo_link", e.target.value)}
                placeholder="https://example.com/demo"
              />
              <p className="text-sm text-gray-500 mt-1">
                Link to a demo or preview of your workflow
              </p>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Review Your Listing</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Name</h4>
                  <p className="text-gray-600">{formData.name}</p>
                </div>

                <div>
                  <h4 className="font-medium">Description</h4>
                  <p className="text-gray-600">{formData.description}</p>
                </div>

                <div>
                  <h4 className="font-medium">Pricing</h4>
                  <p className="text-gray-600">
                    {formData.price === 0
                      ? "Free"
                      : `$${formData.price} ${formData.billing_period.replace(
                          "_",
                          " "
                        )}`}
                  </p>
                </div>

                {formData.source_code_price && (
                  <div>
                    <h4 className="font-medium">Source Code</h4>
                    <p className="text-gray-600">
                      ${formData.source_code_price} -{" "}
                      {formData.source_code_format}
                    </p>
                  </div>
                )}

                {formData.setup_time && (
                  <div>
                    <h4 className="font-medium">Setup Time</h4>
                    <p className="text-gray-600">{formData.setup_time}</p>
                  </div>
                )}

                {formData.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {formData.demo_link && (
                  <div>
                    <h4 className="font-medium">Demo Link</h4>
                    <a
                      href={formData.demo_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {formData.demo_link}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">
                Important Note
              </h4>
              <p className="text-sm text-yellow-700">
                Your listing will be created as a draft. You can review and
                publish it from your seller dashboard. Once published, it will
                be visible to buyers in the marketplace.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            Please log in to create a marketplace listing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Marketplace Listing
          </h1>
          <p className="text-gray-600 mt-2">
            Share your workflow with the world
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      step.completed
                        ? "bg-green-500 border-green-500 text-white"
                        : index === currentStep
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "bg-white border-gray-300 text-gray-500"
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p
                      className={`text-sm font-medium ${
                        index === currentStep
                          ? "text-blue-600"
                          : step.completed
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:block w-16 h-0.5 mx-4 ${
                      step.completed ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600">{steps[currentStep].description}</p>
          </div>

          {renderStepContent()}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? "Creating..." : "Create Listing"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!steps[currentStep].completed}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
