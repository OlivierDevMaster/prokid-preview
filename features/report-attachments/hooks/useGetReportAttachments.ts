import { useQuery } from '@tanstack/react-query';

import { getReportAttachments } from '../report-attachment.service';

export function useGetReportAttachments(reportId: null | string) {
  return useQuery({
    enabled: reportId !== null,
    queryFn: async () => {
      if (!reportId) return [];
      return getReportAttachments(reportId);
    },
    queryKey: ['report-attachments', reportId],
  });
}
