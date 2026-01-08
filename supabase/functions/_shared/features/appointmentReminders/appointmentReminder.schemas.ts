import { z } from 'zod';

export const MissionScheduleSchema = z.object({
  duration_mn: z.number().int().positive('Duration must be a positive integer'),
  rrule: z.string().min(1, 'RRULE is required'),
  schedule_id: z.string().uuid('Schedule ID must be a valid UUID'),
});

export const MissionForReminderSchema = z.object({
  mission_dtstart: z.iso.datetime({
    message: 'Mission start date must be a valid ISO datetime',
  }),
  mission_id: z.string().uuid('Mission ID must be a valid UUID'),
  mission_until: z.iso.datetime({
    message: 'Mission until date must be a valid ISO datetime',
  }),
  schedules: z
    .array(MissionScheduleSchema)
    .min(1, 'At least one schedule is required'),
});

export const SendAppointmentRemindersRequestBodySchema = z.object({
  missions: z
    .array(MissionForReminderSchema)
    .min(1, 'At least one mission is required'),
});

export const ProcessReminderRequestBodySchema = z.object({
  reminder_id: z.string().uuid('Reminder ID must be a valid UUID'),
});

export type ProcessReminderRequestBody = z.infer<
  typeof ProcessReminderRequestBodySchema
>;

export type SendAppointmentRemindersRequestBody = z.infer<
  typeof SendAppointmentRemindersRequestBodySchema
>;
