import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Save, Eye, CheckCircle, X } from "lucide-react";

interface MarketplaceItemFormData {
  status: "draft" | "pending_review" | "active" | "inactive" | "rejected";
  is_public: boolean;
  setup_time?: string;
  webhook_url?: string;
}

interface PublishingStatusProps {
  formData: MarketplaceItemFormData;
  onSave: () => void;
  onPublish: () => void;
  isSaving: boolean;
  canPublish: boolean;
  requirements: Array<{
    id: string;
    label: string;
    completed: boolean;
  }>;
  pricingType: "flat" | "usage";
}

export default function PublishingStatus({
  formData,
  onSave,
  onPublish,
  isSaving,
  canPublish,
  requirements,
  pricingType,
}: PublishingStatusProps) {
  return (
    <div className="space-y-6">
      {/* Publishing Requirements */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-lg font-semibold">
            Publishing Requirements
          </CardTitle>
          <CardDescription>
            Complete all requirements to publish your listing
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3">
            {requirements.map((requirement) => (
              <div key={requirement.id} className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    requirement.completed
                      ? "bg-muted text-foreground"
                      : "bg-muted-foreground/20 text-muted-foreground"
                  }`}
                >
                  {requirement.completed ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </div>
                <span
                  className={`text-sm ${
                    requirement.completed
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {requirement.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status and Actions */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-lg font-semibold">
            Status & Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Current Status
              </Label>
              <div className="mt-1">
                <Badge
                  variant={
                    formData.status === "active"
                      ? "default"
                      : formData.status === "draft"
                      ? "secondary"
                      : "outline"
                  }
                  className="text-xs"
                >
                  {formData.status.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <Label className="text-sm font-medium text-muted-foreground">
                Visibility
              </Label>
              <div className="mt-1">
                <Badge
                  variant={formData.is_public ? "default" : "secondary"}
                  className="text-xs"
                >
                  {formData.is_public ? "Public" : "Private"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Additional Configs */}
          {formData.setup_time === "self-service" && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Webhook URL
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.webhook_url
                  ? "Configured"
                  : "Required for self-service items"}
              </p>
            </div>
          )}

          {pricingType === "usage" && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Test Event
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Required for usage-based pricing
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-0 pt-4 flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={onSave}
            disabled={isSaving}
            className="w-full flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          {formData.status === "draft" && (
            <Button
              onClick={onPublish}
              disabled={isSaving || !canPublish}
              className="w-full flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {isSaving ? "Publishing..." : "Publish Listing"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
