import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { marketplaceApi } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Home, Settings } from "lucide-react";

interface WorkflowConfigData {
  trigger_type: "webhook" | "cron" | "event" | "manual";
  trigger_config: {
    webhook_url?: string;
    manual_url?: string;
    event_title?: string;
    event_description?: string;
    cron_schedule?: string;
  };
  connection_keys: Array<{
    id: string;
    name: string;
    type: "api_key" | "oauth" | "basic_auth" | "custom";
    required: boolean;
    description: string;
  }>;
  reporting_webhook?: string;
  execution_timeout?: number;
  retry_config: {
    max_retries: number;
    retry_delay: number;
    exponential_backoff: boolean;
  };
  environment_variables: Array<{
    id: string;
    name: string;
    value: string;
    required: boolean;
    description: string;
  }>;
}

export default function MarketplaceItemConfig() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [originalConfig, setOriginalConfig] =
    useState<WorkflowConfigData | null>(null);
  const [configData, setConfigData] = useState<WorkflowConfigData>({
    trigger_type: "manual",
    trigger_config: {
      manual_url: "",
    },
    connection_keys: [],
    reporting_webhook: "",
    execution_timeout: 300,
    retry_config: {
      max_retries: 3,
      retry_delay: 1000,
      exponential_backoff: true,
    },
    environment_variables: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load configuration data
  useEffect(() => {
    if (!id || !user || hasLoaded) return;

    const loadConfig = async () => {
      try {
        const item = await marketplaceApi.getItemById(id);
        if (item) {
          // For now, we'll create a default config since we don't have config data in the database yet
          const defaultConfig: WorkflowConfigData = {
            trigger_type: "manual",
            trigger_config: {
              manual_url: "",
            },
            connection_keys: [],
            reporting_webhook: "",
            execution_timeout: 300,
            retry_config: {
              max_retries: 3,
              retry_delay: 1000,
              exponential_backoff: true,
            },
            environment_variables: [],
          };

          setOriginalConfig(defaultConfig);
          setConfigData(defaultConfig);
          setHasLoaded(true);
        }
      } catch (error) {
        console.error("Error loading configuration:", error);
      }
    };

    loadConfig();
  }, [id, user, hasLoaded]);

  const handleInputChange = (field: string, value: any) => {
    setConfigData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleNestedInputChange = (
    parentField: string,
    childField: string,
    value: any
  ) => {
    setConfigData((prev) => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof WorkflowConfigData] as any),
        [childField]: value,
      },
    }));
  };

  const handleArrayItemChange = (
    field: string,
    index: number,
    childField: string,
    value: any
  ) => {
    setConfigData((prev) => {
      const fieldData = prev[field as keyof WorkflowConfigData] as any[];
      return {
        ...prev,
        [field]: fieldData.map((item: any, i: number) =>
          i === index ? { ...item, [childField]: value } : item
        ),
      };
    });
  };

  const addArrayItem = (field: string, newItem: any) => {
    setConfigData((prev) => {
      const fieldData = prev[field as keyof WorkflowConfigData] as any[];
      return {
        ...prev,
        [field]: [...fieldData, newItem],
      };
    });
  };

  const removeArrayItem = (field: string, index: number) => {
    setConfigData((prev) => {
      const fieldData = prev[field as keyof WorkflowConfigData] as any[];
      return {
        ...prev,
        [field]: fieldData.filter((_: any, i: number) => i !== index),
      };
    });
  };

  const handleSave = useCallback(async () => {
    if (!originalConfig) return;

    setIsSaving(true);
    try {
      // For now, just log the config data since we don't have database storage yet
      console.log("Saving workflow configuration:", configData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setOriginalConfig(configData);
      setErrors({});
    } catch (error) {
      console.error("Error saving configuration:", error);
      setErrors({ general: "Failed to save configuration. Please try again." });
    } finally {
      setIsSaving(false);
    }
  }, [originalConfig, configData]);

  const handleReturnToDashboard = () => {
    navigate("/dashboard");
  };

  const addConnectionKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: "",
      type: "api_key" as const,
      required: true,
      description: "",
    };
    addArrayItem("connection_keys", newKey);
  };

  const addEnvironmentVariable = () => {
    const newVar = {
      id: Date.now().toString(),
      name: "",
      value: "",
      required: false,
      description: "",
    };
    addArrayItem("environment_variables", newVar);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReturnToDashboard}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <h1 className="text-2xl font-bold">Workflow Configuration</h1>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-destructive text-sm">{errors.general}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trigger Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Trigger Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label
                    htmlFor="trigger_type"
                    className="text-foreground font-medium"
                  >
                    Trigger Type
                  </Label>
                  <Select
                    value={configData.trigger_type}
                    onValueChange={(
                      value: "webhook" | "cron" | "event" | "manual"
                    ) => handleInputChange("trigger_type", value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select trigger type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webhook">Webhook</SelectItem>
                      <SelectItem value="cron">Cron Schedule</SelectItem>
                      <SelectItem value="event">Event-Based</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {configData.trigger_type === "webhook" && (
                  <div>
                    <Label
                      htmlFor="webhook_url"
                      className="text-foreground font-medium"
                    >
                      Webhook URL *
                    </Label>
                    <Input
                      id="webhook_url"
                      value={configData.trigger_config.webhook_url || ""}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "trigger_config",
                          "webhook_url",
                          e.target.value
                        )
                      }
                      placeholder="https://your-domain.com/webhook"
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter your webhook URL. We'll handle token management and
                      call your webhook when triggered.
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>API Integration:</strong> In your automation,
                          you must call our API at{" "}
                          <code className="bg-blue-100 px-1 rounded">
                            api.bloxable.io/exchange?token=12345
                          </code>{" "}
                          to exchange the token for user information. See our{" "}
                          <a
                            href="https://bloxable.io/documentation"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            documentation
                          </a>{" "}
                          for details.
                        </p>
                      </div>
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-sm text-amber-800">
                          <strong>CORS Required:</strong> Your webhook must have
                          CORS enabled for the domain{" "}
                          <code className="bg-amber-100 px-1 rounded">
                            bloxable.io
                          </code>{" "}
                          to allow our platform to call your endpoint.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {configData.trigger_type === "manual" && (
                  <div>
                    <Label
                      htmlFor="manual_url"
                      className="text-foreground font-medium"
                    >
                      Manual Trigger URL *
                    </Label>
                    <Input
                      id="manual_url"
                      value={configData.trigger_config.manual_url || ""}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "trigger_config",
                          "manual_url",
                          e.target.value
                        )
                      }
                      placeholder="https://your-domain.com/manual-trigger"
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      URL where buyers can manually activate this workflow
                    </p>
                  </div>
                )}

                {configData.trigger_type === "cron" && (
                  <div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                      <p className="text-sm text-gray-700">
                        <strong>Cron Schedule:</strong> Buyers will configure
                        their own schedule when they purchase this workflow. No
                        additional configuration needed here.
                      </p>
                    </div>
                  </div>
                )}

                {configData.trigger_type === "event" && (
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="event_title"
                        className="text-foreground font-medium"
                      >
                        Event Title *
                      </Label>
                      <Input
                        id="event_title"
                        value={configData.trigger_config.event_title || ""}
                        onChange={(e) =>
                          handleNestedInputChange(
                            "trigger_config",
                            "event_title",
                            e.target.value
                          )
                        }
                        placeholder="Instagram Comment"
                        className="mt-2"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Short title for the event (e.g., "Instagram Comment",
                        "New Email")
                      </p>
                    </div>
                    <div>
                      <Label
                        htmlFor="event_description"
                        className="text-foreground font-medium"
                      >
                        Event Description *
                      </Label>
                      <Textarea
                        id="event_description"
                        value={
                          configData.trigger_config.event_description || ""
                        }
                        onChange={(e) =>
                          handleNestedInputChange(
                            "trigger_config",
                            "event_description",
                            e.target.value
                          )
                        }
                        placeholder="Triggers when someone comments on your Instagram post"
                        className="mt-2"
                        rows={3}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Brief description of what triggers this workflow
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Connection Keys */}
            <Card>
              <CardHeader>
                <CardTitle>Connection Keys</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Define the API keys and credentials users need to connect to
                  external services
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {configData.connection_keys.map((key, index) => (
                  <div
                    key={key.id}
                    className="border border-border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        Connection Key {index + 1}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeArrayItem("connection_keys", index)
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
                          value={key.name}
                          onChange={(e) =>
                            handleArrayItemChange(
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
                            handleArrayItemChange(
                              "connection_keys",
                              index,
                              "type",
                              value
                            )
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="api_key">API Key</SelectItem>
                            <SelectItem value="oauth">OAuth</SelectItem>
                            <SelectItem value="basic_auth">
                              Basic Auth
                            </SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <Textarea
                        value={key.description}
                        onChange={(e) =>
                          handleArrayItemChange(
                            "connection_keys",
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Instructions for users on how to obtain this key"
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`required-${key.id}`}
                        checked={key.required}
                        onChange={(e) =>
                          handleArrayItemChange(
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
                <Button
                  variant="outline"
                  onClick={addConnectionKey}
                  className="w-full"
                >
                  Add Connection Key
                </Button>
              </CardContent>
            </Card>

            {/* Environment Variables */}
            <Card>
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Define environment variables that users can configure
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {configData.environment_variables.map((envVar, index) => (
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
                          removeArrayItem("environment_variables", index)
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
                            handleArrayItemChange(
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
                        <Label className="text-sm font-medium">
                          Default Value
                        </Label>
                        <Input
                          value={envVar.value}
                          onChange={(e) =>
                            handleArrayItemChange(
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
                          handleArrayItemChange(
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
                          handleArrayItemChange(
                            "environment_variables",
                            index,
                            "required",
                            e.target.checked
                          )
                        }
                        className="rounded"
                      />
                      <Label
                        htmlFor={`env-required-${envVar.id}`}
                        className="text-sm"
                      >
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reporting Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Reporting & Monitoring</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label
                    htmlFor="reporting_webhook"
                    className="text-foreground font-medium"
                  >
                    Reporting Webhook
                  </Label>
                  <Input
                    id="reporting_webhook"
                    value={configData.reporting_webhook || ""}
                    onChange={(e) =>
                      handleInputChange("reporting_webhook", e.target.value)
                    }
                    placeholder="https://your-domain.com/reporting"
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    URL to receive execution logs and status updates
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="execution_timeout"
                    className="text-foreground font-medium"
                  >
                    Execution Timeout (seconds)
                  </Label>
                  <Input
                    id="execution_timeout"
                    type="number"
                    value={configData.execution_timeout}
                    onChange={(e) =>
                      handleInputChange(
                        "execution_timeout",
                        parseInt(e.target.value) || 300
                      )
                    }
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Retry Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Retry Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label
                    htmlFor="max_retries"
                    className="text-foreground font-medium"
                  >
                    Max Retries
                  </Label>
                  <Input
                    id="max_retries"
                    type="number"
                    value={configData.retry_config.max_retries}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "retry_config",
                        "max_retries",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="retry_delay"
                    className="text-foreground font-medium"
                  >
                    Retry Delay (ms)
                  </Label>
                  <Input
                    id="retry_delay"
                    type="number"
                    value={configData.retry_config.retry_delay}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "retry_config",
                        "retry_delay",
                        parseInt(e.target.value) || 1000
                      )
                    }
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="exponential_backoff"
                    checked={configData.retry_config.exponential_backoff}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "retry_config",
                        "exponential_backoff",
                        e.target.checked
                      )
                    }
                    className="rounded"
                  />
                  <Label htmlFor="exponential_backoff" className="text-sm">
                    Exponential Backoff
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
