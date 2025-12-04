import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database/schema';

export type Report = {
  author: {
    profile: Tables<'profiles'>;
  } & Tables<'professionals'>;
  recipient: {
    profile: Tables<'profiles'>;
  } & Tables<'structures'>;
} & Tables<'reports'>;

export interface ReportFilters {
  authorId?: string;
  authorSearch?: string;
  recipientId?: string;
  recipientSearch?: string;
  search?: string;
}

export type ReportInsert = TablesInsert<'reports'>;

export type ReportUpdate = TablesUpdate<'reports'>;
