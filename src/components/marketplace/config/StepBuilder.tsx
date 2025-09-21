import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description: string;
}

interface StepBuilderProps {
  readonly steps: Step[];
  readonly onStepsChange: (steps: Step[]) => void;
  readonly placeholder?: {
    title: string;
    description: string;
  };
}

export default function StepBuilder({
  steps,
  onStepsChange,
  placeholder = {
    title: "Step title",
    description: "Describe what the user needs to do in this step",
  },
}: StepBuilderProps) {
  const addStep = () => {
    const newStep: Step = {
      id: Date.now().toString(),
      title: "",
      description: "",
    };
    onStepsChange([...steps, newStep]);
  };

  const removeStep = (stepId: string) => {
    onStepsChange(steps.filter((step) => step.id !== stepId));
  };

  const updateStep = (stepId: string, field: keyof Step, value: string) => {
    onStepsChange(
      steps.map((step) =>
        step.id === stepId ? { ...step, [field]: value } : step
      )
    );
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    const newSteps = [...steps];
    const [movedStep] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, movedStep);
    onStepsChange(newSteps);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Steps to Obtain Key ({steps.length} steps)
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addStep}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Step</span>
        </Button>
      </div>

      {steps.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          <p className="text-sm">No steps added yet</p>
          <p className="text-xs mt-1">
            Click "Add Step" to create the first step
          </p>
        </div>
      )}

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="border border-border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Step {index + 1}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeStep(step.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Label className="text-sm font-medium">Step Title</Label>
              <Input
                value={step.title}
                onChange={(e) => updateStep(step.id, "title", e.target.value)}
                placeholder={placeholder.title}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Step Description</Label>
              <Textarea
                value={step.description}
                onChange={(e) =>
                  updateStep(step.id, "description", e.target.value)
                }
                placeholder={placeholder.description}
                className="mt-1"
                rows={2}
              />
            </div>

            {/* Move buttons */}
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => moveStep(index, index - 1)}
                disabled={index === 0}
                className="text-xs"
              >
                Move Up
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => moveStep(index, index + 1)}
                disabled={index === steps.length - 1}
                className="text-xs"
              >
                Move Down
              </Button>
            </div>
          </div>
        ))}
      </div>

      {steps.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Provide clear, step-by-step instructions to help users obtain this
          connection key
        </p>
      )}
    </div>
  );
}
