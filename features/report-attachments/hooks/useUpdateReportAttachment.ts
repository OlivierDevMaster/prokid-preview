import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import type { UpdateReportAttachmentParams } from '../report-attachment.model';

import { updateReportAttachment } from '../report-attachment.service';

export function useUpdateReportAttachment() {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.report');

  return useMutation({
    mutationFn: async (params: UpdateReportAttachmentParams) => {
      return updateReportAttachment(params);
    },
    onError: error => {
      toast.error(
        error instanceof Error
          ? error.message
          : t('messages.errorUpdatingAttachment') || 'Error updating attachment'
      );
    },
    onSuccess: () => {
      // Invalidate reports to refresh the attachments list
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report-attachments'] });
      queryClient.invalidateQueries({ queryKey: ['get-report'] });
      toast.success(
        t('messages.attachmentUpdatedSuccessfully') ||
          'Attachment updated successfully'
      );
    },
  });
}
