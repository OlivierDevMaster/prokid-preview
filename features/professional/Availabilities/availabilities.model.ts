export interface DaySchedule {
  enabled: boolean;
  recurring: boolean;
  slots: TimeSlot[];
}

import type { AvailabilitySlot } from '@/features/availabilities/availability.model';

export interface TimeSlot {
  end: string;
  isDeleted?: boolean;
  originalSlot?: AvailabilitySlot;
  recurring?: boolean;
  start: string;
}
