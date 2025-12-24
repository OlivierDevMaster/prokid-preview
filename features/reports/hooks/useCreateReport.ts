import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Report, ReportInsert } from '@/features/reports/report.model';

import { createReport } from '../report.service';

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation<Report, Error, ReportInsert>({
    mutationFn: async (insertData: ReportInsert): Promise<Report> => {
      const result = await createReport(insertData);
      return result;
    },
    onSuccess: data => {
      console.log('useCreateReport onSuccess with data:', data);
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};
