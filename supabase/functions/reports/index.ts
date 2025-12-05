import '@supabase/functions-js/edge-runtime.d.ts';
import { Hono } from '@hono/hono';

import { authMiddleware } from '../_shared/middlewares/auth.middleware.ts';
import { apiResponse } from '../_shared/utils/responses.ts';
import { createReportHandler, getReportsHandler } from './handlers/index.ts';

const app = new Hono().basePath('/reports');

// CORS preflight
app.options('*', () => apiResponse.options());

// Protected routes (with auth middleware)
app.use('*', authMiddleware);

// GET /reports - Get all reports for the authenticated user
app.get('/', ...getReportsHandler);

// POST /reports - Create a new report
app.post('/', ...createReportHandler);

Deno.serve(app.fetch);
