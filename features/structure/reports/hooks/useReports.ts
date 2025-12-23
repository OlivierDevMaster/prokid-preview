import { useQuery } from '@tanstack/react-query';

import { type Report, ReportStatus } from '@/features/reports/report.model';

import { getStructureReports } from '../services/report.service';

export function useReports(
  professionalId?: null | string,
  missionId?: null | string
) {
  return useQuery<Report[], Error>({
    queryFn: async () => {
      const reports = await getStructureReports(
        professionalId,
        missionId,
        ReportStatus.sent
      );
      return reports;
    },
    queryKey: [
      'structure-reports',
      professionalId,
      missionId,
      ReportStatus.sent,
    ],
  });
}
