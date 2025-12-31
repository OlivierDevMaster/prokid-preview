-- Migration: fix_profile_pictures_rls
-- Purpose: Fix RLS policies for profile_pictures bucket by removing invalid storage.foldername() function
-- Affected objects: storage.objects (policies)
-- Issue: storage.foldername() function doesn't exist in Supabase, causing RLS policy failures
-- Solution: Remove foldername checks and use only LIKE pattern matching

-- ============================================================================
-- Drop existing policies that use storage.foldername()
-- ============================================================================

DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;

-- ============================================================================
-- Recreate policies without storage.foldername() function
-- ============================================================================

-- Authenticated users can upload their own profile pictures
-- Users can only upload files with their user_id at the start of the filename
-- Filename pattern: {userId}-{timestamp}.{ext}
-- Using starts_with() for more reliable pattern matching
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile_pictures' AND
  (
    name LIKE (auth.uid()::text || '-%') OR
    name LIKE (auth.uid()::text || '/%')
  )
);

-- Users can update their own profile pictures
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile_pictures' AND
  (
    name LIKE (auth.uid()::text || '-%') OR
    name LIKE (auth.uid()::text || '/%')
  )
)
WITH CHECK (
  bucket_id = 'profile_pictures' AND
  (
    name LIKE (auth.uid()::text || '-%') OR
    name LIKE (auth.uid()::text || '/%')
  )
);

-- Users can delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile_pictures' AND
  (
    name LIKE (auth.uid()::text || '-%') OR
    name LIKE (auth.uid()::text || '/%')
  )
);

