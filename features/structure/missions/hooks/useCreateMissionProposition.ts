import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eachDayOfInterval, format, startOfDay } from 'date-fns';
import { useSession } from 'next-auth/react';

import type { CreateMissionsRequestBody } from '@/features/missions/mission.model';

import { conversationsQueryKey } from '@/features/chat/hooks/useConversations';
import { createMissionSchedules } from '@/features/missions/mission-schedule.service';
import { createMissions } from '@/features/missions/mission.service';

import type { MissionPropositionFormValues } from '../validation/mission.schema';

function timeDiffInMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

function buildSingleDayRrule(date: Date, startTime: string): string {
  const dateStr = format(date, 'yyyyMMdd');
  const timeStr = startTime.replace(':', '') + '00';
  return `DTSTART:${dateStr}T${timeStr}\nRRULE:FREQ=DAILY;COUNT=1`;
}

function buildDailyRrule(
  startDate: Date,
  endDate: Date,
  startTime: string
): string {
  const dtstart = format(startDate, 'yyyyMMdd');
  const until = format(endDate, 'yyyyMMdd');
  const timeStr = startTime.replace(':', '') + '00';
  return `DTSTART:${dtstart}T${timeStr}\nRRULE:FREQ=DAILY;UNTIL=${until}T235959`;
}

export function useCreateMissionProposition() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const structureId = session?.user?.id;

  return useMutation({
    mutationFn: async (values: MissionPropositionFormValues) => {
      if (!structureId) {
        throw new Error('Structure ID is required to create a mission');
      }

      const missionStartDate = values.startDate ?? new Date();
      const missionEndDate = values.endDate ?? missionStartDate;

      // Set mission_dtstart to start of first day, mission_until to end of last day
      const missionStart = startOfDay(missionStartDate);
      const missionEnd = new Date(startOfDay(missionEndDate));
      missionEnd.setHours(23, 59, 59, 999);

      const body: CreateMissionsRequestBody = {
        address:
          values.modality === 'remote'
            ? undefined
            : values.address?.trim() || undefined,
        description: values.description,
        mission_dtstart: missionStart.toISOString(),
        mission_until: missionEnd.toISOString(),
        modality: values.modality,
        professional_ids: values.professionalIds,
        structure_id: structureId,
        title: values.title,
      };

      const missions = await createMissions(body);

      // Create schedules for each mission
      const days = eachDayOfInterval({
        end: missionEndDate,
        start: missionStartDate,
      });

      for (const mission of missions) {
        if (values.sameHoursEveryDay) {
          // Single schedule with daily recurrence
          const rrule = buildDailyRrule(
            missionStartDate,
            missionEndDate,
            values.dailyStartTime
          );
          const durationMn = timeDiffInMinutes(
            values.dailyStartTime,
            values.dailyEndTime
          );
          await createMissionSchedules([
            {
              duration_mn: durationMn,
              mission_id: mission.id,
              rrule,
            },
          ]);
        } else {
          // One schedule per day
          const schedules = (values.daySchedules || []).map(day => ({
            duration_mn: timeDiffInMinutes(day.startTime, day.endTime),
            mission_id: mission.id,
            rrule: buildSingleDayRrule(day.date, day.startTime),
          }));
          if (schedules.length > 0) {
            await createMissionSchedules(schedules);
          }
        }
      }

      return missions;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structure-missions'] });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'structure', 'missions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'admin', 'missions'],
      });
      queryClient.invalidateQueries({ queryKey: conversationsQueryKey });
    },
  });
}
