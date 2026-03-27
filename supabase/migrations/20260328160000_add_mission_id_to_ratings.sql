-- Add mission_id to professional_ratings for per-mission reviews
ALTER TABLE public.professional_ratings ADD COLUMN IF NOT EXISTS mission_id UUID REFERENCES public.missions(id);

-- Drop old unique constraint (1 rating per structure-pro pair)
ALTER TABLE public.professional_ratings DROP CONSTRAINT IF EXISTS professional_ratings_unique_structure_professional;

-- New unique: 1 rating per structure-pro-mission combo
CREATE UNIQUE INDEX IF NOT EXISTS idx_ratings_unique_per_mission
  ON public.professional_ratings (structure_id, professional_id, mission_id)
  WHERE mission_id IS NOT NULL;
