'use client';

import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Card } from '@/components/ui/card';
import { useListSubscriptions } from '@/features/subscriptions/hooks';

import { getStatusColor, getStatusLabel } from './subscription-status.utils';

export const SubscriptionHistoryCard = () => {
  const t = useTranslations('admin');
  const locale = useLocale() as 'en' | 'fr';
  const { data: subscriptions } = useListSubscriptions();

  const dateLocale = locale === 'fr' ? fr : enUS;

  if (!subscriptions || subscriptions.length === 0) {
    return null;
  }

  return (
    <Card className='rounded-lg border border-gray-200 bg-white p-6'>
      <div className='space-y-4'>
        <h2 className='text-lg font-bold text-blue-900'>
          {t('setting.subscriptionHistory')}
        </h2>
        <div className='space-y-3'>
          {subscriptions.map(subscription => (
            <div
              className='rounded-lg border border-gray-200 bg-gray-50 p-4 transition-shadow hover:shadow-md'
              key={subscription.id}
            >
              <div className='space-y-3'>
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                        subscription.status
                      )}`}
                    >
                      {getStatusLabel(subscription.status, locale)}
                    </span>
                    {subscription.cancel_at_period_end && (
                      <span className='rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800'>
                        {t('setting.subscriptionHistoryCancelingAtPeriodEnd')}
                      </span>
                    )}
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-2 border-t border-gray-200 pt-3 sm:grid-cols-2'>
                  <div className='flex items-start gap-2'>
                    <Calendar className='mt-0.5 h-4 w-4 text-gray-400' />
                    <div className='flex-1'>
                      <p className='text-xs font-medium text-gray-500'>
                        {t('setting.subscriptionHistoryCreated')}
                      </p>
                      <p className='text-sm text-gray-700'>
                        {format(
                          new Date(subscription.created_at),
                          'MMM dd, yyyy',
                          { locale: dateLocale }
                        )}
                      </p>
                    </div>
                  </div>

                  {subscription.current_period_start &&
                    subscription.current_period_end && (
                      <div className='flex items-start gap-2'>
                        <Clock className='mt-0.5 h-4 w-4 text-gray-400' />
                        <div className='flex-1'>
                          <p className='text-xs font-medium text-gray-500'>
                            {t('setting.subscriptionHistoryPeriod')}
                          </p>
                          <p className='text-sm text-gray-700'>
                            {format(
                              new Date(subscription.current_period_start),
                              'MMM dd, yyyy',
                              { locale: dateLocale }
                            )}{' '}
                            -{' '}
                            {format(
                              new Date(subscription.current_period_end),
                              'MMM dd, yyyy',
                              { locale: dateLocale }
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                  {subscription.trial_end && (
                    <div className='flex items-start gap-2'>
                      <Clock className='mt-0.5 h-4 w-4 text-gray-400' />
                      <div className='flex-1'>
                        <p className='text-xs font-medium text-gray-500'>
                          {t('setting.subscriptionHistoryTrialEnds')}
                        </p>
                        <p className='text-sm text-gray-700'>
                          {format(
                            new Date(subscription.trial_end),
                            'MMM dd, yyyy',
                            { locale: dateLocale }
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
