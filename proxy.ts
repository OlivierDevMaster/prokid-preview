import { createServerClient } from '@supabase/ssr';
import { getToken } from 'next-auth/jwt';
import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { updateSession } from '@/lib/supabase/proxy';
import { Database } from '@/types/database/schema';

import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Role-based route protection
const roleRoutes: Record<string, string> = {
  '/admin': 'admin',
  '/professional': 'professional',
  '/structure': 'structure',
};

export async function proxy(request: NextRequest) {
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

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/professionals', '/faq', '/auth'];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') {
      return pathWithoutLocale === '/';
    }
    return pathWithoutLocale.startsWith(route);
  });

  // If it's a public route, skip role checking
  if (isPublicRoute) {
    const supabaseResponse = await updateSession(request);
    return supabaseResponse;
  }

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
          // We don't set them here to avoid conflicts
        },
      },
    });

    // Create service role client for subscription checks
    // This bypasses RLS, which is acceptable since NextAuth has already verified identity
    let supabaseServiceRole: null | ReturnType<typeof createServiceRoleClient> =
      null;
    try {
      supabaseServiceRole = createServiceRoleClient();
    } catch {
      // Continue with regular client - subscription check will fail but won't crash
    }

    // Get user profile role from Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', token.id as string)
      .maybeSingle();

    // If profile not found or error, redirect to login
    if (error || !profile || !profile.role) {
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
        // Check if professional is subscribed before allowing access
        // Use service role client to bypass RLS (NextAuth has already verified identity)
        const subscriptionClient = supabaseServiceRole || supabase;
        const { data: isSubscribed, error: subscriptionError } =
          await subscriptionClient.rpc('is_professional_subscribed', {
            user_id_param: token.id as string,
          });

        if (subscriptionError || !isSubscribed) {
          // Redirect to subscription page if not subscribed
          redirectPath = `/${locale}/professional/subscription`;
        } else {
          redirectPath = `/${locale}/professional/dashboard`;
        }
      } else if (profile.role === 'structure') {
        redirectPath = `/${locale}/structure/dashboard`;
      }

      const redirectUrl = new URL(redirectPath, request.url);
      // Add a message parameter to inform the user why they were redirected
      redirectUrl.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(redirectUrl);
    }

    // Additional check: if accessing professional routes, verify subscription
    // Skip subscription check for subscription-related pages to avoid redirect loops
    const isSubscriptionPage = pathWithoutLocale.startsWith(
      '/professional/subscription'
    );

    if (requiredRole === 'professional' && !isSubscriptionPage) {
      // Use service role client to bypass RLS (NextAuth has already verified identity)
      const subscriptionClient = supabaseServiceRole || supabase;
      const { data: isSubscribed, error: subscriptionError } =
        await subscriptionClient.rpc('is_professional_subscribed', {
          user_id_param: token.id as string,
        });

      if (subscriptionError) {
        // Allow access but log the error (could redirect to error page)
      } else if (!isSubscribed) {
        // Redirect to subscription page if not subscribed
        const subscriptionUrl = new URL(
          `/${locale}/professional/subscription`,
          request.url
        );
        subscriptionUrl.searchParams.set('error', 'subscription_required');
        return NextResponse.redirect(subscriptionUrl);
      }
    }
  }

  // Update Supabase session
  const supabaseResponse = await updateSession(request);

  // Return Supabase response (it contains the updated cookies)
  return supabaseResponse;
}

/**
 * Creates a Supabase admin client with service role key to bypass RLS
 * Used for subscription checks in middleware where NextAuth has already verified identity
 * Uses createServerClient from @supabase/ssr with no-op cookie handlers since service role doesn't need session management
 */
function createServiceRoleClient(): ReturnType<
  typeof createServerClient<Database>
> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured'
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    cookies: {
      getAll() {
        // No-op: service role client doesn't need cookies
        return [];
      },
      setAll() {
        // No-op: service role client doesn't need to set cookies
      },
    },
  });
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
