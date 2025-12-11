import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { deleteReportAttachment } from '../report-attachment.service';

export function useDeleteReportAttachment() {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.report');

  return useMutation({
    mutationFn: async (attachmentId: string) => {
      return deleteReportAttachment(attachmentId);
    },
    onError: error => {
      toast.error(
        error instanceof Error
          ? error.message
          : t('messages.errorDeletingAttachment') || 'Error deleting attachment'
      );
    },
    onSuccess: () => {
      // Invalidate reports to refresh the attachments list
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report-attachments'] });
      queryClient.invalidateQueries({ queryKey: ['get-report'] });
      toast.success(
        t('messages.attachmentDeletedSuccessfully') ||
          'Attachment deleted successfully'
      );
    },
  });
}
