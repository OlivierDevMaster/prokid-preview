import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import type { MissionFilters } from '@/features/missions/mission.model';

import { PaginationOptions } from '@/features/paginations/pagination.model';

import { getStructureMissions } from '../services/mission.service';

export function useGetMissions(
  filters: Omit<MissionFilters, 'structure_id'> = {},
  paginationOptions: PaginationOptions = {}
) {
  const { data: session } = useSession();
  const structureId = session?.user?.id;

  return useQuery({
    enabled: !!structureId,
    queryFn: async () => {
      if (!structureId) {
        throw new Error('Structure ID is required');
      }
      return getStructureMissions(structureId, filters, paginationOptions);
    },
    queryKey: ['structure-missions', structureId, filters, paginationOptions],
  });
}
