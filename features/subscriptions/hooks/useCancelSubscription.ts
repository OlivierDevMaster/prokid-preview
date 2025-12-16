import { useMutation } from '@tanstack/react-query';

import type { CancelSubscriptionRequestBody } from '../subscription.model';

import { cancelSubscription } from '../subscription.service';

export const useCancelSubscription = () => {
  return useMutation({
    mutationFn: async (body: CancelSubscriptionRequestBody) => {
      return cancelSubscription(body);
    },
  });
};
