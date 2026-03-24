import '@supabase/functions-js/edge-runtime.d.ts';
import { Hono } from '@hono/hono';

import { authMiddleware } from '../_shared/middlewares/auth.middleware.ts';
import { apiResponse } from '../_shared/utils/responses.ts';
import {
  acceptMissionHandler,
  cancelMissionHandler,
  createMissionsHandler,
  declineMissionHandler,
  updateMissionHandler,
} from './handlers/index.ts';

const app = new Hono().basePath('/missions');

// CORS preflight
app.options('*', () => apiResponse.options());

// Protected routes (with auth middleware)
app.use('*', authMiddleware);

// POST /missions - Create mission invitation(s) (one or more professionals)
app.post('/', ...createMissionsHandler);

// PUT /missions/:id - Update a mission
app.put('/:id', ...updateMissionHandler);

// POST /missions/:id/accept - Accept a mission
app.post('/:id/accept', ...acceptMissionHandler);

// POST /missions/:id/decline - Decline a mission
app.post('/:id/decline', ...declineMissionHandler);

// POST /missions/:id/cancel - Cancel a mission
app.post('/:id/cancel', ...cancelMissionHandler);

Deno.serve(app.fetch);
