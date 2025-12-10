-- Migration: create_profile_picture_bucket
-- Purpose: Create storage bucket for profile pictures with appropriate policies
-- Affected objects: storage.buckets, storage.objects (policies)
-- Special considerations: Bucket is public for viewing but only authenticated users can upload

-- ============================================================================
-- Storage Bucket: profile_picture
-- ============================================================================

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile_pictures',
  'profile_pictures',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Storage Policies: profile_picture bucket
-- ============================================================================

-- Anyone can view profile pictures (public bucket)
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile_pictures');

-- Authenticated users can upload their own profile pictures
-- Users can only upload files with their user_id at the start of the filename
-- Filename pattern: {userId}-{timestamp}.{ext}
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile_pictures' AND
  (name LIKE auth.uid()::text || '-%' OR
   (storage.foldername(name))[1] = auth.uid()::text)
);

-- Users can update their own profile pictures
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile_pictures' AND
  (name LIKE auth.uid()::text || '-%' OR
   (storage.foldername(name))[1] = auth.uid()::text)
)
WITH CHECK (
  bucket_id = 'profile_pictures' AND
  (name LIKE auth.uid()::text || '-%' OR
   (storage.foldername(name))[1] = auth.uid()::text)
);

-- Users can delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile_pictures' AND
  (name LIKE auth.uid()::text || '-%' OR
   (storage.foldername(name))[1] = auth.uid()::text)
);

-- Admins can manage all profile pictures
CREATE POLICY "Admins can manage all profile pictures"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'profile_pictures' AND
  (SELECT public.is_admin())
)
WITH CHECK (
  bucket_id = 'profile_pictures' AND
  (SELECT public.is_admin())
);

