'use client';

import { Camera, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VerifyEmailModal } from '@/components/verify-email-modal';
import { useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';

import { createAccount } from '../signUp.service';

type AccountFormProps = {
  role: 'professional' | 'structure';
} & React.ComponentPropsWithoutRef<'div'>;

export function AccountForm({ className, role, ...props }: AccountFormProps) {
  const t = useTranslations('auth.signUp');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<null | string>(null);
  const [error, setError] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerifyEmailModal, setShowVerifyEmailModal] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError(t('professionalForm.passwordMismatch'));
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(t('professionalForm.passwordTooShort'));
      setIsLoading(false);
      return;
    }

    try {
      const result = await createAccount({
        email,
        firstName,
        lastName,
        password,
        profilePhoto,
        role,
      });

      // If email verification is required and not verified, show modal
      if (!result.emailVerified) {
        setShowVerifyEmailModal(true);
        return;
      }

      // If email is already verified (shouldn't happen with enable_confirmations = true, but handle it)
      if (role === 'professional') {
        router.push('/professional/on-boarding');
      } else if (role === 'structure') {
        router.push('/auth/login');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('professionalForm.error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className='w-full border-slate-200 shadow-sm'>
        <CardContent className='p-6 md:p-8'>
          <form className='space-y-5' onSubmit={handleSignUp}>
            <div className='space-y-2 text-center'>
              <h1 className='text-2xl font-bold tracking-tight text-slate-900'>
                {t('professionalForm.title')}
              </h1>
              <p className='text-sm text-slate-500'>
                {t('professionalForm.subtitle')}
              </p>
            </div>

            {error && (
              <div className='rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
                {error}
              </div>
            )}

            {role === 'structure' && (
              <>
                <div className='flex flex-col items-center justify-center space-y-2'>
                  <Label className='text-xs font-medium text-slate-600'>
                    {t('structureForm.profilePhotoLabel')}
                  </Label>
                  <div className='flex items-center gap-4'>
                    <div className='relative'>
                      <div className='relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-200 ring-2 ring-gray-300'>
                        {photoPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt='Profile preview'
                            className='h-full w-full rounded-full object-cover'
                            src={photoPreview}
                          />
                        ) : (
                          <span className='text-2xl font-semibold text-gray-500'>
                            {firstName && lastName
                              ? `${firstName.charAt(0)}${lastName.charAt(0)}`
                              : firstName
                                ? firstName.charAt(0)
                                : lastName
                                  ? lastName.charAt(0)
                                  : '?'}
                          </span>
                        )}
                      </div>
                      <Button
                        className='absolute bottom-0 right-3 h-6 w-6 rounded-full bg-blue-500 p-3 hover:bg-blue-600'
                        onClick={() => fileInputRef.current?.click()}
                        size='sm'
                        type='button'
                        variant='ghost'
                      >
                        <Camera className='h-3 w-3 text-white' />
                      </Button>
                      <input
                        accept='image/*'
                        className='hidden'
                        disabled={isLoading}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setProfilePhoto(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPhotoPreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        ref={fileInputRef}
                        type='file'
                      />
                    </div>
                  </div>
                  <div>
                    {profilePhoto && (
                      <Button
                        className='mt-2 text-xs text-red-500'
                        onClick={() => {
                          setProfilePhoto(null);
                          setPhotoPreview(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        size='sm'
                        type='button'
                        variant='ghost'
                      >
                        <Trash className='h-3 w-3 text-red-500' />
                        {t('structureForm.removePhoto')}
                      </Button>
                    )}
                  </div>
                </div>
                <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                  <div>
                    <Label className='text-xs font-medium text-slate-600' htmlFor='firstName'>
                      {t('structureForm.firstNameLabel')}
                    </Label>
                    <Input
                      className='h-10 rounded-xl border-slate-200'
                      disabled={isLoading}
                      id='firstName'
                      onChange={e => setFirstName(e.target.value)}
                      placeholder={t('structureForm.firstNamePlaceholder')}
                      required
                      type='text'
                      value={firstName}
                    />
                  </div>
                  <div>
                    <Label className='text-xs font-medium text-slate-600' htmlFor='lastName'>
                      {t('structureForm.lastNameLabel')}
                    </Label>
                    <Input
                      className='h-10 rounded-xl border-slate-200'
                      disabled={isLoading}
                      id='lastName'
                      onChange={e => setLastName(e.target.value)}
                      placeholder={t('structureForm.lastNamePlaceholder')}
                      required
                      type='text'
                      value={lastName}
                    />
                  </div>
                </div>
              </>
            )}

            <div className='space-y-2'>
              <Label className='text-xs font-medium text-slate-600' htmlFor='email'>
                {t('professionalForm.emailLabel')}
              </Label>
              <Input
                className='h-10 rounded-xl border-slate-200'
                disabled={isLoading}
                id='email'
                onChange={e => setEmail(e.target.value)}
                placeholder={t('professionalForm.emailPlaceholder')}
                required
                type='email'
                value={email}
              />
            </div>

            <div className='space-y-2'>
              <Label className='text-xs font-medium text-slate-600' htmlFor='password'>
                {t('professionalForm.passwordLabel')}
              </Label>
              <Input
                className='h-10 rounded-xl border-slate-200'
                disabled={isLoading}
                id='password'
                onChange={e => setPassword(e.target.value)}
                placeholder={t('professionalForm.passwordPlaceholder')}
                required
                type='password'
                value={password}
              />
            </div>

            <div className='space-y-2'>
              <Label className='text-xs font-medium text-slate-600' htmlFor='confirmPassword'>
                {t('professionalForm.confirmPasswordLabel')}
              </Label>
              <Input
                className='h-10 rounded-xl border-slate-200'
                disabled={isLoading}
                id='confirmPassword'
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder={t('professionalForm.confirmPasswordPlaceholder')}
                required
                type='password'
                value={confirmPassword}
              />
            </div>

            <Button
              className='h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700'
              disabled={isLoading}
              type='submit'
            >
              {isLoading
                ? t('professionalForm.creatingAccount')
                : t('professionalForm.submitButton')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <VerifyEmailModal email={email} onClose={() => setShowVerifyEmailModal(false)} open={showVerifyEmailModal} />
    </div>
  );
}
