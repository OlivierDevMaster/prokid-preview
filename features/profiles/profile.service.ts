import { createClient } from '@/lib/supabase/client';

import type { Profile, ProfileUpdate } from './profile.model';

import { ProfileConfig } from './profile.config';

export const findProfile = async (userId: string): Promise<null | Profile> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to find profile: ${error.message}`);
  }

  return data;
};

export const updateProfile = async (
  userId: string,
  updateData: ProfileUpdate
): Promise<Profile> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return data;
};

export async function deleteProfilePhoto(avatarUrl: string): Promise<void> {
  const supabase = createClient();

  // Extract file path from URL
  // URL format: https://.../storage/v1/object/public/profile_pictures/{filename}
  const urlParts = avatarUrl.split('/');
  const fileName = urlParts[urlParts.length - 1];

  if (!fileName) {
    throw new Error('Invalid avatar URL');
  }

  const { error: deleteError } = await supabase.storage
    .from(ProfileConfig.PROFILE_PICTURES_BUCKET)
    .remove([fileName]);

  if (deleteError) {
    throw new Error(`Failed to delete profile photo: ${deleteError.message}`);
  }
}

export async function uploadProfilePhoto(
  file: File,
  userId: string
): Promise<string> {
  const supabase = createClient();

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(ProfileConfig.PROFILE_PICTURES_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload profile photo: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from(ProfileConfig.PROFILE_PICTURES_BUCKET)
    .getPublicUrl(filePath);

  return publicUrl;
}
