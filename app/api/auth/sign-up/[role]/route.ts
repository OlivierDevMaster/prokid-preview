import { NextResponse } from 'next/server';

import { Role } from '@/features/roles/role.model';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ role: string }> }
) {
  try {
    const { email, firstName, lastName, password } = await request.json();
    const { role } = await params;

    const allowedRoles: Role[] = [Role.professional, Role.structure];

    // Validation du type d'utilisateur
    if (!role || !allowedRoles.includes(role as Role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'professional' or 'structure'" },
        { status: 400 }
      );
    }

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const fullName = `${firstName} ${lastName}`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      options: {
        data: {
          first_name: firstName,
          full_name: fullName,
          last_name: lastName,
          role: role,
        },
      },
      password,
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Profile is automatically created by the database trigger handle_new_user()
    // No need to manually insert the profile

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          email: email,
          id: authData.user.id,
          name: fullName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
