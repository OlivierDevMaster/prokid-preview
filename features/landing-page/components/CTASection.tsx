'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

export function CTASection() {
  const t = useTranslations('landing.cta');

  return (
    <section className='bg-white py-20 lg:py-32'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <h2 className='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
            {t('title')}
          </h2>
          <p className='mt-6 text-lg leading-8 text-gray-600'>
            {t('description')}
          </p>
          <div className='mt-10 flex items-center justify-center gap-x-6'>
            <Button
              asChild
              className='bg-blue-500 text-white hover:bg-blue-600'
              size='lg'
            >
              <Link href='/auth/sign-up'>{t('primaryButton')}</Link>
            </Button>
            <Button
              asChild
              className='border-gray-300 text-gray-700 hover:bg-gray-50'
              size='lg'
              variant='outline'
            >
              <Link href='/professionals'>{t('secondaryButton')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
