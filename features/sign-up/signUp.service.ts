import { createClient } from '@/lib/supabase/client';

export interface SignUpData {
  email: string;
  firstName?: string;
  lastName?: string;
  password: string;
  preferredLanguage?: 'en' | 'fr';
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
    parsedData.firstName = data.firstName;
  }
  if (data.lastName) {
    parsedData.lastName = data.lastName;
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

  return {
    email: authData.user.email!,
    userId: authData.user.id,
  };
}
