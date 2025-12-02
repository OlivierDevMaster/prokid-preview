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
    const response = await fetch(`/api/auth/user/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to fetch user' };
    }

    return { profile: data };
  } catch (err) {
    console.error('Get user error:', err);
    return { error: 'Internal server error' };
  }
}

export async function signUp({ body, userType }: SignUpParams) {
  try {
    const response = await fetch(`/api/auth/sign-up/${userType}`, {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error === 'Email already exists') {
        return { error: 'Email already exists' };
      } else {
        return { error: data.error };
      }
    }

    return { message: 'User created successfully' };
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
