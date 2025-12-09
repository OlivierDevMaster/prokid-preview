import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { PaginationOptions } from '@/features/paginations/pagination.model';

import type { StructureMemberFilters } from '../structureMember.model';

import { getProfessionalsForStructure } from '../structureMember.service';

export const useProfessionalsForStructure = (
  structureId: string,
  filters: StructureMemberFilters = {},
  options: PaginationOptions = {}
) => {
  return useQuery({
    enabled: !!structureId,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      return getProfessionalsForStructure(structureId, filters, options);
    },
    queryKey: [
      'structure-members',
      'professionals-for-structure',
      structureId,
      filters,
      options,
    ],
  });
};
