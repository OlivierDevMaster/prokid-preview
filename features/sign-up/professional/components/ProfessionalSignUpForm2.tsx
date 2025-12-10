'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { type Resolver, useForm } from 'react-hook-form';

import type { DaySchedule } from '@/features/sign-up/professional/components/steps/Step3Availability';

import { Card } from '@/components/ui/card';
import {
  type ProfessionalSignUpFormData,
  professionalSignUpSchema,
} from '@/features/professional/schemas/professional-signup.schema';
import { Step1ProfilePhoto } from '@/features/sign-up/professional/components/steps/Step1ProfilePhoto';
import { Step2IdentityInfo } from '@/features/sign-up/professional/components/steps/Step2IdentityInfo';
import { Step3Availability } from '@/features/sign-up/professional/components/steps/Step3Availability';
import { Step4Finalization } from '@/features/sign-up/professional/components/steps/Step4Finalization';
import { createClient } from '@/lib/supabase/client';

import { useRegisterProfessionalProfile } from '../hooks/useRegisterProfessionalProfile';

const initialSchedule: Record<string, DaySchedule> = {
  friday: { enabled: true, slots: [{ end: '17:00', start: '09:00' }] },
  monday: { enabled: true, slots: [{ end: '17:00', start: '09:00' }] },
  saturday: { enabled: false, slots: [] },
  sunday: { enabled: false, slots: [] },
  thursday: { enabled: true, slots: [{ end: '17:00', start: '09:00' }] },
  tuesday: { enabled: true, slots: [{ end: '17:00', start: '09:00' }] },
  wednesday: { enabled: true, slots: [{ end: '17:00', start: '09:00' }] },
};

export default function ProfessionalSignUpForm2() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState<null | string>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const form = useForm<ProfessionalSignUpFormData>({
    defaultValues: {
      availabilities: initialSchedule,
      city: '',
      description: '',
      firstName: '',
      hourlyRate: '',
      interventionZone: 25,
      lastName: '',
      phone: '',
      postalCode: '',
      profession: '',
      profilePhoto: null,
      yearsExperience: '',
    },
    mode: 'onChange',
    resolver: zodResolver(
      professionalSignUpSchema
    ) as Resolver<ProfessionalSignUpFormData>,
  });

  useEffect(() => {
    const getUserId = async () => {
      try {
        const supabase = createClient();
        const { data: user, error } = await supabase.auth.getUser();

        if (error || !user?.user) {
          throw new Error('User not found. Please sign in again.');
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
  const handleSubmit = form.handleSubmit(data => {
    if (!userId) {
      throw new Error('User ID is required. Please sign in again.');
    }
    registerProfessionalProfile({ formData: data, userId });
  });

  if (isLoadingUser) {
    return (
      <div className='flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4'>
        <Card className='w-full rounded-lg bg-white p-8 shadow-lg'>
          <div className='text-center'>Loading...</div>
        </Card>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className='flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4'>
        <Card className='w-full rounded-lg bg-white p-8 shadow-lg'>
          <div className='text-center text-red-600'>
            User not found. Please sign in again.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4'>
      <Card className='w-full rounded-lg bg-white p-8 shadow-lg'>
        {currentStep === 1 && (
          <Step1ProfilePhoto
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
