import { useQuery } from '@tanstack/react-query';

import { getReportAttachment } from '../report-attachment.service';

export function useGetReportAttachment(attachmentId: null | string) {
  return useQuery({
    enabled: attachmentId !== null,
    queryFn: async () => {
      if (!attachmentId) return null;
      return getReportAttachment(attachmentId);
    },
    queryKey: ['report-attachment', attachmentId],
  });
}
