import { z } from 'zod';

export const GetAvailabilitySlotsQuerySchema = z.object({
  endAt: z.iso.datetime(),
  professionalId: z.uuid(),
  startAt: z.iso.datetime(),
});

export type GetAvailabilitySlotsQuery = z.infer<
  typeof GetAvailabilitySlotsQuerySchema
>;
