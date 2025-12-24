import '@supabase/functions-js/edge-runtime.d.ts';
import { Hono } from '@hono/hono';

import { authMiddleware } from '../_shared/middlewares/auth.middleware.ts';
import { apiResponse } from '../_shared/utils/responses.ts';
import {
  cancelSubscriptionHandler,
  createCheckoutSessionHandler,
  createPortalSessionHandler,
  getSubscriptionStatusHandler,
} from './handlers/index.ts';

const app = new Hono().basePath('/subscriptions');

// CORS preflight
app.options('*', () => apiResponse.options());

// Apply authentication middleware to all routes
app.use('*', authMiddleware);

// POST /subscriptions/checkout - Create checkout session (authenticated)
app.post('/checkout', ...createCheckoutSessionHandler);

// GET /subscriptions/status - Get subscription status (authenticated)
app.get('/status', ...getSubscriptionStatusHandler);

// POST /subscriptions/portal - Create customer portal session (authenticated)
app.post('/portal', ...createPortalSessionHandler);

// POST /subscriptions/cancel - Cancel subscription (authenticated)
app.post('/cancel', ...cancelSubscriptionHandler);

Deno.serve(app.fetch);
