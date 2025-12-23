import { useMutation, useQueryClient } from '@tanstack/react-query';

import { acceptMission } from '@/features/missions/mission.service';
import { acceptStructureInvitation } from '@/features/structure-invitations/structureInvitation.service';

import type { Notification } from '../notification.model';

export const useAcceptNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notification: Notification) => {
      if (notification.type === 'invitation_received') {
        const data = notification.data as { invitation_id: string };
        return acceptStructureInvitation(data.invitation_id);
      }
      if (notification.type === 'mission_received') {
        const data = notification.data as { mission_id: string };
        return acceptMission(data.mission_id);
      }
      throw new Error('Notification type does not support accept action');
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
