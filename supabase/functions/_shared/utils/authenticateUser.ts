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
      response: apiResponse.unauthorized(),
      success: false,
    };
  }

  const supabaseClient = createClient<Database>(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
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
      response: apiResponse.unauthorized(),
      success: false,
    };
  }

  if (!user) {
    return {
      response: apiResponse.unauthorized(),
      success: false,
    };
  }

  return {
    success: true,
    supabaseClient,
    user,
  };
}
