import { useQuery } from '@tanstack/react-query';

import { createClient } from '@/lib/supabase/client';

export function useGetMembershipId(
  structureId: string | undefined,
  professionalId: string | undefined
) {
  return useQuery<null | string, Error>({
    enabled: !!structureId && !!professionalId,
    queryFn: async () => {
      if (!structureId || !professionalId) {
        return null;
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
        console.error('Error getting membership ID:', error);
        return null;
      }

      return data?.id ?? null;
    },
    queryKey: ['membership-id', structureId, professionalId],
  });
}
