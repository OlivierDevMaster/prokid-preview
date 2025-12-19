import { createClient } from '@/lib/supabase/client';

import { uploadProfilePhoto } from './professional/professionalSignUp.service';

export interface SignUpData {
  email: string;
  firstName?: string;
  lastName?: string;
  password: string;
  preferredLanguage?: 'en' | 'fr';
  profilePhoto?: File | null;
  role: 'professional' | 'structure';
}

export async function createAccount(data: SignUpData): Promise<{
  email: string;
  firstName?: string;
  lastName?: string;
  userId: string;
}> {
  const supabase = createClient();

  const parsedData: Record<string, string> = {
    role: data.role,
  };
  if (data.firstName) {
    parsedData.first_name = data.firstName;
  }
  if (data.lastName) {
    parsedData.last_name = data.lastName;
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    options: {
      data: parsedData,
    },
    password: data.password,
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      throw new Error('Email already exists');
    }
    throw new Error(`Failed to create account: ${authError.message}`);
  }

  if (!authData.user) {
    throw new Error('Failed to create account: No user data returned');
  }

  // Upload profile photo if provided (for structure role)
  if (data.profilePhoto && data.role === 'structure') {
    try {
      const avatarUrl = await uploadProfilePhoto(
        data.profilePhoto,
        authData.user.id
      );

      // Update profile with avatar URL
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', authData.user.id);

      if (profileUpdateError) {
        throw new Error(
          `Failed to update profile: ${profileUpdateError.message}`
        );
      }
    } catch (error) {
      throw new Error(
        `Failed to upload profile photo: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  return {
    email: authData.user.email!,
    userId: authData.user.id,
  };
}
