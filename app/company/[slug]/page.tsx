import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, MapPin, Users, Briefcase, Globe, Linkedin, Twitter,
  Facebook, Instagram, CheckCircle, Mail, Phone, ExternalLink,
  Calendar, DollarSign, Clock,
} from 'lucide-react';
import { CompanySchema, FAQSchema } from '@/components/seo/StructuredData';
import { getCompanyName } from '@/lib/utils/companyUtils';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Company {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string;
  logo_url: string | null;
  cover_image_url: string | null;
  meta_title: string;
  meta_description: string;
  seo_keywords: string[] | null;
  h1_title: string;
  industry: string | null;
  company_size: string | null;
  founded_year: number | null;
  headquarters_location: string | null;
  website_url: string | null;
  careers_page_url: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  benefits: string[] | null;
  company_values: string[] | null;
  work_environment: string | null;
  faqs: any;
  is_verified: boolean;
  view_count: number;
  job_count: number;
}

interface RelatedCompany {
  slug: string;
  name: string;
  logo_url: string | null;
  industry: string | null;
  job_count: number;
  headquarters_location: string | null;
}

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function getCompany(slug: string): Promise<Company | null> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

async function incrementViewCount(slug: string) {
  try {
    await supabase.rpc('increment_company_views', { company_slug: slug });
  } catch {}
}

async function getCompanyJobs(companyName: string) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .ilike('company', `%${companyName}%`)
      .order('posted_date', { ascending: false })
      .limit(10);
    if (error || !data) return [];
    return data.filter((job) => {
      const name = getCompanyName(job.company);
      return name.toLowerCase().includes(companyName.toLowerCase());
    });
  } catch {
    return [];
  }
}

