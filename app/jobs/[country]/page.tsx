import JobList from '@/components/jobs/JobList';
import { Metadata } from 'next';
import { getCountryDisplay } from '@/lib/countrySlugMap';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://global.jobmeter.app';

// ─── Static params (optional but recommended for known country slugs) ──────────
// Remove this export if you want full dynamic rendering for all countries.
export const dynamic = 'force-dynamic';

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { country: string };
}): Promise<Metadata> {
  const countryDisplay = getCountryDisplay(params.country);
  const title = `Jobs in ${countryDisplay} — Search & Apply | JobMeter`;
  const description = `Browse the latest job vacancies in ${countryDisplay}. Search by role, sector, salary and experience level. Updated daily.`;
  const canonicalUrl = `${siteUrl}/jobs/${params.country}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'JobMeter Global',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CountryJobsPage({
  params,
}: {
  params: { country: string };
}) {
  const countryDisplay = getCountryDisplay(params.country);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Jobs', item: `${siteUrl}/jobs` },
      { '@type': 'ListItem', position: 3, name: `Jobs in ${countryDisplay}`, item: `${siteUrl}/jobs/${params.country}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="min-h-screen bg-white">
        <JobList
          siteType="global"
          initialCountry={countryDisplay}
        />
      </main>
    </>
  );
}