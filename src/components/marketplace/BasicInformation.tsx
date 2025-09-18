import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface MarketplaceItemFormData {
  name: string;
  description: string;
  setup_time?: string;
  installation_url?: string;
  webhook_url?: string;
}

interface BasicInformationProps {
  formData: MarketplaceItemFormData;
  onInputChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

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

const getDescriptionLengthColor = (length: number): string => {
  if (length >= 50) return "text-green-600 dark:text-green-400";
  if (length > 0) return "text-yellow-600 dark:text-yellow-400";
  return "text-muted-foreground";
};

export default function BasicInformation({
  formData,
  onInputChange,
  errors,
}: BasicInformationProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground mb-6">
        Basic Information
      </h2>

      <Card className="p-6">
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-foreground font-medium">
              Workflow Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onInputChange("name", e.target.value)}
              placeholder="Enter a descriptive name for your workflow"
              className="mt-2"
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
              onChange={(e) => onInputChange("description", e.target.value)}
              placeholder="Describe what your workflow does, how it helps users, and what makes it unique. Be specific and detailed."
              className="mt-2 min-h-[120px]"
            />
            <div className="flex justify-between items-center mt-2">
              <p
                className={`text-sm ${getDescriptionLengthColor(
                  formData.description.length
                )}`}
              >
                {formData.description.length}/50 characters minimum{" "}
                {formData.description.length >= 50 && "✓"}
              </p>
            </div>
            {errors.description && (
              <p className="text-sm text-destructive mt-1">
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="setup_time" className="text-foreground font-medium">
              Setup Time
            </Label>
            <Select
              value={formData.setup_time}
              onValueChange={(value) => onInputChange("setup_time", value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select setup time" />
              </SelectTrigger>
              <SelectContent>
                {setupTimeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.setup_time && (
              <p className="text-sm text-destructive mt-1">
                {errors.setup_time}
              </p>
            )}
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
                    onInputChange("installation_url", e.target.value)
                  }
                  placeholder="https://example.com/install"
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Provide a URL where users can install your workflow
                </p>
                {errors.installation_url && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.installation_url}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="webhook_url"
                  className="text-foreground font-medium"
                >
                  Webhook URL *
                </Label>
                <Input
                  id="webhook_url"
                  value={formData.webhook_url || ""}
                  onChange={(e) => onInputChange("webhook_url", e.target.value)}
                  placeholder="https://example.com/webhook"
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Webhook URL for self-service workflow execution
                </p>
                {errors.webhook_url && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.webhook_url}
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
