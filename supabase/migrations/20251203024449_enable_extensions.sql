-- Migration: enable_extensions
-- Purpose: Enable required PostgreSQL extensions
-- Affected objects: pgcrypto, pg_net, realtime extensions
-- Note: In Supabase, extensions are typically in the 'extensions' schema

-- Enable pgcrypto extension for password hashing functions (crypt, gen_salt)
-- Required for seed files that hash passwords
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Enable pg_net extension for HTTP calls from PostgreSQL
-- Required for extract_rrule_dates trigger to call Edge Functions
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Enable realtime extension for Supabase Realtime functionality
-- Provides realtime schema with broadcast_changes and send functions
-- Note: In Supabase, this is typically enabled by default, but we ensure it's available
CREATE EXTENSION IF NOT EXISTS "wrappers" WITH SCHEMA extensions;

COMMENT ON EXTENSION pgcrypto IS 'PostgreSQL extension for cryptographic functions';
COMMENT ON EXTENSION pg_net IS 'PostgreSQL extension for making HTTP requests from the database';
COMMENT ON EXTENSION wrappers IS 'PostgreSQL extension that provides realtime functionality';
