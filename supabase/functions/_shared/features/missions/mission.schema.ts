import { z } from 'zod';

import { MissionStatuses } from './mission.model.ts';

export const MissionStatusSchema = z.enum(MissionStatuses);

export const CreateMissionRequestBodySchema = z
  .object({
    description: z.string().optional(),
    mission_dtstart: z.iso.datetime('Invalid mission start date format'),
    mission_until: z.iso.datetime('Invalid mission end date format'),
    professional_id: z.uuid(),
    status: MissionStatusSchema.optional(),
    address: z.string().optional(),
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

export const UpdateMissionRequestBodySchema = z
  .object({
    description: z.string().nullable().optional(),
    mission_dtstart: z
      .string()
      .datetime('Invalid mission start date format')
      .optional(),
    mission_until: z
      .string()
      .datetime('Invalid mission end date format')
      .optional(),
    address: z.string().optional(),
    status: MissionStatusSchema.optional(),
    title: z.string().min(1).optional(),
  })
  .refine(
    data => {
      if (!data.mission_until || !data.mission_dtstart) return true;
      const start = new Date(data.mission_dtstart);
      const end = new Date(data.mission_until);
      return end > start;
    },
    {
      message: 'Mission end date must be after start date',
      path: ['mission_until'],
    }
  )


export type UpdateMissionRequestBody = z.infer<
  typeof UpdateMissionRequestBodySchema
>;
