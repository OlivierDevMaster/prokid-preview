import { createMiddleware } from '@hono/hono/factory';

import { authenticateUser } from '../utils/authenticateUser.ts';

export const authMiddleware = createMiddleware(async (context, next) => {
  const authResult = await authenticateUser(context.req);

  if (!authResult.success) {
    return authResult.response!;
  }

  // Store auth data in context
  context.set('user', authResult.user);
  context.set('supabaseClient', authResult.supabaseClient);

  await next();
});
