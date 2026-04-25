"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Briefcase, Check, ArrowRight, X, Loader2, Search, FileCheck, Clock } from 'lucide-react';
import { theme } from '@/lib/theme';
import { useRouter } from 'next/navigation';
import { ATSReviewService } from '@/lib/services/atsReviewService';
import { supabase } from '@/lib/supabase';
import { useCredits } from '@/context/CreditContext';
import { ApplyPaymentModal } from '@/components/payment/ApplyPaymentModal';
import AuthModal from '@/components/AuthModal';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description?: string;
}

interface CVDocument {
  id: string;
  name: string;
  structuredData?: any; // From CreateCVModal
  structured_data?: any; // From other sources
  content?: string; // HTML content
  html_content?: string;
  pasted_text?: string;
}

type Step = 'cv-selection' | 'job-selection' | 'job-selection-details' | 'analyzing';

interface ATSReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ATSReviewModal({ isOpen, onClose }: ATSReviewModalProps) {
  const router = useRouter();
  const { deductCredit } = useCredits();

  const [step, setStep] = useState<Step>('cv-selection');
  const [loading, setLoading] = useState(false);
  
  // CV selection state
  const [cvSelectionMethod, setCvSelectionMethod] = useState<'select' | 'paste' | null>(null);
  const [cvDocuments, setCvDocuments] = useState<CVDocument[]>([]);
  const [filteredCVDocuments, setFilteredCVDocuments] = useState<CVDocument[]>([]);
  const [cvSearchQuery, setCvSearchQuery] = useState('');
  const [selectedCV, setSelectedCV] = useState<CVDocument | null>(null);
  const [pastedCVContent, setPastedCVContent] = useState('');
  
  // Review type
  const [reviewType, setReviewType] = useState<'cv-only' | 'cv-job' | null>(null);
  
  // Job selection state (only for cv-job mode)
  const [jobSelectionMethod, setJobSelectionMethod] = useState<'select' | 'paste' | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [pastedJobDetails, setPastedJobDetails] = useState('');
  const [fetchingJob, setFetchingJob] = useState(false);

