import '@supabase/functions-js/edge-runtime.d.ts';
import { Hono } from '@hono/hono';

import { apiResponse } from '../_shared/utils/responses.ts';
import { sendNotificationEmailHandler } from './handlers/index.ts';

const app = new Hono().basePath('/send-notification-email');

// CORS preflight
app.options('*', () => apiResponse.options());

// POST /send-notification-email - Send email notification
// This endpoint is called by the database trigger, so it doesn't require auth middleware
// It uses service role key for authentication
app.post('/', ...sendNotificationEmailHandler);

Deno.serve(app.fetch);

