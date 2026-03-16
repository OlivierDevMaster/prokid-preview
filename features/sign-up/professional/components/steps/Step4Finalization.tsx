'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

import type { ProfessionalSignUpFormData } from '@/features/sign-up/professional/hooks/useProfessionalSignUpSchema';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

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
  const { getValues, watch } = form;

  const {
    city,
    firstName,
    interventionZone,
    lastName,
    phone,
    profession,
    skills,
  } = getValues();

  const profilePhoto = watch('profilePhoto');
  const [preview, setPreview] = useState<null | string>(null);

  useEffect(() => {
    if (profilePhoto) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(profilePhoto);
    } else {
      setPreview(null);
    }
  }, [profilePhoto]);

  const initials =
    `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <div className='space-y-6'>
      <div className='space-y-2 text-center'>
        <h1 className='text-[32px] font-bold tracking-tight text-gray-900'>
          {t('yourProfessionalProfile')}
        </h1>
        <p className='text-gray-600'>{t('profileReadySubtitle')}</p>
      </div>

      <div className='space-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-6'>
        <div className='flex items-start gap-4'>
          <div className='relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 ring-2 ring-white'>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt='Profile preview'
                className='h-full w-full rounded-full object-cover'
                src={preview}
              />
            ) : (
              <span className='text-2xl font-semibold text-gray-500'>
                {initials || '?'}
              </span>
            )}
          </div>
          <div className='min-w-0 flex-1'>
            <div className='text-lg font-bold text-gray-900'>
              {firstName} {lastName}
            </div>
            <p className='text-sm font-medium text-gray-600'>
              {profession ? tProfessional(`jobs.${profession}`) : '—'}
            </p>
            {(city || interventionZone) && (
              <p className='mt-1 text-sm text-gray-500'>
                {city}
                {interventionZone
                  ? ` • ${interventionZone} ${tCommon('label.km')}`
                  : ''}
              </p>
            )}
          </div>
        </div>

        {skills && skills.length > 0 && (
          <div>
            <h6 className='text-sm font-semibold text-gray-700'>
              {t('skills')}
            </h6>
            <div className='mt-1 flex flex-wrap gap-2'>
              {skills.map((skill, index) => (
                <Badge key={index} variant='secondary'>
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {phone && (
          <div>
            <h6 className='text-sm font-semibold text-gray-700'>
              {tCommon('label.contact')}
            </h6>
            <p className='text-sm text-gray-600'>{phone}</p>
          </div>
        )}

        <div className='flex flex-wrap gap-3 border-t border-gray-200 pt-4'>
          <button
            className='text-sm font-medium text-blue-600 underline hover:text-blue-700'
            onClick={onPrevious}
            type='button'
          >
            {t('editPhoto')}
          </button>
          <Link
            className='text-sm font-medium text-blue-600 underline hover:text-blue-700'
            href='/professional/dashboard'
          >
            {t('setAvailabilityFromDashboard')}
          </Link>
        </div>
      </div>

      <div className='flex justify-between gap-3 pt-4'>
        <Button
          className='min-h-12 flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 md:flex-none'
          disabled={isPending}
          onClick={onPrevious}
          type='button'
          variant='outline'
        >
          ← {tCommon('label.previous')}
        </Button>
        <Button
          className='min-h-12 flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 md:flex-none'
          disabled={isPending}
          onClick={onSubmit}
          type='button'
        >
          {t('createMyProfessionalProfile')}
        </Button>
      </div>
    </div>
  );
}
