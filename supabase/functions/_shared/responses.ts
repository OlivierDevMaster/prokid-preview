import type { ApiResponse } from './types';

import { corsHeaders } from './cors';

const createResponse = (
  body: string,
  status: number,
  headers?: Record<string, string>
) =>
  new Response(body, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ...headers,
    },
    status,
  });

export const apiResponse = {
  badRequest: (
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) =>
    createResponse(
      JSON.stringify({
        error: { code, details, message },
        success: false,
      } as ApiResponse),
      400
    ),

  conflict: (message = 'Conflit') =>
    createResponse(
      JSON.stringify({
        error: { code: 'CONFLICT', message },
        success: false,
      } as ApiResponse),
      409
    ),

  created: <T>(data: T) =>
    createResponse(
      JSON.stringify({
        data,
        meta: { timestamp: new Date().toISOString() },
        success: true,
      } as ApiResponse<T>),
      201
    ),

  forbidden: (message = 'Accès interdit') =>
    createResponse(
      JSON.stringify({
        error: { code: 'FORBIDDEN', message },
        success: false,
      } as ApiResponse),
      403
    ),

  internalServerError: (message = 'Erreur interne du serveur') =>
    createResponse(
      JSON.stringify({
        error: { code: 'INTERNAL_ERROR', message },
        success: false,
      } as ApiResponse),
      500
    ),

  notFound: (resource = 'Ressource') =>
    createResponse(
      JSON.stringify({
        error: { code: 'NOT_FOUND', message: `${resource} introuvable` },
        success: false,
      } as ApiResponse),
      404
    ),

  ok: <T>(data: T, meta?: Partial<ApiResponse<T>['meta']>) =>
    createResponse(
      JSON.stringify({
        data,
        meta: { ...meta, timestamp: new Date().toISOString() },
        success: true,
      } as ApiResponse<T>),
      200
    ),

  options: () => createResponse('', 200),

  unauthorized: (message = 'Non autorisé') =>
    createResponse(
      JSON.stringify({
        error: { code: 'UNAUTHORIZED', message },
        success: false,
      } as ApiResponse),
      401
    ),

  unprocessableEntity: (
    message = 'Entité non traitable',
    details?: Record<string, unknown>
  ) =>
    createResponse(
      JSON.stringify({
        error: { code: 'UNPROCESSABLE_ENTITY', details, message },
        success: false,
      } as ApiResponse),
      422
    ),
};
