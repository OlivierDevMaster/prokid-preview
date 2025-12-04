import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

import { apiResponse } from '../_shared/responses';

const corsHeaders = {
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Origin': '*',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return apiResponse.unauthorized('Missing authorization header');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get user from path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[pathParts.length - 1];

    if (!userId) {
      return apiResponse.badRequest('MISSING_USER_ID', 'User ID is required');
    }

    // Verify the authenticated user
    const {
      data: { user: authenticatedUser },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !authenticatedUser) {
      return apiResponse.unauthorized('Invalid or missing authentication');
    }

    // Récupérer le profil depuis la table profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);

      // Si le profil n'existe pas
      if (profileError.code === 'PGRST116') {
        return apiResponse.notFound('Profile');
      }

      return apiResponse.internalServerError('Failed to fetch profile');
    }

    // Retourner les données du profil
    return apiResponse.ok({
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
      userType: profile.user_type,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return apiResponse.internalServerError(
      error instanceof Error ? error.message : 'Internal server error'
    );
  }
});
