import type { Mission } from '../missions/mission.model.ts';

export interface AvailabilitySlot {
  durationMn: number;
  endAt: string;
  isAvailable: boolean;
  isRecurring?: boolean;
  mission: Mission | null;
  startAt: string;
}
