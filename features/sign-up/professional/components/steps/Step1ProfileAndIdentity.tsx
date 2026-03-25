'use client';

import { Camera, MapPin, Phone, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { ProfessionalSignUpFormData } from '@/features/sign-up/professional/hooks/useProfessionalSignUpSchema';
import { createClient } from '@/lib/supabase/client';

interface Step1Props {
  form: UseFormReturn<ProfessionalSignUpFormData>;
  onNext: () => void;
  onPhotoChange: (file: File | null) => void;
  profilePhoto?: File | null;
}

export function Step1ProfileAndIdentity({
  form,
  onNext,
  onPhotoChange,
  profilePhoto,
}: Step1Props) {
  const [preview, setPreview] = useState<null | string>(null);
  const [userEmail, setUserEmail] = useState<null | string>(null);
  const [isLocating, setIsLocating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('auth.signUp.professionalForm');
  const tCommon = useTranslations('common.label');

  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const firstName = watch('firstName');
  const lastName = watch('lastName');

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const supabase = createClient();
        const { data: user } = await supabase.auth.getUser();
        if (user?.user?.email) setUserEmail(user.user.email);
      } catch {
        // ignore
      }
    };
    getUserEmail();
  }, []);

  // Restore preview if profilePhoto already set
  useEffect(() => {
    if (profilePhoto && !preview) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(profilePhoto);
    }
  }, [profilePhoto, preview]);

  const getInitials = (): string => {
    if (firstName && lastName) return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    if (firstName) return firstName.charAt(0).toUpperCase();
    if (lastName) return lastName.charAt(0).toUpperCase();
    if (userEmail) return userEmail.charAt(0).toUpperCase();
    return '?';
  };

  const processFile = useCallback(
    (file: File) => {
      onPhotoChange(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    },
    [onPhotoChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) processFile(file);
    },
    [processFile]
  );

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

  const INPUT_CLASS =
    'flex h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';
  const ICON_CLASS = 'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400';

  return (
    <div className='space-y-5'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-slate-900'>
          {t('welcomeTitle')}
        </h1>
        <p className='mt-1 text-sm text-slate-500'>{t('clientsTrustPhotos')}</p>
      </div>

      {/* Photo + Name row */}
      <div className='flex items-start gap-5'>
        {/* Photo compact */}
        <div
          className='group relative shrink-0 cursor-pointer'
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); }}
          onDrop={handleDrop}
        >
          <div
            className={`flex items-center justify-center overflow-hidden rounded-full border-2 border-dashed ${
              preview ? 'border-transparent' : 'border-slate-300 hover:border-blue-300'
            } bg-slate-50`}
            style={{ height: 100, width: 100 }}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt='Profile' className='h-full w-full rounded-full object-cover' src={preview} />
            ) : (
              <span className='text-2xl font-semibold text-slate-300'>{getInitials()}</span>
            )}
          </div>
          <button
            className='absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 shadow-md hover:bg-blue-700'
            onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
            type='button'
          >
            <Camera className='h-3.5 w-3.5 text-white' />
          </button>
          <input accept='image/*' className='hidden' onChange={handleFileChange} ref={fileInputRef} type='file' />
        </div>

        {/* Name fields next to photo */}
        <div className='flex flex-1 flex-col gap-3'>
          <div className='space-y-1'>
            <Label className='text-xs font-medium text-slate-600' htmlFor='firstName'>
              {tCommon('firstName')} *
            </Label>
            <Controller
              control={control}
              name='firstName'
              render={({ field }) => (
                <div className='relative'>
                  <User className={ICON_CLASS} />
                  <input
                    className={INPUT_CLASS}
                    id='firstName'
                    onChange={field.onChange}
                    placeholder={t('firstNamePlaceholder')}
                    type='text'
                    value={field.value}
                  />
                </div>
              )}
            />
            {errors.firstName && <p className='text-xs text-red-500'>{errors.firstName.message}</p>}
          </div>

          <div className='space-y-1'>
            <Label className='text-xs font-medium text-slate-600' htmlFor='lastName'>
              {tCommon('lastName')} *
            </Label>
            <Controller
              control={control}
              name='lastName'
              render={({ field }) => (
                <div className='relative'>
                  <User className={ICON_CLASS} />
                  <input
                    className={INPUT_CLASS}
                    id='lastName'
                    onChange={field.onChange}
                    placeholder={t('lastNamePlaceholder')}
                    type='text'
                    value={field.value}
                  />
                </div>
              )}
            />
            {errors.lastName && <p className='text-xs text-red-500'>{errors.lastName.message}</p>}
          </div>
        </div>
      </div>

      <p className='text-center text-xs text-slate-400'>Format JPG ou PNG, max 5 Mo</p>

      {/* Phone */}
      <div className='space-y-1'>
        <Label className='text-xs font-medium text-slate-600' htmlFor='phone'>
          {t('phone')} *
        </Label>
        <Controller
          control={control}
          name='phone'
          render={({ field }) => (
            <div className='relative'>
              <Phone className={ICON_CLASS} />
              <input
                className={INPUT_CLASS}
                id='phone'
                onChange={field.onChange}
                placeholder={t('phonePlaceholder')}
                type='tel'
                value={field.value}
              />
            </div>
          )}
        />
        {errors.phone && <p className='text-xs text-red-500'>{errors.phone.message}</p>}
      </div>

      {/* Location */}
      <div className='space-y-3'>
        <button
          className='flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50/50 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50'
          disabled={isLocating}
          onClick={handleUseMyLocation}
          type='button'
        >
          <MapPin className='h-4 w-4' />
          {isLocating ? t('locating') : t('useMyLocation')}
        </button>

        <div className='grid grid-cols-3 gap-3'>
          <div className='col-span-2 space-y-1'>
            <Label className='text-xs font-medium text-slate-600' htmlFor='city'>
              {t('city')} *
            </Label>
            <Controller
              control={control}
              name='city'
              render={({ field }) => (
                <div className='relative'>
                  <MapPin className={ICON_CLASS} />
                  <input
                    className={INPUT_CLASS}
                    id='city'
                    onChange={field.onChange}
                    placeholder={t('cityPlaceholder')}
                    type='text'
                    value={field.value}
                  />
                </div>
              )}
            />
            {errors.city && <p className='text-xs text-red-500'>{errors.city.message}</p>}
          </div>

          <div className='space-y-1'>
            <Label className='text-xs font-medium text-slate-600' htmlFor='postalCode'>
              {t('postalCode')}
            </Label>
            <Controller
              control={control}
              name='postalCode'
              render={({ field }) => (
                <input
                  className='flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
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
      </div>

      {/* Navigation */}
      <div className='flex justify-end pt-2'>
        <Button
          className='h-10 rounded-xl bg-blue-600 px-8 text-sm text-white hover:bg-blue-700'
          onClick={onNext}
          type='button'
        >
          {tCommon('next')}
        </Button>
      </div>
    </div>
  );
}
