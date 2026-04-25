"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Briefcase, FileText, Wand2, Check } from 'lucide-react';
import { theme } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CV_TEMPLATES } from '@/lib/types/cv';
import { COVER_LETTER_TEMPLATES } from '@/lib/types/coverLetter';
import { generateCV } from '@/lib/services/cvGenerationService';
import { generateCoverLetter } from '@/lib/services/coverLetterGenerationService';
import { renderCVTemplate } from '@/lib/services/cvTemplateRenderer';
import { renderCoverLetterTemplate } from '@/lib/services/coverLetterTemplateRenderer';

type Step = 'job-selection' | 'template-selection' | 'generation' | 'review';

export default function CVCreatePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [step, setStep] = useState<Step>('job-selection');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Job selection state
  const [jobSelectionMethod, setJobSelectionMethod] = useState<'select' | 'paste' | null>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [pastedJobDetails, setPastedJobDetails] = useState('');

  // Template selection state
  const [selectedCVTemplate, setSelectedCVTemplate] = useState<string | null>(null);
  const [createCoverLetter, setCreateCoverLetter] = useState(false);
  const [coverLetterType, setCoverLetterType] = useState<'document' | 'email' | null>(null);
  const [selectedCoverLetterTemplate, setSelectedCoverLetterTemplate] = useState<string | null>(null);

  // Generated documents
  const [generatedCVData, setGeneratedCVData] = useState<any>(null);
  const [generatedCoverLetterData, setGeneratedCoverLetterData] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
    } else {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('onboarding_data')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user data:', error);
      }

      if (data) {
        setUserData(data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobSelect = (job: any) => {
    setSelectedJob(job);
    setStep('template-selection');
  };

  const handlePasteJob = () => {
    if (!pastedJobDetails.trim()) {
      alert('Please paste job details');
      return;
    }
    // Create a job object from pasted text
    const job = {
      id: 'pasted-' + Date.now(),
      title: 'Pasted Job',
      company: 'Company',
      description: pastedJobDetails,
    };
    setSelectedJob(job);
    setStep('template-selection');
  };

  const handleGenerate = async () => {
    if (!selectedCVTemplate) {
      alert('Please select a CV template');
      return;
    }

    if (createCoverLetter && (!coverLetterType || !selectedCoverLetterTemplate)) {
      alert('Please complete cover letter options');
      return;
    }

    if (!userData) {
      alert('User data not found. Please complete your profile.');
      return;
    }

    try {
      setGenerating(true);
      setStep('generation');

      const jobDescription = selectedJob?.description || pastedJobDetails;
      const isPastedJob = selectedJob?.id?.startsWith('pasted-') || !!pastedJobDetails;
      const realJobId = selectedJob?.id && !isPastedJob ? selectedJob.id : undefined;
      const jobPastedTextForCV = isPastedJob ? jobDescription : undefined;

      // Generate CV
      const cvData = await generateCV({
        userId: user.id,
        jobId: realJobId,
        jobPastedText: jobPastedTextForCV,
        templateId: selectedCVTemplate ?? undefined,
      });

      setGeneratedCVData(cvData);

      // Generate cover letter if requested
      if (createCoverLetter) {
        const coverLetterData = await generateCoverLetter({
          userId: user.id,
          jobId: realJobId,
          jobPastedText: jobPastedTextForCV,
          cvPastedText: JSON.stringify(cvData),
          templateId: selectedCoverLetterTemplate ?? undefined,
          format: coverLetterType ?? 'document',
        });
        setGeneratedCoverLetterData(coverLetterData);
      }

      setStep('review');
    } catch (error: any) {
      console.error('Generation error:', error);
      alert(error.message || 'Failed to generate documents. Please try again.');
      setStep('template-selection');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedCVData) return;

    try {
      // Render CV HTML
      const cvHTML = renderCVTemplate(selectedCVTemplate!, generatedCVData);

      // Save CV
      const { data: cvDoc, error: cvError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          type: 'cv',
          name: `${selectedJob?.title || 'CV'} - ${selectedJob?.company || 'General'}`,
          template_id: selectedCVTemplate!,
          structured_data: generatedCVData,
          content: cvHTML,
        })
        .select()
        .single();

      if (cvError) throw cvError;

      // Save cover letter if generated
      if (createCoverLetter && generatedCoverLetterData) {
        const clHTML = renderCoverLetterTemplate(selectedCoverLetterTemplate!, generatedCoverLetterData);
        
        await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            type: 'cover-letter',
            name: `Cover Letter - ${selectedJob?.title || 'General'}`,
            template_id: selectedCoverLetterTemplate!,
            structured_data: generatedCoverLetterData,
            content: clHTML,
            cv_id: cvDoc.id,
            job_id: selectedJob?.id || null,
          });
      }

      alert('Documents saved successfully!');
      router.push('/cv');
    } catch (error: any) {
      console.error('Save error:', error);
      alert('Failed to save documents. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background.muted }}>
        <p style={{ color: theme.colors.text.secondary }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.muted }}>
      {/* Header */}
      <div
        className="pt-12 pb-6 px-6 sticky top-0 z-10"
        style={{
          backgroundColor: theme.colors.primary.DEFAULT,
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/20 transition-colors bg-white/20"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white flex-1">Create CV</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 pb-24">
        {/* Step 1: Job Selection */}
        {step === 'job-selection' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Select Job</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => setJobSelectionMethod('select')}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors text-left"
              >
                <Briefcase size={24} className="mb-2" style={{ color: theme.colors.primary.DEFAULT }} />
                <h3 className="font-semibold mb-1">Select from Saved Jobs</h3>
                <p className="text-sm text-gray-600">Choose from your saved job listings</p>
              </button>

              <button
                onClick={() => setJobSelectionMethod('paste')}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors text-left"
              >
                <FileText size={24} className="mb-2" style={{ color: theme.colors.primary.DEFAULT }} />
                <h3 className="font-semibold mb-1">Paste Job Details</h3>
                <p className="text-sm text-gray-600">Paste the job description directly</p>
              </button>
            </div>

            {jobSelectionMethod === 'paste' && (
              <div className="mt-6">
                <label className="block text-sm font-semibold mb-2">Job Details</label>
                <Textarea
                  value={pastedJobDetails}
                  onChange={(e) => setPastedJobDetails(e.target.value)}
                  placeholder="Paste the entire job posting or description here..."
                  className="min-h-[200px]"
                />
                <div className="flex gap-3 mt-4">
                  <Button onClick={handlePasteJob} className="flex-1">
                    Use Job
                  </Button>
                  <Button variant="outline" onClick={() => setJobSelectionMethod(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Template Selection */}
        {step === 'template-selection' && (
          <div className="space-y-6">
            {/* CV Template Selection */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Choose CV Template</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {CV_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedCVTemplate(template.id)}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      selectedCVTemplate === template.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      borderColor: selectedCVTemplate === template.id ? theme.colors.primary.DEFAULT : undefined,
                    }}
                  >
                    <FileText size={32} className="mx-auto mb-2" />
                    <p className="text-xs font-medium text-center">{template.name}</p>
                    {selectedCVTemplate === template.id && (
                      <Check size={16} className="mx-auto mt-2" style={{ color: theme.colors.primary.DEFAULT }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Cover Letter Checkbox */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createCoverLetter}
                  onChange={(e) => setCreateCoverLetter(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Also create cover letter for this job</span>
              </label>

              {createCoverLetter && (
                <div className="mt-6 space-y-4">
                  {/* Cover Letter Type */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Cover Letter Type</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setCoverLetterType('document')}
                        className={`flex-1 p-3 border-2 rounded-lg ${
                          coverLetterType === 'document'
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-200'
                        }`}
                      >
                        Document
                      </button>
                      <button
                        onClick={() => setCoverLetterType('email')}
                        className={`flex-1 p-3 border-2 rounded-lg ${
                          coverLetterType === 'email'
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-200'
                        }`}
                      >
                        Email
                      </button>
                    </div>
                  </div>

                  {/* Cover Letter Template */}
                  {coverLetterType && (
                    <div>
                      <label className="block text-sm font-semibold mb-2">Cover Letter Template</label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {COVER_LETTER_TEMPLATES.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => setSelectedCoverLetterTemplate(template.id)}
                            className={`p-4 border-2 rounded-lg transition-all ${
                              selectedCoverLetterTemplate === template.id
                                ? 'border-primary bg-primary/10'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <FileText size={32} className="mx-auto mb-2" />
                            <p className="text-xs font-medium text-center">{template.name}</p>
                            {selectedCoverLetterTemplate === template.id && (
                              <Check size={16} className="mx-auto mt-2" style={{ color: theme.colors.primary.DEFAULT }} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!selectedCVTemplate || (createCoverLetter && (!coverLetterType || !selectedCoverLetterTemplate))}
              className="w-full"
              style={{ backgroundColor: theme.colors.primary.DEFAULT }}
            >
              Generate CV{createCoverLetter ? ' & Cover Letter' : ''}
            </Button>
          </div>
        )}

        {/* Step 3: Generation */}
        {step === 'generation' && (
          <div className="bg-white rounded-xl p-12 shadow-sm text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-xl font-bold mb-2">Generating Your CV{createCoverLetter ? ' & Cover Letter' : ''}</h3>
            <p className="text-gray-600">This may take a few moments...</p>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 'review' && generatedCVData && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">CV Generated Successfully!</h2>
              <p className="text-gray-600 mb-6">Your CV has been generated. You can now save it or continue editing.</p>
              <div className="flex gap-3">
                <Button onClick={handleSave} className="flex-1" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
                  Save & Continue
                </Button>
                <Button variant="outline" onClick={() => router.push('/cv')}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


