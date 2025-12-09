import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { PaginationOptions } from '@/features/paginations/pagination.model';

import type { MissionFilters } from '../mission.model';

import { findMissions } from '../mission.service';

export const useFindMissions = (
  filters: MissionFilters = {},
  options: PaginationOptions = {}
) => {
  return useQuery({
    enabled: true,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      return findMissions(filters, options);
    },
    queryKey: ['missions', filters, options],
  });
};
