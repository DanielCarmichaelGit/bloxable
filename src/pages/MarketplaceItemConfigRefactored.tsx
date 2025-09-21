import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { marketplaceApi } from "../lib/supabase";
import {
  validateConfiguration,
  getFieldDisplayName,
  ValidationError,
} from "../lib/configValidation";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Home, Settings } from "lucide-react";

// Import subcomponents
import WebhookConfiguration from "../components/marketplace/config/WebhookConfiguration";
import TriggerConfiguration from "../components/marketplace/config/TriggerConfiguration";
import ConnectionKeys from "../components/marketplace/config/ConnectionKeys";
import EnvironmentVariables from "../components/marketplace/config/EnvironmentVariables";
import ReportingConfiguration from "../components/marketplace/config/ReportingConfiguration";
import RetryConfiguration from "../components/marketplace/config/RetryConfiguration";
import PlatformConfiguration from "../components/marketplace/config/PlatformConfiguration";

interface WorkflowConfigData {
  platform: "n8n" | "make" | "zapier" | "contextual";
  trigger_type: "webhook" | "cron" | "event" | "manual";
  trigger_config: {
    // Manual trigger config
    manual_url?: string;

    // Webhook trigger config
    webhook_url?: string;
    webhook_method?: "GET" | "POST";
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
    webhook_jwt_secret?: string;

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
    steps: Array<{
      id: string;
      title: string;
      description: string;
    }>;
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
    platform: "n8n",
    trigger_type: "manual",
    trigger_config: {
      manual_url: "",
      webhook_url: "",
      webhook_method: "POST",
      webhook_headers: [],
      webhook_query_params: [],
      webhook_body_schema: "",
      webhook_jwt_secret: "",
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
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load configuration data
  useEffect(() => {
    if (!id || !user || hasLoaded) return;

    const loadConfig = async () => {
      try {
        const item = await marketplaceApi.getItemById(id);
        if (item) {
          // Try to load existing configuration
          const existingConfig = await marketplaceApi.getConfiguration(id);

          if (existingConfig) {
            // Load existing configuration
            const configData: WorkflowConfigData = {
              platform: existingConfig.platform || "n8n",
              trigger_type: existingConfig.trigger_type || "manual",
              trigger_config: existingConfig.trigger_config || {
                manual_url: "",
                webhook_url: "",
                webhook_method: "POST",
                webhook_headers: [],
                webhook_query_params: [],
                webhook_body_schema: "",
                webhook_jwt_secret: "",
                event_title: "",
                event_description: "",
              },
              connection_keys: existingConfig.connection_keys || [],
              reporting_webhook: existingConfig.reporting_webhook || "",
              execution_timeout: existingConfig.execution_timeout || 300,
              retry_config: existingConfig.retry_config || {
                max_retries: 3,
                retry_delay: 1000,
                exponential_backoff: true,
                debounce_enabled: false,
                debounce_value: 1,
                debounce_unit: "minutes",
              },
              environment_variables: existingConfig.environment_variables || [],
            };

            setOriginalConfig(configData);
            setConfigData(configData);
          } else {
            // Create default configuration
            const defaultConfig: WorkflowConfigData = {
              platform: "n8n",
              trigger_type: "manual",
              trigger_config: {
                manual_url: "",
                webhook_url: "",
                webhook_method: "POST",
                webhook_headers: [],
                webhook_query_params: [],
                webhook_body_schema: "",
                webhook_jwt_secret: "",
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
          }

          setHasLoaded(true);
        }
      } catch (error) {
        console.error("Error loading configuration:", error);
        setErrors({
          general: "Failed to load configuration. Please try again.",
        });
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
    if (!originalConfig || !id) return;

    setIsSaving(true);
    setValidationErrors([]);
    setErrors({});

    try {
      // Validate configuration
      const validation = validateConfiguration(configData);

      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setIsSaving(false);
        return;
      }

      // Save to database
      const success = await marketplaceApi.saveConfiguration(id, configData);

      if (success) {
        setOriginalConfig(configData);
        setErrors({});
        setValidationErrors([]);
        // Show success message (you could add a toast notification here)
        console.log("Configuration saved successfully!");
      } else {
        setErrors({
          general: "Failed to save configuration. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      setErrors({ general: "Failed to save configuration. Please try again." });
    } finally {
      setIsSaving(false);
    }
  }, [originalConfig, configData, id]);

  const handleReturnToDashboard = () => {
    navigate("/dashboard");
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

        {validationErrors.length > 0 && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <h3 className="text-destructive font-medium mb-2">
              Please fix the following errors:
            </h3>
            <ul className="space-y-1">
              {validationErrors.map((error) => (
                <li
                  key={`${error.field}-${error.message}`}
                  className="text-destructive text-sm"
                >
                  • <strong>{getFieldDisplayName(error.field)}</strong>:{" "}
                  {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Platform Configuration */}
            <PlatformConfiguration
              platform={configData.platform}
              onConfigChange={handleInputChange}
            />

            {/* Webhook Configuration - Always Required */}
            <Card>
              <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Every marketplace item requires a webhook URL for integration
                  with bloxable.io
                </p>
              </CardHeader>
              <CardContent>
                <WebhookConfiguration
                  config={configData.trigger_config}
                  onNestedConfigChange={handleNestedInputChange}
                  onArrayItemChange={handleArrayItemChange}
                  onAddArrayItem={addArrayItem}
                  onRemoveArrayItem={removeArrayItem}
                />
              </CardContent>
            </Card>

            {/* Trigger Configuration */}
            <TriggerConfiguration
              triggerType={configData.trigger_type}
              triggerConfig={configData.trigger_config}
              onConfigChange={handleInputChange}
              onNestedConfigChange={handleNestedInputChange}
            />

            {/* Connection Keys */}
            <ConnectionKeys
              connectionKeys={configData.connection_keys}
              onArrayItemChange={handleArrayItemChange}
              onAddArrayItem={addArrayItem}
              onRemoveArrayItem={removeArrayItem}
            />

            {/* Environment Variables */}
            <EnvironmentVariables
              environmentVariables={configData.environment_variables}
              onArrayItemChange={handleArrayItemChange}
              onAddArrayItem={addArrayItem}
              onRemoveArrayItem={removeArrayItem}
            />
          </div>

          {/* Sidebar */}
          <div className="sticky top-8 self-start h-fit">
            <div className="space-y-6">
              {/* Reporting Configuration */}
              <ReportingConfiguration
                reportingWebhook={configData.reporting_webhook || ""}
                executionTimeout={configData.execution_timeout || 300}
                onConfigChange={handleInputChange}
              />

              {/* Retry Configuration */}
              <RetryConfiguration
                retryConfig={configData.retry_config}
                onNestedConfigChange={handleNestedInputChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
