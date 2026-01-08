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
    onSuccess: (_, variables) => {
      const { missionId } = variables;
      queryClient.invalidateQueries({ queryKey: ['structure-missions'] });
      queryClient.invalidateQueries({ queryKey: ['structure-mission'] });
      queryClient.invalidateQueries({
        queryKey: ['structure-mission', missionId],
      });
      queryClient.invalidateQueries({
        queryKey: ['mission-schedules', missionId],
      });
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
