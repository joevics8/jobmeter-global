// CV Generation Service - Calls the generate-document Edge Function
// Enforces strict 1-page A4 format

import { CVData } from '@/lib/types/cv';
import { supabase } from '@/lib/supabase';

export interface CVGenerationOptions {
  userId: string;
  jobId?: string;
  jobPastedText?: string;
  templateId?: string;
}

export async function generateCV(options: CVGenerationOptions): Promise<CVData> {
  const { userId, jobId, jobPastedText, templateId } = options;

  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!jobId && !jobPastedText) {
    throw new Error('Either jobId or jobPastedText must be provided');
  }

  try {
    // Call the generate-document Edge Function
    const { data: result, error } = await supabase.functions.invoke('generate-document', {
      body: {
        type: 'cv',
        userId,
        jobId: jobId || undefined,
        jobPastedText: jobPastedText || undefined,
        templateId: templateId || 'template-1',
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to generate CV');
    }

    if (!result?.success || !result?.data) {
      throw new Error(result?.error || 'Invalid response from server');
    }

    const cvData: CVData = result.data;

    // Validate required fields
    if (!cvData.personalDetails?.name || !cvData.personalDetails?.email) {
      throw new Error('Generated CV missing required fields');
    }

    return cvData;
  } catch (error: any) {
    console.error('CV Generation Error:', error);
    throw new Error(error.message || 'Failed to generate CV. Please try again.');
  }
}




