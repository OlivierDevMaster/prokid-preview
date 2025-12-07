'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { DaySchedule } from '@/features/sign-up/steps/Step3Planning';

import { Card } from '@/components/ui/card';
import { Step1ProfilePhoto } from '@/features/sign-up/steps/Step1ProfilePhoto';
import { Step2IdentityInfo } from '@/features/sign-up/steps/Step2IdentityInfo';
import { Step3Planning } from '@/features/sign-up/steps/Step3Planning';
import { Step4Finalization } from '@/features/sign-up/steps/Step4Finalization';

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
  const t = useTranslations('professional.label');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [formData, setFormData] = useState({
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
    yearsExperience: '',
  });
  const [schedule, setSchedule] =
    useState<Record<string, DaySchedule>>(initialSchedule);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Submitting form:', {
      formData,
      profilePhoto,
      schedule,
    });
    // TODO: Implement actual submission logic
  };

  return (
    <div className='flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4'>
      <Card className='w-full rounded-lg bg-white p-8 shadow-lg'>
        {currentStep === 1 && (
          <Step1ProfilePhoto
            onNext={handleNext}
            onPhotoChange={setProfilePhoto}
            profilePhoto={profilePhoto}
          />
        )}

        {currentStep === 2 && (
          <Step2IdentityInfo
            formData={formData}
            onFormDataChange={data => setFormData({ ...formData, ...data })}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}

        {currentStep === 3 && (
          <Step3Planning
            onNext={handleNext}
            onPrevious={handlePrevious}
            onScheduleChange={setSchedule}
            schedule={schedule}
          />
        )}

        {currentStep === 4 && (
          <Step4Finalization
            onPrevious={handlePrevious}
            onSubmit={handleSubmit}
          />
        )}
      </Card>
    </div>
  );
}
