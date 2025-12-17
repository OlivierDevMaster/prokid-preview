import type {
  Mission,
  MissionFilters,
  MissionUpdate,
} from '@/features/missions/mission.model';

export type { Mission, MissionFilters, MissionUpdate };

export interface StructureMission extends Mission {
  professional?: {
    profile?: {
      email: null | string;
      first_name: null | string;
      last_name: null | string;
    };
    user_id: string;
  };
}
