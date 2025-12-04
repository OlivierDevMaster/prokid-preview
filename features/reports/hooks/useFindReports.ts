import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { PaginationOptions } from '@/features/paginations/pagination.model';
import { ReportFilters } from '@/features/reports/report.model';

import { findReports } from '../report.service';

export const useFindReports = (
  filters: ReportFilters = {},
  options: PaginationOptions = {}
) => {
  return useQuery({
    enabled: true,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      return findReports(filters, options);
    },
    queryKey: ['reports', filters, options],
  });
};
