'use client';

import { useQuery } from '@tanstack/react-query';

import { findReports } from '@/features/reports/report.service';

export function useLastReportForMission(missionId: null | string) {
  return useQuery({
    enabled: !!missionId,
    queryFn: async () => {
      if (!missionId) {
        return null;
      }

      const result = await findReports(
        {
          missionId,
        },
        { limit: 1, page: 1 }
      );

      return result.data[0] ?? null;
    },
    queryKey: ['last-report-mission', missionId],
  });
}
