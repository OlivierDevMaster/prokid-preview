import { useQuery } from '@tanstack/react-query';

import { getSubscriptionStatus } from '../subscription.service';

export const useSubscriptionStatus = () => {
  return useQuery({
    queryFn: getSubscriptionStatus,
    queryKey: ['subscription-status'],
  });
};
