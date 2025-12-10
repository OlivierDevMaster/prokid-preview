import { z } from 'zod';

import type { DaySchedule } from '@/features/sign-up/professional/components/steps/Step3Availability';

const timeSlotSchema = z.object({
  end: z.string(),
  start: z.string(),
});

const dayScheduleSchema: z.ZodType<DaySchedule> = z.object({
  enabled: z.boolean(),
  slots: z.array(timeSlotSchema),
});

export const professionalSignUpSchema = z.object({
  availabilities: z.record(z.string(), dayScheduleSchema),
  city: z.string().min(1, 'City is required'),
  description: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  hourlyRate: z.string().optional(),
  interventionZone: z.number().min(5).max(100),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  postalCode: z.string().optional(),
  profession: z.string().min(1, 'Profession is required'),
  profilePhoto: z.instanceof(File).nullable().optional(),
  yearsExperience: z.string().optional(),
});

export type ProfessionalSignUpFormData = z.infer<
  typeof professionalSignUpSchema
>;
