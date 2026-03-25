'use client';

import { Camera, ImagePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  const [isDragging, setIsDragging] = useState(false);
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
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleSkip = () => {
    onPhotoChange(null);
    setPreview(null);
    onNext();
  };

  const handleCameraClick = () => fileInputRef.current?.click();

  return (
    <div className='flex w-full flex-col space-y-8'>
      <div className='space-y-2'>
        <h1 className='text-[32px] font-bold tracking-tight text-slate-900'>
          {t('welcomeTitle')}
        </h1>
        <p className='text-base text-slate-500'>{t('clientsTrustPhotos')}</p>
      </div>

      {/* Upload area */}
      <div
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50/50'
            : preview
              ? 'border-slate-200 bg-white'
              : 'border-slate-300 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30'
        } cursor-pointer`}
        onClick={handleCameraClick}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className='group relative mb-4'>
          <div
            className={`relative flex items-center justify-center overflow-hidden rounded-full ring-4 ring-white ${
              preview ? 'bg-transparent' : 'bg-slate-100'
            }`}
            style={{ height: 180, width: 180 }}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt='Profile preview'
                className='h-full w-full rounded-full object-cover'
                src={preview}
              />
            ) : (
              <span className='text-5xl font-semibold text-slate-300'>
                {getInitials()}
              </span>
            )}
          </div>
          <Button
            className='absolute bottom-1 right-1 h-11 w-11 rounded-full bg-blue-600 p-0 shadow-lg hover:bg-blue-700'
            onClick={e => {
              e.stopPropagation();
              handleCameraClick();
            }}
            type='button'
          >
            <Camera className='h-5 w-5 text-white' />
          </Button>
        </div>

        {!preview && (
          <div className='flex flex-col items-center gap-1.5'>
            <ImagePlus className='h-6 w-6 text-slate-400' />
            <p className='text-sm font-medium text-slate-600'>
              {t('uploadPhoto')}
            </p>
            <p className='text-xs text-slate-400'>
              Format JPG ou PNG, max 5 Mo
            </p>
          </div>
        )}

        <input
          accept='image/*'
          className='hidden'
          onChange={handleFileChange}
          ref={fileInputRef}
          type='file'
        />
      </div>

      {/* Navigation */}
      <div className='flex justify-end gap-3 pt-2'>
        <Button
          className='h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50'
          onClick={handleSkip}
          type='button'
          variant='outline'
        >
          {t('skipForNow')}
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
