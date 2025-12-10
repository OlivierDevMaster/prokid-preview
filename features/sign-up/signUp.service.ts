import { createClient } from '@/lib/supabase/client';

export interface SignUpData {
  email: string;
  password: string;
  preferredLanguage?: 'en' | 'fr';
}

export async function createAccount(
  data: SignUpData
): Promise<{ email: string; userId: string }> {
  const supabase = createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
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

  return {
    email: authData.user.email!,
    userId: authData.user.id,
  };
}
