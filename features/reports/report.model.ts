import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database/schema';

export type Report = {
  attachments: ReportAttachment[];
  author: {
    profile: Tables<'profiles'>;
  } & Tables<'professionals'>;
  mission: {
    structure: {
      profile: Tables<'profiles'>;
    } & Tables<'structures'>;
  } & Tables<'missions'>;
} & Tables<'reports'>;

export type ReportAttachment = Tables<'report_attachments'>;

export interface ReportFilters {
  authorId?: string;
  authorSearch?: string;
  missionId?: string;
  search?: string;
  structureId?: string;
}

export type ReportInsert = TablesInsert<'reports'>;

export type ReportUpdate = TablesUpdate<'reports'>;
