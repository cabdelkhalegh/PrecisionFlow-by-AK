import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/api/health'];

/**
 * API routes that handle their own auth
 */
const API_ROUTES = ['/api/trpc'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // Allow API routes (they handle auth via tRPC middleware)
  if (API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static assets and Next.js internals
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Check for Supabase auth token in cookies
  // Supabase stores session as sb-<project-ref>-auth-token
  const hasAuthCookie = request.cookies.getAll().some(
    (cookie) => /^sb-[a-z]+-auth-token$/.test(cookie.name)
  );

  if (!hasAuthCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
