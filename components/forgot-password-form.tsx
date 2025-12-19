'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@/i18n/routing';
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
      {success ? (
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl'>{t('success.title')}</CardTitle>
            <CardDescription>{t('success.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              {t('success.message')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl'>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className='flex flex-col gap-6'>
                <div className='grid gap-2'>
                  <Label htmlFor='email'>{t('emailLabel')}</Label>
                  <Input
                    id='email'
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    required
                    type='email'
                    value={email}
                  />
                </div>
                {error && <p className='text-sm text-red-500'>{error}</p>}
                <Button className='w-full' disabled={isLoading} type='submit'>
                  {isLoading ? t('sending') : t('submitButton')}
                </Button>
              </div>
              <div className='mt-4 text-center text-sm'>
                {t('hasAccount')}{' '}
                <Link
                  className='underline underline-offset-4'
                  href='/auth/login'
                >
                  {t('loginLink')}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
