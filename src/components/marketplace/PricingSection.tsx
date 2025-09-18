import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Plus, X } from "lucide-react";

interface UsageTier {
  id: string;
  minUsage: number;
  maxUsage?: number;
  pricePerUnit: number;
}

interface MarketplaceItemFormData {
  price: number;
  billing_period: string;
  usage_pricing_type?: "flat_rate" | "tiered";
  usage_tiers?: UsageTier[];
  flat_usage_price?: number;
  source_code_price?: number;
  source_code_format?: "json" | "provided_in_chat" | "url";
  source_code_url?: string;
  usage_test_completed?: boolean;
}

interface PricingSectionProps {
  readonly formData: MarketplaceItemFormData;
  readonly pricingType: "flat" | "usage";
  readonly onInputChange: (field: string, value: any) => void;
  readonly onPricingTypeChange: (type: "flat" | "usage") => void;
  readonly errors: Record<string, string>;
}

export default function PricingSection({
  formData,
  pricingType,
  onInputChange,
  onPricingTypeChange,
  errors,
}: PricingSectionProps) {
  const addUsageTier = () => {
    const newTier: UsageTier = {
      id: Date.now().toString(),
      minUsage: 0,
      maxUsage: undefined,
      pricePerUnit: 0,
    };
    onInputChange("usage_tiers", [...(formData.usage_tiers || []), newTier]);
  };

  const removeUsageTier = (tierId: string) => {
    onInputChange(
      "usage_tiers",
      formData.usage_tiers?.filter((tier) => tier.id !== tierId) || []
    );
  };

  const updateUsageTier = (
    tierId: string,
    field: keyof UsageTier,
    value: any
  ) => {
    const updatedTiers =
      formData.usage_tiers?.map((tier) =>
        tier.id === tierId ? { ...tier, [field]: value } : tier
      ) || [];
    onInputChange("usage_tiers", updatedTiers);
  };

  const validateTier = (tier: UsageTier): boolean => {
    return tier.minUsage >= 0 && tier.pricePerUnit > 0;
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground mb-6">
        Pricing & Billing
      </h2>

      <Card className="p-6">
        <CardContent className="space-y-6">
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
                onClick={() => onPricingTypeChange("flat")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  pricingType === "flat"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Flat Rate
              </button>
              <button
                onClick={() => onPricingTypeChange("usage")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  pricingType === "usage"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Usage-Based
              </button>
            </div>
          </div>

          {/* Commission Info */}
          <div className="text-xs text-muted-foreground">
            {pricingType === "flat"
              ? "6% commission on one-time purchases"
              : "6% commission on usage (up to $15/month) + webhook required"}
          </div>

          {pricingType === "flat" ? (
            <>
              <div>
                <Label htmlFor="price" className="text-foreground font-medium">
                  Price ($) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    onInputChange("price", parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className="mt-2"
                  min="0"
                  step="0.01"
                />
                {errors.price && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.price}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="billing_period"
                  className="text-foreground font-medium"
                >
                  Billing Period
                </Label>
                <Select
                  value={formData.billing_period}
                  onValueChange={(value) =>
                    onInputChange("billing_period", value)
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select billing period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One-time</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.price > 0 && (
                <div>
                  <Label
                    htmlFor="source_code_price"
                    className="text-foreground font-medium"
                  >
                    Source Code Price ($)
                  </Label>
                  <Input
                    id="source_code_price"
                    type="number"
                    value={formData.source_code_price || ""}
                    onChange={(e) =>
                      onInputChange(
                        "source_code_price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0.00"
                    className="mt-2"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Optional: Additional price for source code access
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              {/* Usage pricing type */}
              <div>
                <Label className="text-foreground font-medium">
                  Usage Pricing Type
                </Label>
                <Select
                  value={formData.usage_pricing_type || ""}
                  onValueChange={(value) =>
                    onInputChange("usage_pricing_type", value)
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select pricing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat_rate">
                      Flat Rate per Execution
                    </SelectItem>
                    <SelectItem value="tiered">Tiered Pricing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.usage_pricing_type === "flat_rate" && (
                <div>
                  <Label
                    htmlFor="flat_usage_price"
                    className="text-foreground font-medium"
                  >
                    Price per Execution ($) *
                  </Label>
                  <Input
                    id="flat_usage_price"
                    type="number"
                    value={formData.flat_usage_price || ""}
                    onChange={(e) =>
                      onInputChange(
                        "flat_usage_price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0.01"
                    className="mt-2"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Set the price for each execution of your workflow
                  </p>
                  {errors.flat_usage_price && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.flat_usage_price}
                    </p>
                  )}
                </div>
              )}

              {formData.usage_pricing_type === "tiered" && (
                <div>
                  <Label className="text-foreground font-medium">
                    Usage Tiers
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Define pricing tiers based on usage volume
                  </p>

                  <div className="space-y-3">
                    {formData.usage_tiers?.map((tier) => {
                      const isValid = validateTier(tier);
                      return (
                        <div key={tier.id} className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">
                              Min Usage
                            </Label>
                            <Input
                              type="number"
                              value={tier.minUsage}
                              onChange={(e) =>
                                updateUsageTier(
                                  tier.id,
                                  "minUsage",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              placeholder="0"
                              min="0"
                              className={!isValid ? "border-destructive" : ""}
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">
                              Max Usage
                            </Label>
                            <Input
                              type="number"
                              value={tier.maxUsage || ""}
                              onChange={(e) =>
                                updateUsageTier(
                                  tier.id,
                                  "maxUsage",
                                  parseInt(e.target.value) || undefined
                                )
                              }
                              placeholder="∞"
                              min="0"
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">
                              Price per Unit ($)
                            </Label>
                            <Input
                              type="number"
                              value={tier.pricePerUnit}
                              onChange={(e) =>
                                updateUsageTier(
                                  tier.id,
                                  "pricePerUnit",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="0.01"
                              min="0"
                              step="0.01"
                              className={!isValid ? "border-destructive" : ""}
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeUsageTier(tier.id)}
                            className="px-3"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addUsageTier}
                    className="mt-3"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tier
                  </Button>

                  {errors.usage_tiers && (
                    <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-sm text-destructive font-medium">
                        {errors.usage_tiers}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
