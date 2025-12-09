import { useQuery } from '@tanstack/react-query';

import type { Report } from '@/services/admin/reports/report.types';

import { createClient } from '@/lib/supabase/client';

import { getUserReports2 } from '../services/report.service';

export function useReports() {
  return useQuery<Report[], Error>({
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        return [];
      }

      const reports = await getUserReports2();
      return reports;
    },
    queryKey: ['reports'],
  });
}
