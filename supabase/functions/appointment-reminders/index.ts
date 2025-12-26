import '@supabase/functions-js/edge-runtime.d.ts';
import { Hono } from '@hono/hono';

import { apiResponse } from '../_shared/utils/responses.ts';
import { sendAppointmentRemindersHandler } from './handlers/index.ts';

const app = new Hono().basePath('/appointment-reminders');

// CORS preflight
app.options('*', () => apiResponse.options());

// POST /appointment-reminders - Process and send appointment reminders
// This endpoint is called by the database cron job, so it doesn't require auth middleware
// It uses service role key for authentication
app.post('/', ...sendAppointmentRemindersHandler);

Deno.serve(app.fetch);
