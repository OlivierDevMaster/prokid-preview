import '@supabase/functions-js/edge-runtime.d.ts';
import { Hono } from '@hono/hono';

import { authMiddleware } from '../_shared/middlewares/auth.middleware.ts';
import { apiResponse } from '../_shared/utils/responses.ts';
import { getMissionDurationsHandler } from './handlers/index.ts';

const app = new Hono().basePath('/mission-durations');

// CORS preflight
app.options('*', () => apiResponse.options());

// Protected routes (with auth middleware)
app.use('*', authMiddleware);

// GET /mission-durations?professional_id=...&structure_id=... - Get mission durations
app.get('/', ...getMissionDurationsHandler);

Deno.serve(app.fetch);
