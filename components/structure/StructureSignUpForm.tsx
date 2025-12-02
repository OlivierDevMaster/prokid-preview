'use client';

import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { signUp } from '@/services/auth/auth.service';

export function StructureSignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const t = useTranslations('auth.signUp.structureForm');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: ({
      body,
    }: {
      body: {
        email: string;
        firstName: string;
        lastName: string;
        password: string;
      };
    }) => signUp({ body, userType: 'structure' }),
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(t('passwordTooShort'));
      setIsLoading(false);
      return;
    }

    try {
      mutation.mutate(
        { body: { email, firstName, lastName, password } },
        {
          onSuccess: () => {
            toast.success(t('success'));
          },
        }
      );

      router.push('/auth/login?registered=true');
    } catch (err) {
      console.error('Sign up error:', err);
      setError(t('error'));
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className='w-full'>
        <CardContent className='p-6'>
          <form className='space-y-6' onSubmit={handleSignUp}>
            <div className='space-y-2 text-center'>
              <h1 className='text-2xl font-bold text-gray-800'>{t('title')}</h1>
              <p className='text-sm text-gray-600'>{t('subtitle')}</p>
            </div>

            {error && (
              <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
                {error}
              </div>
            )}

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label className='text-gray-700' htmlFor='firstName'>
                  {t('firstNameLabel')}
                </Label>
                <Input
                  className='border-gray-300'
                  disabled={isLoading}
                  id='firstName'
                  onChange={e => setFirstName(e.target.value)}
                  placeholder={t('firstNamePlaceholder')}
                  required
                  type='text'
                  value={firstName}
                />
              </div>

              <div className='space-y-2'>
                <Label className='text-gray-700' htmlFor='lastName'>
                  {t('lastNameLabel')}
                </Label>
                <Input
                  className='border-gray-300'
                  disabled={isLoading}
                  id='lastName'
                  onChange={e => setLastName(e.target.value)}
                  placeholder={t('lastNamePlaceholder')}
                  required
                  type='text'
                  value={lastName}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label className='text-gray-700' htmlFor='email'>
                {t('emailLabel')}
              </Label>
              <Input
                className='border-gray-300'
                disabled={isLoading}
                id='email'
                onChange={e => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                required
                type='email'
                value={email}
              />
            </div>

            <div className='space-y-2'>
              <Label className='text-gray-700' htmlFor='password'>
                {t('passwordLabel')}
              </Label>
              <Input
                className='border-gray-300'
                disabled={isLoading}
                id='password'
                onChange={e => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                required
                type='password'
                value={password}
              />
            </div>

            <div className='space-y-2'>
              <Label className='text-gray-700' htmlFor='confirmPassword'>
                {t('confirmPasswordLabel')}
              </Label>
              <Input
                className='border-gray-300'
                disabled={isLoading}
                id='confirmPassword'
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder={t('confirmPasswordPlaceholder')}
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
              {isLoading ? t('submitButton') + '...' : t('submitButton')}
            </Button>

            <div className='text-center text-sm text-gray-600'>
              <Link
                className='font-medium text-blue-500 transition-colors hover:text-blue-600'
                href='/auth/login'
              >
                {t('hasAccount')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
