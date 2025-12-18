import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { MissionScheduleInsert } from '../mission-schedule.service';

import {
  createMissionSchedule,
  createMissionSchedules,
} from '../mission-schedule.service';

export const useCreateMissionSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (schedule: MissionScheduleInsert) => {
      return createMissionSchedule(schedule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['availability-slots'] });
    },
  });
};

export const useCreateMissionSchedules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (schedules: MissionScheduleInsert[]) => {
      return createMissionSchedules(schedules);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['availability-slots'] });
    },
  });
};
