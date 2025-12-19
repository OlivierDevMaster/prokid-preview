'use client';

import { ExternalLink, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  useCreateCheckoutSession,
  useCreatePortalSession,
  useSubscriptionStatus,
} from '@/features/subscriptions/hooks';

export const SubscriptionActionsCard = () => {
  const t = useTranslations('admin');
  const locale = useLocale() as 'en' | 'fr';
  const { data: subscriptionData } = useSubscriptionStatus();
  const createCheckout = useCreateCheckoutSession();
  const createPortal = useCreatePortalSession();

  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [isCreatingPortal, setIsCreatingPortal] = useState(false);

  const hasSubscription = !!subscriptionData?.subscription;
  const isSubscribed = subscriptionData?.isSubscribed ?? false;

  const handleCreateCheckout = async () => {
    setIsCreatingCheckout(true);
    try {
      const result = await createCheckout.mutateAsync({
        cancelUrl: `${window.location.origin}/${locale}/professional/settings?canceled=true`,
        successUrl: `${window.location.origin}/${locale}/professional/settings?success=true`,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  const handleCreatePortal = async () => {
    setIsCreatingPortal(true);
    try {
      const result = await createPortal.mutateAsync({
        returnUrl: `${window.location.origin}/${locale}/professional/settings`,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Error creating portal:', error);
    } finally {
      setIsCreatingPortal(false);
    }
  };

  return (
    <Card className='rounded-lg border border-gray-200 bg-white p-6'>
      <div className='space-y-4'>
        <div>
          <h2 className='text-lg font-bold text-blue-900'>
            {t('setting.afterTrial')}
          </h2>
          <p className='mt-1 text-sm text-gray-600'>
            {t('setting.subscriptionStart')}
          </p>
        </div>
        <div className='grid grid-cols-2 gap-2'>
          {!isSubscribed ? (
            <Button
              className='bg-blue-500 text-white hover:bg-blue-600'
              disabled={isCreatingCheckout}
              onClick={handleCreateCheckout}
            >
              {isCreatingCheckout ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {t('setting.creating')}
                </>
              ) : (
                t('setting.activate')
              )}
            </Button>
          ) : (
            <Button
              className='bg-blue-500 text-white hover:bg-blue-600'
              disabled
            >
              {t('setting.activate')}
            </Button>
          )}
          <Button
            disabled={isCreatingPortal || !hasSubscription}
            onClick={handleCreatePortal}
            variant='outline'
          >
            {isCreatingPortal ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {t('setting.opening')}
              </>
            ) : (
              <>
                <ExternalLink className='mr-2 h-4 w-4' />
                {t('setting.manageMySubscription')}
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
