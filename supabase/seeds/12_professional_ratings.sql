-- Seed: professional_ratings
-- Purpose: Create one rating per (structure_id, professional_id) for active memberships
-- Note: The trigger sync_professional_rating_on_change automatically updates
-- professionals.rating and professionals.reviews_count.
-- Note: Only one rating per structure–professional pair (no membership_id).

-- Structure 1 (Happy Kids Daycare) - rates its members
insert into public.professional_ratings (
  structure_id,
  professional_id,
  rating,
  comment
)
select
  sm.structure_id,
  sm.professional_id,
  5,
  'Excellent professional with great communication skills and dedication to children. Highly recommend!'
from public.structure_members sm
where sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869af9'
  and sm.deleted_at is null
  and sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
limit 1;

insert into public.professional_ratings (
  structure_id,
  professional_id,
  rating,
  comment
)
select
  sm.structure_id,
  sm.professional_id,
  5,
  'Outstanding work with special needs children. Very patient and understanding.'
from public.structure_members sm
where sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869af9'
  and sm.deleted_at is null
  and sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
limit 1;

-- Structure 2 (Sunshine Childcare Services) - rates its members
insert into public.professional_ratings (
  structure_id,
  professional_id,
  rating,
  comment
)
select
  sm.structure_id,
  sm.professional_id,
  5,
  'Very professional and caring. Great with organizing activities.'
from public.structure_members sm
where sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afa'
  and sm.deleted_at is null
  and sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
limit 1;

insert into public.professional_ratings (
  structure_id,
  professional_id,
  rating,
  comment
)
select
  sm.structure_id,
  sm.professional_id,
  4,
  'Good professional, always on time and well-prepared.'
from public.structure_members sm
where sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afa'
  and sm.deleted_at is null
  and sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
limit 1;

-- Structure 3 (Little Stars Nursery) - rates its members
insert into public.professional_ratings (
  structure_id,
  professional_id,
  rating,
  comment
)
select
  sm.structure_id,
  sm.professional_id,
  5,
  'Great team player and very reliable. Excellent communication skills.'
from public.structure_members sm
where sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afb'
  and sm.deleted_at is null
  and sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
limit 1;

insert into public.professional_ratings (
  structure_id,
  professional_id,
  rating,
  comment
)
select
  sm.structure_id,
  sm.professional_id,
  5,
  'Very knowledgeable and patient with children. Highly recommended.'
from public.structure_members sm
where sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afb'
  and sm.deleted_at is null
  and sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
limit 1;

-- Structure 4 (Rainbow Children Center) - rates its members
insert into public.professional_ratings (
  structure_id,
  professional_id,
  rating,
  comment
)
select
  sm.structure_id,
  sm.professional_id,
  5,
  'Excellent professional with great rapport with children and parents.'
from public.structure_members sm
where sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afc'
  and sm.deleted_at is null
  and sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
limit 1;

insert into public.professional_ratings (
  structure_id,
  professional_id,
  rating,
  comment
)
select
  sm.structure_id,
  sm.professional_id,
  5,
  'Outstanding educator. Children learn a lot and have fun at the same time.'
from public.structure_members sm
where sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afc'
  and sm.deleted_at is null
  and sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
limit 1;

-- Structure 5 (Butterfly Daycare) - rates its members
insert into public.professional_ratings (
  structure_id,
  professional_id,
  rating,
  comment
)
select
  sm.structure_id,
  sm.professional_id,
  5,
  'Excellent professional. Very organized and always prepared.'
from public.structure_members sm
where sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
  and sm.deleted_at is null
  and sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
limit 1;

insert into public.professional_ratings (
  structure_id,
  professional_id,
  rating,
  comment
)
select
  sm.structure_id,
  sm.professional_id,
  5,
  'Good professional with solid experience. Reliable and punctual.'
from public.structure_members sm
where sm.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
  and sm.deleted_at is null
  and sm.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae6'
limit 1;
