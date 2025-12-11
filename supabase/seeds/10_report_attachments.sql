-- Seed: report_attachments
-- Purpose: Create file attachments for reports
-- Note: Reports must exist first (seeded in 09_reports.sql)
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

-- Attachments for John Doe's "Monthly Progress Report" (draft)
INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'monthly_progress_chart.xlsx',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-monthly_progress_chart.xlsx',
  456789,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
  AND r.title = 'Monthly Progress Report'
  AND r.status = 'draft'
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

INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'parent_feedback_forms.pdf',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-parent_feedback_forms.pdf',
  2345678,
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

INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'team_photos.jpg',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-team_photos.jpg',
  1987654,
  'image/jpeg'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
  AND r.title = 'Sports Activities Report'
  AND r.status = 'sent'
ORDER BY r.created_at DESC
LIMIT 1;

-- Attachments for Sophie Bernard's "Language Development Progress" (sent)
INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'vocabulary_assessment.docx',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-vocabulary_assessment.docx',
  567890,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
  AND r.title = 'Language Development Progress'
  AND r.status = 'sent'
ORDER BY r.created_at DESC
LIMIT 1;

INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'reading_session_recording.mp3',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-reading_session_recording.mp3',
  3456789,
  'audio/mpeg'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
  AND r.title = 'Language Development Progress'
  AND r.status = 'sent'
ORDER BY r.created_at DESC
LIMIT 1;

-- Attachments for Antoine Petit's "Arts and Crafts Activities Report" (sent)
INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'artwork_gallery.pdf',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-artwork_gallery.pdf',
  4567890,
  'application/pdf'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae8'
  AND r.title = 'Arts and Crafts Activities Report'
  AND r.status = 'sent'
ORDER BY r.created_at DESC
LIMIT 1;

INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'sculpture_photos_1.jpg',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-sculpture_photos_1.jpg',
  1234567,
  'image/jpeg'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae8'
  AND r.title = 'Arts and Crafts Activities Report'
  AND r.status = 'sent'
ORDER BY r.created_at DESC
LIMIT 1;

INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'sculpture_photos_2.jpg',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-sculpture_photos_2.jpg',
  1456789,
  'image/jpeg'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae8'
  AND r.title = 'Arts and Crafts Activities Report'
  AND r.status = 'sent'
ORDER BY r.created_at DESC
LIMIT 1;

-- Attachments for Camille Laurent's "Nutrition Education Activities" (sent)
INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'nutrition_workshop_recipes.pdf',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-nutrition_workshop_recipes.pdf',
  2345678,
  'application/pdf'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae9'
  AND r.title = 'Nutrition Education Activities'
  AND r.status = 'sent'
ORDER BY r.created_at DESC
LIMIT 1;

INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'cooking_session_photos.jpg',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-cooking_session_photos.jpg',
  1876543,
  'image/jpeg'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae9'
  AND r.title = 'Nutrition Education Activities'
  AND r.status = 'sent'
ORDER BY r.created_at DESC
LIMIT 1;

-- Attachments for Lucie Moreau's "Healthy Habits Program" (sent)
INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'health_program_guide.pdf',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-health_program_guide.pdf',
  3456789,
  'application/pdf'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae7'
  AND r.title = 'Healthy Habits Program'
  AND r.status = 'sent'
ORDER BY r.created_at DESC
LIMIT 1;

-- Attachments for Nicolas Garcia's "Music and Movement Activities" (draft)
INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'music_session_playlist.txt',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-music_session_playlist.txt',
  45678,
  'text/plain'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aec'
  AND r.title = 'Music and Movement Activities'
  AND r.status = 'draft'
ORDER BY r.created_at DESC
LIMIT 1;

-- Attachments for Antoine Petit's "Technology Integration Report" (sent)
INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'technology_usage_report.pdf',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-technology_usage_report.pdf',
  3456789,
  'application/pdf'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae8'
  AND r.title = 'Technology Integration Report'
  AND r.status = 'sent'
ORDER BY r.created_at DESC
LIMIT 1;

INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'app_recommendations.docx',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-app_recommendations.docx',
  678901,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae8'
  AND r.title = 'Technology Integration Report'
  AND r.status = 'sent'
ORDER BY r.created_at DESC
LIMIT 1;

-- Attachments for Thomas Leroy's "Early Development Milestones" (sent)
INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'milestone_tracking_chart.xlsx',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-milestone_tracking_chart.xlsx',
  567890,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae6'
  AND r.title = 'Early Development Milestones'
  AND r.status = 'sent'
ORDER BY r.created_at DESC
LIMIT 1;

-- Attachments for Lucie Moreau's "Environmental Awareness Program" (sent)
INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'environmental_activities_guide.pdf',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-environmental_activities_guide.pdf',
  4567890,
  'application/pdf'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae7'
  AND r.title = 'Environmental Awareness Program'
  AND r.status = 'sent'
ORDER BY r.created_at DESC
LIMIT 1;

INSERT INTO public.report_attachments (report_id, file_name, file_path, file_size, mime_type)
SELECT
  r.id,
  'recycling_project_photos.jpg',
  'reports/' || r.id::text || '/' || extract(epoch from now())::bigint || '-recycling_project_photos.jpg',
  2345678,
  'image/jpeg'
FROM public.reports r
WHERE r.author_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae7'
  AND r.title = 'Environmental Awareness Program'
  AND r.status = 'sent'
ORDER BY r.created_at DESC
LIMIT 1;
