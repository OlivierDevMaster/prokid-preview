import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startOfDay } from 'date-fns';
import { useSession } from 'next-auth/react';

import type { CreateMissionsRequestBody } from '@/features/missions/mission.model';

import { createMissions } from '@/features/missions/mission.service';
import { getEndDate } from '@/shared/utils/date';

import type { MissionPropositionFormValues } from '../validation/mission.schema';

export function useCreateMissionProposition() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const structureId = session?.user?.id;

  return useMutation({
    mutationFn: async (values: MissionPropositionFormValues) => {
      if (!structureId) {
        throw new Error('Structure ID is required to create a mission');
      }

      let missionStart: Date;
      let missionEnd: Date;

      if (values.durationMode === 'duration') {
        const desiredStart = values.desiredStartDate ?? new Date();
        const durationDays = Number(values.durationDays ?? '1') || 1;

        missionStart = startOfDay(desiredStart);
        missionEnd = getEndDate(missionStart, Math.max(durationDays - 1, 0));
      } else {
        const periodStart = values.periodStartDate ?? new Date();
        const periodEnd = values.periodEndDate ?? periodStart;

        missionStart = startOfDay(periodStart);
        missionEnd = startOfDay(periodEnd);
      }

      const body: CreateMissionsRequestBody = {
        address: values.address,
        description: values.description,
        mission_dtstart: missionStart.toISOString(),
        mission_until: missionEnd.toISOString(),
        professional_ids: values.professionalIds,
        structure_id: structureId,
        title: values.title,
      };

      return createMissions(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structure-missions'] });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'structure', 'missions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'admin', 'missions'],
      });
    },
  });
}
