import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ReportUpdate } from '@/features/reports/report.model';

import { updateReport } from '../report.service';

export const useUpdateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      updateData,
    }: {
      reportId: string;
      updateData: ReportUpdate;
    }) => {
      return updateReport(reportId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};
