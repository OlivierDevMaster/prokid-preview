'use client';

import { CheckCircle2, MapPin, Phone as PhoneIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

import type { ProfessionalSignUpFormData } from '@/features/sign-up/professional/hooks/useProfessionalSignUpSchema';

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
    description,
    firstName,
    hourlyRate,
    interventionZone,
    lastName,
    phone,
    profession,
    skills,
    yearsExperience,
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

  const hasPhoto = !!preview;
  const hasIdentity = !!(firstName && lastName && phone);
  const hasProfession = !!profession;

  return (
    <div className='space-y-6'>
      <div className='space-y-2 text-center'>
        <h1 className='text-[32px] font-bold tracking-tight text-slate-900'>
          {t('yourProfessionalProfile')}
        </h1>
        <p className='text-slate-500'>{t('profileReadySubtitle')}</p>
      </div>

      {/* Profile preview card */}
      <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
        {/* Top section - photo and name */}
        <div className='flex flex-col items-center bg-gradient-to-b from-slate-50 to-white px-6 pb-4 pt-8'>
          <div className='relative mb-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-100 shadow-md ring-4 ring-white'>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt='Profile preview'
                className='h-full w-full rounded-full object-cover'
                src={preview}
              />
            ) : (
              <span className='text-2xl font-semibold text-slate-400'>
                {initials || '?'}
              </span>
            )}
          </div>
          <h2 className='text-xl font-bold text-slate-900'>
            {firstName} {lastName}
          </h2>
          {profession && (
            <p className='mt-0.5 text-sm font-medium text-blue-600'>
              {tProfessional(`jobs.${profession}`)}
            </p>
          )}
          {(city || interventionZone) && (
            <p className='mt-1 flex items-center gap-1 text-sm text-slate-400'>
              <MapPin className='h-3.5 w-3.5' />
              {city}
              {interventionZone
                ? ` - ${interventionZone} ${tCommon('label.km')}`
                : ''}
            </p>
          )}
        </div>

        {/* Details grid */}
        <div className='space-y-4 border-t border-slate-100 px-6 py-5'>
          {/* Completion checklist */}
          <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
            <div className='flex items-center gap-2'>
              <CheckCircle2
                className={`h-4 w-4 ${hasPhoto ? 'text-emerald-500' : 'text-slate-300'}`}
              />
              <span
                className={`text-sm ${hasPhoto ? 'text-slate-700' : 'text-slate-400'}`}
              >
                {t('editPhoto')}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <CheckCircle2
                className={`h-4 w-4 ${hasIdentity ? 'text-emerald-500' : 'text-slate-300'}`}
              />
              <span
                className={`text-sm ${hasIdentity ? 'text-slate-700' : 'text-slate-400'}`}
              >
                {tCommon('label.contact')}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <CheckCircle2
                className={`h-4 w-4 ${hasProfession ? 'text-emerald-500' : 'text-slate-300'}`}
              />
              <span
                className={`text-sm ${hasProfession ? 'text-slate-700' : 'text-slate-400'}`}
              >
                {t('professionalDetails')}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <CheckCircle2
                className={`h-4 w-4 ${skills && skills.length > 0 ? 'text-emerald-500' : 'text-slate-300'}`}
              />
              <span
                className={`text-sm ${skills && skills.length > 0 ? 'text-slate-700' : 'text-slate-400'}`}
              >
                {t('skills')}
              </span>
            </div>
          </div>

          {/* Details rows */}
          <div className='space-y-3 border-t border-slate-100 pt-4'>
            {phone && (
              <div className='flex items-center gap-2 text-sm text-slate-600'>
                <PhoneIcon className='h-4 w-4 text-slate-400' />
                {phone}
              </div>
            )}

            {(hourlyRate || yearsExperience) && (
              <div className='flex flex-wrap gap-3'>
                {hourlyRate && (
                  <span className='inline-flex items-center rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700'>
                    {hourlyRate} EUR/h
                  </span>
                )}
                {yearsExperience !== undefined &&
                  yearsExperience !== null &&
                  Number(yearsExperience) > 0 && (
                    <span className='inline-flex items-center rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700'>
                      {yearsExperience} {t('yearsExperience')}
                    </span>
                  )}
              </div>
            )}

            {skills && skills.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {skills.map((skill, index) => (
                  <span
                    className='inline-flex items-center rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600'
                    key={index}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {description && (
              <p className='text-sm leading-relaxed text-slate-500'>
                {description}
              </p>
            )}
          </div>

          <div className='flex flex-wrap gap-3 border-t border-slate-100 pt-3'>
            <button
              className='text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline'
              onClick={onPrevious}
              type='button'
            >
              {t('editPhoto')}
            </button>
            <Link
              className='text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline'
              href='/professional/dashboard'
            >
              {t('setAvailabilityFromDashboard')}
            </Link>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className='space-y-3'>
        <Button
          className='h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50'
          disabled={isPending}
          onClick={onSubmit}
          type='button'
        >
          {t('createMyProfessionalProfile')}
        </Button>

        <p className='text-center text-xs text-slate-400'>
          Vous pourrez modifier ces informations à tout moment
        </p>

        <Button
          className='h-11 w-full rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50'
          disabled={isPending}
          onClick={onPrevious}
          type='button'
          variant='outline'
        >
          {tCommon('label.previous')}
        </Button>
      </div>
    </div>
  );
}
