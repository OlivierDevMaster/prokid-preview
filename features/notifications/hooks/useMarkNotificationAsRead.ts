import { useMutation, useQueryClient } from '@tanstack/react-query';

import { markNotificationAsRead } from '../notification.service';

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      return markNotificationAsRead(notificationId);
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
