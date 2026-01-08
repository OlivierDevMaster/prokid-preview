import type { Professional } from '@/features/professionals/professional.model';
import type { Structure } from '@/features/structures/structure.model';

import { Order } from '@/lib/utils/enums';
import { createEnumConstants } from '@/lib/utils/enums';
import {
  Constants,
  type Enums,
  type Tables,
  type TablesInsert,
  type TablesUpdate,
} from '@/types/database/schema';

export type MissionStatus = Enums<'mission_status'>;

export const MissionStatus = createEnumConstants(
  Constants.public.Enums.mission_status
);

export const MissionStatuses = Constants.public.Enums.mission_status;

export const MissionStatusLabel: Record<
  'en' | 'fr',
  Record<MissionStatus, string>
> = {
  en: {
    [MissionStatus.accepted]: 'Accepted',
    [MissionStatus.cancelled]: 'Cancelled',
    [MissionStatus.declined]: 'Declined',
    [MissionStatus.draft]: 'Draft',
    [MissionStatus.ended]: 'Ended',
    [MissionStatus.expired]: 'Expired',
    [MissionStatus.pending]: 'Pending',
  },
  fr: {
    [MissionStatus.accepted]: 'Accepté',
    [MissionStatus.cancelled]: 'Annulé',
    [MissionStatus.declined]: 'Refusé',
    [MissionStatus.draft]: 'Brouillon',
    [MissionStatus.ended]: 'Terminé',
    [MissionStatus.expired]: 'Expiré',
    [MissionStatus.pending]: 'En attente',
  },
};

export interface CreateMissionRequestBody {
  description?: string;
  mission_dtstart: string;
  mission_until: string;
  professional_id: string;
  schedules: Array<{
    duration_mn: number;
    rrule: string;
  }>;
  status?: MissionStatus;
  structure_id: string;
  title: string;
}

export type Mission = Tables<'missions'>;

export type MissionColumn = keyof Tables<'missions'>;

export const MissionColumn = {
  created_at: 'created_at',
  description: 'description',
  id: 'id',
  mission_dtstart: 'mission_dtstart',
  mission_until: 'mission_until',
  professional_id: 'professional_id',
  status: 'status',
  structure_id: 'structure_id',
  title: 'title',
  updated_at: 'updated_at',
} as const satisfies {
  [K in MissionColumn]: K;
};

export const MissionColumns = Object.freeze(Object.values(MissionColumn));

// Special sort value for title (not a direct column - uses title field)
export const MissionSortTitle = 'title' as const;

// Sort option values for dropdown
export const MissionSortOption = {
  newest: 'newest',
  oldest: 'oldest',
  title_asc: 'title_asc',
  title_desc: 'title_desc',
} as const;

export interface MissionFilters {
  order?: Order;
  professional_id?: string;
  search?: string;
  sort?: MissionColumn | typeof MissionSortTitle;
  status?: MissionStatus;
  structure_id?: string;
}

export type MissionInsert = TablesInsert<'missions'>;

export interface MissionSchedule {
  duration_mn: number;
  rrule: string;
}

export type MissionSortOption =
  (typeof MissionSortOption)[keyof typeof MissionSortOption];

export type MissionUpdate = TablesUpdate<'missions'>;

export type MissionWithProfessional = {
  professional: Professional;
} & Mission;

export type MissionWithStructure = {
  structure: Structure;
} & Mission;
