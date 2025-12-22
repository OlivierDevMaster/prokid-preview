'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { Link } from '@/i18n/routing';

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('auth.forgotPassword');
  return (
    <main className='min-h-screen'>
      <div className='min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-blue-100'>
        <div className='flex h-full items-center justify-center p-6 md:p-10'>
          <div className='h-full w-full'>
            <div className='flex flex-col items-center justify-center p-6'>
              <div className='space-y-8'>
                <div className='space-y-4 text-center'>
                  <div className='flex items-center justify-center'>
                    <h1 className='text-4xl font-bold text-gray-800 md:text-5xl'>
                      {t('title')}
                    </h1>
                    <Image
                      alt='ProKid'
                      className='ml-4'
                      height={200}
                      src='/icons/logo.svg'
                      width={200}
                    />
                  </div>
                  <p className='text-sm text-gray-600'>{t('description')}</p>
                </div>
                <div>{children}</div>
                <div className='text-center text-gray-700'>
                  {t('hasAccount')}{' '}
                  <Link
                    className='font-medium text-blue-500 transition-colors hover:text-blue-600'
                    href='/auth/login'
                  >
                    {t('loginLink')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
