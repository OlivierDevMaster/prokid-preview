'use client';

import { useTranslations } from 'next-intl';

import { Card } from '@/components/ui/card';

export const BillingInformationCard = () => {
  const t = useTranslations('admin');

  return (
    <Card className='rounded-lg border border-gray-200 bg-white p-6'>
      <div className='space-y-4'>
        <h2 className='text-lg font-bold text-blue-900'>
          {t('setting.information')}
        </h2>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <div className='h-3 w-3 rounded-full bg-blue-400'></div>
            <div className='text-sm text-gray-700'>
              {t('setting.stripePayment')}
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <div className='h-3 w-3 rounded-full bg-blue-400'></div>
            <div className='text-sm text-gray-700'>
              {t('setting.freeCancellation')}
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <div className='h-3 w-3 rounded-full bg-blue-400'></div>
            <div className='text-sm text-gray-700'>
              {t('setting.invoicesAvailableInStripePortal')}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
