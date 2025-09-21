import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

interface EnvironmentVariable {
  id: string;
  name: string;
  value: string;
  required: boolean;
  description: string;
}

interface EnvironmentVariablesProps {
  readonly environmentVariables: EnvironmentVariable[];
  readonly onArrayItemChange: (
    field: string,
    index: number,
    childField: string,
    value: any
  ) => void;
  readonly onAddArrayItem: (field: string, newItem: any) => void;
  readonly onRemoveArrayItem: (field: string, index: number) => void;
}

export default function EnvironmentVariables({
  environmentVariables,
  onArrayItemChange,
  onAddArrayItem,
  onRemoveArrayItem,
}: EnvironmentVariablesProps) {
  const addEnvironmentVariable = () => {
    const newVar = {
      id: Date.now().toString(),
      name: "",
      value: "",
      required: false,
      description: "",
    };
    onAddArrayItem("environment_variables", newVar);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment Variables</CardTitle>
        <p className="text-sm text-muted-foreground">
          Define environment variables that users can configure
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          These are configuration settings (like URLs, timeouts, feature flags)
          that control how your workflow behaves and can be customized by each
          user.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {environmentVariables.map((envVar, index) => (
          <div
            key={envVar.id}
            className="border border-border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Variable {index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onRemoveArrayItem("environment_variables", index)
                }
                className="text-destructive hover:text-destructive"
              >
                Remove
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <Input
                  value={envVar.name}
                  onChange={(e) =>
                    onArrayItemChange(
                      "environment_variables",
                      index,
                      "name",
                      e.target.value
                    )
                  }
                  placeholder="e.g., API_BASE_URL"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Default Value</Label>
                <Input
                  value={envVar.value}
                  onChange={(e) =>
                    onArrayItemChange(
                      "environment_variables",
                      index,
                      "value",
                      e.target.value
                    )
                  }
                  placeholder="e.g., https://api.example.com"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={envVar.description}
                onChange={(e) =>
                  onArrayItemChange(
                    "environment_variables",
                    index,
                    "description",
                    e.target.value
                  )
                }
                placeholder="Description of what this variable controls"
                className="mt-1"
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`env-required-${envVar.id}`}
                checked={envVar.required}
                onChange={(e) =>
                  onArrayItemChange(
                    "environment_variables",
                    index,
                    "required",
                    e.target.checked
                  )
                }
                className="rounded"
              />
              <Label htmlFor={`env-required-${envVar.id}`} className="text-sm">
                Required
              </Label>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={addEnvironmentVariable}
          className="w-full"
        >
          Add Environment Variable
        </Button>
      </CardContent>
    </Card>
  );
}
