'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { usePathname } from '@/i18n/routing';
import { Link } from '@/i18n/routing';

export default function SingUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('auth.signUp');
  const pathname = usePathname();
  const isProfessionalSignUpRoute = pathname?.includes(
    '/auth/sign-up/professional'
  );

  if (isProfessionalSignUpRoute) {
    return children;
  }

  return (
    <main>
      <div className='overflow-hidden bg-gradient-to-b from-blue-50 to-blue-100'>
        <div className='flex min-h-svh w-full items-center justify-center p-10'>
          <div className='w-full'>
            <div className='flex flex-col items-center justify-center'>
              <div className='space-y-8'>
                <div className='space-y-4 text-center'>
                  <div className='flex flex-col items-center justify-center md:flex-row'>
                    <h1 className='text-4xl font-bold text-gray-800 md:text-5xl'>
                      {t('welcome')}
                    </h1>
                    <Image
                      alt='ProKid'
                      className='ml-4'
                      height={200}
                      src='/icons/logo.svg'
                      width={200}
                    />
                    <div className='text-4xl'>👋</div>
                  </div>
                  <p className='text-sm text-gray-600'>{t('question')}</p>
                </div>
                <div className='w-full max-w-3xl'>{children}</div>
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
