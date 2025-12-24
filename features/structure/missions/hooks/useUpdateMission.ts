import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { MissionUpdate } from '@/features/missions/mission.model';

import { updateStructureMission } from '../services/mission.service';

export function useUpdateMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      missionId,
      updateData,
    }: {
      missionId: string;
      updateData: MissionUpdate;
    }) => updateStructureMission(missionId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structure-missions'] });
      queryClient.invalidateQueries({ queryKey: ['structure-mission'] });
    },
  });
}
