"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { LogIn, UserPlus, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle, Briefcase, Upload, FileText, X } from 'lucide-react';
import { theme } from '@/lib/theme';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signup');
  const [showSignIn, setShowSignIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  
  // CV Upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState('');
  const [isProcessingCV, setIsProcessingCV] = useState(false);
  const [cvError, setCvError] = useState('');
  
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), type === 'success' ? 5000 : 8000);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!signInData.email.trim()) {
      showMessage('Email is required', 'error');
      setIsLoading(false);
      return;
    }

    if (!signInData.password.trim()) {
      showMessage('Password is required', 'error');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInData.email.trim(),
        password: signInData.password,
      });

      if (error) throw error;

      showMessage('Signed in successfully!', 'success');
      
      setTimeout(() => {
        onOpenChange(false);
        router.refresh();
      }, 1000);

    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.message.includes('Email not confirmed')) {
        showMessage('Please check your email and confirm your account before signing in.', 'error');
      } else if (error.message.includes('Invalid login credentials')) {
        showMessage('Invalid email or password. Please try again.', 'error');
      } else {
        showMessage(error.message || 'Failed to sign in', 'error');
      }
    } finally {
      setIsLoading(false);
    }
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setMessage('');

    if (!resetEmail.trim()) {
      showMessage('Please enter your email address', 'error');
      setIsResetting(false);
      return;
    }

    if (!resetEmail.includes('@')) {
      showMessage('Please enter a valid email address', 'error');
      setIsResetting(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      showMessage('Password reset email sent! Please check your inbox.', 'success');
      setResetEmail('');
      setTimeout(() => {
        setShowForgotPassword(false);
      }, 2000);

    } catch (error: any) {
      console.error('Password reset error:', error);
      showMessage(error.message || 'Failed to send reset email', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSignInData({ email: '', password: '' });
    setResetEmail('');
    setShowForgotPassword(false);
    setShowSignIn(false);
    setMessage('');
    setActiveTab('signup');
    setUploadedFile(null);
    setCvText('');
    setCvError('');
  };

  // CV Upload Handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      e.target.value = '';
      return;
    }

    if (isProcessingCV) {
      e.target.value = '';
      return;
    }

    const isPDF = file.type === "application/pdf";
    const isImage = file.type.includes("image");
    const isDocument = file.type.includes("document") || file.name.endsWith('.doc') || file.name.endsWith('.docx');
    
    if (!isPDF && !isImage && !isDocument) {
      setCvError("Please upload a PDF, Word document (DOC/DOCX), or image file");
      e.target.value = '';
      return;
    }

    setUploadedFile(file);
    setCvError('');
    
    try {
      await extractFromFile(file);
    } catch (error) {
      console.error('File processing failed:', error);
      setUploadedFile(null);
    }
    
    e.target.value = '';
  };

  const extractFromFile = async (file: File) => {
    console.log('📄 Starting file extraction for:', file.name);
    setIsProcessingCV(true);
    setCvError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/onboarding/ocr', { 
        method: 'POST', 
        body: formData 
      });

      console.log('📡 OCR API response status:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.log('❌ OCR API error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error === 'EXTRACTION_FAILED') {
            throw new Error('Text extraction failed. Please try again or paste your CV text.');
          }
        } catch (e) {
          // Not JSON, continue with normal error
        }
        throw new Error(`OCR failed: ${res.status}`);
      }

      const data = await res.json();
      console.log('📄 OCR API response data:', data);

      if (!data?.text) {
        console.log('❌ No text in OCR response');
        throw new Error('No text extracted from file');
      }

      console.log('✅ Text extracted, length:', data.text.length);
      setCvText(data.text as string);

      await parseCVText(data.text as string);

    } catch (error: any) {
      console.error('💥 File extraction error:', error);
      setCvError(error.message || 'Failed to process CV. Please try again.');
      setUploadedFile(null);
      setIsProcessingCV(false);
      throw error;
    }
  };

  const parseCVText = async (text: string) => {
    console.log('🔄 Starting CV parsing, text length:', text.length);
    setIsProcessingCV(true);
    setCvError('');

    try {
      const res = await fetch('/api/onboarding/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      console.log('📡 Parse API response status:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.log('❌ Parse API error response:', errorText);
        const errorData = await res.json().catch(() => ({ 
          error: `Parsing failed: ${res.status}`, 
          details: errorText 
        }));
        throw new Error(errorData.error || `Parsing failed: ${res.status}`);
      }

      const data = await res.json();
      console.log('📄 Parse API response data:', data);

      if (!data?.parsed) {
        console.log('❌ Missing parsed data in response');
        throw new Error('Invalid response: missing parsed data');
      }

      console.log('✅ Parse successful, profile data:', data.parsed);

      const cvRoles = data.parsed.workExperience?.map((exp: any) => exp.title) || [];
      
      const profile = {
        name: data.parsed.fullName || 'Name not found',
        email: data.parsed.email || 'Email not found',
        phone: data.parsed.phone || 'Phone not found',
        location: data.parsed.location || 'Location not found',
        summary: data.parsed.summary || 'Summary not found',
        roles: cvRoles,
        skills: Array.isArray(data.parsed.skills) ? data.parsed.skills : [],
        experience: 'Experience level to be determined',
        workExperience: Array.isArray(data.parsed.workExperience) ? data.parsed.workExperience : [],
        education: Array.isArray(data.parsed.education) ? data.parsed.education : [],
        projects: Array.isArray(data.parsed.projects) ? data.parsed.projects : [],
        accomplishments: Array.isArray(data.parsed.accomplishments) ? data.parsed.accomplishments : [],
        awards: Array.isArray(data.parsed.awards) ? data.parsed.awards : [],
        certifications: Array.isArray(data.parsed.certifications) ? data.parsed.certifications : [],
        languages: Array.isArray(data.parsed.languages) ? data.parsed.languages : [],
        interests: Array.isArray(data.parsed.interests) ? data.parsed.interests : [],
        linkedin: data.parsed.linkedin || '',
        github: data.parsed.github || '',
        portfolio: data.parsed.portfolio || '',
        publications: Array.isArray(data.parsed.publications) ? data.parsed.publications : [],
        volunteerWork: Array.isArray(data.parsed.volunteerWork) ? data.parsed.volunteerWork : [],
        additionalSections: Array.isArray(data.parsed.additionalSections) ? data.parsed.additionalSections : [],
        cvAiSuggestedRoles: Array.isArray(data.parsed.suggestedRoles) ? data.parsed.suggestedRoles : []
      };

      try {
        localStorage.setItem('onboarding_cv_data', JSON.stringify(profile));
        localStorage.setItem('onboarding_cv_file', JSON.stringify({ text }));
        console.log('✅ Saved parsed data to localStorage');
      } catch (storageError) {
        console.warn('Failed to save to localStorage:', storageError);
      }

      console.log('🔄 Redirecting to /onboarding...');
      onOpenChange(false);
      router.push('/onboarding');

    } catch (error: any) {
      console.error('💥 CV parsing error:', error);
      setCvError(error.message || 'Failed to parse CV. Please try again.');
      setUploadedFile(null);
      throw error;
    } finally {
      setIsProcessingCV(false);
    }
  };

  const handlePasteCV = async () => {
    if (!cvText.trim()) {
      setCvError('Please paste your CV text');
      return;
    }
    await parseCVText(cvText.trim());
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!showSignIn ? (
          <>
            <DialogHeader>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: theme.colors.primary.DEFAULT + '20' }}>
                  <svg className="w-8 h-8" style={{ color: theme.colors.primary.DEFAULT }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <DialogTitle className="text-xl font-bold" style={{ color: theme.colors.text.primary }}>
                  Let Top Recruiters Find You! 🎯
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  Upload your CV once and get discovered by hundreds of companies looking for talent like you
                </DialogDescription>
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
                  <div className="h-4 w-4 rounded-full border-2 border-red-600 border-t-transparent animate-spin flex-shrink-0" />
                )}
                <span className="text-sm font-medium">{message}</span>
              </div>
            )}

