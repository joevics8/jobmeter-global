"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Upload,
  FileText,
  User,
  Briefcase,
  MapPin,
  GraduationCap,
  Check,
  X,
  Plus,
  Brain,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Trash2,
  Star,
  Award,
  Sparkles,
  Banknote,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';

export default function OnboardingPage() {
  const router = useRouter();

  // CV upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    roles: [] as string[],
    skills: [] as string[],
    experience: '',
    workExperience: [] as any[],
    education: [] as any[],
    projects: [] as any[],
    accomplishments: [] as string[],
    awards: [] as any[],
    certifications: [] as any[],
    languages: [] as string[],
    interests: [] as string[],
    linkedin: '',
    github: '',
    portfolio: '',
    publications: [] as any[],
    volunteerWork: [] as any[],
    additionalSections: [] as any[],
    cvAiSuggestedRoles: [] as string[],
  });
  const [error, setError] = useState('');
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [newRole, setNewRole] = useState('');
  const [preferences, setPreferences] = useState({
    locations: [] as string[],
    salaryMin: '',
    salaryMax: '',
    experienceLevel: '',
    jobType: '',
    remotePreference: '',
    sector: '',
  });
  const [locationInput, setLocationInput] = useState('');
  const [talentPool, setTalentPool] = useState<boolean | null>(null);

  // Section expand state
  const [rolesExpanded, setRolesExpanded] = useState(false);
  const [prefsExpanded, setPrefsExpanded] = useState(false);

  // Signup modal state
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [isSavingData, setIsSavingData] = useState(false);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [signUpData, setSignUpData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const canCompleteOnboarding = !!(extractedData.name && selectedRoles.length > 0);

  // Auto-fill signup form
  React.useEffect(() => {
    if (extractedData.name && !signUpData.fullName) {
      setSignUpData(prev => ({ ...prev, fullName: extractedData.name }));
    }
    if (extractedData.email && !signUpData.email) {
      setSignUpData(prev => ({ ...prev, email: extractedData.email }));
    }
  }, [extractedData.name, extractedData.email]);

  // Load saved CV data from localStorage on mount
  useEffect(() => {
    try {
      const savedCvData = localStorage.getItem('onboarding_cv_data');
      const savedCvFile = localStorage.getItem('onboarding_cv_file');
      if (savedCvData) {
        const parsedData = JSON.parse(savedCvData);
        setExtractedData(parsedData);
        if (savedCvFile) {
          const fileData = JSON.parse(savedCvFile);
          if (fileData.text) setCvText(fileData.text);
        }
        setRolesExpanded(true);
        setPrefsExpanded(true);
      }
      const savedRoles = localStorage.getItem('onboarding_target_roles');
      if (savedRoles) {
        const parsed = JSON.parse(savedRoles);
        if (Array.isArray(parsed) && parsed.length > 0) setSelectedRoles(parsed);
      }
      const savedPrefs = localStorage.getItem('onboarding_job_preferences');
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        setPreferences(parsed);
      }
    } catch (e) {
      console.warn('Failed to load saved data:', e);
    }
  }, []);

  // Save preferences to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('onboarding_job_preferences', JSON.stringify(preferences));
    } catch (e) {}
  }, [preferences]);

  // Save roles to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('onboarding_target_roles', JSON.stringify(selectedRoles));
    } catch (e) {}
  }, [selectedRoles]);

  // Pre-select CV roles
  React.useEffect(() => {
    if (extractedData.roles && extractedData.roles.length > 0) {
      const savedTargetRoles = localStorage.getItem('onboarding_target_roles');
      if (savedTargetRoles) {
        const parsed = JSON.parse(savedTargetRoles);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedRoles(parsed);
          return;
        }
      }
      setSelectedRoles(extractedData.roles);
    }
  }, [extractedData.roles]);

  const showMsg = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), type === 'success' ? 5000 : 8000);
  };

  const handleRoleToggle = React.useCallback((role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  }, []);

  const addCustomRole = () => {
    if (newRole.trim() && !selectedRoles.includes(newRole.trim())) {
      setSelectedRoles(prev => [...prev, newRole.trim()]);
      setNewRole('');
    }
  };

  const addLocation = () => {
    if (locationInput.trim() && !preferences.locations.includes(locationInput.trim())) {
      setPreferences(prev => ({ ...prev, locations: [...prev.locations, locationInput.trim()] }));
      setLocationInput('');
    }
  };

  const removeLocation = (loc: string) => {
    setPreferences(prev => ({ ...prev, locations: prev.locations.filter(l => l !== loc) }));
  };

  const clearAllData = () => {
    setSelectedFile(null);
    setCvText('');
    setExtractedData({
      name: '', email: '', phone: '', location: '', summary: '',
      roles: [], skills: [], experience: '', workExperience: [], education: [],
      projects: [], accomplishments: [], awards: [], certifications: [],
      languages: [], interests: [], linkedin: '', github: '', portfolio: '',
      publications: [], volunteerWork: [], additionalSections: [], cvAiSuggestedRoles: [],
    });
    setSelectedRoles([]);
    setPreferences({ locations: [], salaryMin: '', salaryMax: '', experienceLevel: '', jobType: '', remotePreference: '', sector: '' });
    setError('');
    setRolesExpanded(false);
    setPrefsExpanded(false);
    try {
      localStorage.removeItem('onboarding_cv_data');
      localStorage.removeItem('onboarding_cv_file');
      localStorage.removeItem('onboarding_job_preferences');
      localStorage.removeItem('onboarding_target_roles');
      localStorage.removeItem('tempUploadedCV');
      localStorage.removeItem('completedOnboarding');
      localStorage.removeItem('extractedProfile');
      localStorage.removeItem('cvText');
      localStorage.removeItem('onboardingPreferences');
    } catch (e) {}
    window.location.reload();
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const onboardingCache = {
        cvData: extractedData, selectedRoles, preferences, cvText,
        cvFileName: selectedFile?.name, cvFileType: selectedFile?.type, cvFileSize: selectedFile?.size,
        cachedAt: new Date().toISOString(),
      };
      localStorage.setItem('pending_onboarding_data', JSON.stringify(onboardingCache));
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/jobs` },
      });
      if (error) { showMsg(error.message || 'Failed to sign in with Google', 'error'); setIsLoading(false); }
    } catch (err: any) {
      showMsg(err.message || 'Failed to sign in with Google', 'error');
      setIsLoading(false);
    }
  };

  const validateSignUpForm = () => {
    const fullName = signUpData.fullName.trim() || extractedData.name?.trim() || '';
    if (!fullName) { showMsg('Full name is required', 'error'); return false; }
    const email = signUpData.email.trim() || extractedData.email?.trim() || '';
    if (!email) { showMsg('Email is required', 'error'); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { showMsg('Please enter a valid email address', 'error'); return false; }
    if (signUpData.password.length < 6) { showMsg('Password must be at least 6 characters long', 'error'); return false; }
    if (signUpData.password !== signUpData.confirmPassword) { showMsg('Passwords do not match', 'error'); return false; }
    return true;
  };

  const saveOnboardingDataToSupabase = async (user: any) => {
    setIsSavingData(true);
    try {
      const fullName = signUpData.fullName.trim() || extractedData.name?.trim() || null;
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id, email: user.email, full_name: fullName,
        phone: extractedData.phone || null, location: extractedData.location || null,
      }, { onConflict: 'id' });
      if (profileError) throw new Error('Failed to save profile');

      let dataToSave = { cvData: extractedData, selectedRoles, preferences, cvText, cvFileName: selectedFile?.name, cvFileType: selectedFile?.type, cvFileSize: selectedFile?.size };
      try {
        const cachedData = localStorage.getItem('pending_onboarding_data');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          if (parsed.userId === user.id) {
            dataToSave = {
              cvData: parsed.cvData || extractedData, selectedRoles: parsed.selectedRoles || selectedRoles,
              preferences: parsed.preferences || preferences, cvText: parsed.cvText || cvText,
              cvFileName: parsed.cvFileName || selectedFile?.name, cvFileType: parsed.cvFileType || selectedFile?.type,
              cvFileSize: parsed.cvFileSize || selectedFile?.size,
            };
          }
        }
      } catch (e) {}

      const { error: onboardingError } = await supabase.from('onboarding_data').upsert({
        user_id: user.id,
        cv_name: dataToSave.cvData.name || null, cv_email: dataToSave.cvData.email || null,
        cv_phone: dataToSave.cvData.phone || null, cv_location: dataToSave.cvData.location || null,
        cv_summary: dataToSave.cvData.summary || null, cv_roles: dataToSave.cvData.roles || [],
        cv_skills: dataToSave.cvData.skills || [], cv_experience: dataToSave.cvData.experience || null,
        cv_work_experience: dataToSave.cvData.workExperience || null, cv_education: dataToSave.cvData.education || null,
        cv_projects: dataToSave.cvData.projects || null, cv_accomplishments: dataToSave.cvData.accomplishments || [],
        cv_awards: dataToSave.cvData.awards || [], cv_certifications: dataToSave.cvData.certifications || [],
        cv_languages: dataToSave.cvData.languages || [], cv_interests: dataToSave.cvData.interests || [],
        cv_linkedin: dataToSave.cvData.linkedin || null, cv_github: dataToSave.cvData.github || null,
        cv_portfolio: dataToSave.cvData.portfolio || null, cv_publications: dataToSave.cvData.publications || [],
        cv_volunteer_work: dataToSave.cvData.volunteerWork || null, cv_additional_sections: dataToSave.cvData.additionalSections || null,
        target_roles: dataToSave.selectedRoles || [], preferred_locations: dataToSave.preferences.locations || [],
        salary_min: dataToSave.preferences.salaryMin ? parseInt(dataToSave.preferences.salaryMin) : null,
        salary_max: dataToSave.preferences.salaryMax ? parseInt(dataToSave.preferences.salaryMax) : null,
        experience_level: dataToSave.preferences.experienceLevel || null, job_type: dataToSave.preferences.jobType || null,
        remote_preference: dataToSave.preferences.remotePreference || null, sector: dataToSave.preferences.sector || null,
        cv_text: dataToSave.cvText || null, cv_file_name: dataToSave.cvFileName || null,
        cv_file_type: dataToSave.cvFileType || null, cv_file_size: dataToSave.cvFileSize || null,
        completed_at: new Date().toISOString(),
        talent_pool: talentPool,
      }, { onConflict: 'user_id' });
      if (onboardingError) throw new Error('Failed to save onboarding data');
    } catch (error) {
      throw error;
    } finally {
      setIsSavingData(false);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    setMessage('');
    if (!canCompleteOnboarding) {
      showMsg('Please upload your CV and select at least one role first', 'error');
      setIsLoading(false);
      return;
    }
    if (!validateSignUpForm()) { setIsLoading(false); return; }
    try {
      const fullName = signUpData.fullName.trim() || extractedData.name?.trim() || '';
      const email = signUpData.email.trim() || extractedData.email?.trim() || '';
      const { data, error } = await supabase.auth.signUp({
        email, password: signUpData.password.trim(),
        options: { data: { full_name: fullName } },
      });
      if (error) {
        const errorMsg = error.message.toLowerCase();
        let errorMessage = error.message;
        if (errorMsg.includes('user already registered') || errorMsg.includes('already registered')) {
          errorMessage = 'This email is already registered. Please sign in instead.';
        } else if (errorMsg.includes('invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (errorMsg.includes('password')) {
          errorMessage = 'Password must be at least 6 characters long.';
        }
        showMsg(errorMessage, 'error');
        return;
      }
      if (data.user) {
        if (!data.session) {
          setEmailConfirmationSent(true);
          try {
            const onboardingDataToCache = {
              userId: data.user.id, userEmail: data.user.email,
              cvData: extractedData, selectedRoles, preferences, cvText,
              cvFileName: selectedFile?.name, cvFileType: selectedFile?.type, cvFileSize: selectedFile?.size,
              cachedAt: new Date().toISOString(),
            };
            localStorage.setItem('pending_onboarding_data', JSON.stringify(onboardingDataToCache));
          } catch (e) {}
          showMsg('Account created! Please check your email to confirm your account.', 'success');
        } else {
          try {
            setIsSavingData(true);
            await saveOnboardingDataToSupabase(data.user);
            showMsg('Account created and data saved! Redirecting...', 'success');
            localStorage.removeItem('pending_onboarding_data');
            setTimeout(() => { router.push('/jobs'); }, 1500);
          } catch (saveError: any) {
            showMsg('Account created, but there was an issue saving your data. Please contact support.', 'error');
          } finally {
            setIsSavingData(false);
          }
        }
      }
    } catch (error: any) {
      showMsg(error.message || 'Failed to create account', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const experienceLevels = ['Entry-Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Executive'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Any'];
  const remotePreferences = ['Remote Only', 'Hybrid', 'On-site Only', 'Any'];
  const sectors = [
    'Information Technology & Software', 'Engineering & Manufacturing', 'Finance & Banking',
    'Healthcare & Medical', 'Education & Training', 'Sales & Marketing',
    'Human Resources & Recruitment', 'Customer Service & Support', 'Media, Advertising & Communications',
    'Design, Arts & Creative', 'Construction & Real Estate', 'Logistics, Transport & Supply Chain',
    'Agriculture & Agribusiness', 'Energy & Utilities (Oil, Gas, Renewable Energy)', 'Legal & Compliance',
    'Government & Public Administration', 'Retail & E-commerce', 'Hospitality & Tourism',
    'Science & Research', 'Security & Defense', 'Telecommunications', 'Nonprofit & NGO',
    'Environment & Sustainability', 'Product Management & Operations', 'Data & Analytics',
  ];

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap'); .ob-page, .ob-page * { font-family: 'DM Sans', sans-serif; } .ob-page h1,.ob-page h2,.ob-page h3,.ob-page .ob-serif { font-family: 'DM Serif Display', serif; }`}</style>
    <div className="ob-page min-h-screen p-4 md:p-8" style={{ backgroundColor: theme.colors.background.muted }}>
      <div className="max-w-6xl mx-auto space-y-6 pb-16">

        {/* ── SECTION 1: CV Upload ── */}
        <Card className="border bg-white" style={{ borderColor: theme.colors.border.DEFAULT, boxShadow: theme.shadows.md }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg" style={{ color: theme.colors.text.primary }}>
              <Upload className="h-5 w-5" style={{ color: theme.colors.primary.DEFAULT }} />
              CV Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CVUploadStep
              onExtracted={setCvText}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              onProfileExtracted={(data) => {
                setExtractedData(data);
                setRolesExpanded(true);
                setPrefsExpanded(true);
              }}
              setShowLoadingOverlay={setShowLoadingOverlay}
              initialProfile={extractedData}
            />

            {extractedData.name && (
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={clearAllData}
                  className="px-4 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Restart
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── SECTION 2: Target Roles ── */}
        <Card className="border bg-white" style={{ borderColor: theme.colors.border.DEFAULT, boxShadow: theme.shadows.md }}>
          <button
            className="w-full text-left"
            onClick={() => setRolesExpanded(v => !v)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full w-10 h-10 flex items-center justify-center" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base" style={{ color: theme.colors.text.primary }}>Target Roles</CardTitle>
                    {selectedRoles.length > 0 && (
                      <p className="text-xs text-green-600 font-medium mt-0.5">{selectedRoles.length} selected</p>
                    )}
                  </div>
                </div>
                {rolesExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </div>
            </CardHeader>
          </button>

          {rolesExpanded && (
            <CardContent className="space-y-6 pt-0">
              {/* Roles from CV */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4" style={{ color: theme.colors.success }} />
                  <h3 className="font-medium text-sm" style={{ color: theme.colors.text.primary }}>From your CV</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {extractedData.roles && extractedData.roles.length > 0 ? (
                    extractedData.roles.map((role) => (
                      <Badge
                        key={role}
                        variant={selectedRoles.includes(role) ? 'default' : 'outline'}
                        className="cursor-pointer px-3 py-2 transition-all"
                        style={selectedRoles.includes(role)
                          ? { backgroundColor: theme.colors.primary.DEFAULT, borderColor: theme.colors.primary.DEFAULT, color: '#fff' }
                          : { backgroundColor: theme.colors.background.muted, borderColor: theme.colors.border.DEFAULT }}
                        onClick={() => handleRoleToggle(role)}
                      >
                        {role}
                        {selectedRoles.includes(role) ? <Check className="h-3 w-3 ml-1" /> : <Plus className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No roles found in CV — upload your CV first</p>
                  )}
                </div>
              </div>

              {/* AI Suggested Roles */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-4 w-4" style={{ color: theme.colors.success }} />
                  <h3 className="font-medium text-sm" style={{ color: theme.colors.text.primary }}>AI Recommended</h3>
                  <div className="flex items-center gap-1 rounded px-2 py-0.5" style={{ backgroundColor: theme.colors.success + '15', border: `1px solid ${theme.colors.success}40` }}>
                    <Star className="h-3 w-3" style={{ color: theme.colors.success }} />
                    <span className="text-xs font-medium" style={{ color: theme.colors.success }}>Smart Match</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {extractedData.cvAiSuggestedRoles && extractedData.cvAiSuggestedRoles.length > 0 ? (
                    extractedData.cvAiSuggestedRoles.map((role) => (
                      <Badge
                        key={role}
                        variant={selectedRoles.includes(role) ? 'default' : 'outline'}
                        className="cursor-pointer px-3 py-2 transition-all"
                        style={selectedRoles.includes(role)
                          ? { backgroundColor: theme.colors.primary.DEFAULT, borderColor: theme.colors.primary.DEFAULT, color: '#fff' }
                          : { backgroundColor: theme.colors.success + '15', borderColor: theme.colors.success + '40' }}
                        onClick={() => handleRoleToggle(role)}
                      >
                        {role}
                        {selectedRoles.includes(role) ? <Check className="h-3 w-3 ml-1" /> : <Plus className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Upload your CV to get AI role suggestions</p>
                  )}
                </div>
              </div>

              {/* Custom Role */}
              <div>
                <h3 className="font-medium text-sm mb-2" style={{ color: theme.colors.text.primary }}>Add Custom Role</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a job role..."
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomRole(); } }}
                    className="flex-1"
                  />
                  <Button
                    onClick={addCustomRole}
                    disabled={!newRole.trim() || selectedRoles.includes(newRole.trim())}
                    className="text-white"
                    style={{ backgroundColor: theme.colors.primary.DEFAULT }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Selected summary */}
              {selectedRoles.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h3 className="font-medium text-slate-900 mb-3">Selected ({selectedRoles.length})</h3>
                  <div className="space-y-2">
                    {selectedRoles.map((role) => (
                      <div key={role} className="flex items-center justify-between rounded px-3 py-2" style={{ backgroundColor: theme.colors.background.muted, border: `1px solid ${theme.colors.border.DEFAULT}` }}>
                        <span className="text-sm font-medium" style={{ color: theme.colors.text.primary }}>{role}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleRoleToggle(role)} className="h-6 w-6 p-0 hover:bg-red-100">
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* ── SECTION 3: Preferences ── */}
        <Card className="border bg-white" style={{ borderColor: theme.colors.border.DEFAULT, boxShadow: theme.shadows.md }}>
          <button
            className="w-full text-left"
            onClick={() => setPrefsExpanded(v => !v)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full w-10 h-10 flex items-center justify-center" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base" style={{ color: theme.colors.text.primary }}>Job Preferences</CardTitle>
                    {preferences.locations.length > 0 && (
                      <p className="text-xs text-green-600 font-medium mt-0.5">{preferences.locations.join(', ')}</p>
                    )}
                  </div>
                </div>
                {prefsExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </div>
            </CardHeader>
          </button>

          {prefsExpanded && (
            <CardContent className="space-y-6 pt-0">
              {/* Preferred Locations */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4" style={{ color: theme.colors.primary.DEFAULT }} />
                  <Label className="text-sm font-semibold" style={{ color: theme.colors.text.primary }}>Preferred Locations</Label>
                </div>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Lagos, Abuja, New York"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLocation(); } }}
                    className="flex-1"
                  />
                  <Button onClick={addLocation} className="text-white" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>Add</Button>
                </div>
                {preferences.locations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {preferences.locations.map((location, index) => (
                      <div key={index} className="flex items-center gap-1 bg-green-50 border border-green-500 rounded-full px-3 py-1">
                        <span className="text-sm font-medium text-green-700">{location}</span>
                        <button onClick={() => removeLocation(location)} className="text-red-600 font-bold hover:text-red-700">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Work Preference */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4" style={{ color: theme.colors.primary.DEFAULT }} />
                  <Label className="text-sm font-semibold" style={{ color: theme.colors.text.primary }}>Work Preference</Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {remotePreferences.map((preference) => (
                    <button
                      key={preference}
                      onClick={() => setPreferences({ ...preferences, remotePreference: preferences.remotePreference === preference ? '' : preference })}
                      className={`px-4 py-2 rounded-md border transition-all ${preferences.remotePreference === preference ? 'text-white' : 'bg-white border-gray-300'}`}
                      style={preferences.remotePreference === preference ? { backgroundColor: theme.colors.primary.DEFAULT, borderColor: theme.colors.primary.DEFAULT } : { color: theme.colors.text.primary }}
                    >
                      {preference}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Banknote className="h-4 w-4" style={{ color: theme.colors.primary.DEFAULT }} />
                  <Label className="text-sm font-semibold" style={{ color: theme.colors.text.primary }}>Minimum Salary</Label>
                </div>
                <Input
                  placeholder="e.g., 800000"
                  value={preferences.salaryMin}
                  onChange={(e) => setPreferences({ ...preferences, salaryMin: e.target.value.replace(/[^0-9]/g, '') })}
                  type="text"
                  inputMode="numeric"
                />
              </div>

              {/* Experience Level */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-4 w-4" style={{ color: theme.colors.primary.DEFAULT }} />
                  <Label className="text-sm font-semibold" style={{ color: theme.colors.text.primary }}>Experience Level</Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {experienceLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setPreferences({ ...preferences, experienceLevel: preferences.experienceLevel === level ? '' : level })}
                      className={`px-4 py-2 rounded-md border transition-all ${preferences.experienceLevel === level ? 'text-white' : 'bg-white border-gray-300'}`}
                      style={preferences.experienceLevel === level ? { backgroundColor: theme.colors.primary.DEFAULT, borderColor: theme.colors.primary.DEFAULT } : { color: theme.colors.text.primary }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Type */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4" style={{ color: theme.colors.primary.DEFAULT }} />
                  <Label className="text-sm font-semibold" style={{ color: theme.colors.text.primary }}>Job Type</Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {jobTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setPreferences({ ...preferences, jobType: preferences.jobType === type ? '' : type })}
                      className={`px-4 py-2 rounded-md border transition-all ${preferences.jobType === type ? 'text-white' : 'bg-white border-gray-300'}`}
                      style={preferences.jobType === type ? { backgroundColor: theme.colors.primary.DEFAULT, borderColor: theme.colors.primary.DEFAULT } : { color: theme.colors.text.primary }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Industry Sector */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4" style={{ color: theme.colors.primary.DEFAULT }} />
                  <Label className="text-sm font-semibold" style={{ color: theme.colors.text.primary }}>Industry Sector</Label>
                </div>
                <Select value={preferences.sector} onValueChange={(value) => setPreferences({ ...preferences, sector: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an industry sector" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {sectors.map((sectorOption) => (
                      <SelectItem key={sectorOption} value={sectorOption}>{sectorOption}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          )}
        </Card>

        {/* ── Talent Pool ── */}
        <Card className="border bg-white" style={{ borderColor: theme.colors.border.DEFAULT, boxShadow: theme.shadows.md }}>
          <CardContent className="pt-5">
            <div className="flex items-start gap-4">
              <div className="mt-0.5">
                <input
                  type="checkbox"
                  id="talent-pool"
                  checked={talentPool === true}
                  onChange={(e) => setTalentPool(e.target.checked ? true : false)}
                  className="h-5 w-5 rounded cursor-pointer" style={{ accentColor: theme.colors.primary.DEFAULT, borderColor: theme.colors.border.DEFAULT }}
                />
              </div>
              <div>
                <label htmlFor="talent-pool" className="font-semibold cursor-pointer" style={{ color: theme.colors.text.primary }}>
                  Join the Talent Pool
                </label>
                <p className="text-sm mt-0.5" style={{ color: theme.colors.text.secondary }}>
                  Join the Talent Pool and let verified recruiters find and contact you directly for job opportunities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── CTA Button ── */}
        <div className="pt-2">
          <Button
            onClick={() => {
              if (!canCompleteOnboarding) {
                setError('Please upload your CV and select at least one role before creating an account.');
                return;
              }
              setError('');
              setShowSignupModal(true);
            }}
            className="w-full text-white py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: theme.colors.primary.DEFAULT }}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Create Account & Start Job Hunting
          </Button>
          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── SIGNUP MODAL ── */}
      <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              Create Your Account
            </DialogTitle>
            <DialogDescription>
              Save your profile and start finding jobs
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Message Display */}
            {message && (
              <div className={`p-3 rounded-lg flex items-center gap-3 text-sm ${messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                {messageType === 'success' ? <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />}
                {message}
              </div>
            )}

            {emailConfirmationSent && (
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                <p className="font-medium mb-1">Check your email</p>
                <p>We&apos;ve sent a confirmation link. Click it to activate your account.</p>
              </div>
            )}

            {/* Google Sign Up */}
            <button
              onClick={handleGoogleSignUp}
              disabled={isLoading || isSavingData || isRedirecting}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div>
              <Label htmlFor="modal-fullname">Full Name</Label>
              <Input
                id="modal-fullname"
                type="text"
                placeholder="Enter your full name"
                value={signUpData.fullName}
                onChange={(e) => setSignUpData(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="modal-email">Email</Label>
              <Input
                id="modal-email"
                type="email"
                placeholder="Enter your email"
                value={signUpData.email}
                onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="modal-password">Password</Label>
              <div className="relative">
                <Input
                  id="modal-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="modal-confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="modal-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleSignUp}
              disabled={isLoading || isSavingData || isRedirecting}
              className="w-full text-white py-3"
              style={{ backgroundColor: theme.colors.primary.DEFAULT }}
            >
              {isLoading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Creating Account...</>
              ) : isSavingData ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Saving Your Data...</>
              ) : isRedirecting ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Redirecting...</>
              ) : (
                'Create Account & Complete Onboarding'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading Overlay (CV processing) */}
      {showLoadingOverlay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Analyzing Your CV</h3>
            <p className="text-gray-600 mb-4">This may take a minute...</p>
            <p className="text-sm text-gray-500">Please wait while our AI processes your information</p>
          </div>
        </div>
      )}

      {/* Signup Loading Overlay */}
      {(isLoading || isSavingData || isRedirecting) && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4 shadow-xl">
            <div className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            <p className="text-slate-700 font-medium">
              {isLoading ? 'Creating Account...' : isSavingData ? 'Saving Your Data...' : 'Redirecting...'}
            </p>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

// ─── CVUploadStep (basics-only parsed display) ───────────────────────────────

function CVUploadStep({ onExtracted, isProcessing, setIsProcessing, onProfileExtracted, setShowLoadingOverlay, initialProfile }: {
  onExtracted: (t: string) => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  onProfileExtracted: (data: any) => void;
  setShowLoadingOverlay: (v: boolean) => void;
  initialProfile?: any;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'manual'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState('');
  const [extractedProfile, setExtractedProfile] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isParsingCV, setIsParsingCV] = useState(false);
  const [manualData, setManualData] = useState({
    fullName: '', email: '', phone: '', location: '', summary: '', workExperience: '', education: '', skills: '',
  });

  React.useEffect(() => {
    if (initialProfile && initialProfile.name && !extractedProfile) {
      setExtractedProfile(initialProfile);
    }
  }, [initialProfile, extractedProfile]);

  const processFile = async (file: File) => {
    const isPDF = file.type === 'application/pdf';
    const isImage = file.type.includes('image');
    const isDocument = file.type.includes('document') || file.name.endsWith('.doc') || file.name.endsWith('.docx');
    if (!isPDF && !isImage && !isDocument) {
      setError('Please upload a PDF, Word document (DOC/DOCX), or image file');
      return;
    }
    setError('');
    setExtractedProfile(null);
    setCvText('');
    setUploadedFile(file);
    setIsProcessing(true);
    setShowLoadingOverlay(true);
    try {
      await extractFromFile(file);
    } catch (error) {
      setUploadedFile(null);
      setCvText('');
      setExtractedProfile(null);
    } finally {
      setIsProcessing(false);
      setShowLoadingOverlay(false);
    }
  };

  const extractFromFile = async (file: File) => {
    setError('');
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/onboarding/ocr', { method: 'POST', body: form });
    if (!res.ok) {
      const errorText = await res.text();
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error === 'EXTRACTION_FAILED') {
          setError('Text extraction failed. Please try again or upload a different file.');
          setIsProcessing(false);
          setShowLoadingOverlay(false);
          return;
        }
      } catch (e) {}
      throw new Error(`OCR failed: ${res.status}`);
    }
    const data = await res.json();
    if (data?.text) {
      setCvText(data.text);
      onExtracted(data.text);
      await parseCVText(data.text);
    } else {
      throw new Error('No text extracted from file');
    }
  };

  const parseCVText = async (text: string) => {
    setIsParsingCV(true);
    try {
      setError('');
      const res = await fetch('/api/onboarding/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Parsing failed: ${res.status}` }));
        throw new Error(errorData.error || `Parsing failed: ${res.status}`);
      }
      const data = await res.json();
      if (!data?.parsed) throw new Error('Invalid response: missing parsed data');

      const cvRoles = data.parsed.workExperience?.map((exp: any) => exp.title) || [];
      const profile = {
        name: data.parsed.fullName || 'Name not found',
        email: data.parsed.email || 'Email not found',
        phone: data.parsed.phone || 'Phone not found',
        location: data.parsed.location || 'Location not found',
        summary: data.parsed.summary || '',
        roles: cvRoles,
        skills: Array.isArray(data.parsed.skills) ? data.parsed.skills : [],
        experience: '',
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
        cvAiSuggestedRoles: Array.isArray(data.parsed.suggestedRoles) ? data.parsed.suggestedRoles : [],
      };
      setExtractedProfile(profile);
      onProfileExtracted(profile);
      try {
        localStorage.setItem('onboarding_cv_data', JSON.stringify(profile));
        localStorage.setItem('onboarding_cv_file', JSON.stringify({ text }));
        localStorage.setItem('extractedProfile', JSON.stringify(profile));
        localStorage.setItem('cvText', text);
      } catch (e) {}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse CV text.';
      setError(errorMessage);
      if (!extractedProfile) setExtractedProfile(null);
      throw error;
    } finally {
      setIsParsingCV(false);
    }
  };

  const handleChoose = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isProcessing) { e.target.value = ''; return; }
    const fileInput = e.target;
    try {
      await processFile(file);
    } finally {
      if (fileInput) fileInput.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;
    const files = e.dataTransfer.files;
    if (files.length > 0) await processFile(files[0]);
  };

  const analyzeManualData = async () => {
    if (!manualData.fullName || !manualData.email) { setError('Please fill in at least your name and email'); return; }
    setIsProcessing(true);
    setShowLoadingOverlay(true);
    setError('');
    try {
      const manualText = `Name: ${manualData.fullName}\nEmail: ${manualData.email}\nPhone: ${manualData.phone}\nLocation: ${manualData.location}\nSummary: ${manualData.summary}\nWork Experience: ${manualData.workExperience}\nEducation: ${manualData.education}\nSkills: ${manualData.skills}`.trim();
      setCvText(manualText);
      await parseCVText(manualText);
    } catch (error) {
      setError('Failed to analyze the profile. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowLoadingOverlay(false);
    }
  };

  return (
    <div className="space-y-6">
      {!extractedProfile && (
        <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as 'upload' | 'manual')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />Upload CV
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <User className="h-4 w-4" />Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {uploadedFile && (
              <div className="rounded-lg p-4" style={{ backgroundColor: theme.colors.background.muted, border: `1px solid ${theme.colors.border.DEFAULT}` }}>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5" style={{ color: theme.colors.primary.DEFAULT }} />
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: theme.colors.text.primary }}>{uploadedFile.name}</p>
                    <p className="text-sm" style={{ color: theme.colors.primary.DEFAULT }}>{isProcessing ? 'Processing...' : 'Ready for analysis'}</p>
                  </div>
                  {!isProcessing && (
                    <Button variant="outline" size="sm" onClick={() => { setUploadedFile(null); setExtractedProfile(null); setCvText(''); setError(''); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div
              className={`text-center transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/jpg,image/png"
                onChange={handleChoose}
                className="hidden"
                id="cv-upload"
                disabled={isProcessing}
              />
              <Upload className="h-12 w-12 mx-auto mb-4 hidden md:block" style={{ color: theme.colors.text.muted }} />
              <p className="text-lg font-medium mb-2 hidden md:block" style={{ color: theme.colors.text.primary }}>Drop your CV here or click to browse</p>
              <p className="text-sm mb-4" style={{ color: theme.colors.text.secondary }}>Supports PDF, DOC, DOCX, JPG, PNG — up to 10MB</p>
              <Button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (fileInputRef.current && !isProcessing) fileInputRef.current.click(); }}
                disabled={isProcessing}
                className="text-white disabled:opacity-50"
                style={{ backgroundColor: theme.colors.primary.DEFAULT }}
              >
                <Upload className="mr-2 h-4 w-4" />Choose File
              </Button>
            </div>

            <div className="border-t pt-4">
              <Label htmlFor="cv-text" className="text-sm font-medium text-slate-700 mb-2 block">Or paste your CV text here:</Label>
              <Textarea
                id="cv-text"
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Paste your CV content here for analysis..."
                rows={6}
                className="w-full"
              />
              {cvText.trim() && !extractedProfile && !isProcessing && (
                <Button onClick={() => parseCVText(cvText)} disabled={isParsingCV} className="mt-2" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
                  {isParsingCV ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Processing...</>
                  ) : (
                    <><Brain className="mr-2 h-4 w-4" />Analyze Text with AI</>
                  )}
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="manual-name">Full Name *</Label>
                <Input id="manual-name" placeholder="Enter your full name" value={manualData.fullName} onChange={(e) => setManualData(prev => ({ ...prev, fullName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual-email">Email *</Label>
                <Input id="manual-email" type="email" placeholder="Enter your email" value={manualData.email} onChange={(e) => setManualData(prev => ({ ...prev, email: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="manual-phone">Phone</Label>
                <Input id="manual-phone" placeholder="Enter your phone number" value={manualData.phone} onChange={(e) => setManualData(prev => ({ ...prev, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual-location">Location</Label>
                <Input id="manual-location" placeholder="Enter your location" value={manualData.location} onChange={(e) => setManualData(prev => ({ ...prev, location: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-summary">Professional Summary</Label>
              <Textarea id="manual-summary" value={manualData.summary} onChange={(e) => setManualData(prev => ({ ...prev, summary: e.target.value }))} placeholder="Brief description of your background..." rows={3} />
            </div>
            <div>
              <Label htmlFor="workExperience">Work Experience</Label>
              <Textarea id="workExperience" value={manualData.workExperience} onChange={(e) => setManualData(prev => ({ ...prev, workExperience: e.target.value }))} placeholder="Job titles, companies, dates..." rows={4} />
            </div>
            <div>
              <Label htmlFor="education">Education</Label>
              <Textarea id="education" value={manualData.education} onChange={(e) => setManualData(prev => ({ ...prev, education: e.target.value }))} placeholder="Degrees, institutions..." rows={3} />
            </div>
            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Textarea id="skills" value={manualData.skills} onChange={(e) => setManualData(prev => ({ ...prev, skills: e.target.value }))} placeholder="JavaScript, React, Node.js..." rows={3} />
            </div>
            <div className="flex justify-center">
              <Button onClick={analyzeManualData} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 text-white px-8" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
                {isProcessing ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Analyzing...</>
                ) : (
                  <><Brain className="mr-2 h-4 w-4" />Analyze</>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">Error</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* ── Basics-only parsed display ── */}
      {extractedProfile && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 text-green-800 font-medium">
            <CheckCircle className="h-5 w-5" />
            CV Analyzed Successfully
          </div>

          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-medium text-slate-500">Name</p>
                <p className="text-slate-800">{extractedProfile.name}</p>
              </div>
              <div>
                <p className="font-medium text-slate-500">Email</p>
                <p className="text-slate-800">{extractedProfile.email}</p>
              </div>
              {extractedProfile.phone && extractedProfile.phone !== 'Phone not found' && (
                <div>
                  <p className="font-medium text-slate-500">Phone</p>
                  <p className="text-slate-800">{extractedProfile.phone}</p>
                </div>
              )}
              {extractedProfile.location && extractedProfile.location !== 'Location not found' && (
                <div>
                  <p className="font-medium text-slate-500">Location</p>
                  <p className="text-slate-800">{extractedProfile.location}</p>
                </div>
              )}
            </div>
          </div>

          {extractedProfile.skills?.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-2 text-sm">Top Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {extractedProfile.skills.slice(0, 10).map((skill: string, idx: number) => (
                  <span key={idx} className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs font-medium">{skill}</span>
                ))}
                {extractedProfile.skills.length > 10 && (
                  <span className="text-xs text-slate-500 py-0.5">+{extractedProfile.skills.length - 10} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}