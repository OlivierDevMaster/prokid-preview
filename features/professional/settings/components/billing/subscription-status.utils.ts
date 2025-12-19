import type { SubscriptionStatus as SubscriptionStatusType } from '@/features/subscriptions/subscription.model';

import {
  SubscriptionStatus,
  SubscriptionStatusLabel,
} from '@/features/subscriptions/subscription.model';

export const getStatusLabel = (
  status: null | SubscriptionStatusType,
  locale: 'en' | 'fr'
): string => {
  if (!status) return 'No subscription';
  return SubscriptionStatusLabel[locale][status];
};

export const getStatusColor = (
  status: null | SubscriptionStatusType
): string => {
  if (!status) return 'bg-gray-100 text-gray-800';
  switch (status) {
    case SubscriptionStatus.active:
      return 'bg-green-100 text-green-800';
    case SubscriptionStatus.canceled:
      return 'bg-red-100 text-red-800';
    case SubscriptionStatus.past_due:
      return 'bg-yellow-100 text-yellow-800';
    case SubscriptionStatus.trialing:
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
