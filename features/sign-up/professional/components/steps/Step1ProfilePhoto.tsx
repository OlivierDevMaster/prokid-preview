'use client';

import { Camera } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

import { ProgressBar } from '../ProgressBar';

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
  const t = useTranslations('professional.label');
  const tSignUp = useTranslations('auth.signUp');
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
    // If firstName and lastName are available, use them
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    // If only firstName is available, use first letter
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }

    // If only lastName is available, use first letter
    if (lastName) {
      return lastName.charAt(0).toUpperCase();
    }

    // Otherwise, use email
    if (userEmail) {
      return userEmail.charAt(0).toUpperCase();
    }

    // Fallback
    return '?';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseDefault = () => {
    onPhotoChange(null);
    setPreview(null);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='w-full max-w-3xl space-y-6'>
      <ProgressBar currentStep={1} totalSteps={4} />

      <div className='space-y-2 text-center'>
        <h1 className='text-3xl font-bold text-gray-900'>
          {t('profilePhoto')}
        </h1>
        <p className='text-gray-600'>{t('profilePhotoPlaceholder')}</p>
      </div>

      <div className='flex justify-center'>
        <div className='relative'>
          <div className='relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-200 ring-2 ring-white'>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt='Profile preview'
                className='h-full w-full rounded-full object-cover'
                src={preview}
              />
            ) : (
              <span className='p-8 text-4xl font-semibold text-gray-500'>
                {getInitials()}
              </span>
            )}
          </div>
          <Button
            className='absolute bottom-0 right-0 h-5 w-5 rounded-full bg-blue-500 p-4 hover:bg-blue-500'
            onClick={handleCameraClick}
            style={{ bottom: 0, position: 'absolute', right: 0 }}
            variant='ghost'
          >
            <Camera className='text-white' />
          </Button>
          <input
            accept='image/*'
            className='hidden'
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
            type='file'
          />
        </div>
      </div>

      <div className='space-y-4 text-center'>
        <p className='text-sm text-gray-500'>
          {tSignUp('professionalForm.recommendedFormat')}
        </p>
        <Button
          className='border-gray-300 text-gray-600 hover:bg-gray-50'
          onClick={handleUseDefault}
          type='button'
          variant='outline'
        >
          {tSignUp('professionalForm.defaultProfilePicture')}
        </Button>
      </div>

      <div className='flex justify-end pt-4'>
        <Button
          className='bg-blue-500 text-white hover:bg-blue-600'
          onClick={onNext}
          type='button'
        >
          {tCommon('next')} →
        </Button>
      </div>
    </div>
  );
}
