-- Seed: professional_ratings
-- Purpose: Create ratings for active professional memberships
-- Note: Ratings are tied to specific memberships. The trigger sync_professional_rating_on_change
-- will automatically update professionals.rating and professionals.reviews_count
-- Note: Only active memberships (deleted_at IS NULL) can be rated

-- ============================================================================
-- Step 1: Create ratings for a subset of active memberships
-- Each structure rates some of their active members
-- Ratings are integers (1, 2, 3, 4, or 5) with varied comments
-- ============================================================================

-- Structure 1 (Happy Kids Daycare) - rates some of its members
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
  'Good professional, reliable and punctual. Children enjoy working with them.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869af9'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
LIMIT 1;

-- Structure 2 (Sunshine Childcare Services) - rates some of its members
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
  5,
  'Excellent educator with strong language development skills.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afa'
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
  4,
  'Good professional, always on time and well-prepared.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afa'
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
  'Very creative and engaging with children. Parents love their approach.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afa'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae7'
LIMIT 1;

-- Structure 3 (Little Stars Nursery) - rates some of its members
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
  'Exceptional professional. Goes above and beyond for the children.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afb'
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
  'Great team player and very reliable. Excellent communication skills.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afb'
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
  'Very knowledgeable and patient with children. Highly recommended.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afb'
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
  'Good professional with solid experience. Works well with the team.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afb'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aea'
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
  'Satisfactory performance. Could improve on time management.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afb'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aec'
LIMIT 1;

-- Structure 4 (Rainbow Children Center) - rates some of its members
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
  'Very dedicated and caring. Always puts children first.'
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
  'Reliable and professional. Good communication with parents.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afc'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae8'
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
  'Good professional. Works well with children of different ages.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afc'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aea'
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
  'Adequate performance. Could benefit from more training in child psychology.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afc'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aed'
LIMIT 1;

-- Structure 5 (Butterfly Daycare) - rates some of its members
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
  'Very creative and engaging. Children love the activities they organize.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
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
  'Very patient and understanding. Great with children who need extra attention.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae9'
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
  'Satisfactory work. Good team member.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aeb'
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
  'Adequate performance. Could improve on activity planning.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aed'
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
  'Meets expectations. Reliable but could be more proactive.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aef'
LIMIT 1;

-- Structure 6 (Wonderland Childcare) - rates some of its members
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
  'Exceptional professional. Parents consistently give positive feedback.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afe'
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
  'Very dedicated and professional. Great communication skills.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afe'
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
  'Excellent educator. Children are always engaged and learning.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afe'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae7'
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
  'Good professional. Reliable and works well with the team.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afe'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae9'
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
  'Solid performance. Good with children and parents.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afe'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aec'
LIMIT 1;

-- Structure 7 (Little Explorers Academy) - rates some of its members
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
  'Outstanding professional. Very creative and innovative in teaching methods.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aff'
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
  'Excellent work. Very organized and always prepared for activities.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aff'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae6'
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
  'Great professional. Children love working with them.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aff'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae8'
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
  'Good professional. Reliable and punctual.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aff'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aea'
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
  'Satisfactory performance. Good team member.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aff'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aec'
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
  'Adequate work. Could improve on communication with parents.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aff'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aef'
LIMIT 1;

-- Structure 8 (Bright Future Daycare) - rates some of its members
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
  'Very professional and caring. Excellent with children.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869b00'
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
  'Great educator. Very patient and understanding.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869b00'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae6'
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
  'Outstanding professional. Always goes the extra mile.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869b00'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae8'
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
  'Good professional. Reliable and works well with the team.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869b00'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aea'
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
  'Solid performance. Good communication skills.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869b00'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aec'
LIMIT 1;

-- Structure 9 (Tiny Tots Nursery) - rates some of its members
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
  'Exceptional professional. Very creative and engaging.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869b01'
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
  'Excellent work. Very dedicated and professional.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869b01'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae7'
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
  'Great professional. Children learn a lot and have fun.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869b01'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae9'
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
  'Good professional. Reliable and punctual.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869b01'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aeb'
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
  'Satisfactory performance. Good team member.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869b01'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aed'
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
  'Adequate work. Could improve on activity planning.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869b01'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aef'
LIMIT 1;

-- Structure 10 (Growing Minds Center) - rates some of its members
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
  'Excellent professional. Very knowledgeable and patient.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869b02'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae7'
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
  'Great educator. Children are always engaged and learning.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869b02'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae8'
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
  'Very professional and caring. Excellent communication skills.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869b02'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aea'
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
  'Good professional. Reliable and works well with the team.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869b02'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aec'
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
  'Solid performance. Good with children and parents.'
FROM public.structure_members sm
WHERE sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869b02'
  AND sm.deleted_at IS NULL
  AND sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aee'
LIMIT 1;

-- ============================================================================
-- Note: The trigger sync_professional_rating_on_change will automatically
-- update professionals.rating and professionals.reviews_count for each
-- professional based on all their ratings. No manual update needed.
-- ============================================================================

