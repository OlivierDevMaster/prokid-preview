'use client';

import { useQuery } from '@tanstack/react-query';

import { findReports } from '@/features/reports/report.service';

export function useLastReport(
  professionalId: null | string,
  structureId: null | string
) {
  return useQuery({
    enabled: !!professionalId && !!structureId,
    queryFn: async () => {
      if (!professionalId || !structureId) {
        return null;
      }

      const result = await findReports(
        {
          authorId: professionalId,
          structureId,
        },
        { limit: 1, page: 1 }
      );

      return result.data[0] ?? null;
    },
    queryKey: ['last-report', professionalId, structureId],
  });
}
