'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, TrendingUp, Target, CheckCircle, XCircle, AlertCircle, FileCheck, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { theme } from '@/lib/theme';

type ScoreBreakdownKey = 
  | 'keywordMatch'
  | 'experienceMatch'
  | 'skillsAlignment'
  | 'atsCompatibility'
  | 'formattingConsistency'
  | 'profileSummaryStrength'
  | 'structureFlow'
  | 'visualBalanceReadability';

interface ATSReviewResult {
  overallScore: number;
  overallExplanation?: string;
  scoreBreakdown?: {
    keywordMatch: { score: number; details: string; examples: string; recommendation: string };
    experienceMatch: { score: number; details: string; examples: string; recommendation: string };
    skillsAlignment: { score: number; details: string; examples: string; recommendation: string };
    atsCompatibility: { score: number; details: string; examples: string; recommendation: string };
    formattingConsistency: { score: number; details: string; examples: string; recommendation: string };
    profileSummaryStrength: { score: number; details: string; examples: string; recommendation: string };
    structureFlow: { score: number; details: string; examples: string; recommendation: string };
    visualBalanceReadability: { score: number; details: string; examples: string; recommendation: string };
  };
  summary?: string;
  finalRecommendations?: string[];
}

interface ATSReviewSession {
  id: string;
  timestamp: number;
  cvName: string;
  jobTitle?: string;
  jobCompany?: string;
  overallScore: number;
  reviewType: 'cv-only' | 'cv-job';
  lastMessage: string;
  fullAnalysis: ATSReviewResult;
}

export default function ATSReviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<ATSReviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<ScoreBreakdownKey | null>(null);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = () => {
    try {
      const history = localStorage.getItem('ats_cv_review_history');
      if (history) {
        const sessions: ATSReviewSession[] = JSON.parse(history);
        const foundSession = sessions.find(s => s.id === sessionId);
        if (foundSession) {
          setSession(foundSession);
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return theme.colors.match.good;
    if (score >= 60) return theme.colors.match.average;
    return theme.colors.match.bad;
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return AlertCircle;
    return XCircle;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const categoryLabels: Record<string, string> = {
    keywordMatch: 'Keyword Match',
    experienceMatch: 'Experience Match',
    skillsAlignment: 'Skills Alignment',
    atsCompatibility: 'ATS Compatibility',
    formattingConsistency: 'Formatting Consistency',
    profileSummaryStrength: 'Profile Summary Strength',
    structureFlow: 'Structure and Flow',
    visualBalanceReadability: 'Visual Balance & Readability',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading review...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h2>
          <p className="text-gray-600 mb-4">The review session you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Tools
          </Link>
        </div>
      </div>
    );
  }

  const analysisResult = session.fullAnalysis;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/tools/ats-review"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
            <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">ATS CV Review</h1>
                <p className="text-sm text-gray-600">
                  {session.cvName}
                  {session.jobTitle && ` • ${session.jobTitle}`}
                </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Score Card - Mobile Friendly */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Overall Score</h2>
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ 
              backgroundColor: `${getScoreColor(analysisResult.overallScore)}15`,
              color: getScoreColor(analysisResult.overallScore)
            }}>
              {session.reviewType === 'cv-job' ? 'Job-Specific Review' : 'General ATS Review'}
            </span>
          </div>
          {/* Score at top */}
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={getScoreColor(analysisResult.overallScore)}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(analysisResult.overallScore / 100) * 352} 352`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold" style={{ color: getScoreColor(analysisResult.overallScore) }}>
                  {analysisResult.overallScore}
                </span>
              </div>
            </div>
          </div>
          {/* Text below score */}
          <div className="text-center">
              {analysisResult.overallExplanation && (
              <p className="text-gray-700 leading-relaxed mb-2">{analysisResult.overallExplanation}</p>
              )}
              {analysisResult.summary && (
              <p className="text-gray-600 leading-relaxed">{analysisResult.summary}</p>
              )}
          </div>
        </div>

        {/* Score Breakdown Accordion */}
        {analysisResult.scoreBreakdown && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Score Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(analysisResult.scoreBreakdown).map(([key, item]) => {
                const Icon = getScoreIcon(item.score);
                const color = getScoreColor(item.score);
                const isExpanded = expandedCategory === key;
                const categoryData = item;
                
                return (
                  <div
                    key={key}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : key as ScoreBreakdownKey)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                      <Icon size={24} style={{ color }} />
                        <div className="text-left flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">
                      {categoryLabels[key] || key}
                    </h3>
                            <span className="text-xl font-bold ml-4" style={{ color }}>
                              {item.score}%
                            </span>
                          </div>
                          {!isExpanded && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-1">{item.details}</p>
                          )}
                  </div>
            </div>
                      <div className="ml-4">
                        {isExpanded ? (
                          <ChevronUp size={20} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-400" />
                        )}
            </div>
                    </button>
                    
                    {/* Accordion Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                        <div className="space-y-4 mt-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Analysis</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">{categoryData.details}</p>
                  </div>
                          {categoryData.examples && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Examples</h4>
                              <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">
                                {categoryData.examples}
                      </p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recommendation</h4>
                            <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">
                              {categoryData.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Final Recommendations */}
        {analysisResult.finalRecommendations && analysisResult.finalRecommendations.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target size={24} className="text-green-600" />
              Final Recommendations
            </h2>
            <ul className="space-y-3">
              {analysisResult.finalRecommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 flex-1">{recommendation}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}




