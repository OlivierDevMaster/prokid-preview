'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { type Resolver, useForm } from 'react-hook-form';

import { Card } from '@/components/ui/card';
import { Step1ProfilePhoto } from '@/features/sign-up/professional/components/steps/Step1ProfilePhoto';
import { Step4Finalization } from '@/features/sign-up/professional/components/steps/Step4Finalization';
import { createClient } from '@/lib/supabase/client';

import {
  type ProfessionalSignUpFormData,
  useProfessionalSignUpSchema,
} from '../hooks/useProfessionalSignUpSchema';
import { useRegisterProfessionalProfile } from '../hooks/useRegisterProfessionalProfile';
import { OnboardingStepPanel } from './OnboardingStepPanel';
import { Step2Identity } from './steps/Step2Identity';
import { Step3ProfessionalInfo } from './steps/Step3ProfessionalInfo';

export default function ProfessionalSignUpForm2() {
  const t = useTranslations('auth.signUp.professionalForm');
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState<null | string>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const professionalSignUpSchema = useProfessionalSignUpSchema();

  const form = useForm<ProfessionalSignUpFormData>({
    defaultValues: {
      city: '',
      description: '',
      firstName: '',
      hourlyRate: undefined as unknown as number,
      interventionZone: 10,
      lastName: '',
      phone: '',
      postalCode: '',
      profession: '',
      profilePhoto: null,
      skills: [],
      yearsExperience: '',
    },
    mode: 'onChange',
    resolver: zodResolver(
      professionalSignUpSchema
    ) as unknown as Resolver<ProfessionalSignUpFormData>,
  });

  useEffect(() => {
    const getUserId = async () => {
      try {
        const supabase = createClient();
        const { data: user, error } = await supabase.auth.getUser();

        if (error || !user?.user) {
          throw new Error(t('userNotFound'));
        }

        setUserId(user.user.id);
      } catch (error) {
        console.error('Error getting user:', error);
        throw error;
      } finally {
        setIsLoadingUser(false);
      }
    };

    getUserId();
  }, [t]);

  const TOTAL_STEPS = 4;

  const handleNext = async () => {
    if (currentStep === 2) {
      const isValid = await form.trigger([
        'firstName',
        'lastName',
        'phone',
        'city',
      ]);
      if (!isValid) {
        setShowErrorSummary(true);
        return;
      }
    }
    if (currentStep === 3) {
      const isValid = await form.trigger(['profession', 'hourlyRate']);
      if (!isValid) {
        setShowErrorSummary(true);
        return;
      }
    }
    setShowErrorSummary(false);
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const { isPending, mutate: registerProfessionalProfile } =
    useRegisterProfessionalProfile();
  const handleSubmit = form.handleSubmit(
    data => {
      if (!userId) {
        console.error('User ID is required');
        return;
      }
      registerProfessionalProfile({ formData: data, userId });
    },
    errors => {
      console.error('Form validation errors:', errors);
    }
  );

  if (isLoadingUser) {
    return (
      <div className='flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4'>
        <Card className='w-full max-w-3xl rounded-lg bg-white p-8 shadow-lg'>
          <div className='text-center'>{t('loading')}</div>
        </Card>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className='flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4'>
        <Card className='w-full max-w-3xl rounded-lg bg-white p-8 shadow-lg'>
          <div className='text-center text-red-600'>{t('userNotFound')}</div>
        </Card>
      </div>
    );
  }

  const formErrors = form.formState.errors;
  const hasErrors = showErrorSummary && Object.keys(formErrors).length > 0;

  return (
    <div className='h-full min-h-0 w-full'>
      <div className='mx-auto grid h-full min-h-0 grid-cols-1 md:grid-cols-[minmax(0,400px)_1fr] md:overflow-hidden'>
        <OnboardingStepPanel
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
        />
        <div className='min-h-0 overflow-y-auto bg-white p-4 md:p-8'>
          {hasErrors && (
            <div className='mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
              <p className='font-semibold'>{t('pleaseCorrectTheFollowing')}</p>
              <ul className='mt-1 list-inside list-disc'>
                {Object.entries(formErrors).map(([key, err]) => (
                  <li key={key}>{err?.message && String(err.message)}</li>
                ))}
              </ul>
            </div>
          )}

          {currentStep === 1 && (
            <Step1ProfilePhoto
              firstName={form.watch('firstName')}
              lastName={form.watch('lastName')}
              onNext={handleNext}
              onPhotoChange={file => form.setValue('profilePhoto', file)}
              profilePhoto={form.watch('profilePhoto')}
            />
          )}

          {currentStep === 2 && (
            <Step2Identity
              form={form}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 3 && (
            <Step3ProfessionalInfo
              form={form}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 4 && (
            <Step4Finalization
              form={form}
              isPending={isPending}
              onPrevious={handlePrevious}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
