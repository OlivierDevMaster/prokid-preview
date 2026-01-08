import { z } from 'zod';

// Step 1: Mission creation schema (without schedules)
export const missionFormSchema = z
  .object({
    description: z.string().optional(),
    is_draft: z.boolean().optional(),
    mission_dtstart: z
      .date({
        message: 'Mission start date is required',
      })
      .refine(
        date => {
          const now = new Date();
          now.setSeconds(0, 0);
          return date >= now;
        },
        {
          message: 'Mission start date cannot be in the past',
        }
      ),
    mission_until: z
      .date({
        message: 'Mission end date is required',
      })
      .refine(
        date => {
          const now = new Date();
          now.setSeconds(0, 0);
          return date >= now;
        },
        {
          message: 'Mission end date cannot be in the past',
        }
      ),
    professional_id: z.string().min(1, 'Professional selection is required'),
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

// Step 2: Mission schedule schema
// This represents the selected availability slot data
export const missionScheduleFormSchema = z.object({
  availabilityEndAt: z.string().min(1, 'Availability end time is required'), // Original availability slot end time
  availabilityStartAt: z.string().min(1, 'Availability start time is required'), // Original availability slot start time
  dtstart: z.string().optional(), // Will be set from startAt
  duration_mn: z.number().int().positive('Duration must be positive'),
  endAt: z.string().min(1, 'End time is required'),
  isAvailabilityRecurrent: z.boolean(), // Whether the original availability is recurrent
  isRecurrent: z.boolean(),
  rrule: z.string().min(1, 'RRULE is required'),
  scheduleId: z.string().optional(), // ID of existing schedule (for updates)
  startAt: z.string().min(1, 'Start time is required'),
  until: z.string().nullable().optional(), // Will be set based on isRecurrent
});

export type MissionScheduleFormData = z.infer<typeof missionScheduleFormSchema>;

// Form schema for step 2 with field array
export const missionSchedulesFormSchema = z.object({
  mission_id: z.string().min(1, 'Mission ID is required'),
  schedules: z
    .array(missionScheduleFormSchema)
    .min(1, 'At least one schedule is required'),
});

export type MissionSchedulesFormData = z.infer<
  typeof missionSchedulesFormSchema
>;

// Edit mission schema (allows past dates for existing missions)
export const editMissionFormSchema = z
  .object({
    description: z.string().optional(),
    is_draft: z.boolean().optional(),
    mission_dtstart: z.date({
      message: 'Mission start date is required',
    }),
    mission_until: z.date({
      message: 'Mission end date is required',
    }),
    professional_id: z.string().min(1, 'Professional selection is required'),
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

export type EditMissionFormData = z.infer<typeof editMissionFormSchema>;
