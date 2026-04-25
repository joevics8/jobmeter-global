'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [planId, setPlanId] = useState<string | null>(null);

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    if (!reference) {
      setStatus('error');
      setErrorMessage('No payment reference found in URL.');
      return;
    }

    const processPayment = async () => {
      try {
        console.log('Processing payment with reference:', reference);

        // Delegate ALL verification + credit logic to the server-side API route
        const res = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        });

        const result = await res.json();

        if (!res.ok || !result.success) {
          setStatus('error');
          setErrorMessage(result.error || 'Payment verification failed');
          return;
        }

        setPlanId(result.planId);
        setStatus('success');

        // Redirect based on plan type returned from API
        if (result.planId === 'apply-for-me') {
          setTimeout(() => router.push('/apply-for-me/submit'), 1500);
        } else {
          setTimeout(() => router.push('/dashboard'), 1500);
        }
      } catch (err: any) {
        console.error('Error in callback:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Failed to process payment');
      }
    };

    processPayment();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-amber-500" />
          <p className="text-xl text-gray-600">Verifying your payment and adding credits...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="max-w-md text-center">
          <XCircle className="h-16 w-16 mx-auto mb-6 text-red-500" />
          <h1 className="text-3xl font-bold mb-3">Payment Processing Failed</h1>
          <p className="text-gray-600 mb-8">{errorMessage}</p>
          <button
            onClick={() => router.push('/apply-for-me')}
            className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-black"
          >
            Back to Apply for Me
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-white">
      <div className="text-center max-w-md px-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
        <p className="text-xl text-gray-600">Credits have been added to your account.</p>
        <p className="mt-6 text-gray-500">Redirecting you...</p>
      </div>
    </div>
  );
}