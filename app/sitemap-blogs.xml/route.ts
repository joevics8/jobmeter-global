import { createClient } from '@supabase/supabase-js';
import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobmeter.app';

/**
 * Blog sitemap
 * Place at: app/sitemap-blogs/route.ts
 */
export async function GET() {
  const routes: MetadataRoute.Sitemap = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase credentials not found');
      return new Response('Missing Supabase credentials', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // ✅ Table is `blogs`, not `posts`. Filter by is_published = true.
    const { data: blogs, error: blogError } = await supabase
      .from('blogs')
      .select('slug, updated_at')
      .eq('is_published', true);

    if (blogError) {
      console.error('Error fetching blogs:', JSON.stringify(blogError));
      return new Response(`Error fetching blogs: ${blogError.message}`, { status: 500 });
    }

    if (blogs && blogs.length > 0) {
      blogs.forEach((blog) => {
        if (!blog.slug) return;
        routes.push({
          url: `${siteUrl}/blog/${blog.slug}`,
          lastModified: blog.updated_at ? new Date(blog.updated_at) : new Date(),
          changeFrequency: 'daily',
          priority: 0.7,
        });
      });
    }

    console.log(`📄 Blogs sitemap: ${routes.length} posts`);
  } catch (error) {
    console.error('Error generating blogs sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${route.url}</loc>
    <lastmod>${new Date(route.lastModified || new Date()).toISOString()}</lastmod>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

export const revalidate = 3600;