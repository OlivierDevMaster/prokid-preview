import { useQuery } from '@tanstack/react-query';

import { getAttachmentDownloadUrl } from '../services/attachment.service';

export function useGetAttachmentDownloadUrl(
  attachmentId: null | string,
  expiresIn: number = 3600
) {
  return useQuery({
    enabled: attachmentId !== null,
    gcTime: expiresIn * 1000, // Garbage collect after expiration
    queryFn: async () => {
      if (!attachmentId) return null;
      return getAttachmentDownloadUrl(attachmentId, expiresIn);
    },
    queryKey: ['attachment-download-url', attachmentId, expiresIn],
    staleTime: expiresIn * 1000 - 60000, // Consider stale 1 minute before expiration
  });
}
