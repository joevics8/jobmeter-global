// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BLOCKED_COUNTRIES = new Set(['SG']);

export function middleware(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country') || 'unknown';

  // Skip immediately for non-blocked countries — the vast majority of requests
  // never need any processing at all, so we exit as fast as possible.
  if (!BLOCKED_COUNTRIES.has(country)) {
    return NextResponse.next();
  }

  // Only reach here for blocked countries (SG).
  // Block access to /jobs routes only.
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/jobs')) {
    return new NextResponse('Access Denied', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only run on /jobs routes — that's the only route with active logic.
    // All other routes (blog, apply, onboarding, dashboard, cv, profile)
    // had no middleware logic and were burning edge CPU for nothing.
    '/jobs/:path*',
  ],
};