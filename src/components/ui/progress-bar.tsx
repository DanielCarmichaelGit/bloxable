interface ProgressStep {
  id: string;
  label: string;
  completed: boolean;
}

interface ProgressBarProps {
  steps: ProgressStep[];
  currentStep?: string;
}

export default function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  const completedSteps = steps.filter((step) => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center space-x-3">
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step.completed
                  ? "bg-primary text-white"
                  : currentStep === step.id
                  ? "bg-primary/20 text-primary border-2 border-primary"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step.completed ? "✓" : index + 1}
            </div>
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  step.completed
                    ? "text-primary"
                    : currentStep === step.id
                    ? "text-primary"
                    : "text-gray-500"
                }`}
              >
                {step.label}
              </p>
            </div>
            {step.completed && (
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Text */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {completedSteps} of {steps.length} steps completed
        </p>
      </div>
    </div>
  );
}
