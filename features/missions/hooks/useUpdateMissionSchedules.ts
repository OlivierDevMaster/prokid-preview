import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  MissionScheduleInsert,
  MissionScheduleUpdate,
} from '../mission-schedule.service';

import {
  createMissionSchedules,
  deleteMissionSchedule,
  deleteMissionSchedules,
  updateMissionSchedule,
} from '../mission-schedule.service';

interface UpdateMissionSchedulesParams {
  missionId: string;
  scheduleIdsToDelete: string[];
  schedulesToCreate: MissionScheduleInsert[];
  schedulesToUpdate: Array<{ data: MissionScheduleUpdate; id: string }>;
}

export const useUpdateMissionSchedules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateMissionSchedulesParams) => {
      const { scheduleIdsToDelete, schedulesToCreate, schedulesToUpdate } =
        params;
      // Delete schedules first
      if (scheduleIdsToDelete.length > 0) {
        if (scheduleIdsToDelete.length === 1) {
          await deleteMissionSchedule(scheduleIdsToDelete[0]);
        } else {
          await deleteMissionSchedules(scheduleIdsToDelete);
        }
      }

      // Update existing schedules
      await Promise.all(
        schedulesToUpdate.map(({ data, id }) => updateMissionSchedule(id, data))
      );

      // Create new schedules
      if (schedulesToCreate.length > 0) {
        await createMissionSchedules(schedulesToCreate);
      }

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['mission-schedules', variables.missionId],
      });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['mission'] });
      queryClient.invalidateQueries({ queryKey: ['structure-missions'] });
      queryClient.invalidateQueries({
        queryKey: ['structure-mission', variables.missionId],
      });
    },
  });
};
