// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BLOCKED_COUNTRIES = new Set(['SG']);

// Search engine crawlers only — social preview bots (Twitter, Facebook,
// LinkedIn, WhatsApp, Discord, Slack) are intentionally excluded to prevent
// them from inflating page views and function invocations.
const ALLOWED_CRAWLERS = [
  'Googlebot',
  'Bingbot',
  'Slurp',        // Yahoo
  'DuckDuckBot',
  'Baiduspider',
  'YandexBot',
  'AhrefsBot',
  'SemrushBot',
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const ua = request.headers.get('user-agent') || '';

  // 1. SKIP STATIC ASSETS
  if (
    pathname.startsWith('/_next/') ||
    pathname.includes('/static/') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  // 2. ALLOW SOCIAL CRAWLERS THROUGH — before any blocking logic
  if (ALLOWED_CRAWLERS.some(bot => ua.includes(bot))) {
    return NextResponse.next();
  }

  const country = request.headers.get('x-vercel-ip-country') || 'unknown';

  // 3. Country Block
  if (BLOCKED_COUNTRIES.has(country) && pathname.startsWith('/jobs')) {
    return new NextResponse('Access Denied', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude static assets, images, AND all job pages.
    // Job pages are protected by Cloudflare at the edge.
    // Excluding them lets Vercel/Cloudflare cache job pages
    // properly without middleware interfering.
    '/((?!_next/static|_next/image|favicon.ico|jobs/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};