import { useQuery } from '@tanstack/react-query';

import { getStructureReport } from '../services/report.service';

export function useGetReport(reportId: null | string | undefined) {
  return useQuery({
    enabled: !!reportId,
    queryFn: async () => {
      if (!reportId) {
        return { report: null };
      }
      return await getStructureReport(reportId);
    },
    queryKey: ['structure-report', reportId],
  });
}
