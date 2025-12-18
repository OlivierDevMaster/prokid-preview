import { z } from 'zod';

export const missionFormSchema = z
  .object({
    description: z.string().optional(),
    mission_dtstart: z.date({
      required_error: 'Mission start date is required',
    }),
    mission_until: z.date({
      required_error: 'Mission end date is required',
    }),
    professional_id: z.string().min(1, 'Professional selection is required'),
    schedule_id: z.string().optional(),
    structure_id: z.string().min(1, 'Structure ID is required'),
    title: z.string().min(1, 'Mission title is required'),
  })
  .refine(
    data => {
      if (!data.mission_until || !data.mission_dtstart) return true;
      return data.mission_until > data.mission_dtstart;
    },
    {
      message: 'Mission end date must be after start date',
      path: ['mission_until'],
    }
  );

export type MissionFormData = z.infer<typeof missionFormSchema>;
