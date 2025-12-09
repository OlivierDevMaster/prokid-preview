import { z } from 'zod';

export const CreateMissionRequestBodySchema = z.object({
  description: z.string().optional(),
  duration_mn: z.number().int().positive(),
  professional_id: z.uuid(),
  rrule: z.string().min(1),
  status: z.enum(['pending', 'accepted', 'declined', 'cancelled']).optional(),
  structure_id: z.uuid(),
  title: z.string().min(1),
});

export type CreateMissionRequestBody = z.infer<
  typeof CreateMissionRequestBodySchema
>;
