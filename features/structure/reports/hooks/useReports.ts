import { useQuery } from '@tanstack/react-query';

import type { Report } from '@/features/reports/report.model';

import { getStructureReports } from '../services/report.service';

export function useReports(professionalId?: null | string) {
  return useQuery<Report[], Error>({
    queryFn: async () => {
      const reports = await getStructureReports(professionalId);
      return reports;
    },
    queryKey: ['structure-reports', professionalId],
  });
}
