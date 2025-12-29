import { Tables } from '../../../../../types/database/schema.ts';

export type AppointmentReminder = Tables<'appointment_reminders'>;

export type MissionForReminder = {
  mission_dtstart: string;
  mission_id: string;
  mission_until: string;
  schedules: MissionSchedule[];
};

export type MissionSchedule = {
  duration_mn: number;
  rrule: string;
  schedule_id: string;
};

export type ReminderResult = {
  error?: string;
  mission_id: string;
  occurrence_date: string;
  schedule_id: string;
  success: boolean;
};

export type SendAppointmentRemindersRequestBody = {
  missions: MissionForReminder[];
};

export type SendAppointmentRemindersResponse = {
  results: ReminderResult[];
  total_failed: number;
  total_processed: number;
  total_sent: number;
};
