// app/sitemap-category.xml/route.ts
// Generates /sitemap-category.xml with all published global category pages

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.global.jobmeter.app';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return new NextResponse('Supabase credentials missing', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('category_job_pages')
      .select('slug, updated_at, page_type')
      .eq('is_published', true)
      .eq('website_country', 'global') // Filter for global entries
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching category pages:', error);
      return new NextResponse('Error fetching data', { status: 500 });
    }

    const pages = data ?? [];

    const urls = pages
      .map((page) => {
        const loc = escapeXml(`${siteUrl}/category/${page.slug}`);
        const lastmod = new Date(page.updated_at).toISOString().split('T')[0];
        const priority = page.page_type === 'jobs_in_location' ? '0.8' : '0.7';

        return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
  </url>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('Sitemap category generation error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 3600;