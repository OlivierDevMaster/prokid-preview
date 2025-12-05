import '@supabase/functions-js/edge-runtime.d.ts';
import { Hono } from '@hono/hono';

import { apiResponse } from '../_shared/utils/responses.ts';
import { getAvailabilitySlotsHandler } from './handlers/index.ts';

const app = new Hono().basePath('/availabilities');

// CORS preflight
app.options('*', () => apiResponse.options());

// GET /availabilities/slots - Get availability slots for a professional
app.get('/slots', ...getAvailabilitySlotsHandler);

Deno.serve(app.fetch);
