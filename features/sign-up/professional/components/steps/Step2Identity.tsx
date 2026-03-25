'use client';

import { MapPin, Phone, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';

import type { ProfessionalSignUpFormData } from '@/features/sign-up/professional/hooks/useProfessionalSignUpSchema';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface Step2IdentityProps {
  form: UseFormReturn<ProfessionalSignUpFormData>;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step2Identity({
  form,
  onNext,
  onPrevious,
}: Step2IdentityProps) {
  const t = useTranslations('auth.signUp.professionalForm');
  const tCommon = useTranslations('common.label');
  const [isLocating, setIsLocating] = useState(false);

  const {
    control,
    formState: { errors },
    setValue,
  } = form;

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async position => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = (await res.json()) as {
            address?: { city?: string; postcode?: string; town?: string };
          };
          const city = data.address?.city ?? data.address?.town ?? '';
          const postalCode = data.address?.postcode ?? '';
          setValue('latitude', latitude, { shouldDirty: true });
          setValue('longitude', longitude, { shouldDirty: true });
          if (city) setValue('city', city);
          if (postalCode) setValue('postalCode', postalCode);
        } catch {
          // ignore
        } finally {
          setIsLocating(false);
        }
      },
      () => setIsLocating(false)
    );
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h1 className='text-[32px] font-bold tracking-tight text-slate-900'>
          {t('tellUsAboutYou')}
        </h1>
      </div>

      {/* First name / Last name side by side */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-1.5'>
          <Label
            className='text-sm font-medium text-slate-700'
            htmlFor='firstName'
          >
            {tCommon('firstName')} *
          </Label>
          <Controller
            control={control}
            name='firstName'
            render={({ field }) => (
              <div className='relative'>
                <User className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                <input
                  className='flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                  id='firstName'
                  onChange={field.onChange}
                  placeholder={t('firstNamePlaceholder')}
                  required
                  type='text'
                  value={field.value}
                />
              </div>
            )}
          />
          {errors.firstName && (
            <p className='text-sm text-red-500'>{errors.firstName.message}</p>
          )}
        </div>

        <div className='space-y-1.5'>
          <Label
            className='text-sm font-medium text-slate-700'
            htmlFor='lastName'
          >
            {tCommon('lastName')} *
          </Label>
          <Controller
            control={control}
            name='lastName'
            render={({ field }) => (
              <div className='relative'>
                <User className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                <input
                  className='flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                  id='lastName'
                  onChange={field.onChange}
                  placeholder={t('lastNamePlaceholder')}
                  required
                  type='text'
                  value={field.value}
                />
              </div>
            )}
          />
          {errors.lastName && (
            <p className='text-sm text-red-500'>{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Phone - full width */}
      <div className='space-y-1.5'>
        <Label className='text-sm font-medium text-slate-700' htmlFor='phone'>
          {t('phone')} *
        </Label>
        <Controller
          control={control}
          name='phone'
          render={({ field }) => (
            <div className='relative'>
              <Phone className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
              <input
                className='flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                id='phone'
                onChange={field.onChange}
                placeholder={t('phonePlaceholder')}
                required
                type='tel'
                value={field.value}
              />
            </div>
          )}
        />
        <p className='text-xs text-slate-400'>{t('phoneHelper')}</p>
        {errors.phone && (
          <p className='text-sm text-red-500'>{errors.phone.message}</p>
        )}
      </div>

      {/* Geolocation button */}
      <Button
        className='h-11 w-full rounded-xl border-2 border-blue-200 bg-blue-50/50 font-medium text-blue-600 hover:border-blue-300 hover:bg-blue-50'
        disabled={isLocating}
        onClick={handleUseMyLocation}
        type='button'
        variant='outline'
      >
        <MapPin className='mr-2 h-4 w-4' />
        {isLocating ? t('locating') : t('useMyLocation')}
      </Button>

      {/* City / Postal code side by side */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-1.5'>
          <Label className='text-sm font-medium text-slate-700' htmlFor='city'>
            {t('city')} *
          </Label>
          <Controller
            control={control}
            name='city'
            render={({ field }) => (
              <div className='relative'>
                <MapPin className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                <input
                  className='flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                  id='city'
                  onChange={field.onChange}
                  placeholder={t('cityPlaceholder')}
                  required
                  type='text'
                  value={field.value}
                />
              </div>
            )}
          />
          {errors.city && (
            <p className='text-sm text-red-500'>{errors.city.message}</p>
          )}
        </div>

        <div className='space-y-1.5'>
          <Label
            className='text-sm font-medium text-slate-700'
            htmlFor='postalCode'
          >
            {t('postalCode')}
          </Label>
          <Controller
            control={control}
            name='postalCode'
            render={({ field }) => (
              <input
                className='flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                id='postalCode'
                onChange={field.onChange}
                placeholder={t('postalCodePlaceholder')}
                type='text'
                value={field.value}
              />
            )}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className='flex justify-end gap-3 pt-4'>
        <Button
          className='h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50'
          onClick={onPrevious}
          type='button'
          variant='outline'
        >
          {tCommon('previous')}
        </Button>
        <Button
          className='h-11 rounded-xl bg-blue-600 px-8 text-white hover:bg-blue-700'
          onClick={onNext}
          type='button'
        >
          {tCommon('next')}
        </Button>
      </div>
    </div>
  );
}
