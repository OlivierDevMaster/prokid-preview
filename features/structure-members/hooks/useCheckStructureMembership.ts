import { useQuery } from '@tanstack/react-query';

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

      return true;
    },
    queryKey: ['structure-membership', structureId, professionalId],
  });
}
