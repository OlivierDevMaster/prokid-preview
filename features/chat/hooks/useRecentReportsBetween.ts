import { useQuery } from '@tanstack/react-query';

import type { Report } from '@/features/reports/report.model';

import { getUserReports2 } from '@/features/professional/reports/services/report.service';
import { ReportStatus } from '@/features/reports/report.model';
import { getStructureReports } from '@/features/structure/reports/services/report.service';

import type { ViewRole } from '../types/chat.types';

const LIMIT = 3;

export function useRecentReportsBetween(
  structureId: null | string,
  professionalId: null | string,
  viewRole: ViewRole
) {
  const enabled = viewRole === 'structure' ? !!professionalId : !!structureId;

  const query = useQuery({
    enabled,
    queryFn: async (): Promise<Report[]> => {
      if (viewRole === 'structure' && professionalId) {
        const reports = await getStructureReports(
          professionalId,
          undefined,
          ReportStatus.sent
        );
        return reports.slice(0, LIMIT);
      }
      if (viewRole === 'professional' && structureId) {
        const reports = await getUserReports2(structureId, undefined);
        return reports.slice(0, LIMIT);
      }
      return [];
    },
    queryKey: ['chat-recent-reports', structureId, professionalId, viewRole],
  });

  return {
    data: query.data ?? [],
    error: query.error,
    isLoading: query.isLoading,
  };
}
