"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Building2, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function RecruiterSignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), type === 'success' ? 5000 : 8000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!formData.email.trim()) {
      showMessage('Email is required', 'error');
      setIsLoading(false);
      return;
    }

    if (!formData.password) {
      showMessage('Password is required', 'error');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      showMessage('Password must be at least 6 characters', 'error');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showMessage('Passwords do not match', 'error');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            user_type: 'recruiter',
          }
        }
      });

      if (error) {
        const errorMsg = error.message.toLowerCase();
        let errorMessage = error.message;

        if (errorMsg.includes('user already registered') || errorMsg.includes('already registered')) {
          errorMessage = 'This email is already registered. Please sign in instead.';
        } else if (errorMsg.includes('invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        }

        showMessage(errorMessage, 'error');
        return;
      }

      if (data.user) {
        // Create profile with user_type
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            email: formData.email.trim(),
            user_type: 'recruiter'
          }]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        if (!data.session) {
          showMessage('Account created! Please check your email to confirm your account.', 'success');
          setTimeout(() => {
            router.push('/auth/login?redirect=/submit');
          }, 2000);
        } else {
          showMessage('Account created successfully!', 'success');
          setTimeout(() => {
            router.push('/submit');
          }, 1000);
        }
      }

    } catch (error: any) {
      console.error('Signup error:', error);
      showMessage(error.message || 'Failed to create account', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white" style={{ backgroundColor: '#2563EB' }}>
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Building2 size={32} />
            <h1 className="text-3xl font-bold">Recruiter Sign Up</h1>
          </div>
          <p className="text-lg text-white">
            Post jobs and find top talent for your company.
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Recruiter Sign Up</span>
          </nav>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        {/* Sign Up Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              messageType === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {messageType === 'success' ? (
                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Recruiter Account'
              )}
            </button>

            <p className="text-sm text-gray-600 text-center">
              Already have an account?{' '}
              <Link href="/auth/login?redirect=/submit" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign In
              </Link>
            </p>
          </form>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Why create a recruiter account?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Post unlimited job listings</li>
            <li>• Manage multiple companies</li>
            <li>• Reach thousands of qualified candidates</li>
            <li>• Simple setup - no onboarding required</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
