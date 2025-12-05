import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

import { apiResponse } from '../_shared/responses';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse request body
    const { email, firstName, lastName, password, userType } = await req.json();

    // Validation du type d'utilisateur
    if (!userType || !['professional', 'structure'].includes(userType)) {
      return apiResponse.badRequest(
        'INVALID_USER_TYPE',
        "Invalid user type. Must be 'professional' or 'structure'"
      );
    }

    if (!firstName || !lastName || !email || !password) {
      return apiResponse.badRequest(
        'MISSING_FIELDS',
        'Missing required fields'
      );
    }

    if (password.length < 8) {
      return apiResponse.badRequest(
        'INVALID_PASSWORD',
        'Password must be at least 8 characters'
      );
    }

    const fullName = `${firstName} ${lastName}`;

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true, // Auto-confirm email
        password,
        user_metadata: {
          first_name: firstName,
          full_name: fullName,
          last_name: lastName,
          user_type: userType,
        },
      });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return apiResponse.conflict('Email already exists');
      }
      return apiResponse.badRequest('AUTH_ERROR', authError.message);
    }

    if (!authData.user) {
      return apiResponse.internalServerError('Failed to create user');
    }

    const userId = authData.user.id;

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        email: email,
        first_name: firstName,
        last_name: lastName,
        user: userId,
        user_type: userType,
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);

      // Try to delete the user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId);

      if (profileError.code === 'PGRST116') {
        return apiResponse.internalServerError(
          'Profile table does not exist. Please create the profiles table in your Supabase database.'
        );
      }

      return apiResponse.internalServerError('Failed to create profile');
    }

    return apiResponse.created({
      message: 'User created successfully',
      user: {
        email: email,
        id: userId,
        name: fullName,
      },
    });
  } catch (error) {
    console.error('Sign up error:', error);
    return apiResponse.internalServerError(
      error instanceof Error ? error.message : 'Internal server error'
    );
  }
});
