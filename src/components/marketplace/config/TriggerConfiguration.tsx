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

interface TriggerConfig {
  manual_url?: string;
  event_title?: string;
  event_description?: string;
}

interface TriggerConfigurationProps {
  readonly triggerType: "webhook" | "cron" | "event" | "manual";
  readonly triggerConfig: TriggerConfig;
  readonly onConfigChange: (field: string, value: any) => void;
  readonly onNestedConfigChange: (
    parentField: string,
    childField: string,
    value: any
  ) => void;
}

export default function TriggerConfiguration({
  triggerType,
  triggerConfig,
  onConfigChange,
  onNestedConfigChange,
}: TriggerConfigurationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trigger Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="trigger_type" className="text-foreground font-medium">
            Trigger Type
          </Label>
          <Select
            value={triggerType}
            onValueChange={(value: "webhook" | "cron" | "event" | "manual") =>
              onConfigChange("trigger_type", value)
            }
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

        {triggerType === "manual" && (
          <div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Manual Trigger:</strong> Buyers will log into their
                dashboard and click "Run Workflow" to manually trigger this
                automation. No additional configuration needed here.
              </p>
            </div>
          </div>
        )}

        {triggerType === "cron" && (
          <div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Cron Schedule:</strong> Buyers will set their own
                schedule during setup (e.g., every hour, daily at 9 AM). Setting
                a debounce timer will override their schedule - if they set
                every second but you set 10 minutes debounce, it will run every
                10 minutes.
              </p>
            </div>
          </div>
        )}

        {triggerType === "event" && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Event-Based Trigger:</strong> This occurs as part of the
                workflow/automation itself. No additional setup needed unless
                specified in the connection keys or environment variables below.
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
                value={triggerConfig.event_title || ""}
                onChange={(e) =>
                  onNestedConfigChange(
                    "trigger_config",
                    "event_title",
                    e.target.value
                  )
                }
                placeholder="Instagram Comment"
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Short title for the event (e.g., "Instagram Comment", "New
                Email")
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
                value={triggerConfig.event_description || ""}
                onChange={(e) =>
                  onNestedConfigChange(
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
  );
}
