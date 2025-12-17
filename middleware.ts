import { createServerClient } from '@supabase/ssr';
import { getToken } from 'next-auth/jwt';
import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { updateSession } from '@/lib/supabase/proxy';

import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Role-based route protection
const roleRoutes: Record<string, string> = {
  '/admin': 'admin',
  '/professional': 'professional',
  '/structure': 'structure',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // First, apply next-intl middleware to handle locale routing
  const intlResponse = intlMiddleware(request);

  // If next-intl redirected, return that response immediately
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse;
  }

  // Extract locale and path without locale
  const locale = pathname.split('/')[1];
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  // Check if the path requires role-based access
  const requiredRole = Object.entries(roleRoutes).find(([route]) =>
    pathWithoutLocale.startsWith(route)
  )?.[1];

  if (requiredRole) {
    // Get NextAuth token
    const token = await getToken({
      req: request,
      secret: authOptions.secret,
    });

    // If no token, redirect to login
    if (!token || !token.id) {
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Create Supabase client for middleware context
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables in middleware');
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // Cookies are set via the response in updateSession
        },
      },
    });

    // Get user profile role from Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', token.id as string)
      .maybeSingle();

    // If profile not found or error, redirect to login
    if (error || !profile || !profile.role) {
      console.error('Profile not found or missing role:', { error, profile });
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      loginUrl.searchParams.set('error', 'profile_not_found');
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has the required role
    if (profile.role !== requiredRole) {
      // Redirect to appropriate dashboard based on user's role
      // If user doesn't have a valid role, redirect to login
      let redirectPath = `/${locale}/auth/login`;

      if (profile.role === 'admin') {
        redirectPath = `/${locale}/admin/dashboard`;
      } else if (profile.role === 'professional') {
        redirectPath = `/${locale}/professional/dashboard`;
      } else if (profile.role === 'structure') {
        redirectPath = `/${locale}/structure/dashboard`;
      }

      const redirectUrl = new URL(redirectPath, request.url);
      // Add a message parameter to inform the user why they were redirected
      redirectUrl.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Update Supabase session
  const supabaseResponse = await updateSession(request);

  // Return Supabase response (it contains the updated cookies)
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
     * - auth routes (login, signup, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
