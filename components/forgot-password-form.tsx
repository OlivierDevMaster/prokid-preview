'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const t = useTranslations('auth.forgotPassword');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<null | string>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const redirectTo = `${window.location.origin}${
        locale === 'en' ? '' : `/${locale}`
      }/auth/update-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className='w-full'>
        <CardContent className='p-6'>
          {success ? (
            <div className='space-y-6'>
              <div className='space-y-2 text-center'>
                <h1 className='text-2xl font-bold text-gray-800'>
                  {t('success.title')}
                </h1>
                <p className='text-sm text-gray-600'>
                  {t('success.description')}
                </p>
              </div>
              <div className='rounded-md bg-green-50 p-3 text-sm text-green-800'>
                {t('success.message')}
              </div>
            </div>
          ) : (
            <form className='space-y-6' onSubmit={handleForgotPassword}>
              <div className='space-y-2 text-center'>
                <h1 className='text-2xl font-bold text-gray-800'>
                  {t('title')}
                </h1>
                <p className='text-sm text-gray-600'>{t('description')}</p>
              </div>

              {error && (
                <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
                  {error}
                </div>
              )}

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

              <Button
                className='w-full bg-blue-500 text-white hover:bg-blue-600'
                disabled={isLoading}
                type='submit'
              >
                {isLoading ? t('sending') : t('submitButton')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
