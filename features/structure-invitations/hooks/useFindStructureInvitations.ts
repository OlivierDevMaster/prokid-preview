import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { PaginationOptions } from '@/features/paginations/pagination.model';

import type { StructureInvitationFilters } from '../structureInvitation.model';

import { findStructureInvitations } from '../structureInvitation.service';

export const useFindStructureInvitations = (
  filters: StructureInvitationFilters = {},
  options: PaginationOptions = {}
) => {
  return useQuery({
    enabled: true,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      return findStructureInvitations(filters, options);
    },
    queryKey: ['structure-invitations', filters, options],
  });
};
