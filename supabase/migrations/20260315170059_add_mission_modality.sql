-- Migration: add_mission_modality
-- Purpose: Add mission_modality enum and modality column to missions table
-- Affected objects: new enum public.mission_modality, column public.missions.modality
-- Existing rows receive default 'remote'; new inserts must or may omit modality (default applies).

-- ============================================================================
-- Enum: mission_modality
-- ============================================================================

create type "public"."mission_modality" as enum ('remote', 'on_site', 'hybrid');

comment on type "public"."mission_modality" is 'How the mission is performed: remote, on_site, or hybrid.';

-- ============================================================================
-- Column: missions.modality
-- ============================================================================

alter table "public"."missions"
  add column if not exists "modality" "public"."mission_modality" not null default 'remote';

comment on column "public"."missions"."modality" is 'Modality of the mission: remote, on_site, or hybrid.';
