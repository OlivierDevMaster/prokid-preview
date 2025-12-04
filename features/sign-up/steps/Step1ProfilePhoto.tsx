'use client';

import { Camera } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

import { ProgressBar } from '../ProgressBar';

interface Step1ProfilePhotoProps {
  onNext: () => void;
  onPhotoChange: (file: File | null) => void;
  profilePhoto?: File | null;
}

export function Step1ProfilePhoto({
  onNext,
  onPhotoChange,
}: Step1ProfilePhotoProps) {
  const [preview, setPreview] = useState<null | string>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('professional.label');

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
    <div className='space-y-6'>
      <ProgressBar currentStep={1} totalSteps={4} />

      <div className='space-y-2 text-center'>
        <h1 className='text-3xl font-bold text-gray-900'>
          {t('profilePhoto')}
        </h1>
        <p className='text-gray-600'>{t('profilePhotoPlaceholder')}</p>
      </div>

      <div className='flex justify-center'>
        <div className='relative'>
          <div className='relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-200 shadow-lg ring-2 ring-white'>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt='Profile preview'
                className='h-full w-full rounded-full object-cover'
                src={preview}
              />
            ) : (
              <span className='p-8 text-4xl font-semibold text-gray-500'>
                kk
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
        <p className='text-sm text-gray-500'>Format carré recommandé</p>
        <Button
          className='border-gray-300 text-gray-600 hover:bg-gray-50'
          onClick={handleUseDefault}
          type='button'
          variant='outline'
        >
          Utiliser une photo par défaut
        </Button>
      </div>

      <div className='flex justify-end pt-4'>
        <Button
          className='bg-blue-500 text-white hover:bg-blue-600'
          onClick={onNext}
          type='button'
        >
          Suivant →
        </Button>
      </div>
    </div>
  );
}
