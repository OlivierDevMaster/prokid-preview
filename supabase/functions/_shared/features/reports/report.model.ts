import {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../../../../../types/database/schema.ts';

export type Report = Tables<'reports'>;
export type ReportInsert = TablesInsert<'reports'>;
export type ReportUpdate = TablesUpdate<'reports'>;
