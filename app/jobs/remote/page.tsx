import JobList from '@/components/jobs/JobList';
import { Metadata } from 'next';
import { BreadcrumbListSchema } from '@/components/seo/StructuredData';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobmeter.app';

export const metadata: Metadata = {
  title: 'Remote Jobs - Work From Anywhere | JobMeter',
  description: 'Browse the latest remote job opportunities. Find full-time, part-time, and contract remote jobs across all industries. Apply to top companies hiring remotely today.',
  alternates: {
    canonical: `${siteUrl}/jobs/remote`,
  },
};

export default function RemoteJobsPage() {
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Jobs', url: `${siteUrl}/jobs` },
    { name: 'Remote', url: `${siteUrl}/jobs/remote` },
  ];

  return (
    <>
      <BreadcrumbListSchema items={breadcrumbItems} />
      <div>
        <JobList initialJobType="Remote" />
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
