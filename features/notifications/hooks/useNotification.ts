import { useQuery } from '@tanstack/react-query';

import { findNotification } from '../notification.service';

export const useNotification = (notificationId: string) => {
  return useQuery({
    enabled: !!notificationId,
    queryFn: async () => {
      return findNotification(notificationId);
    },
    queryKey: ['notification', notificationId],
  });
};
