import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.remote.jobmeter.app';

const tools = [
  { slug: 'ats-review', name: 'ATS Resume Checker' },
  { slug: 'interview', name: 'AI Interview Practice' },
  { slug: 'scam-detector', name: 'Job Scam Detector' },
  { slug: 'scam-checker', name: 'Company Scam Checker' },
  { slug: 'paye-calculator', name: 'PAYE Calculator' },
  { slug: 'keyword-checker', name: 'Resume Keyword Checker' },
  { slug: 'role-finder', name: 'Job Role Finder' },
  { slug: 'career', name: 'Career Path Planner' },
  { slug: 'remote-jobs-finder', name: 'Remote Jobs Finder' },
  { slug: 'internship-finder', name: 'Internship Finder' },
  { slug: 'accommodation-finder', name: 'Accommodation Finder' },
  { slug: 'nysc-finder', name: 'NYSC Job Finder' },
  { slug: 'graduate-trainee-finder', name: 'Graduate Trainee Finder' },
  { slug: 'entry-level-finder', name: 'Entry Level Jobs Finder' },
  { slug: 'visa-finder', name: 'Visa Sponsorship Jobs Finder' },
  { slug: 'quiz', name: 'Company Quiz Platform' },
];

export async function GET() {
  const routes: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${siteUrl}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  routes.push({
    url: `${siteUrl}/tools`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  });

  console.log(`📄 Tools sitemap: ${routes.length} tools`);

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
