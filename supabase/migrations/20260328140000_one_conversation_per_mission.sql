-- Migration: one_conversation_per_mission
-- Purpose: Change from 1 conversation per structure-pro pair to 1 conversation per mission
-- This enables proper tracking of ratings, reports, and chat history per mission

-- Remove the old unique constraint (1 conversation per structure-pro pair)
DROP INDEX IF EXISTS idx_conversations_unique_pair;

-- New unique index: 1 conversation per mission (allows NULL for legacy conversations)
CREATE UNIQUE INDEX idx_conversations_unique_mission
  ON public.conversations (mission_id) WHERE mission_id IS NOT NULL;

-- Keep an index on structure_id + professional_id for lookup performance
CREATE INDEX IF NOT EXISTS idx_conversations_structure_professional
  ON public.conversations (structure_id, professional_id);
