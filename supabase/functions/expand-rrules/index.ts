import '@supabase/functions-js/edge-runtime.d.ts';
import { Hono } from '@hono/hono';

import { apiResponse } from '../_shared/utils/responses.ts';
import { expandRrulesHandler } from './handlers/index.ts';

const app = new Hono().basePath('/expand-rrules');

// CORS preflight
app.options('*', () => apiResponse.options());

// POST /expand-rrules - Expand RRULEs and populate pending queue
// This endpoint is called by the database cron job, so it doesn't require auth middleware
// It uses service role key for authentication
app.post('/', ...expandRrulesHandler);

Deno.serve(app.fetch);
