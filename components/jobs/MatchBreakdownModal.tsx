"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { theme } from '@/lib/theme';

export interface MatchBreakdown {
  rolesScore: number;
  skillsScore: number;
  sectorScore: number;
  locationScore: number;
  experienceScore: number;
  salaryScore: number;
  typeScore: number;
  rolesReason?: string;
}

export interface MatchBreakdownModalData {
  breakdown: MatchBreakdown;
  totalScore: number;
  jobTitle: string;
  companyName: string;
}

interface MatchBreakdownModalProps {
  open: boolean;
  onClose: () => void;
  data: MatchBreakdownModalData | null;
}

export default function MatchBreakdownModal({
  open,
  onClose,
  data,
}: MatchBreakdownModalProps) {
  if (!data) return null;

  const { breakdown, totalScore, jobTitle, companyName } = data;

  const renderScoreRow = (
    label: string,
    score: number,
    maxScore: number = 20
  ) => {
    const percentage = (score / maxScore) * 100;
    
    return (
      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-sm font-medium flex-1 min-w-[140px]"
          style={{ color: theme.colors.text.primary }}
        >
          {label}
        </span>
        <div className="flex-2 flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.border.light }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${percentage}%`,
              backgroundColor: theme.colors.primary.DEFAULT,
              maxWidth: '100%',
            }}
          />
        </div>
        <span
          className="text-sm font-semibold w-8 text-right"
          style={{ color: theme.colors.text.primary }}
        >
          {score}
        </span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader className="relative">
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            style={{ color: theme.colors.text.secondary }}
          >
            <X size={20} />
          </button>
          <DialogTitle
            className="text-xl font-bold mb-1"
            style={{ color: theme.colors.text.primary }}
          >
            Match Breakdown
          </DialogTitle>
          <p
            className="text-sm"
            style={{ color: theme.colors.text.secondary }}
          >
            {jobTitle} at {companyName}
          </p>
        </DialogHeader>

        <div className="mt-6">
          {/* Total Score */}
          <div
            className="text-center mb-6 p-5 rounded-xl"
            style={{ backgroundColor: theme.colors.background.muted }}
          >
            <p
              className="text-sm font-medium mb-2"
              style={{ color: theme.colors.text.secondary }}
            >
              Total Match Score
            </p>
            <p
              className="text-3xl font-bold"
              style={{ color: theme.colors.text.primary }}
            >
              {totalScore}%
            </p>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-1">
            {renderScoreRow(
              'Roles & Skills',
              breakdown.rolesScore + breakdown.skillsScore,
              80
            )}
            {renderScoreRow('Sector', breakdown.sectorScore, 10)}
            {renderScoreRow('Location', breakdown.locationScore, 5)}
            {renderScoreRow('Experience', breakdown.experienceScore, 3)}
            {renderScoreRow('Salary', breakdown.salaryScore, 2)}
            {renderScoreRow('Job Type', breakdown.typeScore, 5)}
          </div>

          {/* Role Match Reason */}
          {breakdown.rolesReason && (
            <div
              className="mt-6 p-4 rounded-lg"
              style={{ backgroundColor: theme.colors.background.muted }}
            >
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Role Match Reason:
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: theme.colors.text.secondary }}
              >
                {breakdown.rolesReason}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


