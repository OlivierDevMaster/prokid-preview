import { useQuery } from '@tanstack/react-query';

import type { PaginationOptions } from '@/features/paginations/pagination.model';

import { getRatingsForStructure } from '../services/rating.service';

export const useRatingsForStructure = (
  structureId: string | undefined,
  paginationOptions: PaginationOptions = {}
) => {
  return useQuery({
    enabled: !!structureId,
    queryFn: async () => {
      if (!structureId) {
        return { count: 0, data: [] };
      }
      return getRatingsForStructure(structureId, paginationOptions);
    },
    queryKey: [
      'ratings-for-structure',
      structureId,
      paginationOptions.page,
      paginationOptions.limit,
    ],
  });
};
