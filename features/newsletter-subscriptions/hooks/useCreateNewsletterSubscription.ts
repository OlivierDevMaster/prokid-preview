import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateNewsletterSubscriptionRequestBody } from '../newsletterSubscription.model';

import { createNewsletterSubscription } from '../newsletterSubscription.service';

export const useCreateNewsletterSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateNewsletterSubscriptionRequestBody) => {
      return createNewsletterSubscription(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscriptions'] });
    },
  });
};
