import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { PaginationOptions } from '@/features/paginations/pagination.model';

import type { StructureInvitationFilters } from '../structureInvitation.model';
import type { StructureInvitationWithProfessional } from '../structureInvitation.service';

import { findStructureInvitationsWithProfessional } from '../structureInvitation.service';

export const useFindStructureInvitationsWithProfessional = (
  filters: StructureInvitationFilters = {},
  options: PaginationOptions = {}
) => {
  return useQuery<{
    count: number;
    data: StructureInvitationWithProfessional[];
  }>({
    enabled: true,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      return findStructureInvitationsWithProfessional(filters, options);
    },
    queryKey: ['structure-invitations-with-professional', filters, options],
  });
};
