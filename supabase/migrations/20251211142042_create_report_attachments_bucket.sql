-- Migration: create_report_attachments_bucket
-- Purpose: Create storage bucket and policies for report attachments
-- Affected objects: storage bucket, storage policies
-- Dependencies: Requires storage extension to be enabled

-- ============================================================================
-- Storage Bucket: report-attachments
-- ============================================================================

-- Create the storage bucket (if it doesn't exist)
-- Note: This uses the storage API, so we need to insert into storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-attachments',
  'report-attachments',
  false,
  10485760, -- 10MB in bytes
  NULL -- Allow all file types
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Storage Policies
-- ============================================================================

-- Policy: Authenticated users can upload files to report folders
-- Security: Users can only upload to folders for reports they authored
CREATE POLICY "Users can upload attachments for their own reports"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'report-attachments'
  AND (
    -- Extract report_id from path: reports/{report_id}/...
    -- Path format: reports/{report_id}/{timestamp}-{filename}
    name ~ '^reports/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
    AND EXISTS (
      SELECT 1 FROM "public"."reports"
      WHERE "reports"."id"::text = (regexp_split_to_array(name, '/'))[2]
      AND "reports"."author_id" = (SELECT auth.uid())
    )
  )
);

-- Policy: Users can view attachments for reports they have access to
-- Security: Same access rules as reports table (professionals for their reports, structures for their missions)
CREATE POLICY "Users can view attachments for accessible reports"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'report-attachments'
  AND (
    -- Professionals can view attachments for their own reports
    (
      name ~ '^reports/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
      AND EXISTS (
        SELECT 1 FROM "public"."reports"
        WHERE "reports"."id"::text = (regexp_split_to_array(name, '/'))[2]
        AND "reports"."author_id" = (SELECT auth.uid())
      )
    )
    OR
    -- Structures can view attachments for reports of their missions
    (
      name ~ '^reports/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
      AND EXISTS (
        SELECT 1 FROM "public"."reports"
        INNER JOIN "public"."missions" ON "missions"."id" = "reports"."mission_id"
        WHERE "reports"."id"::text = (regexp_split_to_array(name, '/'))[2]
        AND "missions"."structure_id" = (SELECT auth.uid())
      )
    )
    OR
    -- Admins can view all attachments
    (SELECT public.is_admin())
  )
);

-- Policy: Users can delete attachments they uploaded
-- Security: Users can only delete attachments for reports they authored
CREATE POLICY "Users can delete attachments for their own reports"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'report-attachments'
  AND (
    name ~ '^reports/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
    AND EXISTS (
      SELECT 1 FROM "public"."reports"
      WHERE "reports"."id"::text = (regexp_split_to_array(name, '/'))[2]
      AND "reports"."author_id" = (SELECT auth.uid())
    )
  )
);

-- Policy: Admins can delete any attachment
-- Security: Admins have full access to delete any attachment
CREATE POLICY "Admins can delete any attachment"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'report-attachments'
  AND (SELECT public.is_admin())
);
