'use client';

import { Check, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/routing';

export function SubscriptionSection() {
  const t = useTranslations('landing.subscription');

  return (
    <section className='bg-gradient-to-b from-white to-blue-50 py-20 lg:py-32'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700'>
            <Star className='h-4 w-4' />
            {t('launchOffer')}
          </div>
          <h2 className='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
            {t('title')}
          </h2>
          <p className='mt-4 text-lg text-gray-600'>{t('tagline')}</p>
        </div>
        <div className='mx-auto mt-12 max-w-md'>
          <Card className='p-8 shadow-xl'>
            <div className='text-center'>
              <div className='text-5xl font-bold text-blue-600'>
                {t('price')}
                <span className='text-2xl font-normal'>{t('priceUnit')}</span>
              </div>
              <p className='mt-2 text-sm text-gray-600'>{t('trialInfo')}</p>
              <ul className='mt-6 space-y-3 text-left'>
                <li className='flex items-center gap-3 text-sm text-gray-700'>
                  <Check className='h-5 w-5 text-blue-600' />
                  {t('benefit1')}
                </li>
                <li className='flex items-center gap-3 text-sm text-gray-700'>
                  <Check className='h-5 w-5 text-blue-600' />
                  {t('benefit2')}
                </li>
                <li className='flex items-center gap-3 text-sm text-gray-700'>
                  <Check className='h-5 w-5 text-blue-600' />
                  {t('benefit3')}
                </li>
              </ul>
              <Button
                asChild
                className='mt-8 w-full bg-blue-500 text-white hover:bg-blue-600'
                size='lg'
              >
                <Link href='/professional/subscription'>
                  {t('activateButton')}
                </Link>
              </Button>
              <p className='mt-4 text-xs text-gray-500'>
                {t('paymentDisclaimer')}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
