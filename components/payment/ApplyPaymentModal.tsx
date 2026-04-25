"use client";

import { useState, useEffect } from 'react';
import { usePaystack } from '@/hooks/usePaystack';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Check, Loader2, Sparkles, Zap } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  price: number;
  usdPrice?: number;
  period: string;
  description: string;
  features: string[];
  highlight?: boolean;
  icon: React.ReactNode;
  planType: string;
  creditAmount: number;
}

const PACKAGES: Package[] = [
  {
    id: 'pro',
    name: 'Pro',
    price: 2499,
    usdPrice: 9.99,
    period: 'month',
    description: 'Full access to all JobMeter tools and features with high credit limits.',
    planType: 'pro',
    creditAmount: 30,
    icon: <Zap className="w-5 h-5" />,
    features: [
      '30 credits/month (Immediate allocation)',
      'Everything in Free plan',
      'Full unlimited access to Assessment Quiz',
      'Priority on all AI tools',
    ],
  },
  {
    id: 'apply-for-me',
    name: 'Apply for Me',
    price: 5000,
    period: 'month',
    description: 'We apply to jobs on your behalf — tailored, curated, consistent.',
    planType: 'apply_for_me',
    creditAmount: 15,
    highlight: true,
    icon: <Sparkles className="w-5 h-5" />,
    features: [
      '15 bonus credits/month',
      '10–15 curated job applications per month',
      'Professional CV written from scratch',
      'Tailored cover letter per application',
      'Dedicated Gmail inbox for interview tracking',
      'Extra month free if zero interview invites',
      'Nigeria only',
    ],
  },
];

interface ApplyPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPackage?: string;
  onAuthRequired: () => void;
  onSuccess?: () => void;
}

export function ApplyPaymentModal({
  open,
  onOpenChange,
  defaultPackage = 'pro',
  onAuthRequired,
  onSuccess,
}: ApplyPaymentModalProps) {
  const [selectedPackage, setSelectedPackage] = useState(defaultPackage);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { initializePayment, loading, error } = usePaystack();

  useEffect(() => {
    if (!open) return;
    setCheckingAuth(true);
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
      setCheckingAuth(false);
    });
  }, [open]);

  const pkg = PACKAGES.find((p) => p.id === selectedPackage) ?? PACKAGES[0];

  const handlePay = async () => {
    if (!userEmail) {
      onOpenChange(false);
      onAuthRequired();
      return;
    }

    // Dynamic callback URL - Apply for Me goes to submit page, others to dashboard
    const successRedirect = selectedPackage === 'apply-for-me' 
      ? '/apply-for-me/submit' 
      : '/dashboard';

    const callback_url = `${window.location.origin}${successRedirect}`;

    await initializePayment({
      email: userEmail,
      amount: pkg.price,
      paymentType: 'subscription',
      planId: pkg.id,
      planType: pkg.planType,
      creditAmount: pkg.creditAmount,
      callback_url,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Choose Your Plan
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            International users pay $9.99 for Pro. Nigerian users pay in NGN. Payments processed via Paystack.
          </DialogDescription>
        </DialogHeader>

        {/* Package selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {PACKAGES.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPackage(p.id)}
              className={`relative text-left rounded-2xl border-2 p-4 transition-all ${
                selectedPackage === p.id
                  ? 'border-amber-400 bg-amber-50'
                  : 'border-gray-200 bg-white hover:border-amber-200'
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-2.5 left-4 bg-amber-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  POPULAR
                </span>
              )}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${
                selectedPackage === p.id ? 'bg-amber-400 text-gray-900' : 'bg-gray-100 text-gray-500'
              }`}>
                {p.icon}
              </div>
              <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
              <div className="mt-1">
                <p className="text-xl font-bold text-gray-900">
                  ₦{p.price.toLocaleString()}
                  <span className="text-xs font-normal text-gray-400 ml-1">/{p.period}</span>
                </p>
                {p.usdPrice && (
                  <p className="text-[10px] text-gray-400 font-medium">
                    Or ${p.usdPrice} international
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Selected package details */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 mt-1">
          <p className="text-sm text-gray-500 mb-4">{pkg.description}</p>
          <ul className="space-y-2.5">
            {pkg.features.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-amber-600" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Auth status + CTA */}
        {checkingAuth ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-3">
            {userEmail ? (
              <p className="text-xs text-center text-gray-400">
                Paying as <span className="font-medium text-gray-600">{userEmail}</span>
              </p>
            ) : (
              <p className="text-xs text-center text-amber-600 bg-amber-50 border border-amber-200 rounded-xl py-2 px-3">
                You need to be logged in to make a payment.
              </p>
            )}

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              onClick={handlePay}
              disabled={loading || !userEmail}
              className="w-full h-12 text-base font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-2xl"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to Paystack...
                </>
              ) : userEmail ? (
                `Pay ₦${pkg.price.toLocaleString()} →`
              ) : (
                'Sign in to Continue'
              )}
            </Button>

            <p className="text-xs text-center text-gray-400">
              🔒 Secured by Paystack · Cancel anytime
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}