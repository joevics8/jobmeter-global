"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { theme } from '@/lib/theme';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    // Supabase puts the tokens in the URL hash when redirecting from email
    // onAuthStateChange picks up the PASSWORD_RECOVERY event automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsValidSession(true);
          setIsCheckingSession(false);
        } else if (event === 'SIGNED_IN' && session) {
          // Sometimes fires before PASSWORD_RECOVERY — still valid
          setIsValidSession(true);
          setIsCheckingSession(false);
        }
      }
    );

    // Fallback: check existing session (user might have already been signed in by the link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      }
      setIsCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const showMsg = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    if (type === 'success') setTimeout(() => setMessage(''), 5000);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (password.length < 8) {
      showMsg('Password must be at least 8 characters.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showMsg('Passwords do not match.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setIsSuccess(true);
      showMsg('Password updated successfully!', 'success');

      // Sign out and redirect to home after 2 seconds
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push('/');
      }, 2000);

    } catch (error: any) {
      console.error('Password update error:', error);
      showMsg(error.message || 'Failed to update password. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: theme.colors.primary.DEFAULT }} />
          <p className="text-sm text-gray-500">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid / expired link
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Link Expired or Invalid</h1>
          <p className="text-sm text-gray-500">
            This password reset link has expired or has already been used. Please request a new one.
          </p>
          <Button
            onClick={() => router.push('/')}
            className="w-full h-11 text-white"
            style={{ backgroundColor: theme.colors.primary.DEFAULT }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto">
            <CheckCircle className="h-7 w-7 text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Password Updated!</h1>
          <p className="text-sm text-gray-500">
            Your password has been changed successfully. Redirecting you to the homepage...
          </p>
          <Loader2 className="h-5 w-5 animate-spin mx-auto" style={{ color: theme.colors.primary.DEFAULT }} />
        </div>
      </div>
    );
  }

  // Main reset form
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
            Set New Password
          </h1>
          <p className="text-sm text-gray-500">
            Choose a strong password for your Jobmeter account.
          </p>
        </div>

        {/* Message banner */}
        {message && (
          <div className={`p-3 rounded-lg flex items-center gap-3 ${
            messageType === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {messageType === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleReset} className="space-y-4">

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                className="pl-10 pr-10 h-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-10 w-10 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword
                  ? <EyeOff className="h-4 w-4 text-slate-400" />
                  : <Eye className="h-4 w-4 text-slate-400" />
                }
              </Button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                className="pl-10 pr-10 h-12"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-10 w-10 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword
                  ? <EyeOff className="h-4 w-4 text-slate-400" />
                  : <Eye className="h-4 w-4 text-slate-400" />
                }
              </Button>
            </div>
          </div>

          {/* Password match indicator */}
          {confirmPassword.length > 0 && (
            <p className={`text-xs flex items-center gap-1 ${
              password === confirmPassword ? 'text-green-600' : 'text-red-500'
            }`}>
              {password === confirmPassword
                ? <><CheckCircle className="h-3 w-3" /> Passwords match</>
                : <><AlertCircle className="h-3 w-3" /> Passwords do not match</>
              }
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            style={{ backgroundColor: theme.colors.primary.DEFAULT }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating Password...
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </form>

        {/* Back link */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:underline flex items-center gap-1 mx-auto"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}