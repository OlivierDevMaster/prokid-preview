import {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../../../../../types/database/schema.ts';

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

export type ReportInsert = TablesInsert<'reports'>;
export type ReportUpdate = TablesUpdate<'reports'>;
