import { useQuery } from '@tanstack/react-query';

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

      return null;
    },
    queryKey: ['membership-id', structureId, professionalId],
  });
}
