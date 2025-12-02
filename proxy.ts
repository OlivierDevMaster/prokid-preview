import createMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/proxy';

import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  // First, apply next-intl middleware to handle locale routing
  const intlResponse = intlMiddleware(request);

  // If next-intl redirected, return that response immediately
  // (Don't process Supabase session for redirects to avoid loops)
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse;
  }

  // Then, update Supabase session (this should not redirect anymore)
  const supabaseResponse = await updateSession(request);

  // Supabase should not redirect anymore, but if it does, return it
  if (supabaseResponse.status === 307 || supabaseResponse.status === 308) {
    return supabaseResponse;
  }

  // Return Supabase response (it contains the updated cookies)
  // The response body and status should be the same as intlResponse
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (e.g., .svg, .png, .jpg, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
