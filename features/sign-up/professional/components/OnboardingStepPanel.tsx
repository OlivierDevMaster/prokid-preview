'use client';

import { useTranslations } from 'next-intl';

import { ProgressBar } from './ProgressBar';

interface OnboardingStepPanelProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingStepPanel({
  currentStep,
  totalSteps,
}: OnboardingStepPanelProps) {
  const t = useTranslations('auth.signUp.professionalForm');

  const stepContent: Record<number, { headline: string; subtitle: string }> = {
    1: {
      headline: t('welcomeTitle'),
      subtitle: t('clientsTrustPhotos'),
    },
    2: {
      headline: t('tellUsAboutYou'),
      subtitle: t('step2PanelSubtitle'),
    },
    3: {
      headline: t('yourProfessionalActivity'),
      subtitle: t('step3PanelSubtitle'),
    },
    4: {
      headline: t('yourProfessionalProfile'),
      subtitle: t('profileReadySubtitle'),
    },
  };

  const { headline, subtitle } = stepContent[currentStep] ?? stepContent[1];

  return (
    <div className='flex flex-col justify-between bg-[#2C3E50] p-6 text-white md:p-8 lg:p-10'>
      <div className='space-y-6'>
        <ProgressBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          variant='onDark'
        />
        <div className='space-y-3'>
          <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {headline}
          </h2>
          <p className='text-sm text-blue-100 md:text-base'>{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
