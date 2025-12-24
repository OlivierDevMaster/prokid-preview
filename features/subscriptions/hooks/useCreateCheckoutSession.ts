import { useMutation } from '@tanstack/react-query';

import type { CreateCheckoutSessionRequestBody } from '../subscription.model';

import { createCheckoutSession } from '../subscription.service';

export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: async (body: CreateCheckoutSessionRequestBody) => {
      return createCheckoutSession(body);
    },
  });
};
