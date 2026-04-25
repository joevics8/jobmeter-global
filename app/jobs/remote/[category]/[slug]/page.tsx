// ─── File: page.tsx ───────────────────────────────────────────────────────────
// Path: app/jobs/remote/[category]/[slug]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import JobClient from '@/app/jobs/[slug]/JobClient';
import { Metadata } from 'next';

// Cache forever — clears on deploy or on-demand revalidation
export const revalidate = false;
export const dynamicParams = true;

const REMOTE_CATEGORIES: Record<string, { name: string }> = {
  'marketing': { name: 'Marketing' },
  'graphic-design': { name: 'Graphic Design' },
  'business-analyst': { name: 'Business Analyst' },
  'administrative-assistant': { name: 'Administrative Assistant' },
  'healthcare': { name: 'Healthcare' },
  'copywriting': { name: 'Copywriting' },
  'video-editing': { name: 'Video Editing' },
  'ai-prompt-engineering': { name: 'AI Prompt Engineering' },
  'software-development': { name: 'Software Development' },
  'customer-service': { name: 'Customer Service' },
  'data-entry': { name: 'Data Entry' },
  'virtual-assistant': { name: 'Virtual Assistant' },
};

export async function generateStaticParams() {
  const supabase = createClient();
  try {
    const { data } = await supabase
      .from('jobs')
      .select('slug, role_category')
      .eq('job_type', 'Remote')
      .in('status', ['active', 'expired', 'expired_indexed']);

    if (!data) return [];

    return data
      .filter(job => job.slug)
      .map(job => {
        // Map role_category back to a slug key
        const categorySlug = Object.entries(REMOTE_CATEGORIES).find(
          ([, v]) => v.name === job.role_category
        )?.[0] ?? 'general';
        return { category: categorySlug, slug: job.slug };
      });
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { category: string; slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { slug, category } = params;

  const { data: job } = await supabase
    .from('jobs')
    .select('title, company, description')
    .eq('slug', slug)
    .single();

  if (!job) return { title: 'Job Not Found - JobMeter' };

  const companyName = typeof job.company === 'string' ? job.company : (job.company?.name || 'Company');
  const categoryName = REMOTE_CATEGORIES[category]?.name || category;

  return {
    title: `${job.title} at ${companyName} - Remote ${categoryName} Jobs`,
    description: job.description?.substring(0, 160),
    alternates: {
      canonical: `https://www.jobmeter.app/jobs/remote/${category}/${slug}`,
    },
  };
}

export default async function RemoteCategoryJobPage({ params }: { params: { category: string; slug: string } }) {
  const supabase = createClient();
  const { slug } = params;

  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!job) notFound();

  return <JobClient job={job} />;
}