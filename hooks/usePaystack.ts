"use client";

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface PaymentOptions {
  email: string;
  amount: number;
  paymentType: 'subscription' | 'credits';
  planId?: string;
  planType?: string;
  creditAmount?: number;
  callback_url?: string;
}

interface UsePaystackReturn {
  initializePayment: (options: PaymentOptions) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function usePaystack(): UsePaystackReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializePayment = useCallback(async (options: PaymentOptions) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return false;
      }

      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: options.email,
          amount: options.amount,
          userId: user.id,
          paymentType: options.paymentType,
          planId: options.planId,
          planType: options.planType,
          creditAmount: options.creditAmount,
          callback_url: options.callback_url,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to initialize payment');
        setLoading(false);
        return false;
      }

      // FIX: Guard against missing authorizationUrl.
      // Previously, if the backend returned no URL (e.g. due to a missing
      // PAYSTACK_SECRET_KEY env var), this would silently do
      // window.location.href = undefined, which skips Paystack entirely
      // and navigates the user straight to the callback page.
      if (!data.authorizationUrl) {
        console.error('[usePaystack] No authorizationUrl in response:', data);
        setError('Payment gateway error: could not get checkout URL. Please try again.');
        setLoading(false);
        return false;
      }

      // Redirect to Paystack's hosted payment page
      window.location.href = data.authorizationUrl;
      return true;
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
      return false;
    }
  }, []);

  return { initializePayment, loading, error };
}