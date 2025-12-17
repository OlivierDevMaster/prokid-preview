import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { PaginationOptions } from '@/features/paginations/pagination.model';
import { findProfessional } from '@/features/professionals/professional.service';

import type { MissionFilters } from '../mission.model';

import { getProfessionalMissions } from '../mission.service';

export function useGetProfessionalMissions(
  filters: Omit<MissionFilters, 'professional_id'> = {},
  paginationOptions: PaginationOptions = {}
) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery({
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const professional = await findProfessional(userId);
      if (!professional) {
        throw new Error('Professional not found');
      }

      return getProfessionalMissions(
        professional.user_id,
        filters,
        paginationOptions
      );
    },
    queryKey: ['professional-missions', userId, filters, paginationOptions],
  });
}
