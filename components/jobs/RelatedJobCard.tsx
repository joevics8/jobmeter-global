import React from 'react';
import Link from 'next/link';
import { MapPin, DollarSign, Calendar } from 'lucide-react';
import { theme } from '@/lib/theme';

interface RelatedJobCardProps {
  job: {
    id: string;
    slug: string;
    title: string;
    company: any;
    location: any;
    salary_range?: any;
    posted_date: string;
  };
}

export default function RelatedJobCard({ job }: RelatedJobCardProps) {
  // Helper to get company name
  const getCompanyName = () => {
    if (!job.company) return 'Confidential';
    if (typeof job.company === 'string') return job.company;
    if (typeof job.company === 'object' && job.company.name) return job.company.name;
    return 'Confidential';
  };

  // Helper to get location string
  const getLocationString = () => {
    if (!job.location) return 'Not specified';
    if (typeof job.location === 'string') return job.location;
    if (typeof job.location === 'object') {
      if (job.location.remote) return 'Remote';
      const parts = [job.location.city, job.location.state, job.location.country].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : 'Not specified';
    }
    return 'Not specified';
  };

  // Helper to get salary string
  const getSalaryString = () => {
    if (!job.salary_range) return null;
    if (typeof job.salary_range === 'object') {
      const { min, max, currency, period } = job.salary_range;
      if (min != null && currency) {
        if (!max || min === max) {
          return `${currency} ${min.toLocaleString()} ${period || ''}`.trim();
        }
        return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} ${period || ''}`.trim();
      }
    }
    return null;
  };

  // Helper to get relative time
  const getRelativeTime = () => {
    if (!job.posted_date) return 'Recently';
    
    try {
      const posted = new Date(job.posted_date);
      const now = new Date();
      
      // Check if date is valid
      if (isNaN(posted.getTime())) return 'Recently';
      
      const diffTime = Math.abs(now.getTime() - posted.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return `${Math.floor(diffDays / 30)} months ago`;
    } catch (e) {
      return 'Recently';
    }
  };

  // Debug log to verify link construction
  if (typeof window !== 'undefined') {
    console.log(`RelatedJobCard: Linking to /jobs/${job.slug} - Title: ${job.title}`);
  }

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
      prefetch={true}
    >
      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
        {job.title}
      </h3>
      <p className="text-sm text-gray-600 mb-3">
        {getCompanyName()}
      </p>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={14} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{getLocationString()}</span>
        </div>

        {getSalaryString() && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign size={14} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{getSalaryString()}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar size={14} className="text-gray-400 flex-shrink-0" />
          <span>{getRelativeTime()}</span>
        </div>
      </div>
    </Link>
  );
}