-- =============================================================================
-- Add or Update Vault Secret
-- =============================================================================
-- This script adds or updates a secret in Supabase Vault
--
-- Usage:
--   1. Update the variables in the DO block below with your actual values
--   2. Run the script
--
-- Note: This script will create the secret if it doesn't exist,
--       or update it if it already exists (upsert behavior)

-- Ensure vault extension is enabled
CREATE EXTENSION IF NOT EXISTS vault;

-- =============================================================================
-- CONFIGURATION - Update these values
-- =============================================================================
-- IMPORTANT: For local development, use 'http://host.docker.internal:54321'
--            instead of 'http://127.0.0.1:54321'
--
-- Explanation:
--   - The database trigger runs inside a Docker container
--   - To reach edge functions on the host machine, use 'host.docker.internal'
--   - This special hostname resolves to the host machine's IP from within Docker
--   - Using '127.0.0.1' would try to connect to localhost inside the container,
--     which won't reach the edge functions running on your host machine
--
-- For production, use your actual Supabase project URL:
--   Example: 'https://your-project-ref.supabase.co'
--
DO $$
DECLARE
    secret_name TEXT := 'supabase_url';
    secret_value TEXT := 'http://host.docker.internal:54321'; -- Use host.docker.internal for local dev
    secret_description TEXT := NULL; -- Optional: Add description if needed
    existing_secret_id UUID;
BEGIN
    -- Check if secret already exists
    SELECT id INTO existing_secret_id
    FROM vault.secrets
    WHERE name = secret_name
    LIMIT 1;

    IF existing_secret_id IS NOT NULL THEN
        -- Update existing secret
        PERFORM vault.update_secret(
            secret_id := existing_secret_id,
            new_secret := secret_value,
            new_description := secret_description
        );
    ELSE
        -- Create new secret
        PERFORM vault.create_secret(
            new_secret := secret_value,
            new_name := secret_name,
            new_description := COALESCE(secret_description, '')
        );
    END IF;
END $$;

-- Verify secret is set (uncomment to check):
-- SELECT name, created_at, updated_at
-- FROM vault.decrypted_secrets
-- WHERE name = 'supabase_url';

-- To delete the secret (if needed, uncomment):
-- SELECT vault.delete_secret('supabase_url');

