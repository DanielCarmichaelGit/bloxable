import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

interface RetryConfig {
  max_retries: number;
  retry_delay: number;
  exponential_backoff: boolean;
  debounce_enabled: boolean;
  debounce_value: number;
  debounce_unit: "seconds" | "minutes" | "hours" | "days";
}

interface RetryConfigurationProps {
  readonly retryConfig: RetryConfig;
  readonly onNestedConfigChange: (
    parentField: string,
    childField: string,
    value: any
  ) => void;
}

export default function RetryConfiguration({
  retryConfig,
  onNestedConfigChange,
}: RetryConfigurationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Retry Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="max_retries" className="text-foreground font-medium">
            Max Retries
          </Label>
          <Input
            id="max_retries"
            type="number"
            value={retryConfig.max_retries}
            onChange={(e) =>
              onNestedConfigChange(
                "retry_config",
                "max_retries",
                parseInt(e.target.value) || 0
              )
            }
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="retry_delay" className="text-foreground font-medium">
            Retry Delay (ms)
          </Label>
          <Input
            id="retry_delay"
            type="number"
            value={retryConfig.retry_delay}
            onChange={(e) =>
              onNestedConfigChange(
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
            checked={retryConfig.exponential_backoff}
            onChange={(e) =>
              onNestedConfigChange(
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
              checked={retryConfig.debounce_enabled}
              onChange={(e) =>
                onNestedConfigChange(
                  "retry_config",
                  "debounce_enabled",
                  e.target.checked
                )
              }
              className="rounded"
            />
            <Label htmlFor="debounce_enabled" className="text-sm font-medium">
              Enable Debounce Timer
            </Label>
          </div>

          {retryConfig.debounce_enabled && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm font-medium">Value</Label>
                  <Input
                    type="number"
                    value={retryConfig.debounce_value}
                    onChange={(e) =>
                      onNestedConfigChange(
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
                    value={retryConfig.debounce_unit}
                    onValueChange={(
                      value: "seconds" | "minutes" | "hours" | "days"
                    ) =>
                      onNestedConfigChange(
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
                Rate limiting: Prevents workflow from running more frequently
                than this interval. For cron triggers, this overrides the user's
                schedule.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
