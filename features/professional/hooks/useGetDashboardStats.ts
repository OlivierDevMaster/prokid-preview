'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { findMissions } from '@/features/missions/mission.service';
import { findReports } from '@/features/reports/report.service';
import { getStructuresForProfessional } from '@/features/structure-members/structureMember.service';

export function useGetDashboardStats() {
  const { data: session } = useSession();
  const professionalId = session?.user?.id;

  // Fetch structures count
  const { data: structuresResult } = useQuery({
    enabled: !!professionalId,
    queryFn: async () => {
      if (!professionalId) {
        throw new Error('Professional ID is required');
      }
      return getStructuresForProfessional(
        professionalId,
        {},
        { limit: 1, page: 1 }
      );
    },
    queryKey: ['professional-dashboard-structures', professionalId],
  });

  // Fetch missions count
  const { data: missionsResult } = useQuery({
    enabled: !!professionalId,
    queryFn: async () => {
      if (!professionalId) {
        throw new Error('Professional ID is required');
      }
      return findMissions(
        { professional_id: professionalId },
        { limit: 1, page: 1 }
      );
    },
    queryKey: ['professional-dashboard-missions', professionalId],
  });

  // Fetch reports count
  const { data: reportsResult } = useQuery({
    enabled: !!professionalId,
    queryFn: async () => {
      if (!professionalId) {
        throw new Error('Professional ID is required');
      }
      return findReports({ authorId: professionalId }, { limit: 1, page: 1 });
    },
    queryKey: ['professional-dashboard-reports', professionalId],
  });

  return {
    missionsCount: missionsResult?.count ?? 0,
    reportsCount: reportsResult?.count ?? 0,
    structuresCount: structuresResult?.count ?? 0,
  };
}
