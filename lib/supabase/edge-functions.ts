import {
  FunctionInvokeOptions,
  FunctionsHttpError,
  SupabaseClient,
} from '@supabase/supabase-js';

import type { ApiError, ApiResponse } from '../../types/api/responses';

import { Database } from '../../types/database/schema';

// Custom error class for edge function errors
export class EdgeFunctionError extends Error {
  public readonly code: string;
  public readonly details: null | Record<string, unknown>;
  public readonly response: ApiResponse<unknown>;
  public readonly statusCode?: number;

  constructor(
    error: ApiError,
    response: ApiResponse<unknown>,
    statusCode?: number
  ) {
    // Use the user-friendly message from the API response
    super(error.message);
    this.name = 'EdgeFunctionError';
    this.code = error.code;
    this.details = error.details;
    this.statusCode = statusCode;
    this.response = response;
  }
}

export const invokeEdgeFunction = async <
  TData,
  TBody extends FunctionInvokeOptions['body'] = undefined,
>(
  supabase: SupabaseClient<Database>,
  functionName: string,
  options: {
    body?: TBody;
    method?: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
    path?: string;
    queryParams?: Record<string, boolean | number | string>;
  } = {}
): Promise<TData> => {
  const { body, method = 'GET', path, queryParams } = options;

  // Build the function name with path and query parameters (following ApiHelper pattern)
  let fullFunctionName = functionName;

  // Add path if provided (but not for root path)
  if (path && path !== '/') {
    fullFunctionName = `${functionName}${path}`;
  }

  // Add query parameters if provided
  if (queryParams) {
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    fullFunctionName = `${fullFunctionName}?${searchParams.toString()}`;
  }

  // Prepare invoke options - following the ApiHelper pattern exactly
  let invokeOptions: FunctionInvokeOptions;
  if (method === 'GET') {
    invokeOptions = { method };
  } else {
    invokeOptions = { body, method };
  }

  const result = await supabase.functions.invoke<TData>(
    fullFunctionName,
    invokeOptions
  );

  if (result.error) {
    if (result.error instanceof FunctionsHttpError) {
      let data: ApiResponse<unknown>;
      // Read the response as text first
      const responseText = await result.error.context.text();

      try {
        data = JSON.parse(responseText) as ApiResponse<unknown>;
      } catch {
        // If JSON parsing fails, create a fallback error structure
        data = {
          data: null,
          error: {
            code: 'PARSE_ERROR',
            details: null,
            message: `Failed to parse response as JSON: ${responseText}`,
          },
          meta: {
            pagination: null,
            timestamp: new Date().toISOString(),
          },
          success: false,
        };
      }

      // Extract status code from the response if available
      const statusCode = result.error.context.status;

      // Throw custom error with structured data
      if (data.error) {
        throw new EdgeFunctionError(data.error, data, statusCode);
      } else {
        // Fallback if error structure is missing
        throw new EdgeFunctionError(
          {
            code: 'UNKNOWN_ERROR',
            details: null,
            message: 'Une erreur inconnue est survenue',
          },
          data,
          statusCode
        );
      }
    } else {
      throw result.error;
    }
  } else {
    // Handle wrapped response from Supabase functions
    const responseData = result.data;
    if (
      responseData &&
      typeof responseData === 'object' &&
      'data' in responseData
    ) {
      // Extract the actual data from the wrapped response
      return responseData.data as TData;
    } else {
      // Return the response as-is if it's not wrapped
      return responseData as unknown as TData;
    }
  }
};
