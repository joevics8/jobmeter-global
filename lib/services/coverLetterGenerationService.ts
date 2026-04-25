// Cover Letter Generation Service - Calls the generate-document Edge Function
// Enforces strict 1-page A4 format

import { StructuredCoverLetter } from '@/lib/types/coverLetter';
import { supabase } from '@/lib/supabase';

export interface CoverLetterGenerationOptions {
  userId: string;
  jobId?: string;
  jobPastedText?: string;
  cvId?: string;
  cvPastedText?: string; // Should be JSON string of CV structured data
  templateId?: string;
  format?: 'document' | 'email';
}

export async function generateCoverLetter(options: CoverLetterGenerationOptions): Promise<StructuredCoverLetter> {
  const { userId, jobId, jobPastedText, cvId, cvPastedText, templateId, format } = options;

  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!jobId && !jobPastedText) {
    throw new Error('Either jobId or jobPastedText must be provided');
  }

  if (!cvId && !cvPastedText) {
    throw new Error('Either cvId or cvPastedText must be provided for cover letter');
  }

  try {
    // Call the generate-document Edge Function
    const { data: result, error } = await supabase.functions.invoke('generate-document', {
      body: {
        type: 'cover-letter',
        userId,
        jobId: jobId || undefined,
        jobPastedText: jobPastedText || undefined,
        cvId: cvId || undefined,
        cvPastedText: cvPastedText || undefined,
        templateId: templateId || 'template-1',
        coverLetterFormat: format || 'document',
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to generate cover letter');
    }

    if (!result?.success || !result?.data) {
      throw new Error(result?.error || 'Invalid response from server');
    }

    const coverLetterData: StructuredCoverLetter = result.data;

    // Validate required fields
    if (!coverLetterData.personalInfo?.name || !coverLetterData.personalInfo?.email) {
      throw new Error('Generated cover letter missing required fields');
    }

    // Ensure date is set
    if (!coverLetterData.meta?.date) {
      coverLetterData.meta = {
        ...coverLetterData.meta,
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };
    }

    return coverLetterData;
  } catch (error: any) {
    console.error('Cover Letter Generation Error:', error);
    throw new Error(error.message || 'Failed to generate cover letter. Please try again.');
  }
}




