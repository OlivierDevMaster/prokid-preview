import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { PaginationOptions } from '@/features/paginations/pagination.model';

import type { NewsletterSubscriptionFilters } from '../newsletterSubscription.model';

import { findNewsletterSubscriptions } from '../newsletterSubscription.service';

export const useFindNewsletterSubscriptions = (
  filters: NewsletterSubscriptionFilters = {},
  options: PaginationOptions = {}
) => {
  return useQuery({
    enabled: true,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      return findNewsletterSubscriptions(filters, options);
    },
    queryKey: ['newsletter-subscriptions', filters, options],
  });
};