  // Auth & Payment modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      resetModal();
    }
  }, [isOpen]);

  // Load CV documents from localStorage (only CVs, not cover letters)
  const loadCVDocuments = () => {
    try {
      const cvDocs = localStorage.getItem('cv_documents');
      if (cvDocs) {
        const docs = JSON.parse(cvDocs);
        // Filter to only show CVs, not cover letters
        const cvsOnly = docs.filter((doc: any) => doc.type === 'cv' || !doc.type);
        setCvDocuments(cvsOnly);
        setFilteredCVDocuments(cvsOnly);
      }
    } catch (error) {
      console.error('Error loading CV documents:', error);
    }
  };

  // Load jobs from Supabase
  const loadJobs = async () => {
    try {
      setLoading(true);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company, location, description')
        .eq('status', 'active')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const formattedJobs: Job[] = (data || []).map((job: any) => ({
        id: job.id,
        title: job.title || 'Untitled Job',
        company: typeof job.company === 'string' ? job.company : job.company?.name || 'Company',
        location: typeof job.location === 'string' ? job.location : 
          (job.location?.remote ? 'Remote' : 
          [job.location?.city, job.location?.state, job.location?.country].filter(Boolean).join(', ') || 'Not specified'),
        description: job.description || '',
      }));
      
      setJobs(formattedJobs);
      setFilteredJobs(formattedJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter CV documents
  useEffect(() => {
    if (!cvSearchQuery.trim()) {
      setFilteredCVDocuments(cvDocuments);
      return;
    }
    const query = cvSearchQuery.toLowerCase();
    const filtered = cvDocuments.filter(doc => 
      doc.name.toLowerCase().includes(query)
    );
    setFilteredCVDocuments(filtered);
  }, [cvSearchQuery, cvDocuments]);

  // Filter jobs
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

  // Load CVs when "Select" is clicked
  useEffect(() => {
    if (cvSelectionMethod === 'select') {
      loadCVDocuments();
    }
  }, [cvSelectionMethod]);

  // Load jobs when "Select" is clicked for job selection
  useEffect(() => {
    if (jobSelectionMethod === 'select') {
      loadJobs();
    }
  }, [jobSelectionMethod]);

  const handleCVSelect = (cv: CVDocument) => {
    setSelectedCV(cv);
    setCvSelectionMethod(null);
    setStep('job-selection');
  };

  const handlePasteCV = () => {
    if (!pastedCVContent.trim()) {
      alert('Please paste your CV content');
      return;
    }
    setSelectedCV({
      id: 'pasted',
      name: 'Pasted CV',
      structured_data: null,
      pasted_text: pastedCVContent,
    });
    setCvSelectionMethod(null);
    setStep('job-selection');
  };

  const fetchFullJobDetails = async (jobId: string): Promise<Job | null> => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company, location, description')
        .eq('id', jobId)
        .single();

      if (error) {
        console.error('Error fetching job from Supabase:', error);
        return null;
      }

      if (data) {
        return {
          id: data.id,
          title: data.title || 'Untitled Job',
          company: typeof data.company === 'string' ? data.company : data.company?.name || 'Company',
          location: typeof data.location === 'string' ? data.location : 
            (data.location?.remote ? 'Remote' : 
            [data.location?.city, data.location?.state, data.location?.country].filter(Boolean).join(', ') || 'Not specified'),
          description: data.description || '',
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching full job details:', error);
      return null;
    }
  };

  const handleJobSelect = async (job: Job) => {
    let jobWithDescription = job;
    
    if (!job.description || !job.description.trim()) {
      setFetchingJob(true);
      try {
        const fullJob = await fetchFullJobDetails(job.id);
        if (fullJob && fullJob.description && fullJob.description.trim()) {
          jobWithDescription = fullJob;
        } else {
          const proceed = confirm('This job does not have a description. The review will be general (not job-specific). Do you want to continue?');
          if (!proceed) {
            setFetchingJob(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        const proceed = confirm('Unable to load job description. The review will be general (not job-specific). Do you want to continue?');
        if (!proceed) {
          setFetchingJob(false);
          return;
        }
      } finally {
        setFetchingJob(false);
      }
    }
    
    setSelectedJob(jobWithDescription);
    // Do NOT set step to 'analyzing' here — handleGenerate will do it after auth+credit pass
    handleGenerateWithJob('cv-job', jobWithDescription);
  };

  const handlePasteJob = () => {
    if (!pastedJobDetails.trim()) {
      alert('Please paste job details');
      return;
    }
    const pastedJob: Job = {
      id: 'pasted',
      title: 'Pasted Job',
      company: '',
      location: '',
      description: pastedJobDetails,
    };
    setSelectedJob(pastedJob);
    // Do NOT set step to 'analyzing' here — handleGenerate will do it after auth+credit pass
    handleGenerateWithJob('cv-job', pastedJob);
  };

  const handleCVOnly = () => {
    // Do NOT set step to 'analyzing' here — handleGenerate will do it after auth+credit pass
    handleGenerate('cv-only');
  };

  const getCVContent = (): string => {
    if (!selectedCV) return '';

    if (selectedCV.structuredData) {
      return JSON.stringify(selectedCV.structuredData);
    }

    if (selectedCV.structured_data) {
      return JSON.stringify(selectedCV.structured_data);
    }

    if (selectedCV.content) {
      return ATSReviewService.extractTextFromHTML(selectedCV.content);
    }

    if (selectedCV.html_content) {
      return ATSReviewService.extractTextFromHTML(selectedCV.html_content);
    }

    if (selectedCV.pasted_text) {
      return selectedCV.pasted_text;
    }

    return '';
  };

  const handleGenerate = async (reviewType: 'cv-only' | 'cv-job' = 'cv-only', jobOverride?: Job) => {
    if (!selectedCV) {
      alert('Please select a CV first');
      setStep('cv-selection');
      return;
    }

    const cvContent = getCVContent();
    if (!cvContent || !cvContent.trim()) {
      alert('CV content could not be extracted. Please try selecting the CV again.');
      setStep('cv-selection');
      return;
    }

    const jobToUse = jobOverride || selectedJob;

    if (reviewType === 'cv-job' && !jobToUse) {
      alert('Please select a job for job-specific review');
      setStep('job-selection');
      return;
    }

    // === AUTH CHECK ===
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setShowAuthModal(true);
      return; // Stay on current step — do NOT show analyzing
    }

    // === CREDIT CHECK ===
    const creditResult = await deductCredit(1);
    if (!creditResult.success) {
      setShowPaymentModal(true);
      return; // Stay on current step — do NOT show analyzing
    }

    // Only transition to analyzing after auth + credit pass
    setStep('analyzing');
    setLoading(true);

    try {
      const reviewResult = await ATSReviewService.generateReview({
        cvContent: cvContent.trim(),
        jobDescription: jobToUse?.description || undefined,
        jobTitle: jobToUse?.title || undefined,
        jobCompany: jobToUse?.company || undefined,
        reviewType: reviewType || 'cv-only',
      });

      const newSession = ATSReviewService.createSession(
        selectedCV.name,
        reviewResult,
        reviewType || 'cv-only',
        jobToUse?.title,
        jobToUse?.company
      );

      ATSReviewService.saveSession(newSession);

      onClose();
      router.push(`/tools/ats-review/${newSession.id}`);
    } catch (error: any) {
      console.error('Error generating ATS review:', error);
      alert(`Error: ${error.message}\n\nCheck console for details.`);
      setStep('cv-selection');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithJob = async (reviewType: 'cv-only' | 'cv-job', job: Job) => {
    await handleGenerate(reviewType, job);
  };

  const resetModal = () => {
    setStep('cv-selection');
    setSelectedCV(null);
    setSelectedJob(null);
    setCvSelectionMethod(null);
    setJobSelectionMethod(null);
    setPastedCVContent('');
    setPastedJobDetails('');
    setReviewType(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogTitle className="sr-only">ATS CV Review</DialogTitle>
          <DialogDescription className="sr-only">Get your CV analyzed for ATS compatibility</DialogDescription>
          <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Create ATS Review</h2>
            <button
              onClick={() => {
                onClose();
                router.push('/tools/ats-review');
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="px-6 py-6">
            {/* Step 1: CV Selection */}
            {step === 'cv-selection' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">1</div>
                  <h3 className="text-lg font-semibold text-gray-900">Select Your CV</h3>
                </div>

                {!cvSelectionMethod ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setCvSelectionMethod('select');
                        loadCVDocuments();
                      }}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors text-left group"
                    >
                      <FileText size={24} className="mb-2 text-blue-600" />
                      <h4 className="font-semibold text-gray-900 mb-1">Select from Saved CVs</h4>
                      <p className="text-sm text-gray-600">Choose from your saved CV documents</p>
                    </button>

                    <button
                      onClick={() => setCvSelectionMethod('paste')}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors text-left group"
                    >
                      <FileText size={24} className="mb-2 text-blue-600" />
                      <h4 className="font-semibold text-gray-900 mb-1">Paste CV Content</h4>
                      <p className="text-sm text-gray-600">Paste your CV as plain text</p>
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
                        <p className="text-gray-600 mb-4">No CVs found. Create a CV first or paste your CV content.</p>
                        <div className="space-y-2">
                          <Button
                            onClick={() => {
                              router.push('/cv?tab=cv');
                              onClose();
                            }}
                            variant="outline"
                            className="mr-2"
                          >
                            Create CV
                          </Button>
                          <Button
                            onClick={() => setCvSelectionMethod('paste')}
                            variant="outline"
                          >
                            Or Paste CV Content
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative">
                          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search CVs by name..."
                            value={cvSearchQuery}
                            onChange={(e) => setCvSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        {filteredCVDocuments.length === 0 ? (
                          <div className="text-center py-6">
                            <p className="text-sm text-gray-500">No CVs match your search.</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {filteredCVDocuments.map((cv) => (
                              <button
                                key={cv.id}
                                onClick={() => handleCVSelect(cv)}
                                className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                              >
                                <h5 className="font-semibold text-gray-900 mb-1">{cv.name}</h5>
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
                      placeholder="Paste your CV content here (plain text)..."
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

            {/* Step 2: Choose Review Option */}
            {step === 'job-selection' && !jobSelectionMethod && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">2</div>
                  <h3 className="text-lg font-semibold text-gray-900">Choose Review Option</h3>
                  <button
                    onClick={() => setStep('cv-selection')}
                    className="ml-auto text-sm text-blue-600 hover:text-blue-700"
                  >
                    Back
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Selected CV: <span className="font-medium">{selectedCV?.name}</span>
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setJobSelectionMethod('select');
                      setStep('job-selection-details');
                      loadJobs();
                    }}
                    className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Briefcase size={24} className="mb-2 text-blue-600" />
                        <p className="font-semibold text-gray-900">Select Job</p>
                        <p className="text-sm text-gray-600 mt-1">Choose from saved jobs for tailored analysis</p>
                      </div>
                      <ArrowRight size={20} className="text-gray-400" />
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setJobSelectionMethod('paste');
                      setStep('job-selection-details');
                    }}
                    className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Briefcase size={24} className="mb-2 text-blue-600" />
                        <p className="font-semibold text-gray-900">Paste Job</p>
                        <p className="text-sm text-gray-600 mt-1">Paste job description for analysis</p>
                      </div>
                      <ArrowRight size={20} className="text-gray-400" />
                    </div>
                  </button>

                  <button
                    onClick={handleCVOnly}
                    className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <FileCheck size={24} className="mb-2 text-blue-600" />
                        <p className="font-semibold text-gray-900">CV Only</p>
                        <p className="text-sm text-gray-600 mt-1">General ATS optimization</p>
                      </div>
                      <ArrowRight size={20} className="text-gray-400" />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Job Selection Details */}
            {step === 'job-selection-details' && jobSelectionMethod && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">3</div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {jobSelectionMethod === 'select' ? 'Select Job' : 'Paste Job Details'}
                  </h3>
                  <button
                    onClick={() => {
                      setJobSelectionMethod(null);
                      setStep('job-selection');
                    }}
                    className="ml-auto text-sm text-blue-600 hover:text-blue-700"
                  >
                    Back
                  </button>
                </div>
              
                {jobSelectionMethod === 'select' ? (
                  <div className="space-y-3">
                    {jobs.length === 0 ? (
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
                                disabled={fetchingJob}
                                className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900 mb-1">{job.title}</h5>
                                    <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                                  </div>
                                  {fetchingJob && (
                                    <Loader2 size={16} className="animate-spin text-blue-600 ml-2" />
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
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
                        onClick={() => {
                          setJobSelectionMethod(null);
                          setStep('job-selection');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Analyzing */}
            {step === 'analyzing' && (
              <div className="text-center py-12">
                <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
                <h3 className="text-xl font-bold mb-2 text-gray-900">Analyzing Your CV</h3>
                <p className="text-gray-600">This may take a few moments...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth & Payment Modals */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      <ApplyPaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onAuthRequired={() => setShowAuthModal(true)}
      />
    </>
  );
}