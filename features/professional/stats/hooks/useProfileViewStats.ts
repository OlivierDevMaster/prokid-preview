'use client';

import { useQuery } from '@tanstack/react-query';

import { createClient } from '@/lib/supabase/client';

export interface ProfileViewStats {
  today: number;
  yesterday: number;
  this_week: number;
  last_week: number;
  this_month: number;
  last_month: number;
  total: number;
}

export function useProfileViewStats() {
  return useQuery({
    queryKey: ['profile-view-stats'],
    queryFn: async (): Promise<ProfileViewStats> => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('get_profile_view_stats', {
        p_professional_id: user.id,
      });

      if (error) throw error;
      return data as unknown as ProfileViewStats;
    },
  });
}
