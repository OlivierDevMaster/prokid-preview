import { useMutation, useQueryClient } from '@tanstack/react-query';

import { declineMission } from '@/features/missions/mission.service';
import { declineStructureInvitation } from '@/features/structure-invitations/structureInvitation.service';

import type { Notification } from '../notification.model';

export const useDeclineNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notification: Notification) => {
      if (notification.type === 'invitation_received') {
        const data = notification.data as { invitation_id: string };
        return declineStructureInvitation(data.invitation_id);
      }
      if (notification.type === 'mission_received') {
        const data = notification.data as { mission_id: string };
        return declineMission(data.mission_id);
      }
      throw new Error('Notification type does not support decline action');
    },
    onSuccess: (_, notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({
        queryKey: ['notification', notification.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['notification-status', notification.id],
      });
      queryClient.invalidateQueries({ queryKey: ['structure-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });
};
