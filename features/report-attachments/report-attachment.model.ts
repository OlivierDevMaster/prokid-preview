import type { Tables } from '@/types/database/schema';

export interface CreateReportAttachmentParams {
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  report_id: string;
}

export type ReportAttachment = Tables<'report_attachments'>;

export interface UpdateReportAttachmentParams {
  attachmentId: string;
  file_name?: string;
}

export interface UploadReportAttachmentParams {
  file: File;
  reportId: string;
}
