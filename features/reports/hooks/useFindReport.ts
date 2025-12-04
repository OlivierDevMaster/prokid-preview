import { useQuery } from '@tanstack/react-query';

import { Report } from '@/features/reports/report.model';

import { findReport } from '../report.service';

export const useFindReport = (reportId: null | string | undefined) => {
  return useQuery<null | Report, Error>({
    enabled: !!reportId,
    queryFn: async () => {
      if (!reportId) {
        return null;
      }

      const report = await findReport(reportId);

      return report;
    },
    queryKey: ['report', reportId],
  });
};
