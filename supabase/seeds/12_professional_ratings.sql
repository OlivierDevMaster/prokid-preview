-- Seed: professional_ratings
-- Purpose: Create ratings for active professional memberships
-- Note: Ratings are tied to specific memberships. The trigger sync_professional_rating_on_change
-- will automatically update professionals.rating and professionals.reviews_count
-- Note: Only active memberships (deleted_at IS NULL) can be rated

-- Structure 1 (Happy Kids Daycare) - rates its members
INSERT INTO public.professional_ratings (
  structure_id,
  professional_id,
  membership_id,
  rating,
  comment
)
SELECT
  sm.structure_id,
  sm.professional_id,
  sm.id AS membership_id,
  5,
  'Excellent professional with great communication skills and dedication to children. Highly recommend!'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869af9'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
LIMIT 1;

INSERT INTO public.professional_ratings (
  structure_id,
  professional_id,
  membership_id,
  rating,
  comment
)
SELECT
  sm.structure_id,
  sm.professional_id,
  sm.id AS membership_id,
  5,
  'Outstanding work with special needs children. Very patient and understanding.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869af9'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
LIMIT 1;

-- Structure 2 (Sunshine Childcare Services) - rates its members
INSERT INTO public.professional_ratings (
  structure_id,
  professional_id,
  membership_id,
  rating,
  comment
)
SELECT
  sm.structure_id,
  sm.professional_id,
  sm.id AS membership_id,
  5,
  'Very professional and caring. Great with organizing activities.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afa'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
LIMIT 1;

INSERT INTO public.professional_ratings (
  structure_id,
  professional_id,
  membership_id,
  rating,
  comment
)
SELECT
  sm.structure_id,
  sm.professional_id,
  sm.id AS membership_id,
  4,
  'Good professional, always on time and well-prepared.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afa'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
LIMIT 1;

-- Structure 3 (Little Stars Nursery) - rates its members
INSERT INTO public.professional_ratings (
  structure_id,
  professional_id,
  membership_id,
  rating,
  comment
)
SELECT
  sm.structure_id,
  sm.professional_id,
  sm.id AS membership_id,
  5,
  'Great team player and very reliable. Excellent communication skills.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afb'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
LIMIT 1;

INSERT INTO public.professional_ratings (
  structure_id,
  professional_id,
  membership_id,
  rating,
  comment
)
SELECT
  sm.structure_id,
  sm.professional_id,
  sm.id AS membership_id,
  5,
  'Very knowledgeable and patient with children. Highly recommended.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afb'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
LIMIT 1;

-- Structure 4 (Rainbow Children Center) - rates its members
INSERT INTO public.professional_ratings (
  structure_id,
  professional_id,
  membership_id,
  rating,
  comment
)
SELECT
  sm.structure_id,
  sm.professional_id,
  sm.id AS membership_id,
  5,
  'Excellent professional with great rapport with children and parents.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afc'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
LIMIT 1;

INSERT INTO public.professional_ratings (
  structure_id,
  professional_id,
  membership_id,
  rating,
  comment
)
SELECT
  sm.structure_id,
  sm.professional_id,
  sm.id AS membership_id,
  5,
  'Outstanding educator. Children learn a lot and have fun at the same time.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afc'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
LIMIT 1;

-- Structure 5 (Butterfly Daycare) - rates its members
INSERT INTO public.professional_ratings (
  structure_id,
  professional_id,
  membership_id,
  rating,
  comment
)
SELECT
  sm.structure_id,
  sm.professional_id,
  sm.id AS membership_id,
  5,
  'Excellent professional. Very organized and always prepared.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
LIMIT 1;

INSERT INTO public.professional_ratings (
  structure_id,
  professional_id,
  membership_id,
  rating,
  comment
)
SELECT
  sm.structure_id,
  sm.professional_id,
  sm.id AS membership_id,
  5,
  'Good professional with solid experience. Reliable and punctual.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae6'
LIMIT 1;
