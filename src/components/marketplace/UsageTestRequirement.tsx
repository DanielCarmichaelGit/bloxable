import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { CheckCircle, Clock } from "lucide-react";

interface MarketplaceItemFormData {
  usage_test_completed?: boolean;
}

interface UsageTestRequirementProps {
  formData: MarketplaceItemFormData;
  onInputChange: (field: string, value: any) => void;
}

export default function UsageTestRequirement({
  formData,
  onInputChange,
}: UsageTestRequirementProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground mb-6">
        Usage Test Requirement
      </h2>

      <Card className="p-6">
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    formData.usage_test_completed
                      ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                  }`}
                >
                  {formData.usage_test_completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Usage Test Completed
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.usage_test_completed
                      ? "Usage test has been completed successfully"
                      : "Usage test must be completed before publishing"}
                  </p>
                </div>
              </div>
              <Button
                variant={formData.usage_test_completed ? "outline" : "default"}
                onClick={() =>
                  onInputChange(
                    "usage_test_completed",
                    !formData.usage_test_completed
                  )
                }
                className="min-w-[120px]"
              >
                {formData.usage_test_completed
                  ? "Mark Incomplete"
                  : "Mark Complete"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              For usage-based pricing, you must complete a test run of your
              workflow to ensure it works correctly before publishing.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
