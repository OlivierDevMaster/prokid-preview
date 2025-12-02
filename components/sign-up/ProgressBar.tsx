"use client";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = (currentStep / totalSteps) * 100;
  const completedPercentage = ((currentStep) / totalSteps) * 100;
  const currentStepPercentage = (1 / totalSteps) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700 font-medium">
          Étape {currentStep} sur {totalSteps}
        </span>
        <span className="text-gray-700 font-medium">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-green-400 rounded-full overflow-hidden">
        <div className="h-full flex relative">
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${completedPercentage}%` }}
          />
          <div
            className="bg-green-400 h-full transition-all duration-300"
            style={{ width: `${currentStepPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

