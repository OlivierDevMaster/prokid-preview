import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { PaginationOptions } from '@/features/paginations/pagination.model';
import { ProfessionalFilters } from '@/features/professionals/professional.model';

import { getProfessionals } from '../professional.service';

export const useFindProfessionals = (
  filters: ProfessionalFilters = {},
  options: PaginationOptions = {}
) => {
  console.info({ filters, options });
  return useQuery({
    enabled: true,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      return getProfessionals(filters, options);
    },
    queryKey: ['professionals', filters, options],
  });
};
