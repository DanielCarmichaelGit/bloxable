import { useState } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import Editor from "@monaco-editor/react";

interface WebhookHeader {
  id: string;
  key: string;
  value: string;
}

interface WebhookQueryParam {
  id: string;
  key: string;
  value: string;
}

interface WebhookConfig {
  webhook_url?: string;
  webhook_method?: "GET" | "POST";
  webhook_headers?: WebhookHeader[];
  webhook_query_params?: WebhookQueryParam[];
  webhook_body_schema?: string;
  webhook_jwt_secret?: string;
}

interface WebhookConfigurationProps {
  readonly config: WebhookConfig;
  readonly onNestedConfigChange: (
    parentField: string,
    childField: string,
    value: any
  ) => void;
  readonly onArrayItemChange: (
    field: string,
    index: number,
    childField: string,
    value: any
  ) => void;
  readonly onAddArrayItem: (field: string, newItem: any) => void;
  readonly onRemoveArrayItem: (field: string, index: number) => void;
}

export default function WebhookConfiguration({
  config,
  onNestedConfigChange,
  onArrayItemChange,
  onAddArrayItem,
  onRemoveArrayItem,
}: WebhookConfigurationProps) {
  const { theme } = useTheme();
  const [isSchemaMode, setIsSchemaMode] = useState(true);
  const [showHeaders, setShowHeaders] = useState(false);
  const [showQueryParams, setShowQueryParams] = useState(false);
  const [showBodySchema, setShowBodySchema] = useState(false);
  const [showJwtSecret, setShowJwtSecret] = useState(false);

  const handleWebhookHeaderChange = (
    index: number,
    field: string,
    value: string
  ) => {
    onArrayItemChange("trigger_config.webhook_headers", index, field, value);
  };

  const handleWebhookQueryParamChange = (
    index: number,
    field: string,
    value: string
  ) => {
    onArrayItemChange(
      "trigger_config.webhook_query_params",
      index,
      field,
      value
    );
  };

  const addWebhookHeader = () => {
    const newHeader = {
      id: Date.now().toString(),
      key: "",
      value: "",
    };
    onAddArrayItem("trigger_config.webhook_headers", newHeader);
  };

  const addWebhookQueryParam = () => {
    const newParam = {
      id: Date.now().toString(),
      key: "",
      value: "",
    };
    onAddArrayItem("trigger_config.webhook_query_params", newParam);
  };

  const removeWebhookHeader = (index: number) => {
    onRemoveArrayItem("trigger_config.webhook_headers", index);
  };

  const removeWebhookQueryParam = (index: number) => {
    onRemoveArrayItem("trigger_config.webhook_query_params", index);
  };

  const handleEditorChange = (value: string | undefined) => {
    onNestedConfigChange("trigger_config", "webhook_body_schema", value || "");
  };

  return (
    <div className="space-y-6">
      {/* Webhook URL and Method */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* HTTP Method */}
        <div>
          <Label
            htmlFor="webhook_method"
            className="text-foreground font-medium"
          >
            HTTP Method *
          </Label>
          <Select
            value={config.webhook_method || "POST"}
            onValueChange={(value: "GET" | "POST") =>
              onNestedConfigChange("trigger_config", "webhook_method", value)
            }
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Webhook URL */}
        <div className="md:col-span-3">
          <Label htmlFor="webhook_url" className="text-foreground font-medium">
            Webhook URL *
          </Label>
          <Input
            id="webhook_url"
            value={config.webhook_url || ""}
            onChange={(e) =>
              onNestedConfigChange(
                "trigger_config",
                "webhook_url",
                e.target.value
              )
            }
            placeholder="https://your-domain.com/webhook"
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">
            The webhook URL that Bloxable.io will call to trigger this workflow
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Need help? Visit our{" "}
            <a
              href="https://bloxable.io/documentation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              documentation
            </a>{" "}
            for more information.
          </p>
        </div>
      </div>

      {/* Headers */}
      <div>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setShowHeaders(!showHeaders)}
            className="flex items-center space-x-2 p-0 h-auto font-medium text-foreground hover:text-foreground"
          >
            <span>Headers (Optional)</span>
            <span className="text-muted-foreground">
              {showHeaders ? "−" : "+"}
            </span>
          </Button>
          {showHeaders && (
            <Button variant="outline" size="sm" onClick={addWebhookHeader}>
              Add Header
            </Button>
          )}
        </div>
        {showHeaders && (
          <div className="mt-2 space-y-2">
            {config.webhook_headers?.map((header, index) => (
              <div key={header.id} className="flex items-center space-x-2">
                <Input
                  placeholder="Header name"
                  value={header.key}
                  onChange={(e) =>
                    handleWebhookHeaderChange(index, "key", e.target.value)
                  }
                  className="flex-1"
                />
                <Input
                  placeholder="Header value"
                  value={header.value}
                  onChange={(e) =>
                    handleWebhookHeaderChange(index, "value", e.target.value)
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
            ))}
          </div>
        )}
      </div>

      {/* Query Parameters */}
      <div>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setShowQueryParams(!showQueryParams)}
            className="flex items-center space-x-2 p-0 h-auto font-medium text-foreground hover:text-foreground"
          >
            <span>Query Parameters (Optional)</span>
            <span className="text-muted-foreground">
              {showQueryParams ? "−" : "+"}
            </span>
          </Button>
          {showQueryParams && (
            <Button variant="outline" size="sm" onClick={addWebhookQueryParam}>
              Add Parameter
            </Button>
          )}
        </div>
        {showQueryParams && (
          <div className="mt-2 space-y-2">
            {config.webhook_query_params?.map((param, index) => (
              <div key={param.id} className="flex items-center space-x-2">
                <Input
                  placeholder="Parameter name"
                  value={param.key}
                  onChange={(e) =>
                    handleWebhookQueryParamChange(index, "key", e.target.value)
                  }
                  className="flex-1"
                />
                <Input
                  placeholder="Parameter value"
                  value={param.value}
                  onChange={(e) =>
                    handleWebhookQueryParamChange(
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
            ))}
          </div>
        )}
      </div>

      {/* Body Schema */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            onClick={() => setShowBodySchema(!showBodySchema)}
            className="flex items-center space-x-2 p-0 h-auto font-medium text-foreground hover:text-foreground"
          >
            <span>
              {isSchemaMode
                ? "Request Body Schema (JSON) (Optional)"
                : "Example Request Body (JSON) (Optional)"}
            </span>
            <span className="text-muted-foreground">
              {showBodySchema ? "−" : "+"}
            </span>
          </Button>
          {showBodySchema && (
            <div className="flex space-x-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Mode:</span>
                <Button
                  type="button"
                  variant={isSchemaMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsSchemaMode(true)}
                >
                  Schema
                </Button>
                <Button
                  type="button"
                  variant={!isSchemaMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsSchemaMode(false)}
                >
                  Example
                </Button>
              </div>
            </div>
          )}
        </div>
        {showBodySchema && (
          <>
            <div className="mt-2 border rounded-md border-border">
              <Editor
                height="200px"
                defaultLanguage="json"
                value={config.webhook_body_schema || ""}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  wordWrap: "on",
                  lineNumbers: "on",
                  folding: true,
                  bracketPairColorization: { enabled: true },
                  autoClosingBrackets: "always",
                  autoClosingQuotes: "always",
                  formatOnPaste: true,
                  formatOnType: true,
                }}
                theme={theme === "dark" ? "vs-dark" : "vs-light"}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isSchemaMode
                ? "Enter a JSON schema that defines the structure of the request body (optional)."
                : "Enter an example JSON request body (optional). This will be automatically converted to a schema when you save the configuration."}
            </p>
          </>
        )}
      </div>

      {/* JWT Secret */}
      <div>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setShowJwtSecret(!showJwtSecret)}
            className="flex items-center space-x-2 p-0 h-auto font-medium text-foreground hover:text-foreground"
          >
            <span>JWT Secret (Optional)</span>
            <span className="text-muted-foreground">
              {showJwtSecret ? "−" : "+"}
            </span>
          </Button>
        </div>
        {showJwtSecret && (
          <>
            <Input
              id="webhook_jwt_secret"
              value={config.webhook_jwt_secret || ""}
              onChange={(e) =>
                onNestedConfigChange(
                  "trigger_config",
                  "webhook_jwt_secret",
                  e.target.value
                )
              }
              placeholder="Your JWT secret key for signing requests"
              className="mt-2"
              type="password"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Optional JWT secret used to sign webhook requests. This will be
              used to verify request authenticity.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
