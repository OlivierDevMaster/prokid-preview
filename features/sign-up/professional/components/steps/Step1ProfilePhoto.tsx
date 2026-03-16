'use client';

import { Camera } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface Step1ProfilePhotoProps {
  firstName?: string;
  lastName?: string;
  onNext: () => void;
  onPhotoChange: (file: File | null) => void;
  profilePhoto?: File | null;
}

export function Step1ProfilePhoto({
  firstName,
  lastName,
  onNext,
  onPhotoChange,
}: Step1ProfilePhotoProps) {
  const [preview, setPreview] = useState<null | string>(null);
  const [userEmail, setUserEmail] = useState<null | string>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('auth.signUp.professionalForm');
  const tCommon = useTranslations('common.label');

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const supabase = createClient();
        const { data: user } = await supabase.auth.getUser();
        if (user?.user?.email) {
          setUserEmail(user.user.email);
        }
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    };

    getUserEmail();
  }, []);

  const getInitials = (): string => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) return firstName.charAt(0).toUpperCase();
    if (lastName) return lastName.charAt(0).toUpperCase();
    if (userEmail) return userEmail.charAt(0).toUpperCase();
    return '?';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoChange(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSkip = () => {
    onPhotoChange(null);
    setPreview(null);
    onNext();
  };

  const handleCameraClick = () => fileInputRef.current?.click();

  return (
    <div className='w-full space-y-6'>
      <div className='space-y-2'>
        <h1 className='text-[32px] font-bold tracking-tight text-gray-900'>
          {t('welcomeTitle')}
        </h1>
        <p className='text-base text-gray-600'>{t('clientsTrustPhotos')}</p>
      </div>

      <div className='flex'>
        <div className='group relative'>
          <div className='relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-200'>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt='Profile preview'
                className='h-full w-full rounded-full object-cover'
                src={preview}
              />
            ) : (
              <span className='text-4xl font-semibold text-gray-400'>
                {getInitials()}
              </span>
            )}
          </div>
          <Button
            className='absolute bottom-0 right-0 h-10 w-10 rounded-full bg-blue-600 p-0 hover:bg-blue-700'
            onClick={handleCameraClick}
            type='button'
          >
            <Camera className='h-5 w-5 text-white' />
          </Button>
          <input
            accept='image/*'
            className='hidden'
            onChange={handleFileChange}
            ref={fileInputRef}
            type='file'
          />
        </div>
      </div>

      <div className='flex flex-col items-start gap-3'>
        <Button
          className='min-h-12 border-gray-300 text-gray-700 hover:bg-gray-50'
          onClick={handleCameraClick}
          type='button'
          variant='outline'
        >
          {t('uploadPhoto')}
        </Button>
      </div>

      <div className='flex justify-end gap-4 pt-4'>
        <Button variant='outline' onClick={handleSkip} className='min-h-12'>
          {t('skipForNow')}
        </Button>
        <Button
          className='min-h-12 bg-blue-600 px-8 text-white hover:bg-blue-700'
          onClick={onNext}
          type='button'
        >
          {tCommon('next')}
        </Button>
      </div>
    </div>
  );
}
