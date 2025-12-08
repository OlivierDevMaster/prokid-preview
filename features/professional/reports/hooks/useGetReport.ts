import { useQuery } from '@tanstack/react-query';

import { getReport } from '../services/report.service';

export function useGetReport(reportId: string) {
  return useQuery({
    queryFn: async () => await getReport(reportId),
    queryKey: ['get-report'],
  });
}
