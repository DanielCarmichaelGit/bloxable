import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface ReportingConfigurationProps {
  readonly reportingWebhook: string;
  readonly executionTimeout: number;
  readonly onConfigChange: (field: string, value: any) => void;
}

export default function ReportingConfiguration({
  reportingWebhook,
  executionTimeout,
  onConfigChange,
}: ReportingConfigurationProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyWebhook = async () => {
    if (reportingWebhook) {
      try {
        await navigator.clipboard.writeText(reportingWebhook);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy webhook URL:", err);
      }
    }
  };

  return (
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
          <div className="flex gap-2 mt-2">
            <Input
              id="reporting_webhook"
              value={reportingWebhook || ""}
              readOnly
              placeholder="https://your-domain.com/reporting"
              className="flex-1 bg-muted"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyWebhook}
              disabled={!reportingWebhook}
              className="px-3"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
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
            value={executionTimeout}
            onChange={(e) =>
              onConfigChange(
                "execution_timeout",
                parseInt(e.target.value) || 300
              )
            }
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}
