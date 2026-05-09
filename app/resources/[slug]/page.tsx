import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import CategoryJobList, { RawJobRow } from '@/components/category/CategoryJobList';
import CategoryContent from '@/components/category/CategoryContent';
import Link from 'next/link';
import { ArrowLeft, Briefcase, MapPin } from 'lucide-react';
import AdUnit from '@/components/ads/AdUnit';

// Cache forever — page is fully static until a new deploy or on-demand
// revalidation clears it. This is what Vercel's "cache infinitely" maps to
// in Next.js: revalidate = false means no automatic time-based rebuild.
export const revalidate = false;

// Slugs not in generateStaticParams are built on first request, then cached
// forever the same way (no automatic expiry). A deploy or revalidateTag()
// call is what clears them.
export const dynamicParams = true;

interface CategoryPage {
  id: string;
  category: string;
  location: string | null;
  slug: string;
  meta_title: string;
  meta_description: string;
  seo_keywords: string[] | null;
  h1_title: string;
  about_role: string | null;
  who_should_apply: string | null;
  how_to_stand_out: string | null;
  key_responsibilities: string[] | null;
  faqs: any;
  related_categories: string[] | null;
  related_locations: string[] | null;
  view_count: number;
  job_count: number;
  town: string | null;
}

interface RelatedCategory {
  slug: string;
  h1_title: string;
  job_count: number;
  location: string | null;
  town: string | null;
}

