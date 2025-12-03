import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Récupérer le profil depuis la table profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);

      // Si le profil n'existe pas
      if (profileError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // Retourner les données du profil
    return NextResponse.json(
      {
        createdAt: profile.created_at,
        email: profile.email,
        firstName: profile.first_name,
        fullName:
          profile.first_name && profile.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : null,
        id: profile.user,
        lastName: profile.last_name,
        updatedAt: profile.updated_at,
        userType: profile.role,
        // Ajoutez d'autres champs selon votre schéma de table profiles
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
