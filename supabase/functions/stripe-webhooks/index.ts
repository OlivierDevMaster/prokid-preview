import '@supabase/functions-js/edge-runtime.d.ts';
import { Hono } from '@hono/hono';

import { apiResponse } from '../_shared/utils/responses.ts';
import { webhookHandler } from './handlers/index.ts';

const app = new Hono().basePath('/stripe-webhooks');

// CORS preflight
app.options('*', () => apiResponse.options());

// POST /stripe-webhooks - Handle Stripe webhook events (no authentication, uses signature verification)
app.post('/', ...webhookHandler);

Deno.serve(app.fetch);
