"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, FileText, Clipboard, Plus, Building2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { theme } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const SECTORS = [
  'Information Technology & Software',
  'Engineering & Manufacturing',
  'Finance & Banking',
  'Healthcare & Medical',
  'Education & Training',
  'Sales & Marketing',
  'Human Resources & Recruitment',
  'Customer Service & Support',
  'Media, Advertising & Communications',
  'Design, Arts & Creative',
  'Construction & Real Estate',
  'Logistics, Transport & Supply Chain',
  'Agriculture & Agribusiness',
  'Energy & Utilities (Oil, Gas, Renewable Energy)',
  'Legal & Compliance',
  'Government & Public Administration',
  'Retail & E-commerce',
  'Hospitality & Tourism',
  'Science & Research',
  'Security & Defense',
  'Telecommunications',
  'Nonprofit & NGO',
  'Environment & Sustainability',
  'Product Management & Operations',
  'Data & Analytics'
];

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
const EXPERIENCE_LEVELS = ['Entry Level', 'Junior', 'Mid-level', 'Senior', 'Lead', 'Executive'];

export default function SubmitJobPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [postAnonymously, setPostAnonymously] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [companyFormData, setCompanyFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    industry: '',
    company_size: '',
    headquarters_location: '',
    website_url: '',
    email: '',
    phone: '',
    linkedin_url: '',
    founded_year: '',
    twitter_url: '',
    facebook_url: '',
    instagram_url: '',
  });
  const [companyError, setCompanyError] = useState('');
  const [companyShowMore, setCompanyShowMore] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'paste'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pastedContent, setPastedContent] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [jobData, setJobData] = useState({
    title: '',
    sector: '',
    companyName: '',
    companyWebsite: '',
    city: '',
    state: '',
    remote: false,
    employmentType: '',
    skills: '',
    experienceLevel: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'NGN',
    period: 'annually',
    description: '',
    responsibilities: '',
    qualifications: '',
    benefits: '',
    applicationUrl: '',
    applicationEmail: '',
    applicationPhone: '',
    deadline: ''
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/recruiter?redirect=/submit');
        return;
      }
      setUser(user);
      
      const { data: userCompanies } = await supabase
        .from('companies')
        .select('id, name, slug, industry')
        .eq('user_id', user.id)
        .order('name');
      
      setIsLoadingCompanies(false);
      
      if (userCompanies && userCompanies.length > 0) {
        setCompanies(userCompanies);
        setSelectedCompanyId(userCompanies[0].id);
      } else {
        setShowAddCompany(true);
      }
    };
    checkUser();
  }, []);

  const generateSlug = (name: string): string => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsAddingCompany(true);
    setCompanyError('');

    try {
      const slug = generateSlug(companyFormData.name);
      
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('slug')
        .eq('slug', slug)
        .single();

      if (existingCompany) {
        setCompanyError('A company with this name already exists.');
        setIsAddingCompany(false);
        return;
      }

      const { data, error } = await supabase
        .from('companies')
        .insert([{
          name: companyFormData.name,
          slug,
          tagline: companyFormData.tagline || null,
          description: companyFormData.description,
          industry: companyFormData.industry || null,
          company_size: companyFormData.company_size || null,
          founded_year: companyFormData.founded_year ? parseInt(companyFormData.founded_year) : null,
          headquarters_location: companyFormData.headquarters_location || null,
          website_url: companyFormData.website_url || null,
          email: companyFormData.email || null,
          phone: companyFormData.phone || null,
          linkedin_url: companyFormData.linkedin_url || null,
          twitter_url: companyFormData.twitter_url || null,
          facebook_url: companyFormData.facebook_url || null,
          instagram_url: companyFormData.instagram_url || null,
          user_id: user.id,
          is_published: false,
          is_verified: false,
          meta_title: `${companyFormData.name} Careers & Jobs in Nigeria | JobMeter`,
          meta_description: companyFormData.tagline || `Join ${companyFormData.name}. Explore career opportunities and company culture.`,
          h1_title: `Careers at ${companyFormData.name}`,
        }])
        .select('id, name, slug, industry')
        .single();

      if (error) throw error;

      if (data) {
        setCompanies([...companies, data]);
        setSelectedCompanyId(data.id);
        setShowAddCompany(false);
        setCompanyFormData({
          name: '',
          tagline: '',
          description: '',
          industry: '',
          company_size: '',
          headquarters_location: '',
          website_url: '',
          email: '',
          phone: '',
          linkedin_url: '',
          founded_year: '',
          twitter_url: '',
          facebook_url: '',
          instagram_url: '',
        });
      }
    } catch (err: any) {
      console.error('Error adding company:', err);
      setCompanyError(err.message || 'Failed to add company');
    } finally {
      setIsAddingCompany(false);
    }
  };

  // Generate hash for duplicate checking
  const generateHash = (input: string): string => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 7);
  };

  // Check for duplicates
  const checkForDuplicates = async (title: string, companyName: string, city: string, state: string): Promise<boolean> => {
    try {
      const duplicateCheck = {
        hash: generateHash(JSON.stringify({
          title: title,
          company: companyName,
          location: `${city}_${state}`,
        })),
        fingerprint: `${title}_${companyName}_${city}`,
      };

      const [submittedJobs, existingJobs] = await Promise.all([
        supabase
          .from('user_submitted_jobs')
          .select('id, title, company, duplicate_check')
          .not('duplicate_check', 'is', null),
        supabase
          .from('jobs')
          .select('id, title, company, duplicate_check')
          .not('duplicate_check', 'is', null)
      ]);

      const isSubmittedDuplicate = submittedJobs.data?.some(job =>
        job.duplicate_check?.hash === duplicateCheck.hash
      );

      const isExistingDuplicate = existingJobs.data?.some(job =>
        job.duplicate_check?.hash === duplicateCheck.hash
      );

      return isSubmittedDuplicate || isExistingDuplicate || false;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false;
    }
  };

  const handleFormSubmit = async () => {
    // Validation
    if (!jobData.title.trim() || !jobData.sector.trim() ||
        !jobData.description.trim() ||
        !jobData.city.trim() || !jobData.state.trim()) {
      alert('Please fill in all required fields (Title, Sector, Description, and Location).');
      return;
    }

    if (!jobData.applicationUrl.trim() && !jobData.applicationEmail.trim() && !jobData.applicationPhone.trim()) {
      alert('Please provide at least one application method (Email, URL, or Phone).');
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Get company details for the selected company
      const selectedCompany = companies.find(c => c.id === selectedCompanyId);
      const companyName = selectedCompany?.name || '';

      // Check for duplicates
      const isDuplicate = await checkForDuplicates(
        jobData.title.trim(),
        companyName,
        jobData.city.trim(),
        jobData.state.trim()
      );

      if (isDuplicate) {
        alert(`A job with the title "${jobData.title}" already exists in our system.`);
        setIsLoading(false);
        return;
      }
      
      // Create formatted text for AI processing
      const formattedJobText = `Job Title: ${jobData.title.trim()}
Company: ${companyName}
Company Website: ${selectedCompany?.website_url || 'Not specified'}
Location: ${jobData.city.trim()}, ${jobData.state.trim()}
Remote: ${jobData.remote ? 'Yes' : 'No'}
Employment Type: ${jobData.employmentType || 'Not specified'}
Experience Level: ${jobData.experienceLevel || 'Not specified'}
Sector: ${jobData.sector}
Skills Required: ${jobData.skills.trim()}
Salary Range: ${jobData.salaryMin && jobData.salaryMax ? `${jobData.currency} ${jobData.salaryMin} - ${jobData.salaryMax} ${jobData.period}` : 'Not specified'}
Description: ${jobData.description.trim()}
Responsibilities: ${jobData.responsibilities.trim() || 'Not specified'}
Qualifications: ${jobData.qualifications.trim() || 'Not specified'}
Benefits: ${jobData.benefits.trim() || 'Not specified'}
Application Email: ${jobData.applicationEmail.trim() || 'Not specified'}
Application URL: ${jobData.applicationUrl.trim() || 'Not specified'}
Application Phone: ${jobData.applicationPhone.trim() || 'Not specified'}
Deadline: ${jobData.deadline || 'Not specified'}
Posted Date: ${new Date().toISOString().split('T')[0]}`;

      // Call edge function instead of direct insert (bypasses RLS)
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          rawContent: formattedJobText,
          submissionMethod: 'form',
          submissionNotes: submissionNotes.trim() || undefined,
          userId: user?.id,
          companyId: postAnonymously ? null : selectedCompanyId,
          companyName: postAnonymously ? 'Anonymous' : companyName,
          companyWebsite: postAnonymously ? null : (selectedCompany?.website_url || null),
          postAnonymously: postAnonymously,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit job');
      }

      setShowSuccessModal(true);

    } catch (error: any) {
      console.error('Job submission error:', error);
      alert(error.message || 'Failed to submit job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteSubmit = async () => {
    if (!pastedContent.trim()) {
      alert('Please paste a job description.');
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Call edge function instead of direct insert (bypasses RLS)
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          rawContent: pastedContent.trim(),
          submissionMethod: 'paste',
          submissionNotes: submissionNotes.trim() || undefined,
          userId: user?.id,
          companyId: postAnonymously ? null : selectedCompanyId,
          postAnonymously: postAnonymously,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit job');
      }

      setShowSuccessModal(true);

    } catch (error: any) {
      console.error('Job submission error:', error);
      alert(error.message || 'Failed to submit job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (activeTab === 'form') {
      await handleFormSubmit();
    } else {
      await handlePasteSubmit();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.muted }}>
      {/* Header */}
      <div
        className="pt-12 pb-8 px-6"
        style={{
          backgroundColor: theme.colors.primary.DEFAULT,
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Submit a Job</h1>
            <p className="text-white/80 mt-1">
              Post a job opportunity to help others find their dream role
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 bg-white/20 rounded-lg p-1 mt-4">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'form'
                ? 'bg-white text-gray-900'
                : 'text-white/80'
            }`}
          >
            <FileText size={20} />
            <span>Fill Form</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'paste'
                ? 'bg-white text-gray-900'
                : 'text-white/80'
            }`}
          >
            <Clipboard size={20} />
            <span>Paste Job</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 pb-24">
        {activeTab === 'form' ? (
          <div className="space-y-6">
            {/* Job Details */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Job Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">Job Title *</label>
                  <Input
                    placeholder="e.g., Senior React Developer"
                    value={jobData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobData({...jobData, title: e.target.value})}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">Sector *</label>
                  <select
                    value={jobData.sector}
                    onChange={(e) => setJobData({...jobData, sector: e.target.value})}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    style={{
                      borderColor: theme.colors.border.DEFAULT,
                      color: theme.colors.text.primary,
                    }}
                  >
                    <option value="">Select a sector</option>
                    {SECTORS.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">Employment Type</label>
                  <div className="flex flex-wrap gap-2">
                    {EMPLOYMENT_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => setJobData({...jobData, employmentType: jobData.employmentType === type ? '' : type})}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          jobData.employmentType === type
                            ? 'text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        style={jobData.employmentType === type ? { backgroundColor: theme.colors.primary.DEFAULT } : {}}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">Experience Level</label>
                  <div className="flex flex-wrap gap-2">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <button
                        key={level}
                        onClick={() => setJobData({...jobData, experienceLevel: jobData.experienceLevel === level ? '' : level})}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          jobData.experienceLevel === level
                            ? 'text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        style={jobData.experienceLevel === level ? { backgroundColor: theme.colors.primary.DEFAULT } : {}}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Hidden - Company info now comes from selected company */}
            <input type="hidden" value={jobData.companyName} onChange={() => {}} />
            <input type="hidden" value={jobData.companyWebsite} onChange={() => {}} />

            {/* Location */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Location *</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">City *</label>
                    <Input
                      placeholder="e.g., Lagos"
                      value={jobData.city}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobData({...jobData, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">State/Country *</label>
                    <Input
                      placeholder="e.g., Lagos State, Nigeria"
                      value={jobData.state}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobData({...jobData, state: e.target.value})}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={jobData.remote}
                    onChange={(e) => setJobData({...jobData, remote: e.target.checked})}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: theme.colors.primary.DEFAULT }}
                  />
                  <span className="text-sm text-gray-900">Remote work available</span>
                </label>
              </div>
            </section>

            {/* Compensation & Requirements */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Compensation & Requirements</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">Required Skills</label>
                  <Input
                    placeholder="e.g., React, JavaScript, TypeScript, Node.js"
                    value={jobData.skills}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobData({...jobData, skills: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">Min Salary</label>
                    <Input
                      placeholder="500000"
                      type="number"
                      value={jobData.salaryMin}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobData({...jobData, salaryMin: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">Max Salary</label>
                    <Input
                      placeholder="800000"
                      type="number"
                      value={jobData.salaryMax}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobData({...jobData, salaryMax: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Job Description */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Job Description</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">Description *</label>
                  <Textarea
                    placeholder="Describe the role, company culture, and what makes this opportunity special..."
                    value={jobData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJobData({...jobData, description: e.target.value})}
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">Responsibilities</label>
                  <Input
                    placeholder="e.g., Develop features, Code reviews, Team collaboration"
                    value={jobData.responsibilities}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobData({...jobData, responsibilities: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">Qualifications</label>
                  <Input
                    placeholder="e.g., 3+ years experience, Bachelor's degree, Portfolio required"
                    value={jobData.qualifications}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobData({...jobData, qualifications: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">Benefits</label>
                  <Input
                    placeholder="e.g., Health insurance, Pension, Flexible hours, Remote work"
                    value={jobData.benefits}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobData({...jobData, benefits: e.target.value})}
                  />
                </div>
              </div>
            </section>

            {/* Application Details */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-2 text-gray-900">Application Details *</h2>
              <p className="text-sm text-gray-600 mb-4">Provide at least one application method</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">Email</label>
                    <Input
                      placeholder="jobs@company.com"
                      type="email"
                      value={jobData.applicationEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobData({...jobData, applicationEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">URL</label>
                    <Input
                      placeholder="https://company.com/apply"
                      type="url"
                      value={jobData.applicationUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobData({...jobData, applicationUrl: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">Phone</label>
                    <Input
                      placeholder="+234 801 234 5678"
                      type="tel"
                      value={jobData.applicationPhone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobData({...jobData, applicationPhone: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">Application Deadline</label>
                  <Input
                    placeholder="YYYY-MM-DD (optional)"
                    value={jobData.deadline}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobData({...jobData, deadline: e.target.value})}
                  />
                </div>
              </div>
            </section>

            {/* Additional Notes */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Additional Notes</h2>
              <Textarea
                placeholder="Any additional information about this job posting..."
                value={submissionNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSubmissionNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-2 text-gray-900">Paste Job Description</h2>
              <p className="text-sm text-gray-600 mb-4">
                Paste the complete job description from any job board or company website.
                JobMeter will automatically extract and structure the information.
              </p>
              
              <Textarea
                placeholder="Paste the complete job description here..."
                value={pastedContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPastedContent(e.target.value)}
                className="min-h-[200px]"
              />
            </section>

            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Additional Notes</h2>
              <Textarea
                placeholder="Any additional information about this job posting..."
                value={submissionNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSubmissionNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </section>
          </div>
        )}
      </div>

      {/* Company Section - Bottom */}
      <div className="px-4 pb-24">
        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Company</h2>
          
          {isLoadingCompanies ? (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              Loading companies...
            </div>
            ) : !showAddCompany && companies.length > 0 ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">Select Company</label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => {
                      setSelectedCompanyId(e.target.value);
                      setPostAnonymously(false);
                    }}
                    className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowAddCompany(true)}
                  className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700"
                >
                  <Plus size={18} />
                  Add Company
                </button>
              </div>
              
              {/* Anonymous Posting Option */}
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={postAnonymously}
                  onChange={(e) => {
                    setPostAnonymously(e.target.checked);
                    if (e.target.checked) {
                      setSelectedCompanyId('');
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <span className="font-medium text-gray-900">Post Anonymously</span>
                  <p className="text-xs text-gray-500">Your company name will not be shown to job seekers</p>
                </div>
              </label>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Add New Company</h3>
                {companies.length > 0 && (
                  <button
                    onClick={() => setShowAddCompany(false)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Select existing company
                  </button>
                )}
              </div>
              
              {companyError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-600 mt-0.5" />
                  <p className="text-sm text-red-800">{companyError}</p>
                </div>
              )}

              <form onSubmit={handleAddCompany} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Company Name *</label>
                    <Input
                      placeholder="e.g., Acme Corporation"
                      value={companyFormData.name}
                      onChange={(e) => setCompanyFormData({...companyFormData, name: e.target.value})}
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Industry</label>
                    <select
                      value={companyFormData.industry}
                      onChange={(e) => setCompanyFormData({...companyFormData, industry: e.target.value})}
                      className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="">Select</option>
                      <option value="Technology">Technology</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Finance & Banking">Finance & Banking</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Description *</label>
                  <Textarea
                    placeholder="Tell us about your company..."
                    value={companyFormData.description}
                    onChange={(e) => setCompanyFormData({...companyFormData, description: e.target.value})}
                    required
                    className="w-full"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Company Size</label>
                    <select
                      value={companyFormData.company_size}
                      onChange={(e) => setCompanyFormData({...companyFormData, company_size: e.target.value})}
                      className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="">Select</option>
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-200">51-200</option>
                      <option value="201-500">201-500</option>
                      <option value="500+">500+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Website</label>
                    <Input
                      placeholder="https://example.com"
                      value={companyFormData.website_url}
                      onChange={(e) => setCompanyFormData({...companyFormData, website_url: e.target.value})}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Company Email</label>
                    <Input
                      placeholder="hr@company.com"
                      value={companyFormData.email}
                      onChange={(e) => setCompanyFormData({...companyFormData, email: e.target.value})}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Phone</label>
                    <Input
                      placeholder="+234..."
                      value={companyFormData.phone}
                      onChange={(e) => setCompanyFormData({...companyFormData, phone: e.target.value})}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Show More Toggle */}
                <button
                  type="button"
                  onClick={() => setCompanyShowMore(!companyShowMore)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {companyShowMore ? 'Show Less' : 'Show More'}
                </button>

                {companyShowMore && (
                  <div className="space-y-4 pt-2 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Founded Year</label>
                        <Input
                          type="number"
                          placeholder="e.g., 2010"
                          value={companyFormData.founded_year}
                          onChange={(e) => setCompanyFormData({...companyFormData, founded_year: e.target.value})}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Headquarters</label>
                        <Input
                          placeholder="e.g., Lagos, Nigeria"
                          value={companyFormData.headquarters_location}
                          onChange={(e) => setCompanyFormData({...companyFormData, headquarters_location: e.target.value})}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">LinkedIn URL</label>
                        <Input
                          placeholder="https://linkedin.com/company/..."
                          value={companyFormData.linkedin_url}
                          onChange={(e) => setCompanyFormData({...companyFormData, linkedin_url: e.target.value})}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Twitter</label>
                        <Input
                          placeholder="https://twitter.com/..."
                          value={companyFormData.twitter_url}
                          onChange={(e) => setCompanyFormData({...companyFormData, twitter_url: e.target.value})}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Facebook</label>
                        <Input
                          placeholder="https://facebook.com/..."
                          value={companyFormData.facebook_url}
                          onChange={(e) => setCompanyFormData({...companyFormData, facebook_url: e.target.value})}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Instagram</label>
                        <Input
                          placeholder="https://instagram.com/..."
                          value={companyFormData.instagram_url}
                          onChange={(e) => setCompanyFormData({...companyFormData, instagram_url: e.target.value})}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAddingCompany}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isAddingCompany ? 'Adding Company...' : 'Add Company'}
                </button>
              </form>
            </div>
          )}
        </section>
      </div>

      {/* Footer Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3 border-t bg-white safe-area-bottom">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-3 text-lg font-semibold"
          style={{
            backgroundColor: isLoading ? theme.colors.text.secondary : theme.colors.primary.DEFAULT,
            color: theme.colors.primary.foreground,
          }}
        >
          {isLoading ? (
            <span>Submitting...</span>
          ) : (
            <>
              <Plus size={20} className="mr-2" />
              Submit Job
            </>
          )}
        </Button>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent style={{ backgroundColor: theme.colors.card.DEFAULT, borderColor: theme.colors.border.DEFAULT }}>
          <DialogHeader>
            <div className="text-center mb-4">
              <div className="text-5xl mb-4">✅</div>
              <DialogTitle className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
                Job Submitted
              </DialogTitle>
              <DialogDescription className="mt-2" style={{ color: theme.colors.text.secondary }}>
                Your job posting has been submitted for approval.
              </DialogDescription>
            </div>
          </DialogHeader>
          <Button
            onClick={() => {
              setShowSuccessModal(false);
              router.push('/jobs');
            }}
            className="w-full mt-4"
            style={{
              backgroundColor: theme.colors.primary.DEFAULT,
              color: theme.colors.primary.foreground,
            }}
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

