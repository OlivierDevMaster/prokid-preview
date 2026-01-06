-- Seed: report_attachments
-- Purpose: Create file attachments for reports
-- Note: Reports must exist first (seeded in 10_reports.sql)
-- Note: Each report can have up to 10 attachments

-- Attachments for John Doe's "Weekly Activity Report - Week 1" (sent)
INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'activity_photos_week1.pdf',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-activity_photos_week1.pdf',
  2456789,
  'application/pdf'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
  AND r.title = 'Weekly Activity Report - Week 1'
  AND r.status = 'sent'
ORDER BY r.created_at DESC
LIMIT 1;

INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'children_artwork_samples.jpg',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-children_artwork_samples.jpg',
  1234567,
  'image/jpeg'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
  AND r.title = 'Weekly Activity Report - Week 1'
  AND r.status = 'sent'
ORDER BY r.created_at DESC
LIMIT 1;

-- Attachments for Marie Martin's "Special Needs Care Report" (sent)
INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'behavioral_assessment.pdf',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-behavioral_assessment.pdf',
  3456789,
  'application/pdf'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
  AND r.title = 'Special Needs Care Report'
  AND r.status = 'sent'
ORDER BY r.created_at DESC
LIMIT 1;

-- Attachments for Pierre Dupont's "Sports Activities Report" (sent)
INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'sports_activities_video.mp4',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-sports_activities_video.mp4',
  8765432,
  'video/mp4'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
  AND r.title = 'Sports Activities Report'
  AND r.status = 'sent'
ORDER BY r.created_at DESC
LIMIT 1;
