import { createMiddleware } from '@hono/hono/factory';

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

  await next();
});
