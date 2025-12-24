import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import type { StructureMemberFilters } from '@/features/structure-members/structureMember.model';

import { PaginationOptions } from '@/features/paginations/pagination.model';

import { getStructureProfessionals } from '../services/professional.service';

export function useGetProfessionals(
  filters: StructureMemberFilters = {},
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
      return getStructureProfessionals(structureId, filters, paginationOptions);
    },
    queryKey: [
      'structure-professionals',
      structureId,
      filters,
      paginationOptions,
    ],
  });
}
