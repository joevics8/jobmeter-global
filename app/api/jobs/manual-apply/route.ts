// API Route: Manual Apply (User-triggered)
// Allows users to manually apply to jobs with auto-generated CV and cover letter

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CreditService } from '@/lib/services/creditService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Allow longer timeout for document generation and email sending (up to 5 minutes)
export const maxDuration = 300;

// Auto-apply costs 2 credits per application
const AUTO_APPLY_CREDITS_COST = 2;

export async function POST(request: NextRequest) {
  try {
    const { userId, jobId } = await request.json();

    if (!userId || !jobId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, jobId' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Check if user has enough credits (2 credits per application)
    const hasEnoughCredits = await CreditService.hasEnoughCredits(
      userId,
      AUTO_APPLY_CREDITS_COST,
      supabaseServiceKey
    );

    if (!hasEnoughCredits) {
      const creditDetails = await CreditService.getCreditDetails(userId, supabaseServiceKey);
      return NextResponse.json(
        { 
          error: 'INSUFFICIENT_CREDITS',
          message: `Auto-apply requires ${AUTO_APPLY_CREDITS_COST} credits. You have ${creditDetails.total} credit${creditDetails.total !== 1 ? 's' : ''}. Please purchase credits to continue.`,
          requiredCredits: AUTO_APPLY_CREDITS_COST,
          currentCredits: creditDetails.total,
        },
        { status: 403 }
      );
    }

    // Step 2: Check if already applied
    const { data: existingApp } = await supabase
      .from('job_applications')
      .select('id, application_status, retry_count')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .single();

    if (existingApp && existingApp.application_status === 'sent') {
      return NextResponse.json(
        { error: 'Already applied to this job' },
        { status: 400 }
      );
    }

    // Step 3: Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, title, company, application')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Step 4: Extract application email
    let recipientEmail = '';
    if (job.application && typeof job.application === 'object') {
      recipientEmail = job.application.email || '';
      recipientEmail = recipientEmail.replace(/^mailto:/i, '').trim();
    }

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Job has no email application method' },
        { status: 400 }
      );
    }

    // Step 5: Check if user has onboarding data (required for CV/cover letter)
    const { data: onboardingData } = await supabase
      .from('onboarding_data')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (!onboardingData) {
      return NextResponse.json(
        { error: 'Please complete your profile to apply. Go to onboarding to set up your CV.' },
        { status: 400 }
      );
    }

    // Step 6: Create or update application record
    let applicationId: string;
    if (existingApp) {
      applicationId = existingApp.id;
      await supabase
        .from('job_applications')
        .update({
          application_status: 'processing',
          application_method: 'manual',
          application_email: recipientEmail,
          retry_count: (existingApp.retry_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);
    } else {
      const { data: newApp, error: appError } = await supabase
        .from('job_applications')
        .insert({
          user_id: userId,
          job_id: jobId,
          application_method: 'manual',
          application_email: recipientEmail,
          application_status: 'processing',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (appError || !newApp) {
        return NextResponse.json(
          { error: 'Failed to create application record', details: appError?.message },
          { status: 500 }
        );
      }

      applicationId = newApp.id;
    }

    // Step 7: Generate documents (this takes time - CV and cover letter generation)
    const { data: docsResult, error: docsError } = await supabase.functions.invoke('generate-auto-apply-documents', {
      body: {
        userId,
        jobId,
        templateId: 'template-1',
      },
    });

    if (docsError || !docsResult?.success) {
      const errorMsg = docsError?.message || docsResult?.error || 'Failed to generate documents';
      
      await supabase
        .from('job_applications')
        .update({
          application_status: 'failed',
          error_message: `Document generation: ${errorMsg}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      return NextResponse.json(
        { error: 'Failed to generate CV and cover letter', details: errorMsg },
        { status: 500 }
      );
    }

    const cvPDFBase64 = docsResult.cv?.pdfBase64;
    const coverLetterHTML = docsResult.coverLetter?.html;
    const coverLetterSubject = docsResult.coverLetter?.subject || `Application for ${job.title || 'Position'}`;

    if (!cvPDFBase64 || !coverLetterHTML) {
      await supabase
        .from('job_applications')
        .update({
          application_status: 'failed',
          error_message: 'Missing CV or cover letter in response',
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      return NextResponse.json(
        { error: 'Failed to generate documents' },
        { status: 500 }
      );
    }

    // Update with generation timestamps
    await supabase
      .from('job_applications')
      .update({
        cv_generated_at: new Date().toISOString(),
        cover_letter_generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    // Step 8: Send email (this also takes time)
    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-auto-apply-email', {
      body: {
        userId,
        jobId,
        applicationId,
        recipientEmail,
        cvPDFBase64,
        coverLetterHTML,
        coverLetterSubject,
        jobTitle: job.title,
        companyName: typeof job.company === 'object' ? job.company.name : job.company,
      },
    });

    if (emailError || !emailResult?.success) {
      const errorMsg = emailError?.message || emailResult?.error || 'Failed to send email';
      
      await supabase
        .from('job_applications')
        .update({
          application_status: 'failed',
          error_message: `Email sending: ${errorMsg}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      return NextResponse.json(
        { error: 'Failed to send application email', details: errorMsg },
        { status: 500 }
      );
    }

    const sesMessageId = emailResult.messageId;

    // Step 9: Update application as sent
    await supabase
      .from('job_applications')
      .update({
        application_status: 'sent',
        ses_message_id: sesMessageId,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    // Step 10: Create success notification
    await supabase
      .from('application_notifications')
      .insert({
        user_id: userId,
        job_id: jobId,
        application_id: applicationId,
        notification_type: 'application_sent',
        message: `Successfully applied to ${job.title || 'position'} at ${typeof job.company === 'object' ? job.company.name : job.company}`,
      });

    // Step 11: Deduct credits after successful application
    try {
      await CreditService.deductCredits(
        userId,
        AUTO_APPLY_CREDITS_COST,
        `Auto-apply to ${job.title || 'position'} at ${typeof job.company === 'object' ? job.company.name : job.company}`,
        applicationId,
        supabaseServiceKey
      );
    } catch (creditError: any) {
      // Log error but don't fail the request since application was already sent
      console.error('Error deducting credits after successful application:', creditError);
      // Optionally, we could mark the application with a warning flag
    }

    return NextResponse.json({
      success: true,
      message: 'Application sent successfully',
      applicationId,
      messageId: sesMessageId,
      sentAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in manual-apply API:', error);
    return NextResponse.json(
      { 
        error: error?.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
