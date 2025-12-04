import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { AvailabilityFilters } from '@/features/availabilities/availability.model';
import { PaginationOptions } from '@/features/paginations/pagination.model';

import { getAvailabilities } from '../availability.service';

export const useFindAvailabilities = (
  filters: AvailabilityFilters = {},
  options: PaginationOptions = {}
) => {
  return useQuery({
    enabled: true,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      return getAvailabilities(filters, options);
    },
    queryKey: ['availabilities', filters, options],
  });
};
