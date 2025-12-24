import {
  FunctionInvokeOptions,
  FunctionsHttpError,
} from '@supabase/supabase-js';

import { SupabaseTestClient } from './SupabaseTestClient.ts';

export type InvokeEndpointParams = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
  name: string;
  path?: string;
  queryParams?: Record<string, boolean | number | string>;
  token: null | string;
};

export class ApiTestHelper {
  constructor(private supabaseClientFactory: SupabaseTestClient) {}

  async invokeEndpoint(
    params: InvokeEndpointParams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<{ data: any; response: Response }> {
    const { body, method, name, path, queryParams, token } = params;

    const client = token
      ? this.supabaseClientFactory.createAuthenticatedClient(token)
      : this.supabaseClientFactory.createUnauthenticatedClient();

    // Build the function name with path and query parameters
    let functionName = name;

    // Add path if provided (but not for root path)
    if (path && path !== '/') {
      functionName = `${name}${path}`;
    }

    // Add query parameters if provided
    if (queryParams) {
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      functionName = `${functionName}?${searchParams.toString()}`;
    }

    let options: FunctionInvokeOptions;
    if (method === 'GET') {
      options = {
        method,
      };
    } else {
      options = {
        body,
        method,
      };
    }

    const result = await client.functions.invoke(functionName, options);

    if (result.error) {
      if (result.error instanceof FunctionsHttpError) {
        let data;
        // Read the response as text first
        const responseText = await result.error.context.text();

        try {
          data = JSON.parse(responseText);
        } catch {
          // If JSON parsing fails, return the raw response text
          data = {
            error: {
              code: 'PARSE_ERROR',
              message: `Failed to parse response as JSON: ${responseText}`,
            },
            success: false,
          };
        }

        return { data: data, response: result.error.context };
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
        return { data: responseData.data, response: result.response! };
      } else {
        // Return the response as-is if it's not wrapped
        return { data: responseData, response: result.response! };
      }
    }
  }
}
