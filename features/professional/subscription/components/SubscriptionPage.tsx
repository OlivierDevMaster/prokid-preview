'use client';

import {
  BarChart3,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Star,
  Users,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCreateCheckoutSession } from '@/features/subscriptions/hooks';
import { useSubscriptionStatus } from '@/features/subscriptions/hooks/useSubscriptionStatus';

export default function SubscriptionPage() {
  const locale = useLocale() as 'en' | 'fr';
  const t = useTranslations('professional.subscription');
  const searchParams = useSearchParams();

  const { data: subscriptionData, refetch } = useSubscriptionStatus();
  const createCheckout = useCreateCheckoutSession();

  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      refetch();
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams, refetch]);

  const handleActivateSubscription = async () => {
    setIsCreatingCheckout(true);
    try {
      const result = await createCheckout.mutateAsync({
        cancelUrl: `${window.location.origin}/${locale}/professional/subscription?canceled=true`,
        successUrl: `${window.location.origin}/${locale}/professional/subscription?success=true`,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error(t('checkoutError'));
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  // If already subscribed, show a message
  if (subscriptionData?.isSubscribed) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-blue-50/30 p-8'>
        <Card className='w-full max-w-2xl p-8'>
          <div className='text-center'>
            <CheckCircle2 className='mx-auto h-16 w-16 text-green-600' />
            <h1 className='mt-4 text-2xl font-bold text-gray-900'>
              {t('alreadySubscribed')}
            </h1>
            <p className='mt-2 text-gray-600'>
              {t('alreadySubscribedMessage')}
            </p>
            <Link
              className='mt-4 block text-blue-600'
              href='/professional/dashboard'
            >
              📈 {t('goToDashboard')}
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-full bg-blue-50/30'>
      {/* Success Message */}
      {showSuccess && (
        <div className='bg-green-50 p-4'>
          <div className='mx-auto flex max-w-4xl items-center gap-2'>
            <CheckCircle2 className='h-5 w-5 text-green-600' />
            <p className='text-sm font-medium text-green-800'>
              {t('checkoutSuccess')}
            </p>
          </div>
        </div>
      )}

      <div className='mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8'>
        {/* Launch Offer Badge */}
        <div className='mb-6 flex justify-center'>
          <div className='flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2'>
            <Star className='h-4 w-4 fill-blue-600 text-blue-600' />
            <span className='text-sm font-medium text-blue-700'>
              {t('launchOffer')}
            </span>
          </div>
        </div>

        {/* Main Title */}
        <div className='mb-8 text-center'>
          <h1 className='text-4xl font-bold text-gray-900'>{t('title')}</h1>
          <p className='mt-2 text-lg text-gray-600'>{t('tagline')}</p>
        </div>

        {/* Pricing Card */}
        <Card className='mx-auto mb-12 max-w-2xl border-2 border-blue-200 shadow-lg'>
          <div className='p-8'>
            <div className='text-center'>
              <div className='mb-4 text-5xl font-bold text-blue-600'>
                {t('price')}
              </div>
              <p className='mb-6 text-gray-600'>{t('trialInfo')}</p>

              {/* Benefits Checklist */}
              <div className='mb-8 space-y-3 text-left'>
                <div className='flex items-center gap-3'>
                  <CheckCircle2 className='h-5 w-5 flex-shrink-0 text-blue-600' />
                  <span className='text-gray-700'>{t('benefit1')}</span>
                </div>
                <div className='flex items-center gap-3'>
                  <CheckCircle2 className='h-5 w-5 flex-shrink-0 text-blue-600' />
                  <span className='text-gray-700'>{t('benefit2')}</span>
                </div>
                <div className='flex items-center gap-3'>
                  <CheckCircle2 className='h-5 w-5 flex-shrink-0 text-blue-600' />
                  <span className='text-gray-700'>{t('benefit3')}</span>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                className='mb-4 w-full bg-blue-600 text-lg font-semibold hover:bg-blue-700'
                disabled={isCreatingCheckout}
                onClick={handleActivateSubscription}
                size='lg'
              >
                {isCreatingCheckout ? (
                  <>
                    <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                    {t('activating')}
                  </>
                ) : (
                  t('activateButton')
                )}
              </Button>

              {/* Payment Disclaimer */}
              <p className='text-xs text-gray-500'>{t('paymentDisclaimer')}</p>
            </div>
          </div>
        </Card>

        {/* Features Section */}
        <div className='mb-12 text-center'>
          <h2 className='mb-8 text-3xl font-bold text-gray-900'>
            {t('featuresTitle')}
          </h2>

          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            {/* Feature 1: Maximum Visibility */}
            <Card className='p-6'>
              <div className='mb-4 flex justify-center'>
                <div className='rounded-full bg-blue-100 p-3'>
                  <Star className='h-6 w-6 text-blue-600' />
                </div>
              </div>
              <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                {t('feature1Title')}
              </h3>
              <p className='text-sm text-gray-600'>
                {t('feature1Description')}
              </p>
            </Card>

            {/* Feature 2: Qualified Requests */}
            <Card className='p-6'>
              <div className='mb-4 flex justify-center'>
                <div className='rounded-full bg-blue-100 p-3'>
                  <Users className='h-6 w-6 text-blue-600' />
                </div>
              </div>
              <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                {t('feature2Title')}
              </h3>
              <p className='text-sm text-gray-600'>
                {t('feature2Description')}
              </p>
            </Card>

            {/* Feature 3: Integrated Messaging */}
            <Card className='p-6'>
              <div className='mb-4 flex justify-center'>
                <div className='rounded-full bg-blue-100 p-3'>
                  <MessageSquare className='h-6 w-6 text-blue-600' />
                </div>
              </div>
              <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                {t('feature3Title')}
              </h3>
              <p className='text-sm text-gray-600'>
                {t('feature3Description')}
              </p>
            </Card>

            {/* Feature 4: Simple Analytics */}
            <Card className='p-6'>
              <div className='mb-4 flex justify-center'>
                <div className='rounded-full bg-blue-100 p-3'>
                  <BarChart3 className='h-6 w-6 text-blue-600' />
                </div>
              </div>
              <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                {t('feature4Title')}
              </h3>
              <p className='text-sm text-gray-600'>
                {t('feature4Description')}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
