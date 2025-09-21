import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

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
          <Input
            id="reporting_webhook"
            value={reportingWebhook || ""}
            onChange={(e) =>
              onConfigChange("reporting_webhook", e.target.value)
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
