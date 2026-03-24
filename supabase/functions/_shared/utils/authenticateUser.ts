import { HonoRequest } from '@hono/hono';
import { createClient, User } from '@supabase/supabase-js';

import { Database } from '../../../../types/database/schema.ts';
import { apiResponse } from './responses.ts';

export interface AuthResult {
  response?: Response;
  success: boolean;
  supabaseClient?: ReturnType<typeof createClient<Database>>;
  user?: User;
}

export async function authenticateUser(req: HonoRequest): Promise<AuthResult> {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return {
      response: apiResponse.unauthorized('Token is required'),
      success: false,
    };
  }

  return await getUserAndClient(token);
}

/** Gets user and Supabase client from an already-verified JWT token. No token extraction or JWT verification. */
export async function getUserAndClient(token: string): Promise<AuthResult> {
  const supabaseClient = createClient<Database>(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SB_PUBLISHABLE_KEY') ?? '',
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser(token);

  if (authError) {
    console.error('Auth error:', authError);
    return {
      response: apiResponse.unauthorized('Invalid token'),
      success: false,
    };
  }

  if (!user) {
    return {
      response: apiResponse.unauthorized('User not found'),
      success: false,
    };
  }

  return {
    success: true,
    supabaseClient,
    user,
  };
}
