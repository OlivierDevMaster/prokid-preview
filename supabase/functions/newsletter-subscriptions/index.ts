import '@supabase/functions-js/edge-runtime.d.ts';
import { Hono } from '@hono/hono';

import { apiResponse } from '../_shared/utils/responses.ts';
import { createNewsletterSubscriptionHandler } from './handlers/index.ts';

const app = new Hono().basePath('/newsletter-subscriptions');

// CORS preflight
app.options('*', () => apiResponse.options());

// POST /newsletter-subscriptions - Create a new newsletter subscription (public)
app.post('/', ...createNewsletterSubscriptionHandler);

Deno.serve(app.fetch);
