import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ReportInsert } from '@/features/reports/report.model';

import { createReport } from '../report.service';

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insertData: ReportInsert) => {
      return createReport(insertData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};
