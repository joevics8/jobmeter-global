"use client";

// Fires once in the browser after the cached HTML is served.
// This way view count increments happen client-side, not on every
// Vercel render — which would fire on every Cloudflare cache miss.
import { useEffect } from 'react';

export default function BlogViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_blog_views`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ blog_slug: slug }),
    }).catch(() => {
      // Silent fail — view count is non-critical
    });
  }, [slug]);

  return null;
}
