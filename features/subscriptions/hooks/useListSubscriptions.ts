import { useQuery } from '@tanstack/react-query';

import { listSubscriptions } from '../subscription.service';

export const useListSubscriptions = () => {
  return useQuery({
    queryFn: listSubscriptions,
    queryKey: ['subscriptions-list'],
  });
};
