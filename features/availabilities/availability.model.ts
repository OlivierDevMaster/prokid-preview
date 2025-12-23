import type { Mission } from '@/features/missions/mission.model';
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database/schema';

export type Availability = Tables<'availabilities'>;

export interface AvailabilityFilters {
  userId?: string;
}

export type AvailabilityInsert = TablesInsert<'availabilities'>;

export interface AvailabilitySlot {
  durationMn: number;
  endAt: string;
  isAvailable: boolean;
  isRecurring: boolean;
  mission: Mission | null;
  startAt: string;
}

export interface AvailabilitySlotFilters {
  endAt: string;
  professionalId: string;
  startAt: string;
}

export type AvailabilityUpdate = TablesUpdate<'availabilities'>;
