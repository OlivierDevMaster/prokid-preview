import type { ReportAttachment } from '@/features/report-attachments/report-attachment.model';

import { createEnumConstants } from '@/lib/utils/enums';
import {
  Constants,
  type Enums,
  type Tables,
  type TablesInsert,
  type TablesUpdate,
} from '@/types/database/schema';

export type ReportStatus = Enums<'report_status'>;

export const ReportStatus = createEnumConstants(
  Constants.public.Enums.report_status
);

export const ReportStatuses = Constants.public.Enums.report_status;

export const ReportStatusLabel: Record<
  'en' | 'fr',
  Record<ReportStatus, string>
> = {
  en: {
    [ReportStatus.draft]: 'Draft',
    [ReportStatus.sent]: 'Sent',
  },
  fr: {
    [ReportStatus.draft]: 'Brouillon',
    [ReportStatus.sent]: 'Envoyé',
  },
};

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

export interface ReportFilters {
  authorId?: string;
  authorSearch?: string;
  missionId?: string;
  search?: string;
  structureId?: string;
}

export type ReportInsert = TablesInsert<'reports'>;

export type ReportUpdate = TablesUpdate<'reports'>;
