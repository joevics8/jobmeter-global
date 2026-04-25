// Supabase Edge Function: Auto-Apply Processor
// Main function that processes auto-apply queue and sends job applications
// Phase 5: Auto-Apply Core Function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  planType?: 'Pro' | 'Max' | 'Elite'; // Optional: process specific plan type
  maxApplications?: number; // Optional: limit number of applications per run
  dryRun?: boolean; // Optional: test mode without sending emails
}

// Process auto-apply for a single user
async function processUserAutoApply(
  supabase: any,
  userId: string,
  planType: 'Pro' | 'Max' | 'Elite',
  eligibleJobs: any[],
  dryRun: boolean = false
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = { success: 0, failed: 0, errors: [] as string[] };

  console.log(`\n👤 Processing auto-apply for user ${userId} (${planType})`);
  console.log(`   Found ${eligibleJobs.length} eligible jobs`);

  // Get user subscription to check monthly limit
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (subError || !subscription) {
    results.errors.push(`No active subscription found for user ${userId}`);
    return results;
  }

  // Check monthly limit
  const applicationsUsed = subscription.applications_used_this_month || 0;
  const monthlyLimit = subscription.monthly_application_limit || 0;
  const remainingApplications = monthlyLimit - applicationsUsed;

  if (remainingApplications <= 0) {
    console.log(`   ⚠️ Monthly limit reached (${applicationsUsed}/${monthlyLimit})`);
    
    // Create notification for user
    await supabase
      .from('application_notifications')
      .insert({
        user_id: userId,
        notification_type: 'monthly_limit_reached',
        message: `You've reached your monthly application limit (${monthlyLimit}). Your limit will reset on ${subscription.monthly_reset_date}.`,
      });

    results.errors.push(`Monthly limit reached for user ${userId}`);
    return results;
  }

  // Limit jobs to remaining applications
  const jobsToProcess = eligibleJobs.slice(0, remainingApplications);
  console.log(`   📊 Can apply to ${remainingApplications} more jobs this month`);
  console.log(`   🎯 Processing ${jobsToProcess.length} jobs`);

  for (const match of jobsToProcess) {
    let jobId: string;
    let matchResultId: string;
    
    try {
      // Validate match data
      if (!match || !match.job_id || !match.id) {
        console.error(`   ❌ Invalid match data: ${JSON.stringify(match)}`);
        results.failed++;
        results.errors.push('Invalid match data');
        continue;
      }

      jobId = match.job_id;
      matchResultId = match.id;

      console.log(`\n   📄 Processing job ${jobId}...`);

      // Check if already applied with timeout
      let existingApp;
      try {
        const { data, error } = await supabase
          .from('job_applications')
          .select('id, application_status, retry_count')
          .eq('user_id', userId)
          .eq('job_id', jobId)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = not found, which is OK
          console.error(`   ⚠️ Error checking existing application: ${error.message}`);
          // Continue anyway - will create new record
        } else {
          existingApp = data;
        }
      } catch (error: any) {
        console.error(`   ⚠️ Exception checking existing application: ${error.message}`);
        // Continue anyway
      }

      if (existingApp) {
        if (existingApp.application_status === 'sent') {
          console.log(`   ⏭️ Already applied to this job (status: sent)`);
          continue;
        }
        // If failed/retrying, check retry count
        if (existingApp.retry_count >= 3) {
          console.log(`   ⏭️ Max retries reached for job ${jobId}`);
          continue;
        }
      }

      // Get job details with error handling
      let job;
      try {
        const { data, error: jobError } = await supabase
          .from('jobs')
          .select('id, title, company, application')
          .eq('id', jobId)
          .single();

        if (jobError || !data) {
          throw new Error(`Job not found: ${jobError?.message || 'Unknown error'}`);
        }
        job = data;
      } catch (error: any) {
        console.error(`   ❌ Error fetching job ${jobId}: ${error.message}`);
        results.errors.push(`Job ${jobId} not found: ${error.message}`);
        results.failed++;
        continue;
      }

      // Extract application email
      let recipientEmail = '';
      if (job.application && typeof job.application === 'object') {
        recipientEmail = job.application.email || '';
        // Remove mailto: prefix if present
        recipientEmail = recipientEmail.replace(/^mailto:/i, '').trim();
      }

      if (!recipientEmail) {
        results.errors.push(`Job ${jobId} has no email address`);
        results.failed++;
        continue;
      }

      // Create application record
      let applicationId: string;
      if (existingApp) {
        applicationId = existingApp.id;
        // Update existing record
        await supabase
          .from('job_applications')
          .update({
            application_status: 'processing',
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
            plan_type: planType,
            application_method: 'auto',
            application_email: recipientEmail,
            application_status: 'processing',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (appError || !newApp) {
          results.errors.push(`Failed to create application record: ${appError?.message}`);
          results.failed++;
          continue;
        }

        applicationId = newApp.id;
      }

      if (dryRun) {
        console.log(`   ✅ [DRY RUN] Would send application to ${recipientEmail}`);
        results.success++;
        continue;
      }

      // Step 1: Generate documents with timeout and retry
      console.log(`   📝 Generating CV and cover letter...`);
      let docsResult;
      let docsError;
      
      try {
        // Set timeout for document generation (60 seconds)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Document generation timeout')), 60000);
        });

        const docsPromise = supabase.functions.invoke('generate-auto-apply-documents', {
          body: {
            userId,
            jobId,
            templateId: 'template-1',
          },
        });

        const result = await Promise.race([docsPromise, timeoutPromise]) as any;
        docsResult = result.data;
        docsError = result.error;
      } catch (error: any) {
        docsError = error;
        console.error(`   ❌ Document generation exception: ${error.message}`);
      }

      if (docsError || !docsResult?.success) {
        const errorMsg = docsError?.message || docsResult?.error || 'Failed to generate documents';
        console.error(`   ❌ Document generation failed: ${errorMsg}`);
        
        try {
          await supabase
            .from('job_applications')
            .update({
              application_status: 'failed',
              error_message: `Document generation: ${errorMsg}`,
              updated_at: new Date().toISOString(),
            })
            .eq('id', applicationId);
        } catch (updateError: any) {
          console.error(`   ⚠️ Failed to update application status: ${updateError.message}`);
        }

        results.failed++;
        results.errors.push(`Document generation failed for job ${jobId}: ${errorMsg}`);
        continue;
      }

      // Validate document response
      const cvPDFBase64 = docsResult.cv?.pdfBase64;
      const coverLetterHTML = docsResult.coverLetter?.html;
      const coverLetterSubject = docsResult.coverLetter?.subject || `Application for ${job.title || 'Position'}`;

      if (!cvPDFBase64 || !coverLetterHTML) {
        const errorMsg = 'Missing CV or cover letter in response';
        console.error(`   ❌ ${errorMsg}`);
        console.error(`   Response structure: ${JSON.stringify(Object.keys(docsResult || {}))}`);
        
        try {
          await supabase
            .from('job_applications')
            .update({
              application_status: 'failed',
              error_message: errorMsg,
              updated_at: new Date().toISOString(),
            })
            .eq('id', applicationId);
        } catch (updateError: any) {
          console.error(`   ⚠️ Failed to update application status: ${updateError.message}`);
        }

        results.failed++;
        results.errors.push(`Missing documents for job ${jobId}`);
        continue;
      }

      // Validate base64 PDF
      if (typeof cvPDFBase64 !== 'string' || cvPDFBase64.length < 100) {
        const errorMsg = 'Invalid CV PDF data';
        console.error(`   ❌ ${errorMsg}`);
        
        try {
          await supabase
            .from('job_applications')
            .update({
              application_status: 'failed',
              error_message: errorMsg,
              updated_at: new Date().toISOString(),
            })
            .eq('id', applicationId);
        } catch (updateError: any) {
          console.error(`   ⚠️ Failed to update application status: ${updateError.message}`);
        }

        results.failed++;
        results.errors.push(`Invalid CV PDF for job ${jobId}`);
        continue;
      }

      // Update application with generation timestamps
      await supabase
        .from('job_applications')
        .update({
          cv_generated_at: new Date().toISOString(),
          cover_letter_generated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      console.log(`   ✅ Documents generated`);

      // Step 2: Send email
      console.log(`   📧 Sending email to ${recipientEmail}...`);
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
        console.error(`   ❌ Email sending failed: ${errorMsg}`);
        
        await supabase
          .from('job_applications')
          .update({
            application_status: 'failed',
            error_message: `Email sending: ${errorMsg}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', applicationId);

        results.failed++;
        results.errors.push(`Email sending failed for job ${jobId}: ${errorMsg}`);
        continue;
      }

      const sesMessageId = emailResult.messageId;

      // Step 3: Update application as sent
      await supabase
        .from('job_applications')
        .update({
          application_status: 'sent',
          ses_message_id: sesMessageId,
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      // Step 4: Increment monthly application count
      await supabase
        .from('user_subscriptions')
        .update({
          applications_used_this_month: applicationsUsed + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      // Step 5: Create success notification
      await supabase
        .from('application_notifications')
        .insert({
          user_id: userId,
          job_id: jobId,
          application_id: applicationId,
          notification_type: 'application_sent',
          message: `Successfully applied to ${job.title || 'position'} at ${typeof job.company === 'object' ? job.company.name : job.company}`,
        });

      // Step 6: Mark match as processed
      await supabase
        .from('server_match_results')
        .update({
          queued_for_auto_apply_at: null, // Clear queue flag
        })
        .eq('id', matchResultId);

      console.log(`   ✅ Application sent successfully (SES ID: ${sesMessageId})`);
      results.success++;

    } catch (error: any) {
      console.error(`   ❌ Error processing job ${match.job_id}:`, error);
      results.failed++;
      results.errors.push(`Error processing job ${match.job_id}: ${error.message}`);
    }
  }

  return results;
}

// Main handler
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { planType, maxApplications = 50, dryRun = false }: RequestBody = await req.json().catch(() => ({}));

    console.log(`🚀 Starting auto-apply processor...`);
    console.log(`   Plan type filter: ${planType || 'All'}`);
    console.log(`   Max applications: ${maxApplications}`);
    console.log(`   Dry run: ${dryRun ? 'YES' : 'NO'}`);

    // Build query for eligible matches
    let query = supabase
      .from('server_match_results')
      .select('id, user_id, job_id, match_score, auto_apply_rank, plan_type')
      .eq('is_auto_apply_eligible', true)
      .not('queued_for_auto_apply_at', 'is', null)
      .order('user_id', { ascending: true })
      .order('auto_apply_rank', { ascending: true });

    // Filter by plan type if specified
    if (planType) {
      query = query.eq('plan_type', planType);
    }

    const { data: eligibleMatches, error: matchesError } = await query;

    if (matchesError) {
      throw new Error(`Failed to fetch eligible matches: ${matchesError.message}`);
    }

    if (!eligibleMatches || eligibleMatches.length === 0) {
      console.log('✅ No eligible matches found for auto-apply');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No eligible matches found',
          processed: 0,
          applications_sent: 0,
          applications_failed: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Found ${eligibleMatches.length} eligible matches`);

    // Group matches by user
    const matchesByUser = new Map<string, any[]>();
    for (const match of eligibleMatches) {
      if (!matchesByUser.has(match.user_id)) {
        matchesByUser.set(match.user_id, []);
      }
      matchesByUser.get(match.user_id)!.push(match);
    }

    console.log(`👥 Processing ${matchesByUser.size} users`);

    // Process each user
    let totalSuccess = 0;
    let totalFailed = 0;
    const allErrors: string[] = [];
    let processedCount = 0;

    for (const [userId, userMatches] of matchesByUser.entries()) {
      if (processedCount >= maxApplications) {
        console.log(`\n⚠️ Reached max applications limit (${maxApplications})`);
        break;
      }

      const planTypeForUser = userMatches[0]?.plan_type || 'Pro';
      const remaining = maxApplications - processedCount;
      const matchesToProcess = userMatches.slice(0, remaining);

      const result = await processUserAutoApply(
        supabase,
        userId,
        planTypeForUser,
        matchesToProcess,
        dryRun
      );

      totalSuccess += result.success;
      totalFailed += result.failed;
      allErrors.push(...result.errors);
      processedCount += result.success + result.failed;

      if (processedCount >= maxApplications) {
        break;
      }
    }

    console.log(`\n✅ Auto-apply processing complete`);
    console.log(`   Success: ${totalSuccess}`);
    console.log(`   Failed: ${totalFailed}`);
    console.log(`   Errors: ${allErrors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        applications_sent: totalSuccess,
        applications_failed: totalFailed,
        errors: allErrors.slice(0, 10), // Limit error output
        dry_run: dryRun,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Fatal error in auto-apply-processor:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

