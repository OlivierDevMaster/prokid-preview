import '@supabase/functions-js/edge-runtime.d.ts';
import { Hono } from '@hono/hono';

import { apiResponse } from '../_shared/utils/responses.ts';
import { extractRruleDatesHandler } from './handlers/index.ts';

const app = new Hono().basePath('/extract-rrule-dates');

// CORS preflight
app.options('*', () => apiResponse.options());

// POST /extract-rrule-dates - Extract dates from RRULE and update record
app.post('/', ...extractRruleDatesHandler);

Deno.serve(app.fetch);
