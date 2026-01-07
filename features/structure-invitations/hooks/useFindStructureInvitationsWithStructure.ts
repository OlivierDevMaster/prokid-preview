import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { PaginationOptions } from '@/features/paginations/pagination.model';

import type { StructureInvitationFilters } from '../structureInvitation.model';
import type { StructureInvitationWithStructure } from '../structureInvitation.service';

import { findStructureInvitationsWithStructure } from '../structureInvitation.service';

export const useFindStructureInvitationsWithStructure = (
  filters: StructureInvitationFilters = {},
  options: PaginationOptions = {}
) => {
  return useQuery<{
    count: number;
    data: StructureInvitationWithStructure[];
  }>({
    enabled: true,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      return findStructureInvitationsWithStructure(filters, options);
    },
    queryKey: ['structure-invitations-with-structure', filters, options],
  });
};
