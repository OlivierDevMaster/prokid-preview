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
  endAt: string;
  startAt: string;
}

export type AvailabilityUpdate = TablesUpdate<'availabilities'>;
