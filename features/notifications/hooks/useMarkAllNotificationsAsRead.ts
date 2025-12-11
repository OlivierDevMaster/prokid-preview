import { useMutation, useQueryClient } from '@tanstack/react-query';

import { markAllNotificationsAsRead } from '../notification.service';

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipientId: string) => {
      return markAllNotificationsAsRead(recipientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification'] });
      queryClient.invalidateQueries({
        queryKey: ['notification-unread-count'],
      });
    },
  });
};
