'use client';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = (currentStep / totalSteps) * 100;
  const completedPercentage = (currentStep / totalSteps) * 100;
  const currentStepPercentage = (1 / totalSteps) * 100;

  return (
    <div className='w-full space-y-2'>
      <div className='flex items-center justify-between text-sm'>
        <span className='font-medium text-gray-700'>
          Étape {currentStep} sur {totalSteps}
        </span>
        <span className='font-medium text-gray-700'>{percentage}%</span>
      </div>
      <div className='h-2 w-full overflow-hidden rounded-full bg-green-500'>
        <div className='relative flex h-full'>
          <div
            className='h-full bg-blue-500 transition-all duration-300'
            style={{ width: `${completedPercentage}%` }}
          />
          <div
            className='h-full bg-green-500 transition-all duration-300'
            style={{ width: `${currentStepPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
