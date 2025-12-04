import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

const BillingTabContent = () => {
  const t = useTranslations('admin');

  return (
    <div className='rounded-md border border-gray-200 p-4'>
      <h1 className='text-2xl font-bold text-gray-900'>
        {t('setting.billing')}
      </h1>
      <div className='my-2 flex justify-between gap-4 rounded-md border border-gray-200 bg-blue-50/30 p-4'>
        <div>
          <h2 className='text-lg font-bold text-gray-800'>
            {t('setting.subscriptionStatus')}
          </h2>
          <p className='text-sm text-gray-600'>{t('setting.trialActivated')}</p>
        </div>
        <div>
          <h2 className='text-end text-lg font-bold text-gray-800'>69</h2>
          <p className='text-sm text-gray-600'>{t('setting.remaining')}</p>
        </div>
      </div>
      <div className='my-2 flex flex-col justify-between gap-4 rounded-md border border-gray-200 bg-green-50/30 p-4'>
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
      <div>
        <div className='flex-start flex flex-col'>
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
      </div>
    </div>
  );
};

export default BillingTabContent;
