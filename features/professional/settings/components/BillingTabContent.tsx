import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSubscriptionStatus } from '@/features/subscriptions/hooks/useSubscriptionStatus';

const BillingTabContent = () => {
  const t = useTranslations('admin');
  const { data: subscriptionData } = useSubscriptionStatus();

  console.info({ subscriptionData });

  return (
    <div className='space-y-6'>
      <Card className='rounded-lg border border-gray-200 bg-blue-50/30 p-6'>
        <div className='flex justify-between gap-4'>
          <div>
            <h2 className='text-lg font-bold text-gray-800'>
              {t('setting.subscriptionStatus')}
            </h2>
            <p className='text-sm text-gray-600'>
              {t('setting.trialActivated')}
            </p>
          </div>
          <div>
            <h2 className='text-end text-lg font-bold text-gray-800'>69</h2>
            <p className='text-sm text-gray-600'>{t('setting.remaining')}</p>
          </div>
        </div>
      </Card>

      <Card className='rounded-lg border border-gray-200 bg-green-50/30 p-6'>
        <div className='flex flex-col justify-between gap-4'>
          <div>
            <h2 className='text-lg font-bold text-gray-800'>
              {t('setting.afterTrial')}
            </h2>
            <p className='text-sm text-gray-600'>
              {t('setting.subscriptionStart')}
            </p>
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <Button className='rounded-lg bg-blue-600 text-white hover:bg-blue-700'>
              {t('setting.activate')}
            </Button>
            <Button className='rounded-lg' variant='outline'>
              {t('setting.manageMySubscription')}
            </Button>
          </div>
        </div>
      </Card>

      <Card className='rounded-lg border border-gray-200 bg-white p-6'>
        <div className='flex flex-col'>
          <div className='text-lg font-bold text-gray-800'>
            {t('setting.information')}
          </div>
          <div className='flex items-center gap-2 py-2'>
            <div className='h-3 w-3 rounded-full bg-blue-400'></div>
            <div className='text-gray-700'>{t('setting.stripePayment')}</div>
          </div>
          <div className='flex items-center gap-2 py-2'>
            <div className='h-3 w-3 rounded-full bg-blue-400'></div>
            <div className='text-gray-700'>{t('setting.freeCancellation')}</div>
          </div>
          <div className='flex items-center gap-2 py-2'>
            <div className='h-3 w-3 rounded-full bg-blue-400'></div>
            <div className='text-gray-700'>
              {t('setting.invoicesAvailableInStripePortal')}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BillingTabContent;
