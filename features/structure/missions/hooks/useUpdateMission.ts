import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateMissionRequestBody } from '@/features/missions/mission.service';

import { updateStructureMission } from '../services/mission.service';

export function useUpdateMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      missionId,
      updateData,
    }: {
      missionId: string;
      updateData: UpdateMissionRequestBody;
    }) => updateStructureMission(missionId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structure-missions'] });
      queryClient.invalidateQueries({ queryKey: ['structure-mission'] });
      // Invalidate dashboard queries for structure
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'structure', 'missions'],
      });
      // Invalidate admin dashboard queries
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'admin', 'missions'],
      });
    },
  });
}
