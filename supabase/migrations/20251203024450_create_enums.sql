-- Create role enum type
CREATE TYPE "public"."role" AS ENUM ('professional', 'structure', 'admin');

COMMENT ON TYPE "public"."role" IS 'User role types: professional, structure, or admin';

