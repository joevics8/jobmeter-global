"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Briefcase
} from 'lucide-react';

interface RecruiterAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RecruiterAuthModal({ open, onOpenChange }: RecruiterAuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
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

  const handleClose = () => {
    onOpenChange(false);
    setFormData({ email: '', password: '', confirmPassword: '' });
    setMessage('');
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      showMessage(error.message || 'Failed to sign in with Google', 'error');
    }
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

    if (mode === 'signup') {
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
          if (errorMsg.includes('user already registered') || errorMsg.includes('already registered')) {
            showMessage('This email is already registered. Please sign in instead.', 'error');
          } else if (errorMsg.includes('invalid email')) {
            showMessage('Please enter a valid email address.', 'error');
          } else {
            showMessage(error.message, 'error');
          }
          setIsLoading(false);
          return;
        }

        if (data.user) {
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
            setTimeout(() => setMode('signin'), 2000);
          } else {
            handleClose();
            router.push('/submit');
          }
        }
      } catch (error: any) {
        showMessage(error.message || 'Failed to create account', 'error');
      }
    } else {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            showMessage('Invalid email or password. Please try again.', 'error');
          } else {
            showMessage(error.message, 'error');
          }
          setIsLoading(false);
          return;
        }

        handleClose();
        router.push('/submit');
      } catch (error: any) {
        showMessage(error.message || 'Failed to sign in', 'error');
      }
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold">
              {mode === 'signup' ? 'Recruiter Sign Up' : 'Recruiter Sign In'}
            </DialogTitle>
          </div>
        </DialogHeader>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recruiter-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                id="recruiter-email" 
                type="email" 
                placeholder="you@company.com"
                className="pl-10 h-11"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="recruiter-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                id="recruiter-password" 
                type={showPassword ? "text" : "password"}
                placeholder={mode === 'signup' ? "At least 6 characters" : "Enter your password"}
                className="pl-10 pr-10 h-11"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-9 w-9 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-slate-400" />
                ) : (
                  <Eye className="h-4 w-4 text-slate-400" />
                )}
              </Button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="recruiter-confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="recruiter-confirm-password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="pl-10 h-11"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
          
          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-11"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              mode === 'signup' ? 'Create Recruiter Account' : 'Sign In'
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          <Button 
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full h-11"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="text-center text-sm text-gray-600">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}