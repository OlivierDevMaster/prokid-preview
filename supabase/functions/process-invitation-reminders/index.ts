import '@supabase/functions-js/edge-runtime.d.ts';
import { Hono } from '@hono/hono';

import { apiResponse } from '../_shared/utils/responses.ts';
import { processInvitationRemindersHandler } from './handlers/processInvitationRemindersHandler.ts';

const app = new Hono().basePath('/process-invitation-reminders');

// CORS preflight
app.options('*', () => apiResponse.options());

// POST /process-invitation-reminders - Process pending invitation reminders
// This endpoint is called by the database cron job, so it doesn't require auth middleware
app.post('/', ...processInvitationRemindersHandler);

Deno.serve(app.fetch);