<div className="space-y-4">
              

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessingCV}
              />

              <Button
                type="button"
                className="w-full h-14 text-white font-medium shadow-md hover:shadow-lg transition-all"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingCV}
                style={{ backgroundColor: theme.colors.primary.DEFAULT }}
              >
                {uploadedFile ? (
                  <div className="flex items-center gap-2 w-full">
                    <FileText className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium truncate">{uploadedFile.name}</p>
                      <p className="text-xs opacity-90">Click to change</p>
                    </div>
                    <X 
                      className="h-4 w-4 flex-shrink-0" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                        setCvError('');
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Your CV & Get Started
                  </>
                )}
              </Button>

              {!uploadedFile && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('paste-cv-textarea');
                      if (textarea) {
                        textarea.classList.toggle('hidden');
                      }
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                    disabled={isProcessingCV}
                  >
                    Or paste your CV text instead
                  </button>

                  <Textarea
                    id="paste-cv-textarea"
                    placeholder="Paste your CV content here..."
                    value={cvText}
                    onChange={(e) => {
                      setCvText(e.target.value);
                      setCvError('');
                    }}
                    rows={6}
                    disabled={isProcessingCV}
                    className="resize-none border-2 hidden"
                    style={{ borderColor: theme.colors.primary.DEFAULT + '40' }}
                  />

                  {cvText.trim() && !isProcessingCV && (
                    <Button
                      onClick={handlePasteCV}
                      className="w-full h-12 text-white font-medium shadow-md hover:shadow-lg transition-all"
                      style={{ backgroundColor: theme.colors.primary.DEFAULT }}
                    >
                      Continue with Pasted CV
                    </Button>
                  )}
                </div>
              )}

              {cvError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-red-600 border-t-transparent animate-spin flex-shrink-0" />
                  <span className="text-sm text-red-800">{cvError}</span>
                </div>
              )}

              {isProcessingCV && (
                <div className="p-4 rounded-lg border-2 flex items-center gap-3" style={{ 
                  backgroundColor: theme.colors.primary.DEFAULT + '10',
                  borderColor: theme.colors.primary.DEFAULT 
                }}>
                  <Loader2 className="h-6 w-6 animate-spin flex-shrink-0" style={{ color: theme.colors.primary.DEFAULT }} />
                  <div>
                    <p className="font-medium" style={{ color: theme.colors.primary.DEFAULT }}>
                      Analyzing Your CV...
                    </p>
                    <p className="text-sm opacity-70">This may take a moment</p>
                  </div>
                </div>
)}

              {/* Sign In Link */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => setShowSignIn(true)}
                    className="font-medium hover:underline"
                    style={{ color: theme.colors.primary.DEFAULT }}
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setShowSignIn(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <DialogTitle className="text-xl font-bold" style={{ color: theme.colors.text.primary }}>
                  Welcome Back! 👋
                </DialogTitle>
              </div>
              <DialogDescription className="text-sm text-gray-600">
                Sign in to access your job matches and applications
              </DialogDescription>
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
                  <div className="h-4 w-4 rounded-full border-2 border-red-600 border-t-transparent animate-spin flex-shrink-0" />
                )}
                <span className="text-sm font-medium">{message}</span>
              </div>
            )}

            {!showForgotPassword ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="signin-email" 
                      type="email" 
                      placeholder="Enter your email"
                      className="pl-10 h-12"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="signin-password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-12"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
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
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm hover:underline"
                    style={{ color: theme.colors.primary.DEFAULT }}
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>
                
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  style={{ backgroundColor: theme.colors.primary.DEFAULT }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
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
                  className="w-full h-12"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="reset-email" 
                      type="email" 
                      placeholder="Enter your email"
                      className="pl-10 h-12"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      disabled={isResetting}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmail('');
                    }}
                    className="text-sm hover:underline"
                    style={{ color: theme.colors.primary.DEFAULT }}
                    disabled={isResetting}
                  >
                    Back to sign in
                  </button>
                </div>
                
                <Button 
                  type="submit"
                  disabled={isResetting}
                  className="w-full h-12 text-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  style={{ backgroundColor: theme.colors.primary.DEFAULT }}
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
)}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}