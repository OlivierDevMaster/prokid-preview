import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { MissionFilters } from '@/features/missions/mission.model';

import { PaginationOptions } from '@/features/paginations/pagination.model';

import { getAdminMissions } from '../services/mission.service';

export const useFindMissions = (
  filters: MissionFilters = {},
  options: PaginationOptions = {}
) => {
  return useQuery({
    enabled: true,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      return getAdminMissions(filters, options);
    },
    queryKey: ['admin', 'missions', filters, options],
  });
};
