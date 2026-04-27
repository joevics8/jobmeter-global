export const revalidate = false;

import { supabase } from '@/lib/supabase';
import HomePage from '@/components/home/HomePage';
import { OrganizationSchema, WebSiteSchema, BreadcrumbListSchema } from '@/components/seo/StructuredData';
import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.global.jobmeter.app';

export const metadata: Metadata = {
  title: 'JobMeter — Find Jobs That Match Your Skills & Experiences',
  description: 'Discover your next career opportunity with JobMeter. Access thousands of jobs from employers and various sources across industries. Search jobs, get personalized matches, and apply with confidence. Your career journey starts here.',
  keywords: [
    'jobs',
    'careers',
    'employment opportunities',
    'job search',
    'find jobs',
    'career opportunities',
    'job listings',
    'ai job matchin',
    'job board',
    'employment',
    'hiring',
    'job vacancies',
    'work opportunities',
    'professional jobs',
    'career platform',
    'job matching',
    'jobs nigeria',
  ],
  openGraph: {
    title: 'JobMeter — Find Jobs That Match Your Skills & Experiences',
    description: 'Discover your next career opportunity with JobMeter. Smart job matching connects you with thousands of jobs across industries.',
    type: 'website',
    url: siteUrl,
    siteName: 'JobMeter',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobMeter — Find Jobs That Match Your Skills & Experiences',
    description: 'Discover your next career opportunity with JobMeter. Smart job matching connects you with thousands of jobs across industries.',
  },
  alternates: {
    canonical: siteUrl,
  },
};

async function getLatestJobs() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data, error } = await supabase
    .from('jobs')
    .select('id, slug, title, company, location, salary_range, posted_date, employment_type, created_at')
    .eq('status', 'active')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }

  return data || [];
}

export default async function Home() {
  const jobs = await getLatestJobs();

  // Generate JobPosting schema for featured jobs (first 10)
  const jobPostingSchemas = jobs.slice(0, 10).map((job) => {
    const companyName = typeof job.company === 'string' 
      ? job.company 
      : (job.company?.name || 'Company');
    
    const locationStr = typeof job.location === 'string'
      ? job.location
      : (job.location?.remote 
          ? 'Remote'
          : [job.location?.city, job.location?.state, job.location?.country].filter(Boolean).join(', ') || 'Not specified');

    return {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title || 'Job Opening',
      description: `${job.title} position at ${companyName}`,
      datePosted: job.posted_date || job.created_at,
      hiringOrganization: {
        '@type': 'Organization',
        name: companyName,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: locationStr,
        },
      },
      employmentType: job.employment_type || 'FULL_TIME',
      url: `${siteUrl}/jobs/${job.slug}`,
    };
  });

  return (
    <>
      {/* Structured Data */}
      <OrganizationSchema />
      <WebSiteSchema 
        searchAction={{
          target: `${siteUrl}/?q={search_term_string}`,
          queryInput: 'required name=search_term_string',
        }}
      />
      <BreadcrumbListSchema
        items={[
          { name: 'Home', url: siteUrl },
        ]}
      />
      
      {/* JobPosting Schemas */}
      {jobPostingSchemas.map((schema, index) => (
        <script
          key={`job-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}

      <HomePage jobs={jobs} />
    </>
  );
}