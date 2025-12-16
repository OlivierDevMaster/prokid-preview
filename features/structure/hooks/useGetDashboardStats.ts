'use client';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { getProfessionalsForStructure } from '@/features/structure-members/structureMember.service';
import { getStructureMissions } from '@/features/structure/missions/services/mission.service';

export function useGetDashboardStats() {
  const { data: session } = useSession();
  const structureId = session?.user?.id;

  // Fetch professionals count
  const { data: professionalsResult } = useQuery({
    enabled: !!structureId,
    queryFn: async () => {
      if (!structureId) {
        throw new Error('Structure ID is required');
      }
      return getProfessionalsForStructure(
        structureId,
        {},
        { limit: 1, page: 1 }
      );
    },
    queryKey: ['structure-dashboard-professionals', structureId],
  });

  // Fetch missions count
  const { data: missionsResult } = useQuery({
    enabled: !!structureId,
    queryFn: async () => {
      if (!structureId) {
        throw new Error('Structure ID is required');
      }
      return getStructureMissions(structureId, {}, { limit: 1, page: 1 });
    },
    queryKey: ['structure-dashboard-missions', structureId],
  });

  return {
    missionsCount: missionsResult?.count ?? 0,
    professionalsCount: professionalsResult?.count ?? 0,
  };
}
