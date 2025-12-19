'use client';

import { getSession, signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { getUser } from '@/services/auth/auth.service';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const t = useTranslations('auth.signIn');
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<null | string>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const passwordUpdated = searchParams.get('passwordUpdated');
    if (passwordUpdated === 'true') {
      setSuccess(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('passwordUpdated');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('error'));
        setIsLoading(false);
        return;
      }

      // Wait a bit for the session to be available
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get the session to retrieve user ID
      const session = await getSession();

      if (!session?.user?.id) {
        setError(t('error'));
        setIsLoading(false);
        return;
      }

      // Fetch user profile to get role
      const userResult = await getUser(session.user.id);

      if (userResult.error || !userResult.profile) {
        setError(t('error'));
        setIsLoading(false);
        return;
      }

      const role = userResult.profile.role;

      // Redirect based on role
      if (role === 'professional') {
        router.push('/professionals');
      } else if (role === 'structure') {
        router.push('/structure/dashboard');
      } else if (role === 'admin') {
        router.push('/admin');
      } else {
        setError(t('error'));
      }
    } catch {
      setError(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className='w-full'>
        <CardContent className='p-6'>
          <form className='space-y-6' onSubmit={handleLogin}>
            <div className='space-y-2 text-center'>
              <h1 className='text-2xl font-bold text-gray-800'>{t('title')}</h1>
              <p className='text-sm text-gray-600'>{t('subtitle')}</p>
            </div>

            <div className='flex justify-center space-y-2 text-blue-500'>
              <Link href='/'>{t('home')}</Link>
            </div>
            {success && (
              <div className='rounded-md bg-green-50 p-3 text-sm text-green-800'>
                {t('passwordUpdatedSuccess')}
              </div>
            )}
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

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='text-gray-700' htmlFor='password'>
                  {t('passwordLabel')}
                </Label>
                <Link
                  className='text-sm text-blue-500 transition-colors hover:text-blue-600'
                  href='/auth/forgot-password'
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <Input
                className='border-gray-300'
                disabled={isLoading}
                id='password'
                onChange={e => setPassword(e.target.value)}
                required
                type='password'
                value={password}
              />
            </div>

            <Button
              className='w-full bg-blue-500 text-white hover:bg-blue-600'
              disabled={isLoading}
              type='submit'
            >
              {isLoading ? t('submitButton') : t('submitButton')}
            </Button>

            <div className='text-center text-sm text-gray-600'>
              {t('noAccount')}{' '}
              <Link
                className='font-medium text-blue-500 transition-colors hover:text-blue-600'
                href='/auth/sign-up'
              >
                {t('signUp')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
