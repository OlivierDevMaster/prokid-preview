import { useQuery } from '@tanstack/react-query';

import type { PaginationOptions } from '@/features/paginations/pagination.model';

import { getRatingsForProfessional } from '../services/rating.service';

export const useRatingsForProfessional = (
  professionalId: string | undefined,
  paginationOptions: PaginationOptions = {}
) => {
  return useQuery({
    enabled: !!professionalId,
    queryFn: async () => {
      if (!professionalId) {
        return { count: 0, data: [] };
      }
      return getRatingsForProfessional(professionalId, paginationOptions);
    },
    queryKey: [
      'ratings-for-professional',
      professionalId,
      paginationOptions.page,
      paginationOptions.limit,
    ],
  });
};
