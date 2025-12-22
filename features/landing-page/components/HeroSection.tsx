'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

export function HeroSection() {
  const t = useTranslations('landing.hero');

  return (
    <section className='relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 lg:py-32'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-3xl text-center'>
          <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl'>
            {t('title')}
          </h1>
          <p className='mt-6 text-lg leading-8 text-gray-600 sm:text-xl'>
            {t('description')}
          </p>
          <div className='mt-10 flex items-center justify-center gap-x-6'>
            <Button
              asChild
              className='bg-blue-500 text-white hover:bg-blue-600'
              size='lg'
            >
              <Link href='/auth/sign-up'>{t('ctaPrimary')}</Link>
            </Button>
            <Button asChild size='lg' variant='outline'>
              <Link href='/professionals'>{t('ctaSecondary')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
