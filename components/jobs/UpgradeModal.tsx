"use client";

import React from 'react';
import { X, Crown, TrendingUp, Zap } from 'lucide-react';
import { theme } from '@/lib/theme';
import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorType: 'PREMIUM_REQUIRED' | 'QUOTA_EXCEEDED' | 'INSUFFICIENT_CREDITS';
  message?: string;
  resetDate?: string;
  monthlyLimit?: number;
  requiredCredits?: number;
  currentCredits?: number;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  errorType,
  message,
  resetDate,
  monthlyLimit,
  requiredCredits,
  currentCredits,
}: UpgradeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    if (errorType === 'INSUFFICIENT_CREDITS') {
      router.push('/credits/purchase');
    } else {
      router.push('/settings?tab=subscription');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: theme.colors.primary.light + '20' }}
            >
              <Crown
                size={24}
                style={{ color: theme.colors.primary.DEFAULT }}
              />
            </div>
            <h3 className="text-xl font-bold" style={{ color: theme.colors.text.primary }}>
              {errorType === 'PREMIUM_REQUIRED' ? 'Upgrade to Premium' : errorType === 'INSUFFICIENT_CREDITS' ? 'Insufficient Credits' : 'Monthly Limit Reached'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          {errorType === 'INSUFFICIENT_CREDITS' ? (
            <>
              <p className="text-gray-700 mb-4">
                {message || `Auto-apply requires ${requiredCredits || 2} credits. You have ${currentCredits || 0} credit${currentCredits !== 1 ? 's' : ''}.`}
              </p>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 mb-4">
                <p className="text-sm text-blue-800 mb-3 font-medium">
                  Purchase credits to continue using auto-apply:
                </p>
                <ul className="text-sm text-blue-700 space-y-2 ml-4">
                  <li>• <strong>4 Credits:</strong> ₦500 (₦125 per credit)</li>
                  <li>• <strong>10 Credits:</strong> ₦1,000 (₦100 per credit)</li>
                  <li>• <strong>30 Credits:</strong> ₦2,500 (₦83 per credit) - Best Value</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-600">
                  <strong>Note:</strong> Auto-apply costs 2 credits per application. Credits can also be used for CV creation and other premium tools.
                </p>
              </div>
            </>
          ) : errorType === 'PREMIUM_REQUIRED' ? (
            <>
              <p className="text-gray-700 mb-4">
                Auto-apply feature is available for premium users only. Upgrade to unlock:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Zap size={20} style={{ color: theme.colors.primary.DEFAULT }} className="mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Automatic Job Applications</p>
                    <p className="text-sm text-gray-600">Apply to jobs automatically with AI-generated CV and cover letter</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp size={20} style={{ color: theme.colors.primary.DEFAULT }} className="mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Priority Matching</p>
                    <p className="text-sm text-gray-600">Get top job matches ranked and ready for auto-apply</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Crown size={20} style={{ color: theme.colors.primary.DEFAULT }} className="mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Premium Plans</p>
                    <p className="text-sm text-gray-600">Choose from Pro (15/month), Max (30/month), or Elite (90/month)</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700 mb-4">
                {message || `You've reached your monthly application limit of ${monthlyLimit || 0} applications.`}
              </p>
              {resetDate && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Reset Date:</strong> {new Date(resetDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              <div className="mt-4 p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-700 mb-2">
                  Upgrade to a higher plan to get more applications per month:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• <strong>Pro:</strong> 15 applications/month - ₦3,000</li>
                  <li>• <strong>Max:</strong> 30 applications/month - ₦5,000</li>
                  <li>• <strong>Elite:</strong> 90 applications/month - ₦10,000</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm text-white transition-colors"
            style={{
              backgroundColor: theme.colors.primary.DEFAULT,
            }}
          >
            {errorType === 'INSUFFICIENT_CREDITS' ? 'Purchase Credits' : errorType === 'PREMIUM_REQUIRED' ? 'Upgrade Now' : 'Upgrade Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

