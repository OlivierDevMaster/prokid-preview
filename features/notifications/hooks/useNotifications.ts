import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { PaginationOptions } from '@/features/paginations/pagination.model';

import type { NotificationFilters } from '../notification.model';

import { findNotifications } from '../notification.service';

export const useNotifications = (
  filters: NotificationFilters = {},
  options: PaginationOptions = {}
) => {
  return useQuery({
    enabled: true,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      return findNotifications(filters, options);
    },
    queryKey: ['notifications', filters, options],
  });
};