async function getCategoryPage(slug: string): Promise<CategoryPage | null> {
  try {
    const { data, error } = await supabase
      .from('category_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    if (error || !data) return null;
    return data;
  } catch (error) {
    console.error('Error fetching category page:', error);
    return null;
  }
}

async function incrementViewCount(slug: string) {
  try {
    await supabase.rpc('increment_category_page_views', { page_slug: slug });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

async function getInitialJobs(page: CategoryPage): Promise<RawJobRow[]> {
  try {
    let query = supabase
      .from('jobs')
      .select('id, slug, title, company, location, salary_range, employment_type, posted_date, created_at')
      .in('status', ['active', 'expired', 'expired_indexed'])
      .order('created_at', { ascending: false })
      .limit(20);

    query = query.eq('category', page.category);
    if (page.location) query = query.eq('location->>state', page.location);

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching initial jobs:', error);
      return [];
    }
    return (data as RawJobRow[]) || [];
  } catch (error) {
    console.error('Error fetching initial jobs:', error);
    return [];
  }
}

async function fetchRelatedCategories(page: CategoryPage): Promise<RelatedCategory[]> {
  try {
    const relatedSlugs: string[] = [];

    if (page.town) {
      const { data } = await supabase
        .from('category_pages')
        .select('slug, h1_title, job_count, location, town')
        .eq('town', page.town)
        .eq('is_published', true)
        .neq('slug', page.slug)
        .limit(3);
      if (data) data.forEach(cat => relatedSlugs.push(cat.slug));
    }

    if (page.location && relatedSlugs.length < 6) {
      const { data } = await supabase
        .from('category_pages')
        .select('slug, h1_title, job_count, location, town')
        .eq('location', page.location)
        .eq('is_published', true)
        .neq('slug', page.slug)
        .not('slug', 'in', `(${relatedSlugs.join(',')})`)
        .limit(6 - relatedSlugs.length);
      if (data) data.forEach(cat => relatedSlugs.push(cat.slug));
    }

    if (page.related_categories?.length && relatedSlugs.length < 6) {
      const toFetch = page.related_categories
        .filter(s => !relatedSlugs.includes(s))
        .slice(0, 6 - relatedSlugs.length);
      if (toFetch.length > 0) {
        const { data } = await supabase
          .from('category_pages')
          .select('slug, h1_title, job_count, location, town')
          .in('slug', toFetch)
          .eq('is_published', true);
        if (data) data.forEach(cat => relatedSlugs.push(cat.slug));
      }
    }

    if (page.related_locations?.length && relatedSlugs.length < 6) {
      const toFetch = page.related_locations
        .filter(s => !relatedSlugs.includes(s))
        .slice(0, 6 - relatedSlugs.length);
      if (toFetch.length > 0) {
        const { data } = await supabase
          .from('category_pages')
          .select('slug, h1_title, job_count, location, town')
          .in('slug', toFetch)
          .eq('is_published', true);
        if (data) data.forEach(cat => {
          if (!relatedSlugs.includes(cat.slug)) relatedSlugs.push(cat.slug);
        });
      }
    }

    if (relatedSlugs.length === 0) return [];

    const { data } = await supabase
      .from('category_pages')
      .select('slug, h1_title, job_count, location, town')
      .in('slug', relatedSlugs)
      .eq('is_published', true)
      .limit(6);

    return data || [];
  } catch (error) {
    console.error('Error fetching related categories:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await getCategoryPage(params.slug);
  if (!page) return { title: 'Category Not Found | JobMeter' };

  const keywords = page.seo_keywords?.join(', ') || 'jobs, careers, employment';
  const url = `https://global.jobmeter.app/resources/${page.slug}`;
  const shouldAddNearMe =
    !!page.location && page.meta_title.length + ' (Hiring near me)'.length <= 70;
  const title = shouldAddNearMe ? `${page.meta_title} (Hiring near me)` : page.meta_title;

  return {
    title,
    description: page.meta_description,
    keywords: keywords.split(',').map(k => k.trim()),
    authors: [{ name: 'JobMeter' }],
    openGraph: {
      title,
      description: page.meta_description,
      url,
      siteName: 'JobMeter',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: page.meta_description,
    },
    alternates: { canonical: url },
  };
}

export async function generateStaticParams() {
  try {
    const { data } = await supabase
      .from('category_pages')
      .select('slug')
      .eq('is_published', true)
      .order('job_count', { ascending: false })
      .limit(200);
    if (!data) return [];
    return data.map(page => ({ slug: page.slug }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const page = await getCategoryPage(params.slug);
  if (!page) notFound();

  const [initialJobs, relatedCategories] = await Promise.all([
    getInitialJobs(page),
    fetchRelatedCategories(page),
  ]);

  incrementViewCount(params.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: page.h1_title,
    description: page.meta_description,
    url: `https://global.jobmeter.app/resources/${page.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      name: page.h1_title,
      description: page.meta_description,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://global.jobmeter.app' },
        { '@type': 'ListItem', position: 2, name: 'Categories', item: 'https://global.jobmeter.app/resources' },
        { '@type': 'ListItem', position: 3, name: page.h1_title, item: `https://global.jobmeter.app/resources/${page.slug}` },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="text-white" style={{ backgroundColor: '#2563EB' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-3 mb-4">
              {page.location ? <MapPin size={32} /> : <Briefcase size={32} />}
              <h1 className="text-4xl font-bold">{page.h1_title}</h1>
            </div>
            <p className="text-lg text-white max-w-3xl">{page.meta_description}</p>
            <div className="flex items-center gap-6 mt-4 text-sm">
              <span className="flex items-center gap-2">
                <Briefcase size={16} />
                {page.job_count} active jobs
              </span>
              {page.location && (
                <span className="flex items-center gap-2">
                  <MapPin size={16} />
                  {page.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <span>/</span>
              <Link href="/resources" className="hover:text-blue-600">Categories</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium line-clamp-1">
                {page.h1_title.replace(' | JobMeter', '')}
              </span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Categories
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CategoryJobList
                category={page.category}
                location={page.location}
                initialJobs={initialJobs}
              />
            </div>
            <div className="lg:col-span-1">
              <CategoryContent page={page} />
            </div>
          </div>

          {relatedCategories.length > 0 && (
            <section className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Job Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedCategories.map(related => (
                  <Link
                    key={related.slug}
                    href={`/resources/${related.slug}`}
                    className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {related.h1_title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{related.job_count} jobs</span>
                      {related.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {related.town || related.location}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <AdUnit slot="9751041788" format="auto" />

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-100" style={{ height: '50px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50px', overflow: 'hidden' }}>
          <AdUnit slot="3349195672" format="auto" style={{ display: 'block', width: '100%', height: '50px', maxHeight: '50px', overflow: 'hidden' }} />
        </div>
      </div>
    </>
  );
}