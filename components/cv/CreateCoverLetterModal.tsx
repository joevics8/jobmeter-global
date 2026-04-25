"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, FileText, Check, X, Loader2, Search } from 'lucide-react';
import { theme } from '@/lib/theme';
import { generateCoverLetter } from '@/lib/services/coverLetterGenerationService';
import { renderCoverLetterTemplate } from '@/lib/services/coverLetterTemplateRenderer';
import { supabase } from '@/lib/supabase';
import { COVER_LETTER_TEMPLATES } from '@/lib/types/coverLetter';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
}

interface CVDocument {
  id: string;
  name: string;
  type: 'cv' | 'cover-letter';
  templateId: string;
  structuredData: any;
  content: string;
  createdAt: string;
}

interface CreateCoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (coverLetterId: string) => void;
}

type Step = 'job-selection' | 'cv-selection' | 'generating';

export default function CreateCoverLetterModal({ isOpen, onClose, onComplete }: CreateCoverLetterModalProps) {
  const [step, setStep] = useState<Step>('job-selection');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [cvDocuments, setCVDocuments] = useState<CVDocument[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  
  // Job selection state
  const [jobSelectionMethod, setJobSelectionMethod] = useState<'select' | 'paste' | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [pastedJobDetails, setPastedJobDetails] = useState('');
  
  // CV selection state
  const [cvSelectionMethod, setCvSelectionMethod] = useState<'select' | 'paste' | null>(null);
  const [selectedCV, setSelectedCV] = useState<CVDocument | null>(null);
  const [pastedCVContent, setPastedCVContent] = useState('');
  const [coverLetterFormat, setCoverLetterFormat] = useState<'document' | 'email' | null>(null);
  
  // Template selection state - default to template-1

  // Load jobs from localStorage when "Select" is clicked
  // No auto-load on modal open

  useEffect(() => {
    if (isOpen && step === 'cv-selection') {
      loadCVDocuments();
    }
  }, [isOpen, step]);

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

  const loadCVDocuments = () => {
    try {
      const existingDocs = localStorage.getItem('cv_documents');
      if (existingDocs) {
        const documents = JSON.parse(existingDocs);
        const cvDocs = documents.filter((doc: any) => doc.type === 'cv');
        setCVDocuments(cvDocs);
      }
    } catch (error) {
      console.error('Error loading CV documents:', error);
    }
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setJobSelectionMethod(null);
    setStep('cv-selection');
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
    setStep('cv-selection');
  };

  const handleCVSelect = (cv: CVDocument) => {
    setSelectedCV(cv);
    setCvSelectionMethod(null);
    handleGenerate('document');
  };

  const handlePasteCV = () => {
    if (!pastedCVContent.trim()) {
      alert('Please paste CV content');
      return;
    }
    setCvSelectionMethod(null);
    handleGenerate('document');
  };

  const handleFormatSelect = (format: 'document' | 'email') => {
    setCoverLetterFormat(format);
    handleGenerate(format);
  };

  const handleGenerate = async (format?: 'document' | 'email') => {
    const finalFormat = format || 'document';

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

      // Prepare job data
      const jobId = selectedJob?.id && !selectedJob.id.startsWith('pasted-') ? selectedJob.id : undefined;
      const jobPastedText = selectedJob?.id?.startsWith('pasted-') ? pastedJobDetails : undefined;

      // Prepare CV data
      let cvPastedText: string | undefined;
      if (selectedCV) {
        // Get CV structured data from localStorage
        const existingDocs = localStorage.getItem('cv_documents');
        if (existingDocs) {
          const docs = JSON.parse(existingDocs);
          const cvDoc = docs.find((doc: any) => doc.id === selectedCV.id);
          if (cvDoc?.structuredData) {
            cvPastedText = JSON.stringify(cvDoc.structuredData);
          }
        }
      } else if (pastedCVContent.trim()) {
        // Use pasted CV content
        cvPastedText = pastedCVContent;
      }

      if (!cvPastedText) {
        throw new Error('CV data is required for cover letter generation');
      }

      // Generate cover letter
      const coverLetterStructuredData = await generateCoverLetter({
        userId: userId,
        jobId,
        jobPastedText,
        cvPastedText,
        templateId: 'template-1',
        format: finalFormat,
      });

      // Render cover letter with template
      const coverLetterContent = renderCoverLetterTemplate('template-1', coverLetterStructuredData);

      const coverLetterId = `cover-letter-${Date.now()}`;
      
      const coverLetterData = {
        id: coverLetterId,
        name: `Cover Letter - ${selectedJob?.title || 'General'} at ${selectedJob?.company || 'Company'}`,
        type: 'cover-letter',
        templateId: 'template-1',
        format: finalFormat,
        jobId: selectedJob?.id || null,
        jobTitle: selectedJob?.title || null,
        companyName: selectedJob?.company || null,
        cvId: selectedCV?.id || null,
        structuredData: coverLetterStructuredData,
        content: coverLetterContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingDocs = localStorage.getItem('cv_documents');
      const documents = existingDocs ? JSON.parse(existingDocs) : [];
      documents.unshift(coverLetterData);
      localStorage.setItem('cv_documents', JSON.stringify(documents));

      onComplete(coverLetterId);
      handleClose();
    } catch (error) {
      console.error('Error generating cover letter:', error);
      alert('Failed to generate cover letter. Please try again.');
      setStep('cv-selection');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('job-selection');
    setJobSelectionMethod(null);
    setCvSelectionMethod(null);
    setSelectedJob(null);
    setSelectedCV(null);
    setPastedJobDetails('');
    setPastedCVContent('');
    setCoverLetterFormat(null);
    setJobSearchQuery('');
    setFilteredJobs([]);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create Cover Letter</h2>
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

          {/* Step 2: CV Selection */}
          {step === 'cv-selection' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">2</div>
                <h3 className="text-lg font-semibold text-gray-900">Select CV</h3>
                <button
                  onClick={() => setStep('job-selection')}
                  className="ml-auto text-sm text-blue-600 hover:text-blue-700"
                >
                  Back
                </button>
              </div>

              {!cvSelectionMethod ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setCvSelectionMethod('select')}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors text-left group"
                  >
                    <FileText size={24} className="mb-2 text-blue-600" />
                    <h4 className="font-semibold text-gray-900 mb-1">Select from Created CVs</h4>
                    <p className="text-sm text-gray-600">Choose from your created CV documents</p>
                  </button>

                  <button
                    onClick={() => setCvSelectionMethod('paste')}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors text-left group"
                  >
                    <FileText size={24} className="mb-2 text-blue-600" />
                    <h4 className="font-semibold text-gray-900 mb-1">Paste CV Content</h4>
                    <p className="text-sm text-gray-600">Paste your CV content directly</p>
                  </button>
                </div>
              ) : cvSelectionMethod === 'select' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Select a CV</h4>
                    <button
                      onClick={() => setCvSelectionMethod(null)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Back
                    </button>
                  </div>
                  {cvDocuments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">No CVs found. Please paste CV content instead.</p>
                      <Button
                        onClick={() => setCvSelectionMethod('paste')}
                        variant="outline"
                      >
                        Paste CV Content
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {cvDocuments.map((cv) => (
                        <button
                          key={cv.id}
                          onClick={() => handleCVSelect(cv)}
                          className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                        >
                          <h5 className="font-semibold text-gray-900 mb-1">{cv.name}</h5>
                          <p className="text-sm text-gray-600">Created {new Date(cv.createdAt).toLocaleDateString()}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Paste CV Content</h4>
                    <button
                      onClick={() => setCvSelectionMethod(null)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Back
                    </button>
                  </div>
                  <Textarea
                    value={pastedCVContent}
                    onChange={(e) => setPastedCVContent(e.target.value)}
                    placeholder="Paste your CV content here..."
                    className="min-h-[200px]"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={handlePasteCV}
                      className="flex-1"
                      style={{ backgroundColor: theme.colors.primary.DEFAULT }}
                    >
                      Continue
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCvSelectionMethod(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Generating */}
          {step === 'generating' && (
            <div className="text-center py-12">
              <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
              <h3 className="text-xl font-bold mb-2 text-gray-900">Generating Your Cover Letter</h3>
              <p className="text-gray-600">This may take a few moments...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}



