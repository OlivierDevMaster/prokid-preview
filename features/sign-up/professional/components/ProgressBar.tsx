'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  variant?: 'default' | 'onDark';
}

export function ProgressBar({
  currentStep,
  totalSteps,
  variant = 'default',
}: ProgressBarProps) {
  const t = useTranslations('auth.signUp.professionalForm.progress');
  const percentage = Math.round((currentStep / totalSteps) * 100);
  const isOnDark = variant === 'onDark';

  return (
    <div className='w-full space-y-2'>
      <div className='flex items-center justify-between text-sm'>
        <span
          className={cn(
            'font-medium',
            isOnDark ? 'text-white' : 'text-gray-700'
          )}
        >
          {t('step')} {currentStep} {t('of')} {totalSteps}
        </span>
        <span
          className={cn(
            'font-medium',
            isOnDark ? 'text-blue-100' : 'text-gray-600'
          )}
        >
          {t('profileComplete', { percentage })}
        </span>
      </div>
      <div
        className={cn(
          'h-2 w-full overflow-hidden rounded-full',
          isOnDark ? 'bg-white/20' : 'bg-gray-200'
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-300',
            isOnDark ? 'bg-white' : 'bg-blue-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
