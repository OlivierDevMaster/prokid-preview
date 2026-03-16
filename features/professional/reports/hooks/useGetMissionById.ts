import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { createClient } from '@/lib/supabase/client';

/**
 * Fetches a single mission by id for the current professional (for URL prefill on report create).
 * Includes any status so that pending missions from chat can be pre-selected.
 */
export function useGetMissionById(missionId: null | string) {
  const { data: session } = useSession();
  const professionalId = session?.user?.id;

  return useQuery({
    enabled: !!professionalId && !!missionId,
    queryFn: async () => {
      if (!professionalId || !missionId) return null;
      const supabase = createClient();
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
        .eq('id', missionId)
        .eq('professional_id', professionalId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    queryKey: ['professional-mission-by-id', professionalId, missionId],
  });
}
