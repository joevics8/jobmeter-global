import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import JobClient from '@/app/jobs/[slug]/JobClient';
import { Metadata } from 'next';

export const revalidate = false;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { slug } = params;
  
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !job) {
    return { title: 'Job Not Found - JobMeter' };
  }

  const companyName = typeof job.company === 'string' 
    ? job.company 
    : (job.company?.name || 'Company');

  return {
    title: `${job.title} at ${companyName} - UK Jobs`,
    description: job.description?.substring(0, 160) || `Apply for ${job.title} at ${companyName} in the United Kingdom`,
    alternates: {
      canonical: `https://www.global.jobmeter.app/jobs/united-kingdom/${slug}`,
    },
  };
}

export default async function UKJobPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { slug } = params;
  
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !job) {
    notFound();
  }

  return <JobClient job={job} />;
}
