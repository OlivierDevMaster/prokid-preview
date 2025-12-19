'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [error, setError] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      await createAccount({
        email,
        firstName,
        lastName,
        password,
        role,
      });

      if (role === 'professional') {
        router.push('/auth/sign-up/professional/on-boarding');
      } else if (role === 'structure') {
        router.push('/auth/login');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className='w-full'>
        <CardContent className='p-6'>
          <form className='space-y-6' onSubmit={handleSignUp}>
            <div className='space-y-2 text-center'>
              <h1 className='text-2xl font-bold text-gray-800'>
                Create Account
              </h1>
              <p className='text-sm text-gray-600'>
                Fill in the information below to create your account
              </p>
            </div>

            {error && (
              <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
                {error}
              </div>
            )}

            {role === 'structure' && (
              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <Label className='text-gray-700' htmlFor='email'>
                    {t('structureForm.firstNameLabel')}
                  </Label>
                  <Input
                    className='border-gray-300'
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
                  <Label className='text-gray-700' htmlFor='email'>
                    {t('structureForm.lastNameLabel')}
                  </Label>
                  <Input
                    className='border-gray-300'
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
            )}

            <div className='space-y-2'>
              <Label className='text-gray-700' htmlFor='email'>
                {t('professionalForm.emailLabel')}
              </Label>
              <Input
                className='border-gray-300'
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
              <Label className='text-gray-700' htmlFor='password'>
                {t('professionalForm.passwordLabel')}
              </Label>
              <Input
                className='border-gray-300'
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
              <Label className='text-gray-700' htmlFor='confirmPassword'>
                {t('professionalForm.confirmPasswordLabel')}
              </Label>
              <Input
                className='border-gray-300'
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
              className='w-full bg-blue-500 text-white hover:bg-blue-600'
              disabled={isLoading}
              type='submit'
            >
              {isLoading
                ? 'Creating account...'
                : t('professionalForm.submitButton')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
