import sanitizeFilename from 'sanitize-filename';

import { createClient } from '@/lib/supabase/client';

export interface ReportAttachment {
  created_at: string;
  file_name: string;
  file_path: string;
  file_size: number;
  id: string;
  mime_type: string;
  report_id: string;
  updated_at: string;
}

export interface UpdateAttachmentParams {
  attachmentId: string;
  file_name?: string;
}

export interface UploadAttachmentParams {
  file: File;
  reportId: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const MAX_ATTACHMENTS_PER_REPORT = 10;

/**
 * Creates an attachment record in the database
 * Note: This only creates the DB record. Use uploadReportAttachment to upload a file.
 */
export async function createAttachment(params: {
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  report_id: string;
}): Promise<ReportAttachment> {
  const supabase = createClient();

  // Check attachment limit
  await checkAttachmentLimit(params.report_id);

  const { data, error } = await supabase
    .from('report_attachments')
    .insert({
      file_name: params.file_name,
      file_path: params.file_path,
      file_size: params.file_size,
      mime_type: params.mime_type,
      report_id: params.report_id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create attachment: ${error.message}`);
  }

  return data;
}

/**
 * Deletes a report attachment
 */
export async function deleteReportAttachment(
  attachmentId: string
): Promise<void> {
  const supabase = createClient();

  // Get attachment record to get file path
  const { data: attachment, error: fetchError } = await supabase
    .from('report_attachments')
    .select('file_path')
    .eq('id', attachmentId)
    .single();

  if (fetchError || !attachment) {
    throw new Error(
      `Failed to fetch attachment: ${fetchError?.message || 'Attachment not found'}`
    );
  }

  // Delete file from storage
  const { error: storageError } = await supabase.storage
    .from('report-attachments')
    .remove([attachment.file_path]);

  if (storageError) {
    // Log error but continue with database deletion
    console.error('Failed to delete file from storage:', storageError);
  }

  // Delete attachment record from database
  const { error: dbError } = await supabase
    .from('report_attachments')
    .delete()
    .eq('id', attachmentId);

  if (dbError) {
    throw new Error(`Failed to delete attachment: ${dbError.message}`);
  }
}

/**
 * Gets a single attachment by ID
 */
export async function getAttachmentById(
  attachmentId: string
): Promise<null | ReportAttachment> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('report_attachments')
    .select('*')
    .eq('id', attachmentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to fetch attachment: ${error.message}`);
  }

  return data;
}

/**
 * Gets a signed URL for downloading an attachment
 */
export async function getAttachmentDownloadUrl(
  attachmentId: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = createClient();

  // Get attachment record to get file path
  const { data: attachment, error: fetchError } = await supabase
    .from('report_attachments')
    .select('file_path')
    .eq('id', attachmentId)
    .single();

  if (fetchError || !attachment) {
    throw new Error(
      `Failed to fetch attachment: ${fetchError?.message || 'Attachment not found'}`
    );
  }

  // Generate signed URL
  const { data, error } = await supabase.storage
    .from('report-attachments')
    .createSignedUrl(attachment.file_path, expiresIn);

  if (error || !data) {
    throw new Error(
      `Failed to generate download URL: ${error?.message || 'Unknown error'}`
    );
  }

  return data.signedUrl;
}

/**
 * Gets all attachments for a report
 */
export async function getReportAttachments(
  reportId: string
): Promise<ReportAttachment[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('report_attachments')
    .select('*')
    .eq('report_id', reportId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch attachments: ${error.message}`);
  }

  return data || [];
}

/**
 * Updates attachment metadata in the database
 * Note: This only updates metadata, not the actual file. To replace a file, delete and re-upload.
 */
export async function updateAttachment(
  params: UpdateAttachmentParams
): Promise<ReportAttachment> {
  const supabase = createClient();
  const { attachmentId, file_name } = params;

  const updateData: { file_name?: string } = {};
  if (file_name !== undefined) {
    updateData.file_name = file_name;
  }

  const { data, error } = await supabase
    .from('report_attachments')
    .update(updateData)
    .eq('id', attachmentId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update attachment: ${error.message}`);
  }

  if (!data) {
    throw new Error('Attachment not found');
  }

  return data;
}

/**
 * Uploads a file attachment to a report
 */
export async function uploadReportAttachment(
  params: UploadAttachmentParams
): Promise<ReportAttachment> {
  const { file, reportId } = params;

  // Validate file size
  validateFileSize(file);

  // Check attachment limit
  await checkAttachmentLimit(reportId);

  const supabase = createClient();

  // Generate file path
  const filePath = generateFilePath(reportId, file.name);

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from('report-attachments')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  // Create attachment record in database
  const { data: attachment, error: dbError } = await supabase
    .from('report_attachments')
    .insert({
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type || 'application/octet-stream',
      report_id: reportId,
    })
    .select()
    .single();

  if (dbError) {
    // If database insert fails, try to delete the uploaded file
    await supabase.storage.from('report-attachments').remove([filePath]);
    throw new Error(`Failed to create attachment record: ${dbError.message}`);
  }

  return attachment;
}

/**
 * Checks if report has reached the maximum number of attachments
 */
async function checkAttachmentLimit(reportId: string): Promise<void> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from('report_attachments')
    .select('*', { count: 'exact', head: true })
    .eq('report_id', reportId);

  if (error) {
    throw new Error(`Failed to check attachment limit: ${error.message}`);
  }

  if ((count ?? 0) >= MAX_ATTACHMENTS_PER_REPORT) {
    throw new Error(
      `Report cannot have more than ${MAX_ATTACHMENTS_PER_REPORT} attachments`
    );
  }
}

/**
 * Generates a secure file path for storage
 */
function generateFilePath(reportId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = sanitizeFilename(filename);
  return `reports/${reportId}/${timestamp}-${sanitizedFilename}`;
}

/**
 * Validates file size
 */
function validateFileSize(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }
}
