import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { marketplaceApi, MarketplaceItem } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Home } from "lucide-react";

// Import our new components
import BasicInformation from "../components/marketplace/BasicInformation";
import PricingSection from "../components/marketplace/PricingSection";
import AdditionalDetails from "../components/marketplace/AdditionalDetails";
import PublishingStatus from "../components/marketplace/PublishingStatus";
import UsageTestRequirement from "../components/marketplace/UsageTestRequirement";

interface UsageTier {
  id: string;
  minUsage: number;
  maxUsage?: number;
  pricePerUnit: number;
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
  status: "draft" | "pending_review" | "active" | "inactive" | "rejected";
  is_public: boolean;
  usage_test_completed?: boolean;
}

// Publishing requirements validation
const getPublishingRequirements = (
  formData: MarketplaceItemFormData,
  pricingType: "flat" | "usage"
) => {
  const requirements = [];

  // Basic requirements
  if (!formData.name.trim()) {
    requirements.push({
      id: "name",
      label: "Workflow name is required",
      completed: false,
    });
  } else {
    requirements.push({
      id: "name",
      label: "Workflow name is required",
      completed: true,
    });
  }

  if (!formData.description.trim() || formData.description.trim().length < 50) {
    requirements.push({
      id: "description",
      label: "Description must be at least 50 characters",
      completed: false,
    });
  } else {
    requirements.push({
      id: "description",
      label: "Description must be at least 50 characters",
      completed: true,
    });
  }

  // Self-service installation URL requirement
  if (formData.setup_time === "self-service") {
    if (!formData.installation_url?.trim()) {
      requirements.push({
        id: "installation_url",
        label: "Installation URL is required for self-service items",
        completed: false,
      });
    } else {
      requirements.push({
        id: "installation_url",
        label: "Installation URL is required for self-service items",
        completed: true,
      });
    }
  }

  // Usage-based pricing test requirement
  if (pricingType === "usage") {
    if (!formData.usage_test_completed) {
      requirements.push({
        id: "usage_test",
        label: "Usage test must be completed for usage-based pricing",
        completed: false,
      });
    } else {
      requirements.push({
        id: "usage_test",
        label: "Usage test must be completed for usage-based pricing",
        completed: true,
      });
    }
  }

  // Pricing requirements
  if (pricingType === "flat") {
    if (formData.price < 0) {
      requirements.push({
        id: "price",
        label: "Price cannot be negative",
        completed: false,
      });
    } else {
      requirements.push({
        id: "price",
        label: formData.price === 0 ? "Free workflow" : "Price set",
        completed: true,
      });
    }
  } else if (pricingType === "usage") {
    if (formData.usage_pricing_type === "flat_rate") {
      if (!formData.flat_usage_price || formData.flat_usage_price <= 0) {
        requirements.push({
          id: "flat_usage_price",
          label: "Flat usage price must be greater than 0",
          completed: false,
        });
      } else {
        requirements.push({
          id: "flat_usage_price",
          label: "Flat usage price must be greater than 0",
          completed: true,
        });
      }
    } else if (formData.usage_pricing_type === "tiered") {
      if (!formData.usage_tiers || formData.usage_tiers.length === 0) {
        requirements.push({
          id: "usage_tiers",
          label: "At least one usage tier is required",
          completed: false,
        });
      } else {
        // Validate that all tiers have valid data
        const validTiers = formData.usage_tiers.every(
          (tier) => tier.minUsage >= 0 && tier.pricePerUnit > 0
        );
        if (validTiers) {
          requirements.push({
            id: "usage_tiers",
            label: "At least one usage tier is required",
            completed: true,
          });
        } else {
          requirements.push({
            id: "usage_tiers",
            label: "All tiers must have valid min usage and price per unit",
            completed: false,
          });
        }
      }
    } else {
      // No pricing type selected
      requirements.push({
        id: "usage_pricing_type",
        label: "Please select a usage pricing type",
        completed: false,
      });
    }
  }

  // Source code requirements
  if (formData.source_code_price && formData.source_code_price > 0) {
    if (!formData.source_code_format) {
      requirements.push({
        id: "source_code_format",
        label: "Source code format is required when selling source code",
        completed: false,
      });
    } else {
      requirements.push({
        id: "source_code_format",
        label: "Source code format is required when selling source code",
        completed: true,
      });
    }

    if (
      formData.source_code_format === "url" &&
      !formData.source_code_url?.trim()
    ) {
      requirements.push({
        id: "source_code_url",
        label: "Source code URL is required when format is URL",
        completed: false,
      });
    } else if (formData.source_code_format === "url") {
      requirements.push({
        id: "source_code_url",
        label: "Source code URL is required when format is URL",
        completed: true,
      });
    }
  }

  // Tags requirement
  if (formData.tags.length === 0) {
    requirements.push({
      id: "tags",
      label: "At least one tag is required",
      completed: false,
    });
  } else {
    requirements.push({
      id: "tags",
      label: "At least one tag is required",
      completed: true,
    });
  }

  return requirements;
};

