'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { type Resolver, useForm } from 'react-hook-form';

import type { DaySchedule } from '@/features/sign-up/professional/components/steps/Step3Availability';

import { Card } from '@/components/ui/card';
import { Step1ProfilePhoto } from '@/features/sign-up/professional/components/steps/Step1ProfilePhoto';
import { Step2IdentityInfo } from '@/features/sign-up/professional/components/steps/Step2IdentityInfo';
import { Step3Availability } from '@/features/sign-up/professional/components/steps/Step3Availability';
import { Step4Finalization } from '@/features/sign-up/professional/components/steps/Step4Finalization';
import { createClient } from '@/lib/supabase/client';

import {
  type ProfessionalSignUpFormData,
  useProfessionalSignUpSchema,
} from '../hooks/useProfessionalSignUpSchema';
import { useRegisterProfessionalProfile } from '../hooks/useRegisterProfessionalProfile';

const initialSchedule: Record<string, DaySchedule> = {
  friday: {
    enabled: true,
    recurring: true,
    slots: [{ end: '17:00', start: '09:00' }],
  },
  monday: {
    enabled: true,
    recurring: true,
    slots: [{ end: '17:00', start: '09:00' }],
  },
  saturday: { enabled: false, recurring: true, slots: [] },
  sunday: { enabled: false, recurring: true, slots: [] },
  thursday: {
    enabled: true,
    recurring: true,
    slots: [{ end: '17:00', start: '09:00' }],
  },
  tuesday: {
    enabled: true,
    recurring: true,
    slots: [{ end: '17:00', start: '09:00' }],
  },
  wednesday: {
    enabled: true,
    recurring: true,
    slots: [{ end: '17:00', start: '09:00' }],
  },
};

export default function ProfessionalSignUpForm2() {
  const t = useTranslations('auth.signUp.professionalForm');
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState<null | string>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const professionalSignUpSchema = useProfessionalSignUpSchema();

  const form = useForm<ProfessionalSignUpFormData>({
    defaultValues: {
      availabilities: initialSchedule,
      city: '',
      description: '',
      firstName: '',
      hourlyRate: undefined as unknown as number,
      interventionZone: 25,
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
  }, []);

  const handleNext = async () => {
    if (currentStep === 2) {
      const isValid = await form.trigger([
        'firstName',
        'lastName',
        'profession',
        'city',
        'phone',
        'hourlyRate',
      ]);
      if (!isValid) {
        return;
      }
    }
    if (currentStep < 4) {
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

  return (
    <div className='flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4'>
      <Card className='w-full max-w-3xl rounded-lg bg-white p-8 shadow-lg'>
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
          <Step2IdentityInfo
            form={form}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}

        {currentStep === 3 && (
          <Step3Availability
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
      </Card>
    </div>
  );
}
