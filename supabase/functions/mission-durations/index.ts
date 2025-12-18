import '@supabase/functions-js/edge-runtime.d.ts';
import { Hono } from '@hono/hono';

import { authMiddleware } from '../_shared/middlewares/auth.middleware.ts';
import { apiResponse } from '../_shared/utils/responses.ts';
import {
  getMembershipMissionDurationsHandler,
  getMissionDurationHandler,
} from './handlers/index.ts';

const app = new Hono().basePath('/mission-durations');

// CORS preflight
app.options('*', () => apiResponse.options());

// Protected routes (with auth middleware)
app.use('*', authMiddleware);

// GET /mission-durations/membership?professional_id=...&structure_id=... - Get mission durations per membership
app.get('/membership', ...getMembershipMissionDurationsHandler);

// GET /mission-durations/mission?mission_id=... - Get mission duration per mission
app.get('/mission', ...getMissionDurationHandler);

Deno.serve(app.fetch);
