'use client';

import { Check, Star } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSubscriptionStatus } from '@/features/subscriptions/hooks/useSubscriptionStatus';
import { useRole } from '@/hooks/useRole';
import { Link } from '@/i18n/routing';

export function SubscriptionSection() {
  const t = useTranslations('landing.subscription');
  const tProfessional = useTranslations('professional.subscription');
  const { data: session } = useSession();
  const { isAdmin, isProfessional, isStructure } = useRole();
  const { data: subscriptionData } = useSubscriptionStatus();

  // Only check subscription if user is a professional
  const isProfessionalSubscribed =
    isProfessional && subscriptionData?.isSubscribed;

  const isAuthenticated = !!session;
  const shouldDisableButton =
    isStructure || isAdmin || (isProfessional && isProfessionalSubscribed);
  const shouldShowAlreadySubscribedMessage =
    isProfessional && isProfessionalSubscribed;
  const buttonHref = isAuthenticated
    ? '/professional/subscription'
    : '/auth/sign-up';

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
              {shouldShowAlreadySubscribedMessage && (
                <div className='mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-800'>
                  {tProfessional('alreadySubscribedMessage')}
                </div>
              )}
              {!shouldShowAlreadySubscribedMessage && (
                <Button
                  asChild={!shouldDisableButton}
                  className='mt-8 w-full bg-blue-500 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50'
                  disabled={shouldDisableButton}
                  size='lg'
                >
                  {shouldDisableButton ? (
                    <span>{t('activateButton')}</span>
                  ) : (
                    <Link href={buttonHref}>{t('activateButton')}</Link>
                  )}
                </Button>
              )}
              {!shouldShowAlreadySubscribedMessage && (
                <p className='mt-4 text-xs text-gray-500'>
                  {t('paymentDisclaimer')}
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
