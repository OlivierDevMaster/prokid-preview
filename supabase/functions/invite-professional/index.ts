import '@supabase/functions-js/edge-runtime.d.ts';
import { Hono } from '@hono/hono';

import { authMiddleware } from '../_shared/middlewares/auth.middleware.ts';
import { apiResponse } from '../_shared/utils/responses.ts';
import { inviteProfessionalHandler } from './handlers/inviteProfessionalHandler.ts';

const app = new Hono().basePath('/invite-professional');

// CORS preflight
app.options('*', () => apiResponse.options());

// Protected routes (with auth middleware)
app.use('*', authMiddleware);

// POST /invite-professional - Invite a professional
app.post('/', ...inviteProfessionalHandler);

Deno.serve(app.fetch);
