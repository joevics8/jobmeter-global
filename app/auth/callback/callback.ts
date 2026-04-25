// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const next = requestUrl.searchParams.get('next') ?? '/jobs'
  
  // With implicit flow, Supabase handles the session client-side via URL hash.
  // This route just needs to exist as a valid redirect destination.
  // The client will pick up the session automatically via detectSessionInUrl: true.
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}