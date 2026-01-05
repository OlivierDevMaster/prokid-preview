import type { Mission } from '../missions/mission.model.ts';

export interface AvailabilitySlot {
  availabilityId: null | string;
  durationMn: number;
  endAt: string;
  isAvailable: boolean;
  isRecurring?: boolean;
  mission: Mission | null;
  rrule?: string;
  startAt: string;
}
