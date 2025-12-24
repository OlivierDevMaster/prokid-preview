import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useRouter } from '@/i18n/routing';

import { deleteReport } from '../report.service';

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations('admin.report');

  return useMutation({
    mutationFn: async (reportId: string) => {
      return deleteReport(reportId);
    },
    onError: error => {
      toast.error(
        error instanceof Error
          ? error.message
          : t('messages.errorDeletingReport') || 'Error deleting report'
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['get-report'] });
      toast.success(
        t('messages.reportDeletedSuccessfully') || 'Report deleted successfully'
      );
      router.push('/professional/reports');
    },
  });
};
