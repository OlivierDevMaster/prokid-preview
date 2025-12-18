import type { Professional } from '@/features/professionals/professional.model';
import type { Structure } from '@/features/structures/structure.model';

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
    [MissionStatus.pending]: 'Pending',
  },
  fr: {
    [MissionStatus.accepted]: 'Accepté',
    [MissionStatus.cancelled]: 'Annulé',
    [MissionStatus.declined]: 'Refusé',
    [MissionStatus.pending]: 'En attente',
  },
};

export interface CreateMissionRequestBody {
  description?: string;
  mission_dtstart: string;
  mission_until: string;
  professional_id: string;
  schedules: MissionSchedule[];
  status?: MissionStatus;
  structure_id: string;
  title: string;
}

export type Mission = Tables<'missions'>;

export interface MissionFilters {
  professional_id?: string;
  status?: MissionStatus;
  structure_id?: string;
}

export type MissionInsert = TablesInsert<'missions'>;

export interface MissionSchedule {
  duration_mn: number;
  rrule: string;
}

export type MissionUpdate = TablesUpdate<'missions'>;

export type MissionWithProfessional = {
  professional: Professional;
} & Mission;

export type MissionWithStructure = {
  structure: Structure;
} & Mission;
