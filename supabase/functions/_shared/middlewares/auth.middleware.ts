import { createMiddleware } from '@hono/hono/factory';
import { createClient } from '@supabase/supabase-js';

import { Database } from '../../../../types/database/schema.ts';
import { getAuthToken, verifySupabaseJWT } from '../jwt/default.ts';
import { getUserAndClient } from '../utils/authenticateUser.ts';
import { apiResponse } from '../utils/responses.ts';

export const authMiddleware = createMiddleware(async (context, next) => {
  if (context.req.method === 'OPTIONS') {
    await next();
    return;
  }

  try {
    const token = getAuthToken(context.req.raw);
    await verifySupabaseJWT(token);
    const authResult = await getUserAndClient(token);

    if (!authResult.success) {
      return authResult.response!;
    }

    context.set('user', authResult.user);
    context.set('supabaseClient', authResult.supabaseClient);
    context.set(
      'supabaseAdminClient',
      createClient<Database>(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
          global: {
            headers: {
              Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''}`,
            },
          },
        }
      )
    );

    await next();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('Error in authMiddleware:', message);
    console.error('Error in authMiddleware:', e);
    return apiResponse.unauthorized(message);
  }
});
