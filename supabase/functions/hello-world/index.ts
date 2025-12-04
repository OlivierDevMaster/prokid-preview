import '@supabase/functions-js/edge-runtime.d.ts';
import { Hono } from '@hono/hono';

import { apiResponse } from '../_shared/utils/responses.ts';
import { helloWorldHandler } from './handlers/index.ts';

const app = new Hono().basePath('/hello-world');

// CORS preflight
app.options('*', () => apiResponse.options());

// GET /hello-world - Hello World endpoint
app.get('/', ...helloWorldHandler);

// POST /hello-world - Hello World endpoint with name
app.post('/', ...helloWorldHandler);

Deno.serve(app.fetch);
