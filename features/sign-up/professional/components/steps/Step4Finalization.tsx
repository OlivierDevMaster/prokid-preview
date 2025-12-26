'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

import type { ProfessionalSignUpFormData } from '@/features/sign-up/professional/hooks/useProfessionalSignUpSchema';

import { Button } from '@/components/ui/button';

import { ProgressBar } from '../ProgressBar';

interface Step4FinalizationProps {
  form: UseFormReturn<ProfessionalSignUpFormData>;
  isPending: boolean;
  onPrevious: () => void;
  onSubmit: () => void;
}

export function Step4Finalization({
  form,
  isPending,
  onPrevious,
  onSubmit,
}: Step4FinalizationProps) {
  const t = useTranslations('auth.signUp.professionalForm');
  const tCommon = useTranslations('common');
  const tProfessional = useTranslations('professional');
  const tAuthProfessional = useTranslations('auth.signUp.professionalForm');
  const { getValues, watch } = form;

  const {
    availabilities,
    firstName,
    interventionZone,
    lastName,
    phone,
    profession,
  } = getValues();

  const profilePhoto = watch('profilePhoto');
  const [preview, setPreview] = useState<null | string>(null);

  useEffect(() => {
    if (profilePhoto) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(profilePhoto);
    } else {
      setPreview(null);
    }
  }, [profilePhoto]);

  const initials = `${firstName.charAt(0) || ''}${
    lastName.charAt(0) || ''
  }`.toUpperCase();

  return (
    <div className='space-y-6'>
      <ProgressBar currentStep={4} totalSteps={4} />

      <div className='space-y-4 text-center'>
        <h1 className='text-3xl font-bold text-gray-900'>
          {t('finalization')}
        </h1>
        <p className='text-gray-600'>{t('validationInformation')}</p>
      </div>

      <div className='space-y-2 rounded-lg border border-blue-200 p-4'>
        <div className='flex items-start'>
          <div className='relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-200 ring-2 ring-gray-100'>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt='Profile preview'
                className='h-full w-full rounded-full object-cover'
                src={preview}
              />
            ) : (
              <span className='p-8 text-4xl font-semibold text-gray-500'>
                {initials}
              </span>
            )}
          </div>
          <div className='pl-8 text-lg text-gray-700'>
            <div className='font-bold'>{firstName}</div>
            <div>{lastName}</div>
          </div>
        </div>

        <div className='space-2 pt-4'>
          <h6 className='text-sm font-semibold text-gray-700'>
            {tCommon('label.profession')}
          </h6>
          <p className='text-sm text-gray-700'>
            {tProfessional(`jobs.${profession}`)}
          </p>
        </div>
        <div className='space-2'>
          <h6 className='text-sm font-semibold text-gray-700'>
            {tAuthProfessional('interventionZone')}
          </h6>
          <p className='text-sm text-gray-700'>
            {interventionZone} {tCommon('label.km')}
          </p>
        </div>
        <div className='space-2'>
          <h6 className='text-sm font-semibold text-gray-700'>
            {tCommon('label.contact')}
          </h6>
          <p className='text-sm text-gray-700'>{phone}</p>
        </div>

        <div className='space-2'>
          <h6 className='pb-2 text-sm font-semibold text-gray-700'>
            {tCommon('label.availability')}
          </h6>
          <div className='flex flex-wrap gap-2'>
            {Object.entries(availabilities).map(([day, schedule]) => (
              <div
                className='flex rounded-full border border-blue-200 bg-blue-50 p-2 text-xs text-blue-700 hover:bg-blue-100'
                key={day}
              >
                <p className='mr-2 text-sm'>{tCommon(`days.${day}`)} :</p>
                {schedule.slots.map(slot => (
                  <div className='pr-2 text-sm' key={slot.start}>
                    {slot.start} - {slot.end} /
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='flex justify-between pt-4'>
        <Button
          className='border-gray-300 text-gray-700 hover:bg-gray-50'
          disabled={isPending}
          onClick={onPrevious}
          type='button'
          variant='outline'
        >
          ← {tCommon('label.previous')}
        </Button>
        <Button
          className='bg-blue-500 text-white hover:bg-blue-600'
          disabled={isPending}
          onClick={onSubmit}
          type='button'
        >
          {tCommon('actions.submit')}
        </Button>
      </div>
    </div>
  );
}
