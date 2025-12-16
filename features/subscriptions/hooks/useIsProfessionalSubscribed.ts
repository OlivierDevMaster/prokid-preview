import { useQuery } from '@tanstack/react-query';

import { isProfessionalSubscribed } from '../subscription.service';

export const useIsProfessionalSubscribed = (userId?: string) => {
  return useQuery({
    enabled: !!userId,
    queryFn: () => isProfessionalSubscribed(userId!),
    queryKey: ['is-professional-subscribed', userId],
  });
};
