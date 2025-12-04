/**
 * Appelle une Supabase Edge Function
 *
 * Utilise automatiquement la bonne implémentation selon l'environnement :
 * - Client-side : utilise functions-client.ts (pas d'import de next/headers)
 * - Server-side : utilise functions-server.ts (peut importer next/headers)
 */
export async function callSupabaseFunction<T = unknown>(
  functionName: string,
  options: {
    body?: unknown;
    headers?: Record<string, string>;
    method?: 'DELETE' | 'GET' | 'POST' | 'PUT';
  } = {}
): Promise<{ data?: T; error?: string }> {
  // Use dynamic import to avoid bundling server code in client bundle
  if (typeof window !== 'undefined') {
    // Client-side: use client-only implementation
    const { callSupabaseFunction: clientFn } =
      await import('./functions-client');
    return clientFn<T>(functionName, options);
  } else {
    // Server-side: use server-only implementation
    const { callSupabaseFunction: serverFn } =
      await import('./functions-server');
    return serverFn<T>(functionName, options);
  }
}
