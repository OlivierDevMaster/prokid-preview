'use client';

import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';

import type { ProfessionalSignUpFormData } from '@/features/sign-up/professional/hooks/useProfessionalSignUpSchema';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
            address?: { city?: string; postcode?: string };
          };
          const city = data.address?.city ?? data.address?.town ?? '';
          const postalCode = data.address?.postcode ?? '';
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
      <h1 className='text-[32px] font-bold tracking-tight text-gray-900'>
        {t('tellUsAboutYou')}
      </h1>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label
            className='text-sm font-medium text-gray-700'
            htmlFor='firstName'
          >
            {tCommon('firstName')} *
          </Label>
          <Controller
            control={control}
            name='firstName'
            render={({ field }) => (
              <Input
                className='h-12 border-gray-300 text-base'
                id='firstName'
                onChange={field.onChange}
                placeholder={t('firstNamePlaceholder')}
                required
                type='text'
                value={field.value}
              />
            )}
          />
          {errors.firstName && (
            <p className='text-sm text-red-500'>{errors.firstName.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label
            className='text-sm font-medium text-gray-700'
            htmlFor='lastName'
          >
            {tCommon('lastName')} *
          </Label>
          <Controller
            control={control}
            name='lastName'
            render={({ field }) => (
              <Input
                className='h-12 border-gray-300 text-base'
                id='lastName'
                onChange={field.onChange}
                placeholder={t('lastNamePlaceholder')}
                required
                type='text'
                value={field.value}
              />
            )}
          />
          {errors.lastName && (
            <p className='text-sm text-red-500'>{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='text-sm font-medium text-gray-700' htmlFor='phone'>
          {t('phone')} *
        </Label>
        <Controller
          control={control}
          name='phone'
          render={({ field }) => (
            <Input
              className='h-12 border-gray-300 text-base'
              id='phone'
              onChange={field.onChange}
              placeholder={t('phonePlaceholder')}
              required
              type='tel'
              value={field.value}
            />
          )}
        />
        <p className='text-xs text-gray-500'>{t('phoneHelper')}</p>
        {errors.phone && (
          <p className='text-sm text-red-500'>{errors.phone.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Button
          className='w-full border-gray-300 text-gray-700 hover:bg-gray-50'
          disabled={isLocating}
          onClick={handleUseMyLocation}
          type='button'
          variant='outline'
        >
          <MapPin className='mr-2 h-4 w-4' />
          {isLocating ? t('locating') : t('useMyLocation')}
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label className='text-sm font-medium text-gray-700' htmlFor='city'>
            {t('city')} *
          </Label>
          <Controller
            control={control}
            name='city'
            render={({ field }) => (
              <Input
                className='h-12 border-gray-300 text-base'
                id='city'
                onChange={field.onChange}
                placeholder={t('cityPlaceholder')}
                required
                type='text'
                value={field.value}
              />
            )}
          />
          {errors.city && (
            <p className='text-sm text-red-500'>{errors.city.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label
            className='text-sm font-medium text-gray-700'
            htmlFor='postalCode'
          >
            {t('postalCode')}
          </Label>
          <Controller
            control={control}
            name='postalCode'
            render={({ field }) => (
              <Input
                className='h-12 border-gray-300 text-base'
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

      <div className='flex justify-end gap-4 pt-6'>
        <Button
          className='min-h-12 flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 md:flex-none'
          onClick={onPrevious}
          type='button'
          variant='outline'
        >
          {tCommon('previous')}
        </Button>
        <Button
          className='min-h-12 flex-1 bg-blue-600 text-white hover:bg-blue-700 md:flex-none'
          onClick={onNext}
          type='button'
        >
          {tCommon('next')}
        </Button>
      </div>
    </div>
  );
}
