import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { PaginationOptions } from '@/features/paginations/pagination.model';
import { StructureFilters } from '@/features/structures/structure.model';

import { getStructures } from '../structure.service';

export const useFindStructures = (
  filters: StructureFilters = {},
  options: PaginationOptions = {}
) => {
  return useQuery({
    enabled: true,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      return getStructures(filters, options);
    },
    queryKey: ['structures', filters, options],
  });
};
