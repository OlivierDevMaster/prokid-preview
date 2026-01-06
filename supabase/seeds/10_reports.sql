-- Seed: reports
-- Purpose: Create reports from professionals about their missions
-- Note: Missions must exist first (seeded in 09_missions.sql)
-- Note: Reports are linked to missions, and multiple reports can be created for the same mission
-- Note: Each report is linked to a pending/accepted mission for the professional and structure

-- Reports from John Doe (010) for Structure 1 (af9)
INSERT INTO public.reports (title, content, status, author_id, mission_id)
SELECT
  'Weekly Activity Report - Week 1',
  'This week, I focused on creative activities with the children. We organized painting sessions, storytelling, and outdoor games. All children showed great engagement and progress in their social skills.',
  'sent',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae2',
  id
FROM public.missions
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
  AND structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869af9'
  AND status IN ('pending', 'accepted')
ORDER BY created_at DESC
LIMIT 1;

-- Reports from Marie Martin (011) for Structure 1 (af9)
INSERT INTO public.reports (title, content, status, author_id, mission_id)
SELECT
  'Special Needs Care Report',
  'Report on specialized care provided to children with special needs. Implemented new behavioral management techniques with positive results. Parents are satisfied with the progress.',
  'sent',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae3',
  id
FROM public.missions
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
  AND structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869af9'
  AND status IN ('pending', 'accepted')
ORDER BY created_at DESC
LIMIT 1;

-- Reports from Pierre Dupont (012) for Structure 2 (afa)
INSERT INTO public.reports (title, content, status, author_id, mission_id)
SELECT
  'Sports Activities Report',
  'Organized various sports activities including soccer, basketball, and outdoor games. Children showed great enthusiasm and improved physical coordination. Group activities helped develop teamwork skills.',
  'sent',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae4',
  id
FROM public.missions
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
  AND structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afa'
  AND status IN ('pending', 'accepted')
ORDER BY created_at DESC
LIMIT 1;

-- Reports from Sophie Bernard (013) for Structure 3 (afb)
INSERT INTO public.reports (title, content, status, author_id, mission_id)
SELECT
  'Language Development Progress',
  'Focused on multilingual activities this month. Children showed great interest in learning new words in different languages. Reading sessions were particularly successful.',
  'sent',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae5',
  id
FROM public.missions
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
  AND structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afb'
  AND status IN ('pending', 'accepted')
ORDER BY created_at DESC
LIMIT 1;

-- Reports from Thomas Leroy (014) for Structure 5 (afd)
INSERT INTO public.reports (title, content, status, author_id, mission_id)
SELECT
  'Creative Projects Summary',
  'Completed several creative projects this month including a group mural and individual art portfolios. Children developed fine motor skills and artistic expression.',
  'draft',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae6',
  id
FROM public.missions
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae6'
  AND structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
  AND status IN ('pending', 'accepted')
ORDER BY created_at DESC
LIMIT 1;
