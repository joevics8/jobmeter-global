"use client";

import React from 'react';
import { RotateCcw, FileText, Plus } from 'lucide-react';
import { theme } from '@/lib/theme';

interface JobFeedHeaderProps {
  userName: string | null;
  refreshingMatches: boolean;
  onRefreshMatches: () => void;
  onCreateCV: () => void;
  onSubmitJob: () => void;
}

export default function JobFeedHeader({
  userName,
  refreshingMatches,
  onRefreshMatches,
  onCreateCV,
  onSubmitJob,
}: JobFeedHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div
      className="pt-12 pb-8 px-6"
      style={{
        background: `linear-gradient(135deg, ${theme.colors.primary.DEFAULT} 0%, ${theme.colors.primary.dark} 100%)`,
      }}
    >
      <div className="flex flex-col gap-4">
        {/* Top Row: Greeting & Action Buttons */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p
              className="text-base font-medium mb-1"
              style={{ color: theme.colors.text.light }}
            >
              {userName ? `${getGreeting()},` : `${getGreeting()}!`}
            </p>
            {userName && (
              <h1
                className="text-2xl font-bold mb-2"
                style={{ color: theme.colors.text.light }}
              >
                {userName}!
              </h1>
            )}
            <p
              className="text-sm"
              style={{ color: theme.colors.text.light, opacity: 0.8 }}
            >
              Ready to find your dream job?
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefreshMatches}
              disabled={refreshingMatches}
              className="p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              title="Refresh matches"
            >
              <RotateCcw 
                size={18} 
                className={refreshingMatches ? 'animate-spin' : ''}
                style={{ color: theme.colors.text.light }} 
              />
            </button>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCreateCV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm hover:shadow-md transition-all duration-200"
            style={{
              backgroundColor: theme.colors.background.DEFAULT,
              color: theme.colors.primary.DEFAULT,
            }}
          >
            <FileText size={16} />
            <span>Create CV</span>
          </button>

          <button
            onClick={onSubmitJob}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm hover:shadow-md transition-all duration-200"
            style={{
              backgroundColor: theme.colors.background.DEFAULT,
              color: theme.colors.primary.DEFAULT,
            }}
          >
            <Plus size={16} />
            <span>Submit Job</span>
          </button>
        </div>
      </div>
    </div>
  );
}


