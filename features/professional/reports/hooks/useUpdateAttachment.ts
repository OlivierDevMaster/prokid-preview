import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  updateAttachment,
  type UpdateAttachmentParams,
} from '../services/attachment.service';

export function useUpdateAttachment() {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.report');

  return useMutation({
    mutationFn: async (params: UpdateAttachmentParams) => {
      return updateAttachment(params);
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
