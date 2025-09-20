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
    // Manual trigger config
    manual_url?: string;

    // Webhook trigger config
    webhook_url?: string;
    webhook_method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    webhook_headers?: Array<{
      id: string;
      key: string;
      value: string;
    }>;
    webhook_query_params?: Array<{
      id: string;
      key: string;
      value: string;
    }>;
    webhook_body_schema?: string;
    webhook_auth_token?: string;

    // Event trigger config
    event_title?: string;
    event_description?: string;

    // Cron trigger config (no additional config needed)
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
    debounce_enabled: boolean;
    debounce_value: number;
    debounce_unit: "seconds" | "minutes" | "hours" | "days";
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
      webhook_url: "",
      webhook_method: "POST",
      webhook_headers: [],
      webhook_query_params: [],
      webhook_body_schema: "",
      webhook_auth_token: "",
      event_title: "",
      event_description: "",
    },
    connection_keys: [],
    reporting_webhook: "",
    execution_timeout: 300,
    retry_config: {
      max_retries: 3,
      retry_delay: 1000,
      exponential_backoff: true,
      debounce_enabled: false,
      debounce_value: 1,
      debounce_unit: "minutes",
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
              webhook_url: "",
              webhook_method: "POST",
              webhook_headers: [],
              webhook_query_params: [],
              webhook_body_schema: "",
              webhook_auth_token: "",
              event_title: "",
              event_description: "",
            },
            connection_keys: [],
            reporting_webhook: "",
            execution_timeout: 300,
            retry_config: {
              max_retries: 3,
              retry_delay: 1000,
              exponential_backoff: true,
              debounce_enabled: false,
              debounce_value: 1,
              debounce_unit: "minutes",
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

  const addWebhookHeader = () => {
    const newHeader = {
      id: Date.now().toString(),
      key: "",
      value: "",
    };
    addArrayItem("trigger_config.webhook_headers", newHeader);
  };

  const addWebhookQueryParam = () => {
    const newParam = {
      id: Date.now().toString(),
      key: "",
      value: "",
    };
    addArrayItem("trigger_config.webhook_query_params", newParam);
  };

  const removeWebhookHeader = (index: number) => {
    removeArrayItem("trigger_config.webhook_headers", index);
  };

  const removeWebhookQueryParam = (index: number) => {
    removeArrayItem("trigger_config.webhook_query_params", index);
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
                      <SelectItem value="manual">
                        Manual - User clicks "Run Workflow" in dashboard
                      </SelectItem>
                      <SelectItem value="cron">
                        Cron - User sets schedule during setup
                      </SelectItem>
                      <SelectItem value="webhook">
                        Webhook - User hits configured webhook via fetch
                      </SelectItem>
                      <SelectItem value="event">
                        Event - Part of workflow/automation
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {configData.trigger_type === "webhook" && (
                  <div className="space-y-6">
                    {/* Webhook URL */}
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
                        The webhook URL that buyers will call to trigger this
                        workflow
                      </p>
                    </div>

                    {/* HTTP Method */}
                    <div>
                      <Label
                        htmlFor="webhook_method"
                        className="text-foreground font-medium"
                      >
                        HTTP Method *
                      </Label>
                      <Select
                        value={
                          configData.trigger_config.webhook_method || "POST"
                        }
                        onValueChange={(
                          value: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
                        ) =>
                          handleNestedInputChange(
                            "trigger_config",
                            "webhook_method",
                            value
                          )
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Headers */}
                    <div>
                      <div className="flex items-center justify-between">
                        <Label className="text-foreground font-medium">
                          Headers
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addWebhookHeader}
                        >
                          Add Header
                        </Button>
                      </div>
                      <div className="mt-2 space-y-2">
                        {configData.trigger_config.webhook_headers?.map(
                          (header, index) => (
                            <div
                              key={header.id}
                              className="flex items-center space-x-2"
                            >
                              <Input
                                placeholder="Header name"
                                value={header.key}
                                onChange={(e) =>
                                  handleArrayItemChange(
                                    "trigger_config.webhook_headers",
                                    index,
                                    "key",
                                    e.target.value
                                  )
                                }
                                className="flex-1"
                              />
                              <Input
                                placeholder="Header value"
                                value={header.value}
                                onChange={(e) =>
                                  handleArrayItemChange(
                                    "trigger_config.webhook_headers",
                                    index,
                                    "value",
                                    e.target.value
                                  )
                                }
                                className="flex-1"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeWebhookHeader(index)}
                                className="text-destructive"
                              >
                                Remove
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Query Parameters */}
                    <div>
                      <div className="flex items-center justify-between">
                        <Label className="text-foreground font-medium">
                          Query Parameters
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addWebhookQueryParam}
                        >
                          Add Parameter
                        </Button>
                      </div>
                      <div className="mt-2 space-y-2">
                        {configData.trigger_config.webhook_query_params?.map(
                          (param, index) => (
                            <div
                              key={param.id}
                              className="flex items-center space-x-2"
                            >
                              <Input
                                placeholder="Parameter name"
                                value={param.key}
                                onChange={(e) =>
                                  handleArrayItemChange(
                                    "trigger_config.webhook_query_params",
                                    index,
                                    "key",
                                    e.target.value
                                  )
                                }
                                className="flex-1"
                              />
                              <Input
                                placeholder="Parameter value"
                                value={param.value}
                                onChange={(e) =>
                                  handleArrayItemChange(
                                    "trigger_config.webhook_query_params",
                                    index,
                                    "value",
                                    e.target.value
                                  )
                                }
                                className="flex-1"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeWebhookQueryParam(index)}
                                className="text-destructive"
                              >
                                Remove
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Body Schema */}
                    <div>
                      <Label
                        htmlFor="webhook_body_schema"
                        className="text-foreground font-medium"
                      >
                        Request Body Schema (JSON)
                      </Label>
                      <Textarea
                        id="webhook_body_schema"
                        value={
                          configData.trigger_config.webhook_body_schema || ""
                        }
                        onChange={(e) =>
                          handleNestedInputChange(
                            "trigger_config",
                            "webhook_body_schema",
                            e.target.value
                          )
                        }
                        placeholder='{"key": "value", "data": "example"}'
                        className="mt-2"
                        rows={4}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        JSON schema or example of the expected request body
                      </p>
                    </div>

                    {/* Auth Token */}
                    <div>
                      <Label
                        htmlFor="webhook_auth_token"
                        className="text-foreground font-medium"
                      >
                        Authentication Token (Optional)
                      </Label>
                      <Input
                        id="webhook_auth_token"
                        value={
                          configData.trigger_config.webhook_auth_token || ""
                        }
                        onChange={(e) =>
                          handleNestedInputChange(
                            "trigger_config",
                            "webhook_auth_token",
                            e.target.value
                          )
                        }
                        placeholder="Bearer token or API key"
                        className="mt-2"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Optional authentication token that will be provided to
                        buyers
                      </p>
                    </div>

                    {/* Integration Info */}
                    <div className="mt-4 space-y-2">
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
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Manual Trigger:</strong> Buyers will log into
                        their dashboard and click "Run Workflow" to manually
                        trigger this automation. No additional configuration
                        needed here.
                      </p>
                    </div>
                  </div>
                )}

                {configData.trigger_type === "cron" && (
                  <div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Cron Schedule:</strong> Buyers will set their
                        own schedule during setup (e.g., every hour, daily at 9
                        AM). Setting a debounce timer will override their
                        schedule - if they set every second but you set 10
                        minutes debounce, it will run every 10 minutes.
                      </p>
                    </div>
                  </div>
                )}

                {configData.trigger_type === "event" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Event-Based Trigger:</strong> This occurs as
                        part of the workflow/automation itself. No additional
                        setup needed unless specified in the connection keys or
                        environment variables below.
                      </p>
                    </div>
                    <div>
                      <Label
                        htmlFor="event_title"
                        className="text-foreground font-medium"
                      >
                        Event Title (Optional)
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
                        Event Description (Optional)
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
          <div className="sticky top-8 self-start h-fit">
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

                  {/* Debounce Configuration */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="checkbox"
                        id="debounce_enabled"
                        checked={configData.retry_config.debounce_enabled}
                        onChange={(e) =>
                          handleNestedInputChange(
                            "retry_config",
                            "debounce_enabled",
                            e.target.checked
                          )
                        }
                        className="rounded"
                      />
                      <Label
                        htmlFor="debounce_enabled"
                        className="text-sm font-medium"
                      >
                        Enable Debounce Timer
                      </Label>
                    </div>

                    {configData.retry_config.debounce_enabled && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-sm font-medium">Value</Label>
                            <Input
                              type="number"
                              value={configData.retry_config.debounce_value}
                              onChange={(e) =>
                                handleNestedInputChange(
                                  "retry_config",
                                  "debounce_value",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="mt-1"
                              min="1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Unit</Label>
                            <Select
                              value={configData.retry_config.debounce_unit}
                              onValueChange={(
                                value: "seconds" | "minutes" | "hours" | "days"
                              ) =>
                                handleNestedInputChange(
                                  "retry_config",
                                  "debounce_unit",
                                  value
                                )
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="seconds">Seconds</SelectItem>
                                <SelectItem value="minutes">Minutes</SelectItem>
                                <SelectItem value="hours">Hours</SelectItem>
                                <SelectItem value="days">Days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Rate limiting: Prevents workflow from running more
                          frequently than this interval. For cron triggers, this
                          overrides the user's schedule.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
