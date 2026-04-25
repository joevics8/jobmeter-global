// app/api/geo/route.ts
// Uses Vercel's built-in geo headers — no external API, no rate limits, no cost
import { NextRequest, NextResponse } from 'next/server';

// Map Vercel's ISO country codes to the full country names used in the jobs DB
const COUNTRY_CODE_MAP: Record<string, string> = {
  NG: 'Nigeria',
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  ES: 'Spain',
  NZ: 'New Zealand',
  AE: 'United Arab Emirates',
  ZA: 'South Africa',
  KE: 'Kenya',
  GH: 'Ghana',
  // Add more as needed
};

export async function GET(request: NextRequest) {
  // Vercel automatically injects geo data into request headers
  const countryCode = request.headers.get('x-vercel-ip-country') || '';
  const country = COUNTRY_CODE_MAP[countryCode] || 'Nigeria'; // default Nigeria

  return NextResponse.json(
    { country, countryCode },
    {
      headers: {
        // Cache at CDN for 24hrs — country rarely changes per visitor
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    }
  );
}