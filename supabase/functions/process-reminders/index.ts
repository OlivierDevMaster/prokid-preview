import '@supabase/functions-js/edge-runtime.d.ts';
import { Hono } from '@hono/hono';

import { apiResponse } from '../_shared/utils/responses.ts';
import { processRemindersHandler } from './handlers/index.ts';

const app = new Hono().basePath('/process-reminders');

// CORS preflight
app.options('*', () => apiResponse.options());

// POST /process-reminders - Process pending reminders queue
// This endpoint is called by the database cron job, so it doesn't require auth middleware
// It uses service role key for authentication
app.post('/', ...processRemindersHandler);

Deno.serve(app.fetch);
