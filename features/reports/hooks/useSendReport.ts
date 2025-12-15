import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sendReport } from '../report.service';

export const useSendReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string) => {
      return sendReport(reportId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
    },
  });
};