const canPublish = (
  formData: MarketplaceItemFormData,
  pricingType: "flat" | "usage"
) => {
  const requirements = getPublishingRequirements(formData, pricingType);
  return requirements.every((req) => req.completed);
};

export default function MarketplaceItemEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalItem, setOriginalItem] = useState<MarketplaceItem | null>(
    null
  );
  const [hasLoaded, setHasLoaded] = useState(false);

  // Debug logging to track component lifecycle
  useEffect(() => {
    console.log("MarketplaceItemEdit component mounted/updated", {
      id,
      user: user?.id,
    });
    return () => {
      console.log("MarketplaceItemEdit component unmounting");
    };
  }, [id, user?.id]);
  const [formData, setFormData] = useState<MarketplaceItemFormData>({
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
    status: "draft",
    is_public: false,
    usage_test_completed: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pricingType, setPricingType] = useState<"flat" | "usage">("flat");

  // Load the item data - only run once when component mounts
  useEffect(() => {
    if (!id || !user || hasLoaded) return;

    const loadItem = async () => {
      console.log("Loading item data...", { id });
      setIsLoading(true);
      try {
        const item = await marketplaceApi.getItemById(id);
        if (item) {
          console.log("Item loaded successfully:", item);
          setOriginalItem(item);
          setHasLoaded(true);

          // Determine pricing type from usage_pricing_type field
          const isUsageBased =
            item.usage_pricing_type !== undefined &&
            item.usage_pricing_type !== null;
          const pricingType = isUsageBased ? "usage" : "flat";
          setPricingType(pricingType);

          console.log("Setting pricing type based on billing_period:", {
            billing_period: item.billing_period,
            isUsageBased,
            pricingType,
          });

          setFormData({
            name: item.name,
            description: item.description,
            price: item.price,
            billing_period: item.billing_period,
            usage_pricing_type: item.usage_pricing_type,
            usage_tiers: item.usage_tiers || [],
            flat_usage_price: item.flat_usage_price,
            source_code_price: item.source_code_r,
            source_code_format: item.source_code_format,
            source_code_url: item.source_code_url,
            setup_time: item.setup_time || "",
            installation_url: item.installation_url || "",
            tags: item.tags || [],
            demo_link: item.demo_link || "",
            status: item.status,
            is_public: item.is_public,
            usage_test_completed: item.usage_test_completed || false,
          });
        }
      } catch (error) {
        console.error("Error loading item:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadItem();
  }, [id, user, hasLoaded]); // Added hasLoaded to prevent multiple loads

  // Ensure pricing type is set correctly when originalItem changes (only once)
  useEffect(() => {
    if (originalItem && !hasLoaded) {
      const isUsageBased =
        originalItem.usage_pricing_type !== undefined &&
        originalItem.usage_pricing_type !== null;
      const correctPricingType = isUsageBased ? "usage" : "flat";

      console.log("Setting initial pricing type based on originalItem:", {
        billing_period: originalItem.billing_period,
        isUsageBased,
        correctPricingType,
        currentPricingType: pricingType,
      });

      setPricingType(correctPricingType);
    }
  }, [originalItem, hasLoaded]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePricingTypeChange = (type: "flat" | "usage") => {
    console.log("=== PRICING TYPE CHANGE DEBUG ===");
    console.log("Changing pricing type to:", type);
    console.log("Current formData.billing_period:", formData.billing_period);

    setPricingType(type);

    // Update billing_period based on pricing type
    if (type === "usage") {
      console.log(
        "Setting usage-based pricing with billing_period: usage_based"
      );
      setFormData((prev) => {
        const newData = {
          ...prev,
          billing_period: "monthly" as const, // Use monthly for usage-based pricing
          // Clear flat pricing fields when switching to usage
          price: 0,
        };
        console.log("New formData for usage:", newData);
        return newData;
      });
    } else {
      console.log("Setting flat pricing with billing_period: one_time");
      setFormData((prev) => {
        const newData = {
          ...prev,
          billing_period: "one_time" as const, // Default to one_time for flat pricing
          // Clear usage pricing fields when switching to flat
          usage_pricing_type: undefined,
          usage_tiers: [],
          flat_usage_price: undefined,
        };
        console.log("New formData for flat:", newData);
        return newData;
      });
    }
    console.log("=== END PRICING TYPE CHANGE DEBUG ===");
  };

  // Validate pricing tiers for overlaps and gaps
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

    // Check for empty or invalid tiers
    tiers.forEach((tier, index) => {
      if (tier.minUsage < 0) {
        errors.push(`Tier ${index + 1}: Minimum usage cannot be negative`);
      }
      if (tier.pricePerUnit <= 0) {
        errors.push(`Tier ${index + 1}: Price per unit must be greater than 0`);
      }
    });

    // Sort tiers by minUsage
    const sortedTiers = [...tiers].sort((a, b) => a.minUsage - b.minUsage);

    // Check for overlaps
    for (let i = 0; i < sortedTiers.length - 1; i++) {
      const currentTier = sortedTiers[i];
      const nextTier = sortedTiers[i + 1];

      const currentMax = currentTier.maxUsage || Infinity;
      const nextMin = nextTier.minUsage;

      if (currentMax >= nextMin) {
        errors.push(
          `Tier ranges cannot overlap. Tier ${
            tiers.indexOf(currentTier) + 1
          } (${currentTier.minUsage}-${currentMax}) and Tier ${
            tiers.indexOf(nextTier) + 1
          } (${nextMin}-${nextTier.maxUsage || "∞"}) have conflicting ranges`
        );
      }
    }

    // Check for gaps
    for (let i = 0; i < sortedTiers.length - 1; i++) {
      const currentTier = sortedTiers[i];
      const nextTier = sortedTiers[i + 1];

      const currentMax = currentTier.maxUsage || Infinity;
      const nextMin = nextTier.minUsage;

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

  const handleSave = useCallback(async () => {
    if (!originalItem) return;

    // Validate pricing if usage-based
    if (pricingType === "usage") {
      if (formData.usage_pricing_type === "tiered") {
        const tierValidation = validatePricingTiers(formData.usage_tiers || []);
        if (!tierValidation.isValid) {
          setErrors({ usage_tiers: tierValidation.errors.join("; ") });
          return;
        }
      } else if (formData.usage_pricing_type === "flat_rate") {
        if (!formData.flat_usage_price || formData.flat_usage_price <= 0) {
          setErrors({
            flat_usage_price: "Flat usage price must be greater than 0",
          });
          return;
        }
      } else {
        setErrors({ usage_pricing_type: "Please select a usage pricing type" });
        return;
      }
    }

    setIsSaving(true);
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        billing_period: formData.billing_period,
        tags: formData.tags,
        demo_link: formData.demo_link,
        is_public: formData.is_public,
        // Usage-based pricing fields
        usage_pricing_type: formData.usage_pricing_type,
        usage_tiers: formData.usage_tiers,
        flat_usage_price: formData.flat_usage_price,
        usage_test_completed: formData.usage_test_completed,
        // Source code fields (using actual database column names)
        source_code_r: formData.source_code_price,
        source_code_format: formData.source_code_format,
        source_code_url: formData.source_code_url,
        // Setup fields
        setup_time: formData.setup_time,
        installation_url: formData.installation_url,
      };

      console.log("=== SAVE DEBUG INFO ===");
      console.log("Current pricingType:", pricingType);
      console.log("formData.billing_period:", formData.billing_period);
      console.log("formData.usage_pricing_type:", formData.usage_pricing_type);
      console.log("formData.usage_tiers:", formData.usage_tiers);
      console.log("formData.flat_usage_price:", formData.flat_usage_price);
      console.log("updateData.billing_period:", updateData.billing_period);
      console.log(
        "updateData.usage_pricing_type:",
        updateData.usage_pricing_type
      );
      console.log("Full updateData:", JSON.stringify(updateData, null, 2));
      console.log("=== END DEBUG INFO ===");
      const updatedItem = await marketplaceApi.updateItem(
        originalItem.id,
        updateData
      );
      console.log("Updated item from API:", updatedItem);

      if (updatedItem) {
        setOriginalItem(updatedItem);
        // Update form data to reflect saved state
        setFormData((prev) => ({ ...prev, ...updateData }));
        // Clear any errors
        setErrors({});
      } else {
        console.error("Failed to update item - API returned null");
        setErrors({ general: "Failed to save changes. Please try again." });
      }
    } catch (error) {
      console.error("Error saving item:", error);
    } finally {
      setIsSaving(false);
    }
  }, [originalItem, pricingType, formData, isSaving]);

  // Auto-save functionality to prevent data loss
  useEffect(() => {
    if (!originalItem) return;

    const hasUnsavedChanges = () => {
      return (
        formData.name !== originalItem.name ||
        formData.description !== originalItem.description ||
        formData.price !== originalItem.price ||
        formData.billing_period !== originalItem.billing_period ||
        formData.usage_pricing_type !== originalItem.usage_pricing_type ||
        JSON.stringify(formData.usage_tiers) !==
          JSON.stringify(originalItem.usage_tiers) ||
        formData.flat_usage_price !== originalItem.flat_usage_price ||
        formData.source_code_price !== originalItem.source_code_r ||
        formData.source_code_format !== originalItem.source_code_format ||
        formData.source_code_url !== originalItem.source_code_url ||
        formData.setup_time !== (originalItem.setup_time || "") ||
        formData.installation_url !== (originalItem.installation_url || "") ||
        JSON.stringify(formData.tags) !==
          JSON.stringify(originalItem.tags || []) ||
        formData.demo_link !== (originalItem.demo_link || "") ||
        formData.is_public !== originalItem.is_public ||
        formData.usage_test_completed !==
          (originalItem.usage_test_completed || false)
      );
    };

    // Auto-save every 30 seconds if there are changes
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges() && !isSaving) {
        console.log("Auto-saving changes...");
        handleSave();
      }
    }, 30000); // 30 seconds

    return () => {
      clearInterval(autoSaveInterval);
    };
  }, [formData, originalItem, isSaving, handleSave]);

  const handleReturnToDashboard = () => {
    navigate("/dashboard");
  };

  // Dummy function since publish is now handled from dashboard
  const handlePublish = () => {
    console.log("Publish functionality moved to dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading listing...</p>
        </div>
      </div>
    );
  }

  const requirements = getPublishingRequirements(formData, pricingType);

  if (!originalItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Listing Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The listing you're looking for doesn't exist or you don't have
            permission to edit it.
          </p>
          <Button onClick={handleReturnToDashboard}>
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
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
              Edit Marketplace Listing
            </h1>
            <p className="text-muted-foreground">
              Update your workflow listing details and settings
            </p>
          </div>
        </div>

        {/* Main Layout */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Form Sections */}
            <div className="lg:col-span-2 space-y-8">
              <BasicInformation
                formData={formData}
                onInputChange={handleInputChange}
                errors={errors}
              />

              <div className="border-t border-border"></div>

              <PricingSection
                formData={formData}
                pricingType={pricingType}
                onInputChange={handleInputChange}
                onPricingTypeChange={handlePricingTypeChange}
                errors={errors}
              />

              {pricingType === "usage" && (
                <>
                  <div className="border-t border-border"></div>
                  <UsageTestRequirement
                    formData={formData}
                    onInputChange={handleInputChange}
                  />
                </>
              )}

              <div className="border-t border-border"></div>

              <AdditionalDetails
                formData={formData}
                onInputChange={handleInputChange}
                errors={errors}
              />
            </div>

            {/* Right Side - Publishing Controls */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8">
                {errors.general && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{errors.general}</p>
                  </div>
                )}
                <PublishingStatus
                  formData={formData}
                  onSave={handleSave}
                  onPublish={handlePublish}
                  isSaving={isSaving}
                  canPublish={canPublish(formData, pricingType)}
                  requirements={getPublishingRequirements(
                    formData,
                    pricingType
                  )}
                  pricingType={pricingType}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
