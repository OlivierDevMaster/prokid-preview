import { useQuery } from '@tanstack/react-query';

import type { NewsletterSubscription } from '../newsletterSubscription.model';

import { findNewsletterSubscription } from '../newsletterSubscription.service';

export const useFindNewsletterSubscription = (
  subscriptionId: null | string | undefined
) => {
  return useQuery<NewsletterSubscription | null, Error>({
    enabled: !!subscriptionId,
    queryFn: async () => {
      if (!subscriptionId) {
        return null;
      }

      const subscription = await findNewsletterSubscription(subscriptionId);

      return subscription;
    },
    queryKey: ['newsletter-subscription', subscriptionId],
  });
};
