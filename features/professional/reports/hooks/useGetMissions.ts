import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { MissionStatus } from '@/features/missions/mission.model';
import { createClient } from '@/lib/supabase/client';

export function useGetMissions() {
  const { data: session } = useSession();
  const professionalId = session?.user?.id;

  return useQuery({
    enabled: !!professionalId,
    queryFn: async () => {
      if (!professionalId) {
        throw new Error('Professional ID is required');
      }
      const supabase = createClient();

      // Get only accepted and ended missions for the professional with structure info
      const { data, error } = await supabase
        .from('missions')
        .select(
          `
          *,
          structure:structures(
            *,
            profile:profiles(*)
          )
        `
        )
        .eq('professional_id', professionalId)
        .in('status', [MissionStatus.accepted, MissionStatus.ended])
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        count: data?.length ?? 0,
        data: data ?? [],
      };
    },
    queryKey: ['professional-missions', professionalId],
  });
}
