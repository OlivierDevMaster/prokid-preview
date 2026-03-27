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

      // If email is already verified, go to onboarding
      if (role === 'professional') {
        router.push('/professional/on-boarding');
      } else if (role === 'structure') {
        router.push('/structure/on-boarding');
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
