'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
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

  const form = useForm<ProfessionalSignUpFormData>({
    defaultValues: {
      availabilities: initialSchedule,
      city: '',
      description: '',
      email: '',
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

  const handleNext = async () => {
    if (currentStep === 2) {
      const isValid = await form.trigger([
        'firstName',
        'lastName',
        'profession',
        'city',
        'email',
      ]);
      if (!isValid) {
        return;
      }
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  console.info({ errors: form.formState.errors });
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const { isPending, mutate: registerProfessionalProfile } =
    useRegisterProfessionalProfile();
  const handleSubmit = form.handleSubmit(data => {
    registerProfessionalProfile(data);
  });

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
