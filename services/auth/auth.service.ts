import { callSupabaseFunction } from '@/lib/supabase/functions';

type SignUpParams = {
  body: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  };
  userType: 'professional' | 'structure';
};

export async function getUser(userId: string) {
  try {
    const result = await callSupabaseFunction<{
      createdAt: string;
      email: string;
      firstName: string;
      fullName: null | string;
      id: string;
      lastName: string;
      updatedAt: string;
      userType: string;
    }>(`get-user/${userId}`, {
      method: 'GET',
    });

    if (result.error) {
      return { error: result.error };
    }

    // Handle new standardized response format
    const profile = result.data;
    if (!profile) {
      return { error: 'Profile not found' };
    }

    return { profile };
  } catch (err) {
    console.error('Get user error:', err);
    return { error: 'Internal server error' };
  }
}

export async function signUp({ body, userType }: SignUpParams) {
  try {
    const result = await callSupabaseFunction<{
      message: string;
      user: {
        email: string;
        id: string;
        name: string;
      };
    }>('sign-up', {
      body: {
        ...body,
        userType,
      },
      method: 'POST',
    });

    if (result.error) {
      if (result.error === 'Email already exists') {
        return { error: 'Email already exists' };
      } else {
        return { error: result.error };
      }
    }

    return { message: result.data?.message || 'User created successfully' };
  } catch (err) {
    console.error('Sign up error:', err);
    return { error: 'Internal server error' };
  }
}

// Fonction helper pour maintenir la compatibilité
export async function signUpProfessional({
  body,
}: Omit<SignUpParams, 'userType'>) {
  return signUp({ body, userType: 'professional' });
}

// Fonction helper pour les structures
export async function signUpStructure({
  body,
}: Omit<SignUpParams, 'userType'>) {
  return signUp({ body, userType: 'structure' });
}
