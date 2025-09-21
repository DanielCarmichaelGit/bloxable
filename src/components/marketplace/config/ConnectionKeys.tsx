import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import StepBuilder from "./StepBuilder";

interface Step {
  id: string;
  title: string;
  description: string;
}

interface ConnectionKey {
  id: string;
  name: string;
  type: "api_key" | "oauth" | "basic_auth" | "custom";
  required: boolean;
  description: string;
  steps: Step[];
}

interface ConnectionKeysProps {
  readonly connectionKeys: ConnectionKey[];
  readonly onArrayItemChange: (
    field: string,
    index: number,
    childField: string,
    value: any
  ) => void;
  readonly onAddArrayItem: (field: string, newItem: any) => void;
  readonly onRemoveArrayItem: (field: string, index: number) => void;
}

export default function ConnectionKeys({
  connectionKeys,
  onArrayItemChange,
  onAddArrayItem,
  onRemoveArrayItem,
}: ConnectionKeysProps) {
  const addConnectionKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: "",
      type: "api_key" as const,
      required: true,
      description: "",
      steps: [],
    };
    onAddArrayItem("connection_keys", newKey);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection Keys</CardTitle>
        <p className="text-sm text-muted-foreground">
          Define the API keys and credentials users need to connect to external
          services
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          These are sensitive authentication tokens (like Slack API keys, GitHub
          tokens) that users obtain from external services to allow your
          workflow to act on their behalf.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionKeys.map((key, index) => (
          <div
            key={key.id}
            className="border border-border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Connection Key {index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveArrayItem("connection_keys", index)}
                className="text-destructive hover:text-destructive"
              >
                Remove
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <Input
                  value={key.name}
                  onChange={(e) =>
                    onArrayItemChange(
                      "connection_keys",
                      index,
                      "name",
                      e.target.value
                    )
                  }
                  placeholder="e.g., Slack API Key"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Type</Label>
                <Select
                  value={key.type}
                  onValueChange={(
                    value: "api_key" | "oauth" | "basic_auth" | "custom"
                  ) =>
                    onArrayItemChange("connection_keys", index, "type", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api_key">API Key</SelectItem>
                    <SelectItem value="oauth">OAuth</SelectItem>
                    <SelectItem value="basic_auth">Basic Auth</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">
                Description ({key.description.length}/250 characters)
              </Label>
              <Textarea
                value={key.description}
                onChange={(e) =>
                  onArrayItemChange(
                    "connection_keys",
                    index,
                    "description",
                    e.target.value
                  )
                }
                placeholder="Instructions for users on how to obtain this key"
                className={`mt-1 ${
                  key.description.length < 50 || key.description.length > 250
                    ? "border-red-500"
                    : ""
                }`}
                rows={2}
                maxLength={250}
              />
              {key.description.length < 50 && key.description.length > 0 && (
                <p className="text-sm text-red-500 mt-1">
                  Description must be at least 50 characters (
                  {50 - key.description.length} more needed)
                </p>
              )}
              {key.description.length > 250 && (
                <p className="text-sm text-red-500 mt-1">
                  Description must be no more than 250 characters (
                  {key.description.length - 250} over limit)
                </p>
              )}
            </div>
            <StepBuilder
              steps={key.steps}
              onStepsChange={(steps) =>
                onArrayItemChange("connection_keys", index, "steps", steps)
              }
              placeholder={{
                title: "e.g., Go to Settings",
                description:
                  "e.g., Navigate to the API Keys section in your account settings",
              }}
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`required-${key.id}`}
                checked={key.required}
                onChange={(e) =>
                  onArrayItemChange(
                    "connection_keys",
                    index,
                    "required",
                    e.target.checked
                  )
                }
                className="rounded"
              />
              <Label htmlFor={`required-${key.id}`} className="text-sm">
                Required
              </Label>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={addConnectionKey} className="w-full">
          Add Connection Key
        </Button>
      </CardContent>
    </Card>
  );
}
