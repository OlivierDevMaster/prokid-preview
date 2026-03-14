import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { PaginationOptions } from '@/features/paginations/pagination.model';
import { ProfessionalFilters } from '@/features/professionals/professional.model';

import { getProfessionals } from '../professional.service';

export const useFindProfessionals = (
  filters: ProfessionalFilters = {},
  options: PaginationOptions = {}
) => {
  const { enabled = true, ...queryOptions } = options;
  return useQuery({
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      return getProfessionals(filters, queryOptions);
    },
    queryKey: ['professionals', filters, queryOptions],
  });
};
