import { useQuery } from '@tanstack/react-query';

import { createClient } from '@/lib/supabase/client';

export function useCheckStructureMembership(
  structureId: string | undefined,
  professionalId: string | undefined
) {
  return useQuery({
    enabled: !!structureId && !!professionalId,
    queryFn: async () => {
      if (!structureId || !professionalId) {
        return false;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from('structure_members')
        .select('id')
        .eq('structure_id', structureId)
        .eq('professional_id', professionalId)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) {
        console.error('Error checking membership:', error);
        return false;
      }

      return !!data;
    },
    queryKey: ['structure-membership', structureId, professionalId],
  });
}
