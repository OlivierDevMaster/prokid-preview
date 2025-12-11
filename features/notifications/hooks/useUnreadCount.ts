import { useQuery } from '@tanstack/react-query';

import { getNotificationUnreadCount } from '../notification.service';

export const useNotificationUnreadCount = (recipientId: string) => {
  return useQuery({
    enabled: !!recipientId,
    queryFn: async () => {
      return getNotificationUnreadCount(recipientId);
    },
    queryKey: ['notification-unread-count', recipientId],
  });
};
