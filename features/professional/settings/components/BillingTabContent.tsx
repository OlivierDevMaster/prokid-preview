'use client';

import { BillingInformationCard } from './billing/BillingInformationCard';
import { SubscriptionActionsCard } from './billing/SubscriptionActionsCard';
import { SubscriptionHistoryCard } from './billing/SubscriptionHistoryCard';
import { SubscriptionStatusCard } from './billing/SubscriptionStatusCard';

const BillingTabContent = () => {
  return (
    <div className='space-y-6'>
      <SubscriptionStatusCard />
      <SubscriptionActionsCard />
      <SubscriptionHistoryCard />
      <BillingInformationCard />
    </div>
  );
};

export default BillingTabContent;
