import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import type { UploadReportAttachmentParams } from '../report-attachment.model';

import { uploadReportAttachment } from '../report-attachment.service';

export function useUploadReportAttachment() {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.report');

  return useMutation({
    mutationFn: async (params: UploadReportAttachmentParams) => {
      return uploadReportAttachment(params);
    },
    onError: error => {
      toast.error(
        error instanceof Error
          ? error.message
          : t('messages.errorUploadingAttachment') ||
              'Error uploading attachment'
      );
    },
    onSuccess: (data, variables) => {
      // Invalidate reports to refresh the attachments list
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({
        queryKey: ['report-attachments', variables.reportId],
      });
      queryClient.invalidateQueries({ queryKey: ['get-report'] });
      toast.success(
        t('messages.attachmentUploadedSuccessfully') ||
          'Attachment uploaded successfully'
      );
    },
  });
}
