import { useQuery } from '@tanstack/react-query';

import type { Report } from '@/services/admin/reports/report.types';

import { getUserReports2 } from '../services/report.service';

export function useReports(
  structureId?: null | string,
  missionId?: null | string
) {
  return useQuery<Report[], Error>({
    queryFn: async () => {
      const reports = await getUserReports2(structureId, missionId);
      return reports;
    },
    queryKey: ['reports', structureId, missionId],
  });
}
