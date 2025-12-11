import { z } from 'zod';

export const uploadReportAttachmentSchema = z.object({
  file: z.instanceof(File, {
    message: 'File is required',
  }),
  reportId: z.string().uuid('Report ID must be a valid UUID'),
});

export type UploadReportAttachmentFormData = z.infer<
  typeof uploadReportAttachmentSchema
>;

export const updateReportAttachmentSchema = z.object({
  attachmentId: z.string().uuid('Attachment ID must be a valid UUID'),
  file_name: z.string().min(1, 'File name is required').optional(),
});

export type UpdateReportAttachmentFormData = z.infer<
  typeof updateReportAttachmentSchema
>;
