import type {
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../../../../../types/database/schema.ts';

import { Constants } from '../../../../../types/database/schema.ts';
import { createEnumConstants } from '../../utils/enums.ts';

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
    [MissionStatus.ended]: 'Ended',
    [MissionStatus.expired]: 'Expired',
    [MissionStatus.pending]: 'Pending',
  },
  fr: {
    [MissionStatus.accepted]: 'Accepté',
    [MissionStatus.cancelled]: 'Annulé',
    [MissionStatus.declined]: 'Refusé',
    [MissionStatus.ended]: 'Terminé',
    [MissionStatus.expired]: 'Expiré',
    [MissionStatus.pending]: 'En attente',
  },
};

export type Mission = Tables<'missions'>;

export interface MissionFilters {
  professional_id?: string;
  status?: MissionStatus;
  structure_id?: string;
}

export type MissionInsert = TablesInsert<'missions'>;

export type MissionSchedule = Tables<'mission_schedules'>;

export type MissionScheduleInsert = TablesInsert<'mission_schedules'>;

export type MissionScheduleUpdate = TablesUpdate<'mission_schedules'>;

export type MissionUpdate = TablesUpdate<'missions'>;
