import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

import { Database } from '@/types/database/schema';

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

    // Use service role key to bypass RLS and avoid infinite recursion
    // The RLS policy "Admins can view all profiles" queries the profiles table
    // which would trigger the same policy again, causing infinite recursion
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient<Database>(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Récupérer le profil depuis la table profiles
    // Service role key bypasses RLS, avoiding infinite recursion
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(
        `
        role,
        email,
        first_name,
        last_name,
        avatar_url,
        created_at,
        is_onboarded,
        user_id
      `
      )
      .eq('user_id', userId)
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
        avatarUrl: profile.avatar_url,
        createdAt: profile.created_at,
        email: profile.email,
        firstName: profile.first_name,
        fullName:
          profile.first_name && profile.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : null,
        isOnboarded: profile.is_onboarded,
        lastName: profile.last_name,
        role: profile.role,
        userId: profile.user_id,
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
