'use client';

import {
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
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
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Handle successful payment return from Stripe
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setPaymentSuccess(true);
      toast.success(t('checkoutSuccess'));
      window.history.replaceState({}, '', window.location.pathname);
      const interval = setInterval(() => {
        refetch();
      }, 2000);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once subscription is confirmed in DB, redirect to dashboard
  useEffect(() => {
    if (subscriptionData?.isSubscribed) {
      window.location.href = `/${locale}/professional/dashboard`;
    }
  }, [subscriptionData?.isSubscribed, locale]);

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

  // Show manual continue button after timeout
  const [showManualContinue, setShowManualContinue] = useState(false);
  useEffect(() => {
    if (paymentSuccess) {
      const timer = setTimeout(() => setShowManualContinue(true), 6000);
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess]);

  // Payment just completed, waiting for webhook
  if (paymentSuccess && !subscriptionData?.isSubscribed) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-50 p-8'>
        <Card className='w-full max-w-md rounded-xl p-8'>
          <div className='text-center'>
            {showManualContinue ? (
              <>
                <CheckCircle2 className='mx-auto h-10 w-10 text-green-600' />
                <h1 className='mt-4 text-xl font-bold text-slate-900'>
                  Paiement confirmé
                </h1>
                <p className='mt-2 text-sm text-slate-500'>
                  Votre abonnement est en cours d&apos;activation.
                </p>
                <Button
                  className='mt-4 h-10 w-full rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700'
                  onClick={() => { window.location.href = `/${locale}/professional/dashboard`; }}
                >
                  Continuer vers le dashboard
                </Button>
              </>
            ) : (
              <>
                <Loader2 className='mx-auto h-10 w-10 animate-spin text-blue-600' />
                <h1 className='mt-4 text-xl font-bold text-slate-900'>
                  Activation en cours...
                </h1>
                <p className='mt-2 text-sm text-slate-500'>
                  Votre paiement a été accepté. Redirection automatique.
                </p>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Already subscribed
  if (subscriptionData?.isSubscribed) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-50 p-8'>
        <Card className='w-full max-w-md rounded-xl p-8'>
          <div className='text-center'>
            <CheckCircle2 className='mx-auto h-10 w-10 text-green-600' />
            <h1 className='mt-4 text-xl font-bold text-slate-900'>
              Abonnement actif
            </h1>
            <p className='mt-2 text-sm text-slate-500'>
              Redirection vers votre tableau de bord...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-full bg-white'>
      {/* Hero Section */}
      <div className='bg-slate-50 px-4 pb-16 pt-12 sm:px-6'>
        <div className='mx-auto max-w-4xl text-center'>
          <h1 className='text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl'>
            {t('title')}
          </h1>
          <p className='mx-auto mt-3 max-w-lg text-base text-slate-500'>
            {t('tagline')}
          </p>
        </div>

        {/* Pricing Card */}
        <div className='mx-auto mt-10 max-w-sm'>
          <Card className='overflow-hidden rounded-2xl border border-slate-200 shadow-lg'>
            <div className='p-6'>
              {/* Plan header */}
              <div className='mb-4 flex items-baseline justify-between'>
                <div>
                  <span className='mb-1 inline-block rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700'>
                    Plan Premium
                  </span>
                  <h3 className='mt-1 text-lg font-bold text-slate-900'>
                    Abonnement ProKid Pro
                  </h3>
                </div>
                <div className='text-right'>
                  <span className='text-3xl font-extrabold text-slate-900'>9,99€</span>
                  <span className='text-sm text-slate-500'>/mois</span>
                </div>
              </div>

              {/* Trial badge */}
              <div className='mb-4 flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white'>
                <CheckCircle2 className='h-4 w-4 shrink-0' />
                {t('benefit1')}
              </div>

              {/* Benefits */}
              <div className='mb-5 space-y-2.5'>
                <div className='flex items-center gap-2.5'>
                  <CheckCircle2 className='h-4 w-4 shrink-0 text-blue-600' />
                  <span className='text-sm text-slate-700'>{t('benefit1')}</span>
                </div>
                <div className='flex items-center gap-2.5'>
                  <CheckCircle2 className='h-4 w-4 shrink-0 text-blue-600' />
                  <span className='text-sm text-slate-700'>{t('benefit2')}</span>
                </div>
                <div className='flex items-center gap-2.5'>
                  <CheckCircle2 className='h-4 w-4 shrink-0 text-blue-600' />
                  <span className='text-sm text-slate-700'>{t('benefit3')}</span>
                </div>
              </div>

              {/* CTA */}
              <Button
                className='h-11 w-full rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700'
                disabled={isCreatingCheckout}
                onClick={handleActivateSubscription}
              >
                {isCreatingCheckout ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    {t('activating')}
                  </>
                ) : (
                  t('activateButton')
                )}
              </Button>

              <p className='mt-3 text-center text-[11px] text-slate-400'>
                {t('paymentDisclaimer')}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className='px-4 py-12 sm:px-6'>
        <h2 className='mb-6 text-center text-xl font-bold text-slate-900'>
          {t('featuresTitle')}
        </h2>

        <div className='mx-auto grid max-w-2xl gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2'>
          <div className='bg-white p-5'>
            <h3 className='mb-1 text-sm font-semibold text-slate-900'>
              {t('feature1Title')}
            </h3>
            <p className='text-xs leading-relaxed text-slate-500'>
              {t('feature1Description')}
            </p>
          </div>
          <div className='bg-white p-5'>
            <h3 className='mb-1 text-sm font-semibold text-slate-900'>
              {t('feature2Title')}
            </h3>
            <p className='text-xs leading-relaxed text-slate-500'>
              {t('feature2Description')}
            </p>
          </div>
          <div className='bg-white p-5'>
            <h3 className='mb-1 text-sm font-semibold text-slate-900'>
              {t('feature3Title')}
            </h3>
            <p className='text-xs leading-relaxed text-slate-500'>
              {t('feature3Description')}
            </p>
          </div>
          <div className='bg-white p-5'>
            <h3 className='mb-1 text-sm font-semibold text-slate-900'>
              {t('feature4Title')}
            </h3>
            <p className='text-xs leading-relaxed text-slate-500'>
              {t('feature4Description')}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className='mx-4 mb-8 rounded-2xl bg-blue-600 px-6 py-8 sm:mx-auto sm:max-w-2xl'>
        <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
          <div>
            <h3 className='text-lg font-bold text-white'>
              Prêt à développer votre activité ?
            </h3>
            <p className='mt-1 text-sm text-blue-100'>
              Rejoignez les professionnels qui font confiance à ProKid.
            </p>
          </div>
          <Button
            className='h-10 shrink-0 rounded-xl bg-white px-6 font-semibold text-blue-600 hover:bg-blue-50'
            disabled={isCreatingCheckout}
            onClick={handleActivateSubscription}
          >
            {t('activateButton')}
          </Button>
        </div>
      </div>
    </div>
  );
}