async function fetchSimilarCompanies(company: Company): Promise<RelatedCompany[]> {
  try {
    const relatedSlugs: string[] = [];

    if (company.industry) {
      const { data } = await supabase
        .from('companies')
        .select('slug, name, logo_url, industry, job_count, headquarters_location')
        .eq('industry', company.industry)
        .eq('is_published', true)
        .neq('slug', company.slug)
        .order('job_count', { ascending: false })
        .limit(4);
      if (data) data.forEach((c) => relatedSlugs.push(c.slug));
    }

    if (company.headquarters_location && relatedSlugs.length < 6) {
      const baseQuery = supabase
        .from('companies')
        .select('slug, name, logo_url, industry, job_count, headquarters_location')
        .ilike('headquarters_location', `%${company.headquarters_location}%`)
        .eq('is_published', true)
        .neq('slug', company.slug)
        .order('job_count', { ascending: false })
        .limit(6 - relatedSlugs.length);

      const { data } = relatedSlugs.length > 0
        ? await baseQuery.not('slug', 'in', `(${relatedSlugs.join(',')})`)
        : await baseQuery;
      if (data) data.forEach((c) => relatedSlugs.push(c.slug));
    }

    if (relatedSlugs.length === 0) return [];

    const { data: finalCompanies } = await supabase
      .from('companies')
      .select('slug, name, logo_url, industry, job_count, headquarters_location')
      .in('slug', relatedSlugs)
      .eq('is_published', true)
      .limit(6);

    return finalCompanies || [];
  } catch {
    return [];
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const company = await getCompany(params.slug);
  if (!company) return { title: 'Company Not Found | JobMeter' };

  const keywords = company.seo_keywords?.join(', ') || 'careers, jobs, company';
  const url = `https://jobmeter.app/company/${company.slug}`;
  const title = `Jobs at ${company.name} | JobMeter`;

  return {
    title,
    description: company.meta_description,
    keywords: keywords.split(',').map((k) => k.trim()),
    authors: [{ name: 'JobMeter' }],
    openGraph: {
      title,
      description: company.meta_description,
      url,
      siteName: 'JobMeter',
      locale: 'en_US',
      type: 'website',
      images: company.logo_url ? [{ url: company.logo_url }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: company.meta_description,
      images: company.logo_url ? [company.logo_url] : [],
    },
    alternates: { canonical: url },
  };
}

export async function generateStaticParams() {
  try {
    const { data } = await supabase
      .from('companies')
      .select('slug')
      .eq('is_published', true);
    return data?.map((c) => ({ slug: c.slug })) ?? [];
  } catch {
    return [];
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
//
// AD INVENTORY — 4 unique slots, no duplicates, same 4 on mobile + desktop:
//
//  ① slot 4198231153  top display        below breadcrumb, full width
//  ② slot 4690286797  in-article fluid   after company description
//  ③ slot 8181708196  in-article fluid   before FAQ section
//  ④ slot 9025117620  in-feed fluid      bottom of page, above anchor spacer
//  ⑤ slot 9751041788  anchor fixed       fixed bottom bar, mobile + desktop
//
// Total impressions per page-view: 5 (4 scroll + 1 persistent anchor)
// No slot is used more than once.
//
// ─────────────────────────────────────────────────────────────────────────────

export default async function CompanyProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const company = await getCompany(params.slug);
  if (!company) notFound();

  incrementViewCount(params.slug); // intentional fire-and-forget

  const [companyJobs, similarCompanies] = await Promise.all([
    getCompanyJobs(company.name),
    fetchSimilarCompanies(company),
  ]);

  const socialLinks = [
    company.linkedin_url,
    company.twitter_url,
    company.facebook_url,
    company.instagram_url,
  ].filter(Boolean) as string[];

  return (
    <>
      {/* ── Structured data ── */}
      <CompanySchema
        name={company.name}
        description={company.meta_description}
        url={company.website_url || undefined}
        logo={company.logo_url || undefined}
        address={company.headquarters_location || undefined}
        sameAs={socialLinks.length > 0 ? socialLinks : undefined}
      />
      {company.faqs && Array.isArray(company.faqs) && company.faqs.length > 0 && (
        <FAQSchema faqs={company.faqs} />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          Ad ⑤ — Anchor · slot 9751041788
          Fixed bottom bar, visible on BOTH mobile and desktop.
          height 50px, z-index 40 so it clears nav/modals.
          Matching spacer div at page bottom prevents content overlap.
      ════════════════════════════════════════════════════════════════════ */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100"
        style={{ height: '50px', overflow: 'hidden' }}
      >
        <AdUnit
          slot="9751041788"
          format="auto"
          style={{ display: 'block', width: '100%', height: '50px', maxHeight: '50px', overflow: 'hidden' }}
        />
      </div>

      <div className="min-h-screen bg-gray-50">

        {/* ── Breadcrumb ── */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-4">
            <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <span className="text-gray-400">/</span>
              <Link href="/company" className="hover:text-blue-600">Companies</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium line-clamp-1">{company.name}</span>
            </nav>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            Ad ① — Top display · slot 4198231153
            Sits directly below breadcrumb, above cover image.
            Full width, format auto, both mobile and desktop.
        ════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2">
            <AdUnit slot="4198231153" format="auto" />
          </div>
        </div>

        {/* ── Cover image ── */}
        {company.cover_image_url && (
          <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 bg-gray-200">
            <Image
              src={company.cover_image_url}
              alt={`${company.name} cover`}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">

          {/* ── Back button ── */}
          <Link
            href="/company"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-blue-600 hover:text-blue-700 mb-4 sm:mb-6 font-medium text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="sm:size-5" />
            <span className="hidden sm:inline">Back to Companies</span>
            <span className="sm:hidden">Back</span>
          </Link>

          {/* ════════════════════════════════════════════════════════════════
              2-col layout: main content (2/3) + company info panel (1/3)
              items-start prevents the info col from stretching full height.
              info col uses sticky top-4 so it pins beside the content.
              On mobile: info col has order-first so it shows ABOVE main content.
          ════════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">

            {/* ════ Main content col — 2/3 width on desktop ════ */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">

              {/* ── Company header card ── */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                <div className="flex items-start gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                  {company.logo_url ? (
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0">
                      <Image
                        src={company.logo_url}
                        alt={company.name}
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Briefcase size={32} className="sm:size-10 lg:size-12 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                        Jobs at {company.name}
                      </h1>
                      {company.is_verified && (
                        <CheckCircle size={18} className="sm:size-5 lg:size-6 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    {company.tagline && (
                      <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-2 sm:mb-4">
                        {company.tagline}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      {company.industry && (
                        <div className="flex items-center gap-1">
                          <Briefcase size={12} className="sm:size-4" />
                          <span>{company.industry}</span>
                        </div>
                      )}
                      {company.headquarters_location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="sm:size-4" />
                          <span className="truncate">{company.headquarters_location}</span>
                        </div>
                      )}
                      {company.company_size && (
                        <div className="flex items-center gap-1">
                          <Users size={12} className="sm:size-4" />
                          <span>{company.company_size} employees</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-4">
                    About {company.name}
                  </h2>
                  <MarkdownRenderer content={company.description} />
                </div>
              </div>

              {/* ════════════════════════════════════════════════════════════
                  Ad ② — In-article · slot 4690286797
                  After the description block — highest dwell-time position.
              ════════════════════════════════════════════════════════════ */}
              <div className="bg-white rounded-lg overflow-hidden">
                <AdUnit slot="4690286797" format="fluid" layout="in-article" />
              </div>

              {/* ── Company values ── */}
              {company.company_values && company.company_values.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                    Our Values
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    {company.company_values.map((value, index) => (
                      <div key={index} className="flex items-start gap-2 sm:gap-3">
                        <CheckCircle size={16} className="sm:size-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                        <span className="text-gray-700 text-sm sm:text-base">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Benefits ── */}
              {company.benefits && company.benefits.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                    Benefits & Perks
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {company.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 sm:gap-3 bg-blue-50 rounded-lg p-2 sm:p-3 lg:p-4"
                      >
                        <CheckCircle size={16} className="sm:size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 font-medium text-xs sm:text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════
                  Ad ③ — In-article · slot 8181708196
                  Directly before FAQs — users pausing before reading Q&A
                  are highly engaged; strong viewability position.
              ════════════════════════════════════════════════════════════ */}
              <div className="bg-white rounded-lg overflow-hidden">
                <AdUnit slot="8181708196" format="fluid" layout="in-article" />
              </div>

              {/* ── FAQs ── */}
              {company.faqs && Array.isArray(company.faqs) && company.faqs.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-4 sm:space-y-6">
                    {company.faqs.map((faq: any, index: number) => (
                      <div
                        key={index}
                        className="border-b border-gray-200 last:border-0 pb-4 sm:pb-6 last:pb-0"
                      >
                        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1 sm:mb-2">
                          {faq.question}
                        </h3>
                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Open positions ── */}
              {companyJobs.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Open Positions
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                    {companyJobs.map((job) => (
                      <div
                        key={job.id}
                        className="border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-6 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/jobs/${job.slug}`}
                              className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                            >
                              {job.title}
                            </Link>
                            <div className="flex flex-wrap gap-2 sm:gap-3 mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-600">
                              {(() => {
                                const location =
                                  typeof job.location === 'string'
                                    ? job.location
                                    : job.location?.remote
                                    ? 'Remote'
                                    : [job.location?.city, job.location?.state, job.location?.country]
                                        .filter(Boolean)
                                        .join(', ') || 'Not specified';
                                return location && location !== 'Not specified' ? (
                                  <div className="flex items-center gap-1">
                                    <MapPin size={12} className="sm:size-[14px]" />
                                    <span className="truncate">{location}</span>
                                  </div>
                                ) : null;
                              })()}
                              {job.employment_type && (
                                <div className="flex items-center gap-1">
                                  <Clock size={12} className="sm:size-[14px]" />
                                  <span>{job.employment_type}</span>
                                </div>
                              )}
                              {job.salary_range &&
                                typeof job.salary_range === 'object' &&
                                job.salary_range.min && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign size={12} className="sm:size-[14px]" />
                                    <span>
                                      {job.salary_range.currency}{' '}
                                      {job.salary_range.min.toLocaleString()}{' '}
                                      {job.salary_range.period || ''}
                                    </span>
                                  </div>
                                )}
                              {job.posted_date && (
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} className="sm:size-[14px]" />
                                  <span>{new Date(job.posted_date).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                            {job.description && (
                              <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2 line-clamp-2">
                                {typeof job.description === 'string'
                                  ? job.description.replace(/<[^>]*>/g, '').substring(0, 120) + '...'
                                  : 'Great opportunity at ' + company.name}
                              </p>
                            )}
                          </div>
                          <Link
                            href={`/jobs/${job.slug}`}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                  {companyJobs.length >= 10 && (
                    <div className="mt-4 sm:mt-6 text-center">
                      <Link
                        href={`/jobs?company=${company.name}`}
                        className="inline-flex items-center gap-1.5 sm:gap-2 text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm"
                      >
                        View all positions
                        <ExternalLink size={14} className="sm:size-4" />
                      </Link>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* ════════════════════════════════════════════════════════════════
                Company info col — 1/3 width on desktop, stacks first on mobile.
                sticky top-4 keeps it pinned at the top beside the main content.
                NO ads in this column.
            ════════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-1 order-first lg:order-none">
              <div className="sticky top-4 space-y-4 sm:space-y-6">

                {/* Join Our Team CTA */}
                <div className="bg-blue-600 rounded-lg shadow-sm p-4 sm:p-6 text-white">
                  <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">Join Our Team</h3>
                  <p className="text-blue-100 text-xs sm:text-sm mb-3 sm:mb-4">
                    {companyJobs.length} open {companyJobs.length === 1 ? 'position' : 'positions'}
                  </p>
                  <Link
                    href={company.careers_page_url || `/jobs?company=${company.slug}`}
                    className="block w-full bg-white text-blue-600 text-center font-bold py-2 sm:py-3 rounded-lg hover:bg-blue-50 transition-colors text-sm sm:text-base"
                  >
                    View Open Positions
                  </Link>
                </div>

                {/* Company Info */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">Company Info</h3>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    {company.founded_year && (
                      <div>
                        <span className="text-gray-600">Founded:</span>
                        <span className="ml-2 font-medium text-gray-900">{company.founded_year}</span>
                      </div>
                    )}
                    {company.industry && (
                      <div>
                        <span className="text-gray-600">Industry:</span>
                        <span className="ml-2 font-medium text-gray-900">{company.industry}</span>
                      </div>
                    )}
                    {company.company_size && (
                      <div>
                        <span className="text-gray-600">Size:</span>
                        <span className="ml-2 font-medium text-gray-900">{company.company_size} employees</span>
                      </div>
                    )}
                    {company.headquarters_location && (
                      <div>
                        <span className="text-gray-600">Location:</span>
                        <span className="ml-2 font-medium text-gray-900">{company.headquarters_location}</span>
                      </div>
                    )}
                    {company.work_environment && (
                      <div>
                        <span className="text-gray-600">Work Style:</span>
                        <span className="ml-2 font-medium text-gray-900">{company.work_environment}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Profile Views:</span>
                      <span className="ml-2 font-medium text-gray-900">{company.view_count.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Contact & Links */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">Contact & Links</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {company.website_url && (
                      <a
                        href={company.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                      >
                        <Globe size={14} className="sm:size-[18px] flex-shrink-0" />
                        <span>Website</span>
                        <ExternalLink size={12} className="sm:size-[14px] ml-auto flex-shrink-0" />
                      </a>
                    )}
                    {company.email && (
                      <a
                        href={`mailto:${company.email}`}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                      >
                        <Mail size={14} className="sm:size-[18px] flex-shrink-0" />
                        <span className="break-all">{company.email}</span>
                      </a>
                    )}
                    {company.phone && (
                      <a
                        href={`tel:${company.phone}`}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                      >
                        <Phone size={14} className="sm:size-[18px] flex-shrink-0" />
                        <span>{company.phone}</span>
                      </a>
                    )}
                  </div>

                  {socialLinks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-2 sm:mb-3">Follow Us</h4>
                      <div className="flex gap-2 sm:gap-3 flex-wrap">
                        {company.linkedin_url && (
                          <a
                            href={company.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <Linkedin size={16} className="sm:size-5" />
                          </a>
                        )}
                        {company.twitter_url && (
                          <a
                            href={company.twitter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <Twitter size={16} className="sm:size-5" />
                          </a>
                        )}
                        {company.facebook_url && (
                          <a
                            href={company.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <Facebook size={16} className="sm:size-5" />
                          </a>
                        )}
                        {company.instagram_url && (
                          <a
                            href={company.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <Instagram size={16} className="sm:size-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* ── Similar companies — full width below 2-col grid ── */}
          {similarCompanies.length > 0 && (
            <section className="mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                Similar Companies
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                Explore other {company.industry || 'companies'} hiring now
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {similarCompanies.map((similar) => (
                  <Link
                    key={similar.slug}
                    href={`/company/${similar.slug}`}
                    className="block bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {similar.logo_url ? (
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex-shrink-0">
                          <Image
                            src={similar.logo_url}
                            alt={similar.name}
                            fill
                            className="object-contain rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Briefcase size={20} className="sm:size-6 lg:size-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-0.5 sm:mb-1 hover:text-blue-600 transition-colors line-clamp-1">
                          {similar.name}
                        </h3>
                        {similar.industry && (
                          <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1 line-clamp-1">
                            {similar.industry}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">{similar.job_count} open positions</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ════════════════════════════════════════════════════════════════
              Ad ④ — Bottom in-feed · slot 9025117620
              Full width, after similar companies, above anchor spacer.
              Last scroll-triggered impression before user leaves the page.
          ════════════════════════════════════════════════════════════════ */}
          <div className="mt-8 bg-white rounded-lg overflow-hidden">
            <AdUnit slot="9025117620" format="fluid" layout="in-feed" layoutKey="-fb+5w+4e-db+86" />
          </div>

        </div>

        {/* Spacer — prevents anchor ad (50px) from overlapping last content */}
        <div className="h-[58px]" />

      </div>
    </>
  );
}