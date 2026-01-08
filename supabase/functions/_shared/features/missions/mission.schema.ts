import { z } from 'zod';

import { MissionStatuses } from './mission.model.ts';

export const MissionStatusSchema = z.enum(MissionStatuses);

export const CreateMissionRequestBodySchema = z
  .object({
    description: z.string().optional(),
    mission_dtstart: z.string().datetime('Invalid mission start date format'),
    mission_until: z.string().datetime('Invalid mission end date format'),
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

// Schedule update schema for mission updates
export const MissionScheduleUpdateSchema = z.object({
  duration_mn: z.number().int().positive('Duration must be a positive integer'),
  rrule: z.string().min(1, 'RRULE cannot be empty'),
});

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
    schedules: z
      .object({
        create: z
          .array(MissionScheduleUpdateSchema)
          .min(0, 'Schedules array cannot be negative'),
        delete: z.array(z.string().uuid()).min(0),
        update: z
          .array(
            z.object({
              duration_mn: z
                .number()
                .int()
                .positive('Duration must be a positive integer'),
              id: z.string().uuid('Schedule ID must be a valid UUID'),
              rrule: z.string().min(1, 'RRULE cannot be empty'),
            })
          )
          .min(0),
      })
      .optional(),
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
  .refine(
    data => {
      if (!data.schedules) return true;
      const totalSchedules =
        (data.schedules.create?.length ?? 0) +
        (data.schedules.update?.length ?? 0);
      return totalSchedules > 0;
    },
    {
      message: 'At least one schedule must remain after update',
      path: ['schedules'],
    }
  );

export type UpdateMissionRequestBody = z.infer<
  typeof UpdateMissionRequestBodySchema
>;
