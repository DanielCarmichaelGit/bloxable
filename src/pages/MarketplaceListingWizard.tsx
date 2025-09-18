import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { marketplaceApi } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  Star,
  DollarSign,
  Clock,
  Eye,
  Home,
} from "lucide-react";

// allow up to 6 decimals; tweak as needed
const DECIMAL_RE = /^(\d+(\.\d{0,6})?|\.\d{0,6})?$/;

interface WizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface UsageTier {
  id: string;
  minUsage: number;
  maxUsage?: number;
  pricePerUnit: number;
  _min?: string; // transient UI strings
  _max?: string;
  _price?: string;
}

interface MarketplaceItemFormData {
  name: string;
  description: string;
  price: number;
  billing_period:
    | "one_time"
    | "monthly"
    | "yearly"
    | "lifetime"
    | "usage_based";
  usage_pricing_type?: "flat_rate" | "tiered";
  usage_tiers?: UsageTier[];
  flat_usage_price?: number;
  source_code_price?: number;
  source_code_format?: "json" | "provided_in_chat" | "url";
  source_code_url?: string;
  setup_time?: string;
  installation_url?: string;
  tags: string[];
  demo_link?: string;
}

const initialFormData: MarketplaceItemFormData = {
  name: "",
  description: "",
  price: 0,
  billing_period: "one_time",
  usage_pricing_type: undefined,
  usage_tiers: [],
  flat_usage_price: undefined,
  source_code_price: undefined,
  source_code_format: undefined,
  source_code_url: undefined,
  setup_time: "",
  installation_url: "",
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
  { value: "self-service", label: "Self Service" },
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

// Skeleton Preview Component
const SkeletonPreview = () => {
  return (
    <Card className="h-full border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-muted rounded-md w-3/4 animate-pulse" />
            <div className="h-4 bg-muted rounded-md w-1/2 animate-pulse" />
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-muted-foreground" />
            <div className="h-4 w-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-muted rounded w-4/6 animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
              <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="h-4 w-12 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="h-10 w-full bg-muted rounded animate-pulse" />
      </CardFooter>
    </Card>
  );
};

// Live Preview Component
const LivePreview = ({
  formData,
  pricingType,
}: {
  formData: MarketplaceItemFormData;
  pricingType: "flat" | "usage";
}) => {
  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `$${price}`;
  };

  const getBillingPeriodText = (period: string) => {
    switch (period) {
      case "one_time":
        return "one-time";
      case "monthly":
        return "monthly";
      case "yearly":
        return "yearly";
      case "lifetime":
        return "lifetime";
      case "usage_based":
        return "usage-based";
      default:
        return "";
    }
  };

  const getSetupTimeColor = (time: string) => {
    if (time.includes("15min") || time.includes("30min")) {
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    }
    if (time.includes("1hr") || time.includes("2hr") || time.includes("4hr")) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
    }
    if (
      time.includes("1day") ||
      time.includes("2day") ||
      time.includes("1week")
    ) {
      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800";
    }
    return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
  };

  return (
    <Card className="h-full border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg font-semibold line-clamp-1">
            {formData.name || "Your Workflow Name"}
          </CardTitle>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>4.8</span>
          </div>
        </div>
        <CardDescription className="line-clamp-3">
          {formData.description ||
            "Describe what your workflow does, who it's for, and what problem it solves..."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {formData.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {formData.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{formData.tags.length - 2}
                </Badge>
              )}
              {formData.tags.length === 0 && (
                <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
              )}
            </div>
            {formData.setup_time ? (
              <Badge
                variant="outline"
                className={`text-xs px-2 py-1 ${getSetupTimeColor(
                  formData.setup_time
                )}`}
              >
                <Clock className="h-3 w-3 mr-1" />
                {formData.setup_time}
              </Badge>
            ) : (
              <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>by You</span>
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold text-foreground">
                {pricingType === "usage"
                  ? formData.usage_pricing_type === "flat_rate" &&
                    formData.flat_usage_price
                    ? `$${formData.flat_usage_price}/execution`
                    : formData.usage_pricing_type === "tiered" &&
                      formData.usage_tiers &&
                      formData.usage_tiers.length > 0
                    ? "Tiered pricing"
                    : "Usage-based"
                  : formData.price > 0
                  ? `${formatPrice(formData.price)} ${getBillingPeriodText(
                      formData.billing_period
                    )}`
                  : "Free"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full" disabled>
          <Eye className="h-4 w-4 mr-2" />
          Preview Mode
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function MarketplaceListingWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] =
    useState<MarketplaceItemFormData>(initialFormData);
  const [steps, setSteps] = useState<WizardStep[]>(wizardSteps);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pricingType, setPricingType] = useState<"flat" | "usage">("flat");
  const [priceInput, setPriceInput] = useState("");
  const [flatUsagePriceInput, setFlatUsagePriceInput] = useState<string>("");

  // Update step completion status
  useEffect(() => {
    const updatedSteps = steps.map((step) => {
      let completed = false;

      switch (step.id) {
        case "basic-info":
          completed =
            formData.name.trim() !== "" &&
            formData.description.trim() !== "" &&
            formData.description.trim().length >= 50;
          break;
        case "pricing":
          if (pricingType === "usage") {
            if (formData.usage_pricing_type === "flat_rate") {
              completed = (formData.flat_usage_price ?? 0) > 0;
            } else if (formData.usage_pricing_type === "tiered") {
              completed = validatePricingTiers(
                formData.usage_tiers || []
              ).isValid;
            } else {
              completed = false;
            }
          } else {
            completed = formData.price >= 0;
          }
          break;
        case "source-code":
          completed = true; // Optional step
          break;
        case "details":
          const hasBasicDetails =
            formData.setup_time !== "" || formData.tags.length > 0;
          const hasSelfServiceDetails =
            formData.setup_time !== "self-service" ||
            !!formData.installation_url;
          completed = hasBasicDetails && hasSelfServiceDetails;
          break;
        case "review":
          // Will be true when submitted
          break;
      }

      return { ...step, completed };
    });

    setSteps(updatedSteps);
  }, [formData, pricingType]);

  // Validation functions for pricing tiers
  const validatePricingTiers = (
    tiers: UsageTier[]
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!tiers || tiers.length === 0) {
      return {
        isValid: false,
        errors: ["At least one pricing tier is required"],
      };
    }

    // Check for empty tiers
    tiers.forEach((tier, index) => {
      if (!tier.minUsage && tier.minUsage !== 0) {
        errors.push(`Tier ${index + 1}: Minimum usage is required`);
      }
      if (!tier.pricePerUnit && tier.pricePerUnit !== 0) {
        errors.push(`Tier ${index + 1}: Price per unit is required`);
      }
    });

    // Check for tier conflicts (overlapping ranges)
    const sortedTiers = [...tiers].sort(
      (a, b) => (a.minUsage || 0) - (b.minUsage || 0)
    );

    for (let i = 0; i < sortedTiers.length - 1; i++) {
      const currentTier = sortedTiers[i];
      const nextTier = sortedTiers[i + 1];

      const currentMax = currentTier.maxUsage || Infinity;
      const nextMin = nextTier.minUsage || 0;

      if (currentMax >= nextMin) {
        errors.push(
          `Tier ranges cannot overlap. Tier ${
            tiers.indexOf(currentTier) + 1
          } and Tier ${tiers.indexOf(nextTier) + 1} have conflicting ranges`
        );
      }
    }

    // Check for gaps in tier ranges
    for (let i = 0; i < sortedTiers.length - 1; i++) {
      const currentTier = sortedTiers[i];
      const nextTier = sortedTiers[i + 1];

      const currentMax = currentTier.maxUsage || Infinity;
      const nextMin = nextTier.minUsage || 0;

      if (currentMax < nextMin - 1) {
        errors.push(
          `There's a gap between Tier ${
            tiers.indexOf(currentTier) + 1
          } and Tier ${
            tiers.indexOf(nextTier) + 1
          }. All usage ranges should be covered.`
        );
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const validateStep = (stepId: string): boolean => {
    const newErrors: Record<string, string> = {};

    switch (stepId) {
      case "basic-info":
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.description.trim()) {
          newErrors.description = "Description is required";
        } else if (formData.description.trim().length < 50) {
          newErrors.description = "Description must be at least 50 characters";
        }
        break;
      case "pricing":
        if (pricingType === "usage") {
          if (!formData.usage_pricing_type) {
            newErrors.usage_pricing_type = "Please select a pricing model";
          } else if (formData.usage_pricing_type === "flat_rate") {
            if (!formData.flat_usage_price || formData.flat_usage_price <= 0) {
              newErrors.flat_usage_price = "Price per execution is required";
            }
          } else if (formData.usage_pricing_type === "tiered") {
            const tierValidation = validatePricingTiers(
              formData.usage_tiers || []
            );
            if (!tierValidation.isValid) {
              newErrors.usage_tiers = tierValidation.errors.join("; ");
            }
          }
        } else {
          if (formData.price < 0) newErrors.price = "Price cannot be negative";
        }
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

  const handleCommonTagClick = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleReturnToDashboard = () => {
    const hasUnsavedChanges =
      formData.name.trim() !== "" ||
      formData.description.trim() !== "" ||
      formData.price > 0 ||
      formData.tags.length > 0 ||
      formData.setup_time !== "" ||
      formData.demo_link !== "";

    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave? Your current edits will be lost."
      );
      if (confirmed) {
        navigate("/dashboard");
      }
    } else {
      navigate("/dashboard");
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const itemData = {
        name: formData.name,
        description: formData.description,
        price: pricingType === "usage" ? 0 : formData.price,
        billing_period: (pricingType === "usage"
          ? "monthly"
          : formData.billing_period) as
          | "one_time"
          | "monthly"
          | "yearly"
          | "lifetime",
        // Source code fields (using actual database column names)
        source_code_r: formData.source_code_price || undefined,
        source_code_format: formData.source_code_format || undefined,
        source_code_url: formData.source_code_url || undefined,
        // Setup fields
        setup_time: formData.setup_time || undefined,
        installation_url: formData.installation_url || undefined,
        tags: formData.tags,
        demo_link: formData.demo_link || undefined,
        status: "draft" as const,
        is_public: false,
        // Usage-based pricing fields (now as actual columns)
        usage_pricing_type:
          pricingType === "usage" ? formData.usage_pricing_type : undefined,
        usage_tiers: pricingType === "usage" ? formData.usage_tiers : undefined,
        flat_usage_price:
          pricingType === "usage" ? formData.flat_usage_price : undefined,
        usage_test_completed: false,
      };

      const createdItem = await marketplaceApi.createItem(user.id, itemData);

      if (createdItem) {
        // Mark the last step as completed
        setSteps((prev) =>
          prev.map((step, index) =>
            index === prev.length - 1 ? { ...step, completed: true } : step
          )
        );

        // Redirect to dashboard
        navigate("/dashboard");
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
              <Label htmlFor="name" className="text-foreground font-medium">
                Workflow Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Customer Inquiry to CRM Automation"
                className={`mt-2 ${errors.name ? "border-destructive" : ""}`}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="description"
                className="text-foreground font-medium"
              >
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe what your workflow does, who it's for, and what problem it solves..."
                rows={6}
                className={`mt-2 ${
                  errors.description ? "border-destructive" : ""
                }`}
              />
              <p
                className={`text-sm mt-1 ${(() => {
                  const length = formData.description.trim().length;
                  if (length >= 50) return "text-green-600 dark:text-green-400";
                  if (length > 0) return "text-yellow-600 dark:text-yellow-400";
                  return "text-muted-foreground";
                })()}`}
              >
                {formData.description.trim().length}/50 characters minimum
                {formData.description.trim().length >= 50 && " ✓"}
              </p>
              {errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        );

      case "pricing":
        return (
          <div className="space-y-6">
            {/* Pricing Type Toggle */}
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-foreground">Pricing Model</h3>
                <p className="text-sm text-muted-foreground">
                  Choose how you want to price your workflow
                </p>
              </div>

              <div className="flex items-center bg-muted rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => {
                    setPricingType("flat");
                    setPriceInput("");
                    setFlatUsagePriceInput("");
                    setFormData((prev) => ({
                      ...prev,
                      price: 0,
                      billing_period: "one_time",
                      usage_pricing_type: undefined,
                      usage_tiers: [],
                      flat_usage_price: undefined,
                    }));
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    pricingType === "flat"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Flat Pricing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPricingType("usage");
                    setPriceInput("");
                    setFlatUsagePriceInput("");
                    setFormData((prev) => ({
                      ...prev,
                      price: 0,
                      billing_period: "monthly", // Use monthly for usage-based pricing
                      usage_pricing_type: undefined,
                      usage_tiers: [],
                      flat_usage_price: undefined,
                    }));
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    pricingType === "usage"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Usage Pricing
                </button>
              </div>
            </div>

            {/* Commission Info */}
            <div className="text-xs text-muted-foreground">
              {pricingType === "flat"
                ? "4% commission on all transactions"
                : "6% commission on usage (up to $15/month) + webhook required"}
            </div>

            {pricingType === "flat" ? (
              <>
                <div>
                  <Label
                    htmlFor="price"
                    className="text-foreground font-medium"
                  >
                    Price (USD) *
                  </Label>
                  <Input
                    id="price"
                    type="text"
                    inputMode="decimal"
                    value={priceInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (DECIMAL_RE.test(value)) {
                        setPriceInput(value);
                      }
                    }}
                    onBlur={() => {
                      const n = parseFloat(priceInput);
                      handleInputChange("price", Number.isFinite(n) ? n : 0);
                    }}
                    placeholder="0.00"
                    className={`mt-2 ${
                      errors.price ? "border-destructive" : ""
                    }`}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.price}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Set to 0 for free workflows
                  </p>
                </div>

                {formData.price > 0 && (
                  <div>
                    <Label
                      htmlFor="billing_period"
                      className="text-foreground font-medium"
                    >
                      Billing Period *
                    </Label>
                    <Select
                      value={formData.billing_period}
                      onValueChange={(value) =>
                        handleInputChange("billing_period", value)
                      }
                    >
                      <SelectTrigger
                        className={`mt-2 ${
                          errors.billing_period ? "border-destructive" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select billing period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one_time">
                          One-time payment
                        </SelectItem>
                        <SelectItem value="monthly">
                          Monthly subscription
                        </SelectItem>
                        <SelectItem value="yearly">
                          Yearly subscription
                        </SelectItem>
                        <SelectItem value="lifetime">
                          Lifetime access
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.billing_period && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.billing_period}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6">
                {/* Usage pricing type */}
                <div>
                  <Label className="text-foreground font-medium">
                    Usage Pricing Model
                  </Label>
                  <Select
                    value={formData.usage_pricing_type || ""}
                    onValueChange={(value) =>
                      handleInputChange(
                        "usage_pricing_type",
                        value as "flat_rate" | "tiered"
                      )
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select pricing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat_rate">
                        Flat rate per execution
                      </SelectItem>
                      <SelectItem value="tiered">Tiered pricing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Flat rate pricing */}
                {formData.usage_pricing_type === "flat_rate" && (
                  <div>
                    <Label
                      htmlFor="flat_usage_price"
                      className="text-foreground font-medium"
                    >
                      Price per Execution (USD)
                    </Label>
                    <Input
                      id="flat_usage_price"
                      type="text"
                      inputMode="decimal"
                      value={flatUsagePriceInput}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (DECIMAL_RE.test(v)) setFlatUsagePriceInput(v);
                      }}
                      onBlur={() => {
                        const n = parseFloat(flatUsagePriceInput);
                        handleInputChange(
                          "flat_usage_price",
                          Number.isFinite(n) ? n : undefined
                        );
                      }}
                      placeholder="0.01"
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Amount charged for each workflow execution
                    </p>
                  </div>
                )}

                {/* Tiered pricing */}
                {formData.usage_pricing_type === "tiered" && (
                  <div>
                    <Label className="text-foreground font-medium">
                      Usage Tiers
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">
                      Define pricing tiers based on usage volume
                    </p>

                    <div className="space-y-3">
                      {formData.usage_tiers?.map((tier, index) => (
                        <div key={tier.id} className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">
                              Min Usage
                            </Label>
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="\d*"
                              value={
                                tier._min ??
                                (tier.minUsage != null
                                  ? String(tier.minUsage)
                                  : "")
                              }
                              onChange={(e) => {
                                const v = e.target.value;
                                const newTiers = [
                                  ...(formData.usage_tiers || []),
                                ];
                                newTiers[index] = { ...tier, _min: v };
                                if (/^\d*$/.test(v)) {
                                  newTiers[index].minUsage =
                                    v === "" ? 0 : parseInt(v, 10);
                                }
                                handleInputChange("usage_tiers", newTiers);
                              }}
                              placeholder="0"
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">
                              Max Usage (optional)
                            </Label>
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="\d*"
                              value={
                                tier._max ??
                                (tier.maxUsage != null
                                  ? String(tier.maxUsage)
                                  : "")
                              }
                              onChange={(e) => {
                                const v = e.target.value;
                                const newTiers = [
                                  ...(formData.usage_tiers || []),
                                ];
                                newTiers[index] = { ...tier, _max: v };
                                if (/^\d*$/.test(v)) {
                                  newTiers[index].maxUsage =
                                    v === "" ? undefined : parseInt(v, 10);
                                }
                                handleInputChange("usage_tiers", newTiers);
                              }}
                              placeholder="Unlimited"
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">
                              Price per Unit
                            </Label>
                            <Input
                              type="text"
                              inputMode="decimal"
                              value={
                                tier._price ??
                                (tier.pricePerUnit != null
                                  ? String(tier.pricePerUnit)
                                  : "")
                              }
                              onChange={(e) => {
                                const v = e.target.value;
                                if (!DECIMAL_RE.test(v)) return;
                                const newTiers = [
                                  ...(formData.usage_tiers || []),
                                ];
                                newTiers[index] = { ...tier, _price: v };
                                const n = parseFloat(v);
                                newTiers[index].pricePerUnit = Number.isFinite(
                                  n
                                )
                                  ? n
                                  : 0;
                                handleInputChange("usage_tiers", newTiers);
                              }}
                              placeholder="0.01"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newTiers = (
                                formData.usage_tiers || []
                              ).filter((_, i) => i !== index);
                              handleInputChange("usage_tiers", newTiers);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newTier: UsageTier = {
                            id: Date.now().toString(),
                            minUsage: 0,
                            pricePerUnit: 0,
                          };
                          const newTiers = [
                            ...(formData.usage_tiers || []),
                            newTier,
                          ];
                          handleInputChange("usage_tiers", newTiers);
                        }}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Tier
                      </Button>
                    </div>

                    {/* Tier validation errors */}
                    {errors.usage_tiers && (
                      <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="text-sm text-destructive font-medium">
                          Pricing Tier Issues:
                        </p>
                        <p className="text-sm text-destructive mt-1">
                          {errors.usage_tiers}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "source-code":
        return (
          <div className="space-y-6">
            <div className="text-center py-6 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Source Code Options
              </h3>
              <p className="text-muted-foreground">
                These options are for future implementation with Stripe
                integration.
              </p>
            </div>

            <div>
              <Label
                htmlFor="source_code_price"
                className="text-foreground font-medium"
              >
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
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Additional price for source code access
              </p>
            </div>

            <div>
              <Label
                htmlFor="source_code_format"
                className="text-foreground font-medium"
              >
                Source Code Format
              </Label>
              <Select
                value={formData.source_code_format || ""}
                onValueChange={(value) =>
                  handleInputChange("source_code_format", value || undefined)
                }
              >
                <SelectTrigger className="mt-2">
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
                <Label
                  htmlFor="source_code_url"
                  className="text-foreground font-medium"
                >
                  Source Code URL *
                </Label>
                <Input
                  id="source_code_url"
                  type="url"
                  value={formData.source_code_url || ""}
                  onChange={(e) =>
                    handleInputChange("source_code_url", e.target.value)
                  }
                  placeholder="https://example.com/source-code.zip"
                  className={`mt-2 ${
                    errors.source_code_url ? "border-destructive" : ""
                  }`}
                />
                {errors.source_code_url && (
                  <p className="text-sm text-destructive mt-1">
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
              <Label
                htmlFor="setup_time"
                className="text-foreground font-medium"
              >
                Setup Time
              </Label>
              <Select
                value={formData.setup_time || ""}
                onValueChange={(value) =>
                  handleInputChange("setup_time", value)
                }
              >
                <SelectTrigger className="mt-2">
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

            {formData.setup_time === "self-service" && (
              <>
                <div>
                  <Label
                    htmlFor="installation_url"
                    className="text-foreground font-medium"
                  >
                    Installation URL *
                  </Label>
                  <Input
                    id="installation_url"
                    value={formData.installation_url || ""}
                    onChange={(e) =>
                      handleInputChange("installation_url", e.target.value)
                    }
                    placeholder="https://example.com/install"
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Provide a URL where users can install your workflow
                  </p>
                </div>
              </>
            )}

            <div>
              <Label className="text-foreground font-medium">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-3 mt-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-muted-foreground mb-2">
                Common tags:
              </div>
              <div className="flex flex-wrap gap-2">
                {commonTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => handleCommonTagClick(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label
                htmlFor="demo_link"
                className="text-foreground font-medium"
              >
                Demo Link (Optional)
              </Label>
              <Input
                id="demo_link"
                type="url"
                value={formData.demo_link || ""}
                onChange={(e) => handleInputChange("demo_link", e.target.value)}
                placeholder="https://example.com/demo"
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Link to a demo or preview of your workflow
              </p>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-foreground mb-4">
                Review Your Listing
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground">Name</h4>
                  <p className="text-muted-foreground">{formData.name}</p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground">Description</h4>
                  <p className="text-muted-foreground">
                    {formData.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground">Pricing</h4>
                  <p className="text-muted-foreground">
                    {pricingType === "usage"
                      ? formData.usage_pricing_type === "flat_rate" &&
                        formData.flat_usage_price
                        ? `$${formData.flat_usage_price} per execution`
                        : formData.usage_pricing_type === "tiered" &&
                          formData.usage_tiers &&
                          formData.usage_tiers.length > 0
                        ? `Tiered pricing (${formData.usage_tiers.length} tiers)`
                        : "Usage-based pricing"
                      : formData.price === 0
                      ? "Free"
                      : `$${formData.price} ${formData.billing_period.replace(
                          "_",
                          " "
                        )}`}
                  </p>
                  {pricingType === "usage" &&
                    formData.usage_pricing_type === "tiered" &&
                    formData.usage_tiers &&
                    formData.usage_tiers.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {formData.usage_tiers.map((tier) => (
                          <p
                            key={tier.id}
                            className="text-xs text-muted-foreground"
                          >
                            {tier.minUsage} - {tier.maxUsage || "∞"} executions:
                            ${tier.pricePerUnit}/execution
                          </p>
                        ))}
                      </div>
                    )}
                </div>

                {formData.source_code_price && (
                  <div>
                    <h4 className="font-medium text-foreground">Source Code</h4>
                    <p className="text-muted-foreground">
                      ${formData.source_code_price} -{" "}
                      {formData.source_code_format}
                    </p>
                  </div>
                )}

                {formData.setup_time && (
                  <div>
                    <h4 className="font-medium text-foreground">Setup Time</h4>
                    <p className="text-muted-foreground">
                      {formData.setup_time}
                    </p>
                  </div>
                )}

                {formData.setup_time === "self-service" &&
                  formData.installation_url && (
                    <div>
                      <h4 className="font-medium text-foreground">
                        Installation URL
                      </h4>
                      <p className="text-muted-foreground text-sm break-all">
                        {formData.installation_url}
                      </p>
                    </div>
                  )}

                {formData.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground">Tags</h4>
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
                    <h4 className="font-medium text-foreground">Demo Link</h4>
                    <a
                      href={formData.demo_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {formData.demo_link}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Important Note
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            Please log in to create a marketplace listing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={handleReturnToDashboard}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Create Marketplace Listing
            </h1>
            <p className="text-muted-foreground text-lg">
              Share your workflow with the world
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {steps[currentStep].title}
              </span>
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} of {steps.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Panel - Preview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold text-foreground">
                Live Preview
              </h2>
            </div>
            <div className="sticky top-8">
              {formData.name || formData.description ? (
                <LivePreview formData={formData} pricingType={pricingType} />
              ) : (
                <SkeletonPreview />
              )}
            </div>
          </div>

          {/* Right Panel - Wizard */}
          <div className="space-y-6">
            {/* Step Content */}
            <Card className="p-6">{renderStepContent()}</Card>

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
      </div>
    </div>
  );
}
