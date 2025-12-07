-- Migration: enable_pgcrypto
-- Purpose: Enable pgcrypto extension for password hashing functions (crypt, gen_salt)
-- Affected objects: pgcrypto extension
-- Note: Required for seed files that hash passwords
-- Note: In Supabase, extensions are typically in the 'extensions' schema

-- Enable pgcrypto extension in the extensions schema
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

