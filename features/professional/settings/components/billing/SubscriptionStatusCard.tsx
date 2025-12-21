'use client';

import { Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Card } from '@/components/ui/card';
import {
  useRemainingTrialDays,
  useSubscriptionStatus,
} from '@/features/subscriptions/hooks';

import { getStatusColor, getStatusLabel } from './subscription-status.utils';

export const SubscriptionStatusCard = () => {
  const t = useTranslations('admin');
  const locale = useLocale() as 'en' | 'fr';
  const { data: subscriptionData, isLoading: isLoadingStatus } =
    useSubscriptionStatus();
  const { isTrialActive, remainingDays } = useRemainingTrialDays();

  const isLoading = isLoadingStatus;
  const hasSubscription = !!subscriptionData?.subscription;

  return (
    <Card className='rounded-lg border border-gray-200 bg-white p-6'>
      <div className='space-y-4'>
        <h2 className='text-lg font-bold text-blue-900'>
          {t('setting.subscriptionStatus')}
        </h2>
        <div className='flex justify-between gap-4'>
          <div className='flex-1'>
            {isLoading ? (
              <div className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin text-gray-600' />
                <p className='text-sm text-gray-600'>{t('setting.loading')}</p>
              </div>
            ) : hasSubscription && subscriptionData.subscription ? (
              <div className='space-y-2'>
                <p className='text-sm text-gray-600'>
                  {subscriptionData.subscription.status === 'trialing'
                    ? t('setting.trialActivated')
                    : getStatusLabel(
                        subscriptionData.subscription.status,
                        locale
                      )}
                </p>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                    subscriptionData.subscription.status
                  )}`}
                >
                  {getStatusLabel(subscriptionData.subscription.status, locale)}
                </span>
              </div>
            ) : (
              <p className='text-sm text-gray-600'>
                {t('setting.noActiveSubscription')}
              </p>
            )}
          </div>
          {isTrialActive && remainingDays !== null && (
            <div className='text-right'>
              <div className='text-2xl font-bold text-gray-800'>
                {remainingDays}
              </div>
              <p className='text-sm text-gray-600'>{t('setting.remaining')}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
