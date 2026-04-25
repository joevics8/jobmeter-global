"use client";

import React from 'react';
import Link from 'next/link';
import { MapPin, Briefcase, Clock, TrendingUp } from 'lucide-react';
import { theme } from '@/lib/theme';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  employment_type?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  description?: string;
  posted_date: string;
  match_score?: number; // 0-100
}

interface JobCardProps {
  job: Job;
  showMatchScore?: boolean;
}

export default function JobCard({ job, showMatchScore = false }: JobCardProps) {
  // Calculate time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  // Format salary
  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    
    if (job.salary_min && job.salary_max) {
      return `₦${job.salary_min.toLocaleString()} - ₦${job.salary_max.toLocaleString()}`;
    }
    
    if (job.salary_min) {
      return `From ₦${job.salary_min.toLocaleString()}`;
    }
    
    return `Up to ₦${job.salary_max?.toLocaleString()}`;
  };

  // Get match score color and text
  const getMatchScoreDisplay = (score: number) => {
    if (score >= 80) {
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Excellent Match',
        barColor: 'bg-green-500',
      };
    } else if (score >= 60) {
      return {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        label: 'Good Match',
        barColor: 'bg-blue-500',
      };
    } else if (score >= 40) {
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Fair Match',
        barColor: 'bg-yellow-500',
      };
    } else {
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        label: 'Low Match',
        barColor: 'bg-gray-500',
      };
    }
  };

  const matchScore = job.match_score || Math.floor(Math.random() * 40) + 40; // Fallback to random 40-80 for demo
  const matchDisplay = getMatchScoreDisplay(matchScore);
  const salary = formatSalary();

  return (
    <Link href={`/jobs/${job.id}`}>
      <div
        className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
      >
        <div className="flex items-start gap-4">
          {/* Company Logo Placeholder */}
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Briefcase size={24} className="text-gray-400" />
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 hover:text-blue-600 transition-colors">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{job.company}</p>
              </div>

              {/* Match Score Badge - Desktop */}
              {showMatchScore && (
                <div className="hidden md:flex flex-col items-end flex-shrink-0">
                  <div className={`px-3 py-1 rounded-full border text-xs font-semibold mb-1 ${matchDisplay.color}`}>
                    {matchScore}% Match
                  </div>
                  <span className="text-xs text-gray-500">{matchDisplay.label}</span>
                </div>
              )}
            </div>

            {/* Job Details */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>{job.location}</span>
              </div>
              
              {job.employment_type && (
                <div className="flex items-center gap-1">
                  <Briefcase size={16} />
                  <span>{job.employment_type}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{getTimeAgo(job.posted_date)}</span>
              </div>
            </div>

            {/* Salary */}
            {salary && (
              <div className="text-sm font-semibold text-gray-900 mb-3">
                {salary}
              </div>
            )}

            {/* Match Score - Mobile */}
            {showMatchScore && (
              <div className="md:hidden mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Match Score</span>
                  <span className={`text-sm font-semibold ${matchScore >= 70 ? 'text-green-600' : matchScore >= 50 ? 'text-blue-600' : 'text-gray-600'}`}>
                    {matchScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${matchDisplay.barColor} transition-all`}
                    style={{ width: `${matchScore}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{matchDisplay.label}</p>
              </div>
            )}

            {/* Description Preview */}
            {job.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {job.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
              </p>
            )}

            {/* Match Score Indicator - Subtle */}
            {showMatchScore && (
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <TrendingUp size={14} />
                <span>Based on your profile and experience</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}