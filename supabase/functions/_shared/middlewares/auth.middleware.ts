import { createMiddleware } from '@hono/hono/factory';
import { createClient } from '@supabase/supabase-js';

import { Database } from '../../../../types/database/schema.ts';
import { authenticateUser } from '../utils/authenticateUser.ts';

export const authMiddleware = createMiddleware(async (context, next) => {
  // Skip authentication for OPTIONS requests (CORS preflight)
  if (context.req.method === 'OPTIONS') {
    await next();
    return;
  }

  const authResult = await authenticateUser(context.req);

  if (!authResult.success) {
    return authResult.response!;
  }

  // Store auth data in context
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
});
