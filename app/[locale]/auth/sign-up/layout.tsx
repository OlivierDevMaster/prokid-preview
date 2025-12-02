'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/routing';

export default function SingUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('auth.signUp');
  return (
    <main>
      <div className='overflow-hidden bg-gradient-to-b from-blue-50 to-blue-100'>
        <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
          <div className='w-full'>
            <div className='flex flex-col items-center justify-center p-6'>
              <div className='space-y-8'>
                <div className='space-y-4 text-center'>
                  <h1 className='text-4xl font-bold text-gray-800 md:text-5xl'>
                    {t('welcome')} <span className='text-blue-400'>PRO</span>
                    <span className='text-green-400'>Kid</span> 👋
                  </h1>
                  <p className='text-lg text-gray-700'>{t('question')}</p>
                </div>

                {children}

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
