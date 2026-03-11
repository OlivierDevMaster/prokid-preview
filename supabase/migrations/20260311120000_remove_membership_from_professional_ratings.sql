-- Migration: remove_membership_from_professional_ratings
-- Purpose: Enforce one rating per (structure_id, professional_id); remove membership_id.
-- Affected tables: professional_ratings
-- Data: For duplicate (structure_id, professional_id) pairs, keep the row with highest rating
--       (tie-break by latest created_at) and delete the rest.
-- Destructive: Drops column membership_id, FK, index, and unique constraint; replaces with new unique.

-- ============================================================================
-- Step 1: Resolve duplicates — keep one row per (structure_id, professional_id)
-- Keep the row with highest rating; if tied, keep the most recent by created_at.
-- ============================================================================

delete from public.professional_ratings
where id not in (
  select distinct on (structure_id, professional_id) id
  from public.professional_ratings
  order by structure_id, professional_id, rating desc, created_at desc
);

-- ============================================================================
-- Step 2: Drop INSERT policy that references membership_id (recreate after schema change)
-- ============================================================================

drop policy if exists "Structures can create ratings for active members" on public.professional_ratings;

-- ============================================================================
-- Step 3: Drop unique constraint and index that reference membership_id
-- ============================================================================

alter table public.professional_ratings
  drop constraint if exists professional_ratings_unique_membership;

drop index if exists public.idx_professional_ratings_membership_id;

-- ============================================================================
-- Step 4: Drop membership_id column (drops the FK to structure_members automatically)
-- ============================================================================

alter table public.professional_ratings
  drop column if exists membership_id;

-- ============================================================================
-- Step 5: Add new unique constraint — one rating per structure–professional pair
-- ============================================================================

alter table public.professional_ratings
  add constraint professional_ratings_unique_structure_professional
  unique (structure_id, professional_id);

-- ============================================================================
-- Step 6: Update table/column comments
-- ============================================================================

comment on table public.professional_ratings is
  'Ratings and comments from structures about professionals. One rating per structure–professional pair.';
comment on column public.professional_ratings.structure_id is 'Reference to the structure creating the rating';
comment on column public.professional_ratings.professional_id is 'Reference to the professional being rated';
comment on column public.professional_ratings.rating is 'Rating value from 0 to 5';
comment on column public.professional_ratings.comment is 'Optional comment about the professional';

-- ============================================================================
-- Step 7: Recreate INSERT policy — structure can rate any professional
-- ============================================================================

create policy "Structures can create ratings"
  on public.professional_ratings
  for insert
  to authenticated
  with check (
    (select auth.uid()) = structure_id
    and exists (
      select 1
      from public.profiles
      where user_id = (select auth.uid())
        and role = 'structure'
    )
  );
