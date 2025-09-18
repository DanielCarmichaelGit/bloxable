import { useState } from "react";
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
import { Badge } from "../ui/badge";
import { X, Plus } from "lucide-react";

interface MarketplaceItemFormData {
  tags: string[];
  demo_link?: string;
  source_code_price?: number;
  source_code_format?: "json" | "provided_in_chat" | "url";
  source_code_url?: string;
}

interface AdditionalDetailsProps {
  formData: MarketplaceItemFormData;
  onInputChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

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

export default function AdditionalDetails({
  formData,
  onInputChange,
  errors,
}: AdditionalDetailsProps) {
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      onInputChange("tags", [...formData.tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onInputChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const addCommonTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      onInputChange("tags", [...formData.tags, tag]);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground mb-6">
        Additional Details
      </h2>

      <Card className="p-6">
        <CardContent className="space-y-6">
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
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === "Enter" && addTag()}
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-3">
              <p className="text-sm text-muted-foreground mb-2">Common tags:</p>
              <div className="flex flex-wrap gap-1">
                {commonTags.map((tag) => (
                  <Button
                    key={tag}
                    variant="ghost"
                    size="sm"
                    onClick={() => addCommonTag(tag)}
                    disabled={formData.tags.includes(tag)}
                    className="h-6 px-2 text-xs"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
            {errors.tags && (
              <p className="text-sm text-destructive mt-1">{errors.tags}</p>
            )}
          </div>

          <div>
            <Label htmlFor="demo_link" className="text-foreground font-medium">
              Demo Link
            </Label>
            <Input
              id="demo_link"
              value={formData.demo_link || ""}
              onChange={(e) => onInputChange("demo_link", e.target.value)}
              placeholder="https://example.com/demo"
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Optional: Link to a demo or example of your workflow
            </p>
          </div>

          {formData.source_code_price && formData.source_code_price > 0 && (
            <>
              <div>
                <Label
                  htmlFor="source_code_format"
                  className="text-foreground font-medium"
                >
                  Source Code Format *
                </Label>
                <Select
                  value={formData.source_code_format || ""}
                  onValueChange={(value) =>
                    onInputChange("source_code_format", value)
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON File</SelectItem>
                    <SelectItem value="provided_in_chat">
                      Provided in Chat
                    </SelectItem>
                    <SelectItem value="url">URL to Source</SelectItem>
                  </SelectContent>
                </Select>
                {errors.source_code_format && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.source_code_format}
                  </p>
                )}
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
                    value={formData.source_code_url || ""}
                    onChange={(e) =>
                      onInputChange("source_code_url", e.target.value)
                    }
                    placeholder="https://github.com/user/repo"
                    className="mt-2"
                  />
                  {errors.source_code_url && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.source_code_url}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
