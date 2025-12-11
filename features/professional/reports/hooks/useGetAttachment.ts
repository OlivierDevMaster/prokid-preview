import { useQuery } from '@tanstack/react-query';

import { getAttachmentById } from '../services/attachment.service';

export function useGetAttachment(attachmentId: null | string) {
  return useQuery({
    enabled: attachmentId !== null,
    queryFn: async () => {
      if (!attachmentId) return null;
      return getAttachmentById(attachmentId);
    },
    queryKey: ['attachment', attachmentId],
  });
}
