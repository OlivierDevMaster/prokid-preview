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

      // getUserReports now uses the edge function which handles authentication
      // The userId parameter is kept for compatibility but the edge function
      // will use the authenticated user from the token
      const reports = await getUserReports2(session.user.id);
      return reports;
    },
    queryKey: ['reports'],
  });
}
