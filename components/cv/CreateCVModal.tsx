"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, FileText, Check, ArrowRight, X, Loader2, Search } from 'lucide-react';
import { theme } from '@/lib/theme';
import { generateCV } from '@/lib/services/cvGenerationService';
import { generateCoverLetter } from '@/lib/services/coverLetterGenerationService';
import { renderCVTemplate } from '@/lib/services/cvTemplateRenderer';
import { renderCoverLetterTemplate } from '@/lib/services/coverLetterTemplateRenderer';
import { supabase } from '@/lib/supabase';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
}

interface CreateCVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (cvId: string) => void;
}

type Step = 'job-selection' | 'options' | 'generating';

export default function CreateCVModal({ isOpen, onClose, onComplete }: CreateCVModalProps) {
  const [step, setStep] = useState<Step>('job-selection');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  
  // Job selection state
  const [jobSelectionMethod, setJobSelectionMethod] = useState<'select' | 'paste' | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [pastedJobDetails, setPastedJobDetails] = useState('');
  
  // Template selection state - default to template-1
  const [selectedCVTemplate] = useState<string>('template-1');
  const [createCoverLetter, setCreateCoverLetter] = useState(false);
  const [coverLetterFormat, setCoverLetterFormat] = useState<'document' | 'email' | null>(null);

  // Load jobs from localStorage when "Select" is clicked
  // No auto-load on modal open

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      // First try to load from localStorage cache
      const cachedJobs = localStorage.getItem('jobs_cache');
      let jobsData: any[] = [];
      
      if (cachedJobs) {
        try {
          jobsData = JSON.parse(cachedJobs);
        } catch (e) {
          console.error('Error parsing cached jobs:', e);
        }
      }
      
      // If no cached jobs, fetch from Supabase
      if (jobsData.length === 0) {
        const { data, error } = await supabase
          .from('jobs')
          .select('id, title, company, location, status')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (!error && data) {
          jobsData = data;
        }
      }
      
      // Transform to Job format
      const formattedJobs: Job[] = jobsData.map((job: any) => ({
        id: job.id,
        title: job.title || 'Untitled Job',
        company: typeof job.company === 'string' ? job.company : job.company?.name || 'Company',
        location: typeof job.location === 'string' ? job.location : 
          (job.location?.remote ? 'Remote' : 
          [job.location?.city, job.location?.state, job.location?.country].filter(Boolean).join(', ') || 'Not specified'),
      }));
      setJobs(formattedJobs);
      setFilteredJobs(formattedJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Filter jobs based on search query
  useEffect(() => {
    if (!jobSearchQuery.trim()) {
      setFilteredJobs(jobs);
      return;
    }

    const query = jobSearchQuery.toLowerCase();
    const filtered = jobs.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    );
    setFilteredJobs(filtered);
  }, [jobSearchQuery, jobs]);

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setJobSelectionMethod(null);
    setStep('options');
  };

  const handlePasteJob = () => {
    if (!pastedJobDetails.trim()) {
      alert('Please paste job details');
      return;
    }
    const job = {
      id: `pasted-${Date.now()}`,
      title: 'Pasted Job',
      company: 'Company',
      location: 'Not specified',
    };
    setSelectedJob(job);
    setJobSelectionMethod(null);
    setStep('options');
  };

  const handleCoverLetterCheck = (checked: boolean) => {
    setCreateCoverLetter(checked);
    if (checked) {
      setCoverLetterFormat('document');
    }
  };

  const handleGenerate = async () => {

    setStep('generating');
    setLoading(true);

    try {
      // Get current user or use anonymous ID
      let userId = 'anonymous_user';
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
        }
      } catch (e) {
        // Use anonymous user
      }

      // Generate CV
      const jobId = selectedJob?.id && !selectedJob.id.startsWith('pasted-') ? selectedJob.id : undefined;
      const jobPastedText = selectedJob?.id?.startsWith('pasted-') ? pastedJobDetails : undefined;

      const cvStructuredData = await generateCV({
        userId: userId,
        jobId,
        jobPastedText,
        templateId: 'template-1',
      });

      // Render CV with template
      const cvContent = renderCVTemplate('template-1', cvStructuredData);

      // Generate unique ID for CV
      const cvId = `cv-${Date.now()}`;

      // Generate cover letter if requested
      let coverLetterStructuredData = null;
      let coverLetterContent = null;
      if (createCoverLetter && coverLetterFormat) {
        coverLetterStructuredData = await generateCoverLetter({
          userId: userId,
          jobId,
          jobPastedText,
          cvPastedText: JSON.stringify(cvStructuredData), // Pass CV structured data
          templateId: 'template-1',
          format: coverLetterFormat,
        });

        // Render cover letter with template
        coverLetterContent = renderCoverLetterTemplate('template-1', coverLetterStructuredData);
      }

      // Save CV to localStorage
      const cvDocument = {
        id: cvId,
        name: `${selectedJob?.title || 'CV'} - ${selectedJob?.company || 'General'}`,
        type: 'cv',
        templateId: 'template-1',
        jobId: selectedJob?.id || null,
        jobTitle: selectedJob?.title || null,
        companyName: selectedJob?.company || null,
        structuredData: cvStructuredData,
        content: cvContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingDocs = localStorage.getItem('cv_documents');
      const documents = existingDocs ? JSON.parse(existingDocs) : [];
      documents.unshift(cvDocument);
      localStorage.setItem('cv_documents', JSON.stringify(documents));

      // Save cover letter if generated
      if (coverLetterStructuredData && coverLetterContent) {
        const coverLetterId = `cover-letter-${Date.now()}`;
        const coverLetterDocument = {
          id: coverLetterId,
          name: `Cover Letter - ${selectedJob?.title || 'General'} at ${selectedJob?.company || 'Company'}`,
          type: 'cover-letter',
          templateId: 'template-1',
          format: coverLetterFormat,
          jobId: selectedJob?.id || null,
          jobTitle: selectedJob?.title || null,
          companyName: selectedJob?.company || null,
          cvId: cvId,
          structuredData: coverLetterStructuredData,
          content: coverLetterContent,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        documents.unshift(coverLetterDocument);
        localStorage.setItem('cv_documents', JSON.stringify(documents));
      }

      onComplete(cvId);
      handleClose();
    } catch (error: any) {
      console.error('Error generating CV:', error);
      alert(error.message || 'Failed to generate CV. Please try again.');
      setStep('options');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setStep('job-selection');
    setJobSelectionMethod(null);
    setSelectedJob(null);
    setPastedJobDetails('');
    setCreateCoverLetter(false);
    setCoverLetterFormat(null);
    setJobSearchQuery('');
    setFilteredJobs([]);
    setLoading(false);
    onClose();
  };

  const canProceedToGenerate = () => {
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">Create CV</DialogTitle>
        <DialogDescription className="sr-only">Generate a new CV based on a job description</DialogDescription>
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create CV</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-6">
          {/* Step 1: Job Selection */}
          {step === 'job-selection' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">1</div>
                <h3 className="text-lg font-semibold text-gray-900">Select Job</h3>
              </div>

              {!jobSelectionMethod ? (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setJobSelectionMethod('select');
                      loadJobs();
                    }}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors text-left group"
                  >
                    <Briefcase size={24} className="mb-2 text-blue-600" />
                    <h4 className="font-semibold text-gray-900 mb-1">Select from Saved Jobs</h4>
                    <p className="text-sm text-gray-600">Choose from your saved job listings</p>
                  </button>

                  <button
                    onClick={() => setJobSelectionMethod('paste')}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors text-left group"
                  >
                    <FileText size={24} className="mb-2 text-blue-600" />
                    <h4 className="font-semibold text-gray-900 mb-1">Paste Job Details</h4>
                    <p className="text-sm text-gray-600">Paste the job description directly</p>
                  </button>
                </div>
              ) : jobSelectionMethod === 'select' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Select a Job</h4>
                    <button
                      onClick={() => setJobSelectionMethod(null)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Back
                    </button>
                  </div>
                  {loadingJobs ? (
                    <div className="text-center py-8">
                      <Loader2 className="animate-spin mx-auto mb-2 text-blue-600" size={24} />
                      <p className="text-sm text-gray-600">Loading jobs...</p>
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">No jobs found. Please paste job details instead.</p>
                      <Button
                        onClick={() => setJobSelectionMethod('paste')}
                        variant="outline"
                      >
                        Paste Job Details
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Search Box */}
                      <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search jobs by title, company, or location..."
                          value={jobSearchQuery}
                          onChange={(e) => setJobSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      {/* Jobs List */}
                      {filteredJobs.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-sm text-gray-500">No jobs match your search.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {filteredJobs.map((job) => (
                            <button
                              key={job.id}
                              onClick={() => handleJobSelect(job)}
                              className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                            >
                              <h5 className="font-semibold text-gray-900 mb-1">{job.title}</h5>
                              <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Paste Job Details</h4>
                    <button
                      onClick={() => setJobSelectionMethod(null)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Back
                    </button>
                  </div>
                  <Textarea
                    value={pastedJobDetails}
                    onChange={(e) => setPastedJobDetails(e.target.value)}
                    placeholder="Paste the entire job posting or description here..."
                    className="min-h-[200px]"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={handlePasteJob}
                      className="flex-1"
                      style={{ backgroundColor: theme.colors.primary.DEFAULT }}
                    >
                      Continue
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setJobSelectionMethod(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Options */}
          {step === 'options' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">2</div>
                <h3 className="text-lg font-semibold text-gray-900">Additional Options</h3>
                <button
                  onClick={() => setStep('job-selection')}
                  className="ml-auto text-sm text-blue-600 hover:text-blue-700"
                >
                  Back
                </button>
              </div>

              {/* Cover Letter Checkbox */}
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={createCoverLetter}
                    onChange={(e) => handleCoverLetterCheck(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-gray-900">Also create cover letter for this job</span>
                </label>

                {createCoverLetter && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">A cover letter will be created for this job.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={!canProceedToGenerate()}
                  className="flex-1"
                  style={{ backgroundColor: theme.colors.primary.DEFAULT }}
                >
                  Generate CV{createCoverLetter ? ' & Cover Letter' : ''}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Generating */}
          {step === 'generating' && (
            <div className="text-center py-12">
              <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
              <h3 className="text-xl font-bold mb-2 text-gray-900">Generating Your CV{createCoverLetter ? ' & Cover Letter' : ''}</h3>
              <p className="text-gray-600">This may take a few moments...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}