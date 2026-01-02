import { useMutation, useQueryClient } from '@tanstack/react-query';

import { cancelMission } from '../mission.service';

export const useCancelMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      return cancelMission(missionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['mission'] });
      queryClient.invalidateQueries({ queryKey: ['availability-slots'] });
      // Invalidate dashboard queries for both professional and structure
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'professional', 'missions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'structure', 'missions'],
      });
      // Invalidate admin dashboard queries
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'admin', 'missions'],
      });
    },
  });
};
