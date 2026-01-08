import { z } from 'zod';

import { MissionStatuses } from './mission.model.ts';

export const MissionStatusSchema = z.enum(MissionStatuses);

export const CreateMissionRequestBodySchema = z
  .object({
    description: z.string().optional(),
    mission_dtstart: z.iso.datetime('Invalid mission start date format'),
    mission_until: z.iso.datetime('Invalid mission end date format'),
    professional_id: z.uuid(),
    schedules: z
      .array(
        z.object({
          duration_mn: z
            .number()
            .int()
            .positive('Duration must be a positive integer'),
          rrule: z.string().min(1, 'RRULE cannot be empty'),
        })
      )
      .min(1, 'At least one schedule is required'),
    status: MissionStatusSchema.optional(),
    structure_id: z.uuid(),
    title: z.string().min(1),
  })
  .refine(
    data => {
      const start = new Date(data.mission_dtstart);
      const end = new Date(data.mission_until);
      return end > start;
    },
    {
      message: 'Mission end date must be after start date',
      path: ['mission_until'],
    }
  );

export type CreateMissionRequestBody = z.infer<
  typeof CreateMissionRequestBodySchema
>;
