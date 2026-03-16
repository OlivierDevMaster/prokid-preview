import { z } from 'zod';

import { MissionStatuses } from './mission.model.ts';

export const MissionStatusSchema = z.enum(MissionStatuses);

export const MissionModalitySchema = z.enum(['remote', 'on_site', 'hybrid']);

export const CreateMissionRequestBodySchema = z
  .object({
    address: z.string().optional(),
    description: z.string().optional(),
    mission_dtstart: z.iso.datetime('Invalid mission start date format'),
    mission_until: z.iso.datetime('Invalid mission end date format'),
    modality: MissionModalitySchema,
    professional_id: z.uuid(),
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
  )
  .refine(
    data => {
      if (data.modality === 'on_site' || data.modality === 'hybrid') {
        return (
          typeof data.address === 'string' && data.address.trim().length > 0
        );
      }
      return true;
    },
    {
      message: 'Address is required when modality is on_site or hybrid',
      path: ['address'],
    }
  );

export type CreateMissionRequestBody = z.infer<
  typeof CreateMissionRequestBodySchema
>;

export const CreateMissionsRequestBodySchema = z
  .object({
    address: z.string().optional(),
    description: z.string().optional(),
    mission_dtstart: z.iso.datetime('Invalid mission start date format'),
    mission_until: z.iso.datetime('Invalid mission end date format'),
    modality: MissionModalitySchema,
    professional_ids: z.array(z.uuid()).min(1),
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
  )
  .refine(
    data => {
      if (data.modality === 'on_site' || data.modality === 'hybrid') {
        return (
          typeof data.address === 'string' && data.address.trim().length > 0
        );
      }
      return true;
    },
    {
      message: 'Address is required when modality is on_site or hybrid',
      path: ['address'],
    }
  );

export type CreateMissionsRequestBody = z.infer<
  typeof CreateMissionsRequestBodySchema
>;

export const UpdateMissionRequestBodySchema = z
  .object({
    address: z.string().optional(),
    description: z.string().nullable().optional(),
    mission_dtstart: z
      .string()
      .datetime('Invalid mission start date format')
      .optional(),
    mission_until: z
      .string()
      .datetime('Invalid mission end date format')
      .optional(),
    modality: MissionModalitySchema.optional(),
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
  );

export type UpdateMissionRequestBody = z.infer<
  typeof UpdateMissionRequestBodySchema
>;
