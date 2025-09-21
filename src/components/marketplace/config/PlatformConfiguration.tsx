import { Label } from "../../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

interface PlatformConfigurationProps {
  readonly platform: "n8n" | "make" | "zapier" | "contextual";
  readonly onConfigChange: (field: string, value: any) => void;
}

export default function PlatformConfiguration({
  platform,
  onConfigChange,
}: PlatformConfigurationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Configuration</CardTitle>
        <p className="text-sm text-muted-foreground">
          Select the platform where your workflow/automation is built
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          This helps users understand which platform they need to use this
          automation and ensures proper integration.
        </p>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="platform" className="text-foreground font-medium">
            Automation Platform *
          </Label>
          <Select
            value={platform}
            onValueChange={(value: "n8n" | "make" | "zapier" | "contextual") =>
              onConfigChange("platform", value)
            }
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="n8n">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">n8</span>
                  </div>
                  <span>n8n</span>
                </div>
              </SelectItem>
              <SelectItem value="make" disabled>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <span>Make (Coming Soon)</span>
                </div>
              </SelectItem>
              <SelectItem value="zapier" disabled>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Z</span>
                  </div>
                  <span>Zapier (Coming Soon)</span>
                </div>
              </SelectItem>
              <SelectItem value="contextual" disabled>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">C</span>
                  </div>
                  <span>Contextual (Coming Soon)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            Currently only n8n is supported. Other platforms will be available
            soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
