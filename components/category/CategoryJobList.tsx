// components/category/CategoryJobList.tsx

"use client";

import React, { useState } from 'react';
import { theme } from '@/lib/theme';
import JobCard from '@/components/jobs/JobCard';
import { JobUI } from '@/components/jobs/JobCard';
import { Briefcase } from 'lucide-react';

const STORAGE_KEYS = {
  SAVED_JOBS: 'saved_jobs',
  APPLIED_JOBS: 'applied_jobs',
};

export interface RawJobRow {
  id: string;
  slug: string | null;
  title: string;
  company: any;
  location: any;
  salary_range: any;
  employment_type: string | null;
  posted_date: string | null;
  created_at: string;
  type?: string;
  salary?: string;
}

interface CategoryJobListProps {
  category: string;
  location: string | null;
  jobType?: string;
  roleCategory?: string;
  initialJobs?: RawJobRow[];
}

function transformJobToUI(job: RawJobRow): JobUI {
  let locationStr = 'Location not specified';
  if (typeof job.location === 'string') {
    locationStr = job.location;
  } else if (job.location && typeof job.location === 'object') {
    const loc = job.location;
    if (loc.remote) {
      locationStr = 'Remote';
    } else {
      const parts = [loc.city, loc.state, loc.country].filter(Boolean);
      locationStr = parts.length > 0 ? parts.join(', ') : 'Location not specified';
    }
  }

  let companyStr = 'Unknown Company';
  if (typeof job.company === 'string') {
    companyStr = job.company;
  } else if (job.company && typeof job.company === 'object') {
    companyStr = job.company.name || 'Unknown Company';
  }

  let salaryStr = '';
  if (typeof job.salary === 'string') {
    salaryStr = job.salary;
  } else if (job.salary_range && typeof job.salary_range === 'object') {
    const sal = job.salary_range;
    if (sal.min !== null && sal.currency) {
      salaryStr = `${sal.currency} ${sal.min.toLocaleString()} ${sal.period || ''}`.trim();
    }
  }

  return {
    id: job.id,
    slug: job.slug || job.id,
    title: job.title || 'Untitled Job',
    company: companyStr,
    location: locationStr,
    salary: salaryStr,

    // Match disabled
    match: 0,
    calculatedTotal: 0,
    breakdown: null,

    type: job.type || job.employment_type || '',
    postedDate: job.posted_date || job.created_at || undefined,
  };
}

export default function CategoryJobList({ initialJobs = [] }: CategoryJobListProps) {
  const [jobs] = useState<JobUI[]>(() => initialJobs.map(transformJobToUI));

  const [savedJobs, setSavedJobs] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_JOBS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedJobs, setAppliedJobs] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const applied = localStorage.getItem(STORAGE_KEYS.APPLIED_JOBS);
      return applied ? JSON.parse(applied) : [];
    } catch {
      return [];
    }
  });

  const handleSave = (jobId: string) => {
    const newSaved = savedJobs.includes(jobId)
      ? savedJobs.filter(id => id !== jobId)
      : [...savedJobs, jobId];

    setSavedJobs(newSaved);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SAVED_JOBS, JSON.stringify(newSaved));
    }
  };

  const handleApply = (jobId: string) => {
    const newApplied = appliedJobs.includes(jobId)
      ? appliedJobs.filter(id => id !== jobId)
      : [...appliedJobs, jobId];

    setAppliedJobs(newApplied);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.APPLIED_JOBS, JSON.stringify(newApplied));

      if (!appliedJobs.includes(jobId)) {
        const saved = localStorage.getItem(STORAGE_KEYS.SAVED_JOBS);

        if (saved) {
          try {
            const savedArray: string[] = JSON.parse(saved);

            if (savedArray.includes(jobId)) {
              const updatedSaved = savedArray.filter(id => id !== jobId);
              localStorage.setItem(STORAGE_KEYS.SAVED_JOBS, JSON.stringify(updatedSaved));
              setSavedJobs(updatedSaved);
            }
          } catch (e) {
            console.error('Error updating saved jobs:', e);
          }
        }
      }
    }
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    const dateA = a.postedDate ? new Date(a.postedDate).getTime() : 0;
    const dateB = b.postedDate ? new Date(b.postedDate).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div
        className="px-6 py-4 border-b flex items-center justify-between"
        style={{ borderColor: theme.colors.border.DEFAULT }}
      >
        <div className="flex items-center gap-3">
          <Briefcase size={20} style={{ color: theme.colors.primary.DEFAULT }} />
          <h2 className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
            Latest Jobs ({jobs.length})
          </h2>
        </div>
      </div>

      <div className="divide-y" style={{ borderColor: theme.colors.border.DEFAULT }}>
        {sortedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <Briefcase size={48} className="text-gray-400 mb-4" />
            <p className="text-base font-medium mb-2" style={{ color: theme.colors.text.primary }}>
              No jobs found
            </p>
            <p className="text-sm text-center" style={{ color: theme.colors.text.secondary }}>
              Check back later for new opportunities in this category
            </p>
          </div>
        ) : (
          sortedJobs.map((job) => (
            <React.Fragment key={job.id}>
              <JobCard
                job={job}
                savedJobs={savedJobs}
                appliedJobs={appliedJobs}
                onSave={handleSave}
                onApply={handleApply}
                onShowBreakdown={() => {}}
              />
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}
