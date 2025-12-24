import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { PaginationOptions } from '@/features/paginations/pagination.model';

import type { StructureMemberFilters } from '../structureMember.model';

import { getStructuresForProfessional } from '../structureMember.service';

export const useStructuresForProfessional = (
  professionalId: string,
  filters: StructureMemberFilters = {},
  options: PaginationOptions = {}
) => {
  return useQuery({
    enabled: !!professionalId,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      return getStructuresForProfessional(professionalId, filters, options);
    },
    queryKey: [
      'structure-members',
      'structures-for-professional',
      professionalId,
      filters,
      options,
    ],
  });
};
