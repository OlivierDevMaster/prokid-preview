import { useQuery } from '@tanstack/react-query';

import { getProfessionalReport } from '../services/getReport';

export function useGetProfessionalReport(reportId: null | string | undefined) {
  return useQuery({
    enabled: !!reportId,
    queryFn: async () => {
      if (!reportId) {
        return { report: null };
      }
      return await getProfessionalReport(reportId);
    },
    queryKey: ['professional-report', reportId],
  });
}
