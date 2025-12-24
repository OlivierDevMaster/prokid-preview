/**
 * Client-side only helper pour appeler les Supabase Edge Functions
 * Ce fichier ne doit JAMAIS importer server.ts ou next/headers
 */

const getSupabaseUrl = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
};

const getSupabaseAnonKey = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
};

/**
 * Appelle une Supabase Edge Function (client-side only)
 */
export async function callSupabaseFunction<T = unknown>(
  functionName: string,
  options: {
    body?: unknown;
    headers?: Record<string, string>;
    method?: 'DELETE' | 'GET' | 'POST' | 'PUT';
  } = {}
): Promise<{ data?: T; error?: string }> {
  try {
    const supabaseUrl = getSupabaseUrl();
    if (!supabaseUrl) {
      return { error: 'SUPABASE_URL is not configured' };
    }

    const url = `${supabaseUrl}/functions/v1/${functionName}`;
    const supabaseAnonKey = getSupabaseAnonKey();

    if (!supabaseAnonKey) {
      return {
        error:
          'SUPABASE_ANON_KEY or SUPABASE_PUBLISHABLE_KEY is not configured',
      };
    }

    // Client-side: get session from Supabase client
    const { createClient } = await import('./client');
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const authToken = session?.access_token || null;

    const headers: Record<string, string> = {
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers,
      method: options.method || 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle new standardized response format
      if (data.error) {
        return {
          error:
            typeof data.error === 'string'
              ? data.error
              : data.error.message || `HTTP error! status: ${response.status}`,
        };
      }
      return {
        error: `HTTP error! status: ${response.status}`,
      };
    }

    // Handle new standardized response format (success/data/error)
    if (data.success !== undefined) {
      if (data.success && data.data) {
        return { data: data.data };
      }
      if (!data.success && data.error) {
        return {
          error:
            typeof data.error === 'string'
              ? data.error
              : data.error.message || 'Unknown error',
        };
      }
    }

    // Fallback to old format for backward compatibility
    return { data };
  } catch (error) {
    console.error(`Error calling Supabase function ${functionName}:`, error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to call Supabase function',
    };
  }
}
