import { z } from 'zod';

export const CreateMissionRequestBodySchema = z
  .object({
    availability_ids: z
      .array(z.uuid())
      .min(1, 'At least one availability must be selected'),
    description: z.string().optional(),
    mission_dtstart: z.string().datetime('Invalid mission start date format'),
    mission_until: z.string().datetime('Invalid mission end date format'),
    professional_id: z.uuid(),
    status: z.enum(['pending', 'accepted', 'declined', 'cancelled']).optional(),
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
