// supabase/functions/daily-job-notifications/index.ts

// Daily notification service - sends notifications for jobs posted today
// Also handles real-time matching when jobs are posted (triggered by database trigger)
// Phase 2: Enhanced with premium user auto-apply matching

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Normalization functions
function normalizeString(input: string | undefined | null): string {
  if (!input) return '';
  return input.toString().trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeArrayStrings(values: any): string[] {
  if (!values) return [];
  if (Array.isArray(values)) {
    const set = new Set<string>();
    for (const v of values) {
      const n = normalizeString(v);
      if (n) set.add(n);
    }
    return Array.from(set);
  }
  if (typeof values === 'string') {
    return normalizeArrayStrings(values.split(','));
  }
  return [];
}

function toNumeric(input: string | number | undefined | null): number | undefined {
  if (input === undefined || input === null) return undefined;
  if (typeof input === 'number') return isFinite(input) ? input : undefined;
  const cleaned = input.toString().replace(/[^0-9.-]/g, '');
  const num = Number(cleaned);
  return isFinite(num) ? num : undefined;
}

// Matching types
type JobRow = {
  role?: string;
  related_roles?: string[] | string | null;
  ai_enhanced_roles?: string[] | string | null;
  skills_required?: string[] | string | null;
  ai_enhanced_skills?: string[] | string | null;
  location?: { city?: string | null; state?: string | null; country?: string | null; remote?: boolean } | string | null;
  experience_level?: string | null;
  salary_range?: { min?: number; max?: number; period?: string | null; currency?: string | null } | null;
  employment_type?: string | null;
  sector?: string | null;
  application?: { method?: string; email?: string; url?: string; phone?: string } | null;
};

type UserOnboardingData = {
  target_roles?: string[] | null;
  cv_skills?: string[] | null;
  preferred_locations?: string[] | null;
  experience_level?: string | null;
  salary_min?: number | string | null;
  salary_max?: number | string | null;
  job_type?: string | null;
  sector?: string | null;
};

type PremiumSubscription = {
  plan_type: 'Pro' | 'Max' | 'Elite';
  monthly_application_limit: number;
  applications_used_this_month: number;
  monthly_reset_date: string;
  is_active: boolean;
};

type MatchResult = {
  user_id: string;
  job_id: string;
  match_score: number;
};

// Matching function - calculates match score and returns breakdown
function scoreJob(job: JobRow, userData: UserOnboardingData): { score: number; breakdown: { roles: number; skills: number; sector: number; location: number; experience: number; salary: number; type: number; rsCapped: number; total: number } } {
  const targetRoles = normalizeArrayStrings(userData.target_roles || []);
  const cvSkills = normalizeArrayStrings(userData.cv_skills || []);
  const preferredLocations = normalizeArrayStrings(userData.preferred_locations || []);
  const expLevel = normalizeString(userData.experience_level || '');
  const jobType = normalizeString(userData.job_type || '');
  const salaryMin = toNumeric(userData.salary_min ?? undefined);
  const salaryMax = toNumeric(userData.salary_max ?? undefined);
  const userSector = normalizeString(userData.sector || '');

  const jobRole = normalizeString(job.role || '');
  const jobRolesArray = jobRole ? jobRole.split(',').map(r => r.trim()).filter(r => r) : [];
  const relatedRoles = normalizeArrayStrings(job.related_roles as any);
  const aiRoles = normalizeArrayStrings(job.ai_enhanced_roles as any);
  const requiredSkills = normalizeArrayStrings(job.skills_required as any);
  const aiSkills = normalizeArrayStrings(job.ai_enhanced_skills as any);

  const jobLocationFields: string[] = [];
  if (typeof job.location === 'object' && job.location) {
    if (job.location.city) jobLocationFields.push(normalizeString(job.location.city));
    if (job.location.state) jobLocationFields.push(normalizeString(job.location.state));
    if (job.location.country) jobLocationFields.push(normalizeString(job.location.country));
    if (job.location.remote) jobLocationFields.push('remote');
  } else if (typeof job.location === 'string') {
    jobLocationFields.push(normalizeString(job.location));
  }
  
  const jobExp = normalizeString(job.experience_level || '');
  const jobTypeVal = normalizeString(job.employment_type || '');
  const sal = job.salary_range || undefined;
  const jobSalMin = toNumeric(sal?.min ?? undefined);
  const jobSalMax = toNumeric(sal?.max ?? undefined);
  const jobSector = normalizeString(job.sector || '');

  // Roles scoring
  let rolesScore = 0;
  if (jobRolesArray.length && jobRolesArray.some(r => targetRoles.includes(r))) {
    rolesScore = 50;
  } else if (relatedRoles.length && relatedRoles.some(r => targetRoles.includes(r))) {
    rolesScore = 25;
  } else if (aiRoles.length && aiRoles.some(r => targetRoles.includes(r))) {
    rolesScore = 15;
  }

  // Skills scoring
  let skillsScore = 0;
  if (requiredSkills.length > 0) {
    const requiredMatches = requiredSkills.filter(reqSkill => cvSkills.includes(reqSkill)).length;
    skillsScore += requiredMatches * 6;
  }
  if (skillsScore < 30 && aiSkills.length > 0) {
    const aiMatches = aiSkills.filter(aiSkill => cvSkills.includes(aiSkill)).length;
    const remainingCapacity = 30 - skillsScore;
    const maxAiMatches = Math.floor(remainingCapacity / 3);
    const actualAiMatches = Math.min(aiMatches, maxAiMatches);
    skillsScore += actualAiMatches * 3;
  }
  skillsScore = Math.min(30, skillsScore);

  // Sector scoring - check if user sector matches job sector
  let sectorScore = 0;
  if (userSector && jobSector && userSector === jobSector) {
    sectorScore = 30;
  }

  // Location scoring
  const locationScore = jobLocationFields.length > 0 && preferredLocations.length > 0 &&
    jobLocationFields.some(jobLoc => preferredLocations.some(prefLoc => prefLoc === jobLoc)) ? 10 : 0;

  // Experience scoring
  const experienceScore = jobExp && expLevel && jobExp === expLevel ? 5 : 0;

  // Salary scoring
  const salaryScore = (jobSalMax !== undefined && salaryMin !== undefined && jobSalMax >= (salaryMin as number)) ? 5 : 0;

  // Employment type scoring
  const typeScore = (jobTypeVal === 'any' || (jobTypeVal && jobType && jobTypeVal === jobType)) ? 5 : 0;

  // Enforce Roles+Skills+Sector cap at 80
  const rsCapped = Math.min(80, rolesScore + skillsScore + sectorScore);
  const total = rsCapped + locationScore + experienceScore + salaryScore + typeScore;
  const finalScore = Math.max(0, Math.min(100, total));

  return {
    score: finalScore,
    breakdown: {
      roles: rolesScore,
      skills: skillsScore,
      sector: sectorScore,
      location: locationScore,
      experience: experienceScore,
      salary: salaryScore,
      type: typeScore,
      rsCapped,
      total,
    },
  };
}

// Check if job has email application method
function hasEmailApplicationMethod(job: JobRow): boolean {
  if (!job.application) return false;
  
  // Check if application is an object with email field
  if (typeof job.application === 'object') {
    // Check if method is 'Email' or if email field exists
    const method = job.application.method || '';
    const email = job.application.email || '';
    
    // Remove mailto: prefix if present for checking
    const cleanEmail = email.toString().replace(/^mailto:/i, '').trim();
    
    return method.toLowerCase() === 'email' || (cleanEmail.length > 0 && cleanEmail.includes('@'));
  }
  
  return false;
}

// Get premium subscription for a user
async function getUserPremiumSubscription(supabase: any, userId: string): Promise<PremiumSubscription | null> {
  try {
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(`
        plan_type,
        monthly_application_limit,
        applications_used_this_month,
        monthly_reset_date,
        is_active,
        premium_plans (
          monthly_application_limit
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !subscription) {
      return null;
    }

    // Use the limit from the joined premium_plans table (if available) or fallback to subscription's limit
    // The premium_plans join returns an array, so get first element
    const planLimit = Array.isArray(subscription.premium_plans) && subscription.premium_plans.length > 0
      ? subscription.premium_plans[0].monthly_application_limit
      : null;
    const limit = planLimit || subscription.monthly_application_limit;

    return {
      plan_type: subscription.plan_type as 'Pro' | 'Max' | 'Elite',
      monthly_application_limit: limit,
      applications_used_this_month: subscription.applications_used_this_month || 0,
      monthly_reset_date: subscription.monthly_reset_date,
      is_active: subscription.is_active,
    };
  } catch (error) {
    console.error(`Error fetching premium subscription for user ${userId}:`, error);
    return null;
  }
}

// Get top N jobs to mark for auto-apply based on plan type
function getTopJobsForPlan(planType: 'Pro' | 'Max' | 'Elite'): number {
  switch (planType) {
    case 'Pro':
      return 5; // Top 5 daily, but up to 15 monthly
    case 'Max':
      return 10; // Top 10 daily, but up to 30 monthly
    case 'Elite':
      return 20; // Top 20 daily, but up to 90 monthly
    default:
      return 0;
  }
}

// Send Expo push notification
async function sendExpoPushNotification(expoPushToken: string, message: string): Promise<boolean> {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: expoPushToken,
        sound: 'default',
        title: '🎉 New Job Matches!',
        body: message,
        data: { type: 'job_matches' },
        priority: 'high',
      }),
    });

    const result = await response.json();
    console.log('Expo push notification result:', result);
    
    // Check if notification was successful
    if (result.data && result.data.status === 'ok') {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error sending Expo push notification:', error);
    return false;
  }
}

// Main handler
serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if this is a matching request (has job_id) or daily notification
    console.log(`📥 Request method: ${req.method}, URL: ${req.url}`);
    
    // Validate request origin to prevent unauthorized triggers
    const origin = req.headers.get('origin') || '';
    const userAgent = req.headers.get('user-agent') || '';
    const authHeader = req.headers.get('authorization') || '';
    
    // Log request metadata for debugging
    console.log(`🔍 Request metadata: origin="${origin}", user-agent="${userAgent.substring(0, 50)}...", auth="${authHeader.substring(0, 20)}..."`);
    
    let requestData: { job_id?: string } = {};
    try {
      requestData = await req.json();
      console.log(`📋 Parsed request data: ${JSON.stringify(requestData)}`);
    } catch (error) {
      console.log(`⚠️ No JSON body or parsing error: ${error}. Treating as daily notification.`);
      requestData = {};
    }

    const { job_id } = requestData || {};
    console.log(`🔑 Extracted job_id: ${job_id || 'NONE - will run daily notifications'}`);

    // Check if we're in development environment
    const isDevelopment = Deno.env.get('ENVIRONMENT') === 'development' || 
                          Deno.env.get('NODE_ENV') === 'development' ||
                          Deno.env.get('SUPABASE_ENVIRONMENT') === 'development' ||
                          !Deno.env.get('ENVIRONMENT'); // Default to development if not set

    // Log environment detection for debugging
    console.log(`🔧 Environment check: ENVIRONMENT="${Deno.env.get('ENVIRONMENT')}", NODE_ENV="${Deno.env.get('NODE_ENV')}", isDevelopment=${isDevelopment}`);

    // If job_id provided, do matching for that job (but skip in development)
    if (job_id) {
      if (isDevelopment) {
        console.log(`🚫 Development environment detected - skipping real-time job matching for job ${job_id}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            skipped: true, 
            message: 'Development mode - real-time matching disabled',
            job_id 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // Additional security check: verify the request is from an authorized source
      const isAuthorizedSource = 
        userAgent.includes('Supabase') || 
        userAgent.includes('supabase') ||
        origin.includes(Deno.env.get('SUPABASE_URL') || '') ||
        (authHeader.startsWith('Bearer ') && authHeader.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''));

      if (!isAuthorizedSource) {
        console.log(`🚫 Unauthorized request source detected - skipping real-time job matching for job ${job_id}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Unauthorized - real-time matching requires proper authorization',
            job_id 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
      console.log(`🔍 Matching job ${job_id} to all users...`);

      // Get the job (including application field for email checking)
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('id, role, related_roles, ai_enhanced_roles, skills_required, ai_enhanced_skills, location, experience_level, salary_range, employment_type, sector, posted_date, application')
        .eq('id', job_id)
        .single();

      if (jobError || !job) {
        console.error(`Error fetching job ${job_id}:`, jobError);
        return new Response(
          JSON.stringify({ error: 'Job not found', job_id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      // Check if job has email application method (required for auto-apply)
      const jobHasEmail = hasEmailApplicationMethod({ ...job, application: job.application });
      console.log(`📧 Job ${job_id} has email application method: ${jobHasEmail}`);

      // Get all users with onboarding data
      const { data: users, error: usersError } = await supabase
        .from('onboarding_data')
        .select('user_id, target_roles, cv_skills, preferred_locations, experience_level, salary_min, salary_max, job_type, sector');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      if (!users || users.length === 0) {
        console.log('No users with onboarding data');
        return new Response(
          JSON.stringify({ success: true, message: 'No users to match', matched: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      console.log(`Found ${users.length} users to match against job ${job_id}`);
      console.log(`Job data: role="${job.role}", sector="${job.sector}", location=${JSON.stringify(job.location)}`);

      const jobRow: JobRow = {
        role: job.role,
        related_roles: job.related_roles,
        ai_enhanced_roles: job.ai_enhanced_roles,
        skills_required: job.skills_required,
        ai_enhanced_skills: job.ai_enhanced_skills,
        location: job.location,
        experience_level: job.experience_level,
        salary_range: job.salary_range,
        employment_type: job.employment_type,
        sector: job.sector,
        application: job.application,
      };
      
      console.log(`JobRow: role="${jobRow.role}", sector="${jobRow.sector}"`);

      let matchedCount = 0;
      let savedCount = 0;
      let premiumMatchesCount = 0;

      // Store matches for premium users to sort and rank them
      const premiumUserMatches = new Map<string, MatchResult[]>();

      for (const user of users) {
        try {
          const targetRoles = user.target_roles || [];
          const hasTargetRoles = Array.isArray(targetRoles) && targetRoles.length > 0;
          const hasCvSkills = user.cv_skills && Array.isArray(user.cv_skills) && user.cv_skills.length > 0;

          if (!hasTargetRoles && !hasCvSkills) {
            continue;
          }

          // Handle "null" string case for sector
          let userSector = user.sector;
          if (userSector === 'null' || userSector === null || userSector === undefined) {
            userSector = null;
          }

          const userData: UserOnboardingData = {
            target_roles: targetRoles,
            cv_skills: user.cv_skills || [],
            preferred_locations: user.preferred_locations || [],
            experience_level: user.experience_level || null,
            salary_min: user.salary_min || null,
            salary_max: user.salary_max || null,
            job_type: user.job_type || null,
            sector: userSector,
          };

          // Calculate match score
          const matchResult = scoreJob(jobRow, userData);
          const matchScore = Math.round(matchResult.score);
          matchedCount++;
          
          // Log matching summary for this user (grouped together)
          console.log(`\n👤 User ${user.user_id}:`);
          console.log(`   Job: role="${jobRow.role}", sector="${jobRow.sector}"`);
          console.log(`   User: target_roles=${JSON.stringify((userData.target_roles || []).slice(0, 3))}..., sector="${userData.sector || 'none'}"`);
          
          // Show detailed breakdown only for scores >= 50
          if (matchScore >= 50) {
            const b = matchResult.breakdown;
            console.log(`   📊 Score Breakdown: Roles=${b.roles}, Skills=${b.skills}, Sector=${b.sector}, Location=${b.location}, Experience=${b.experience}, Salary=${b.salary}, Type=${b.type} | R+S+S capped=${b.rsCapped} | Total=${b.total}`);
          }
          
          console.log(`   ✅ Final Match Score: ${matchScore}%`);

          // ONLY save matches >= 50%
          if (matchScore >= 50) {
            // Check if user has premium subscription
            const premiumSub = await getUserPremiumSubscription(supabase, user.user_id);
            
            if (premiumSub && jobHasEmail) {
              // Store match for premium user (will be sorted and ranked later)
              if (!premiumUserMatches.has(user.user_id)) {
                premiumUserMatches.set(user.user_id, []);
              }
              premiumUserMatches.get(user.user_id)!.push({
                user_id: user.user_id,
                job_id: job.id,
                match_score: matchScore,
              });
              console.log(`   💎 Premium user - match stored for ranking (plan: ${premiumSub.plan_type})`);
            }

            // Save match to server_match_results (all users, premium or not)
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
            const { error: saveError } = await supabase
              .from('server_match_results')
              .insert({
                user_id: user.user_id,
                job_id: job.id,
                match_score: matchScore,
                notification_sent: false,
                notification_date: today,
                computed_at: new Date().toISOString(),
              })
              .select();
            
            // If insert fails due to duplicate, try update instead
            if (saveError && saveError.code === '23505') {
              const { error: updateError } = await supabase
                .from('server_match_results')
                .update({
                  match_score: matchScore,
                  notification_date: today,
                  computed_at: new Date().toISOString(),
                })
                .eq('user_id', user.user_id)
                .eq('job_id', job.id);
              
              if (updateError) {
                console.error(`Error updating match for user ${user.user_id}:`, updateError);
              } else {
                savedCount++;
              }
            } else if (saveError) {
              console.error(`Error saving match for user ${user.user_id}:`, saveError);
            } else {
              savedCount++;
            }
          }
        } catch (error) {
          console.error(`Error processing user ${user.user_id}:`, error);
        }
      }

      // Process premium users: sort matches and mark top N for auto-apply
      console.log(`\n💎 Processing ${premiumUserMatches.size} premium users for auto-apply ranking...`);
      
      for (const [userId, matches] of premiumUserMatches.entries()) {
        try {
          const premiumSub = await getUserPremiumSubscription(supabase, userId);
          if (!premiumSub) {
            console.log(`   ⚠️ User ${userId}: Premium subscription not found, skipping auto-apply ranking`);
            continue;
          }

          // Sort matches by score (descending)
          const sortedMatches = matches.sort((a, b) => b.match_score - a.match_score);
          
          // Get top N based on plan type
          const topN = getTopJobsForPlan(premiumSub.plan_type);
          const topMatches = sortedMatches.slice(0, topN);

          console.log(`   👤 User ${userId} (${premiumSub.plan_type}): ${matches.length} matches, selecting top ${topMatches.length} for auto-apply`);

          // Mark top matches as auto-apply eligible
          for (let i = 0; i < topMatches.length; i++) {
            const match = topMatches[i];
            const rank = i + 1; // 1-based ranking

            const { error: updateError } = await supabase
              .from('server_match_results')
              .update({
                is_auto_apply_eligible: true,
                auto_apply_rank: rank,
                plan_type: premiumSub.plan_type,
                queued_for_auto_apply_at: new Date().toISOString(),
              })
              .eq('user_id', match.user_id)
              .eq('job_id', match.job_id)
              .eq('notification_date', new Date().toISOString().split('T')[0]);

            if (updateError) {
              console.error(`   ❌ Error marking match for auto-apply (user ${userId}, job ${match.job_id}):`, updateError);
            } else {
              premiumMatchesCount++;
              console.log(`   ✅ Marked job ${match.job_id} as auto-apply eligible (rank ${rank})`);
            }
          }
        } catch (error) {
          console.error(`Error processing premium matches for user ${userId}:`, error);
        }
      }

      console.log(`✅ Matched job ${job_id} to ${matchedCount} users, saved ${savedCount} results (>= 50%), marked ${premiumMatchesCount} premium matches for auto-apply`);

      // Cleanup old matches (older than 72 hours)
      try {
        const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
        await supabase
          .from('server_match_results')
          .delete()
          .lt('computed_at', seventyTwoHoursAgo);
        console.log(`🧹 Cleaned up matches older than 72 hours`);
      } catch (cleanupError) {
        console.error('Error in cleanup:', cleanupError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          job_id,
          matched: matchedCount,
          saved: savedCount,
          premium_auto_apply_marked: premiumMatchesCount,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Otherwise, do daily notifications (unchanged logic for now)
    console.log('🚀 Starting daily job notifications process...');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Step 1: Get all users with notifications enabled and onboarding data
    console.log('📋 Fetching users with notifications enabled...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, notifications_enabled')
      .eq('notifications_enabled', true);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log('No users with notifications enabled');
      return new Response(
        JSON.stringify({ success: true, message: 'No users to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Found ${users.length} users with notifications enabled`);

    // Step 2: Get jobs posted today (to filter matches)
    console.log('📋 Fetching jobs posted today...');
    const { data: todayJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id')
      .eq('posted_date', today);

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
      throw jobsError;
    }

    if (!todayJobs || todayJobs.length === 0) {
      console.log('No jobs posted today');
      return new Response(
        JSON.stringify({ success: true, message: 'No jobs posted today', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const todayJobIds = todayJobs.map(j => j.id);
    console.log(`Found ${todayJobIds.length} jobs posted today`);

    // Step 3: Process each user - READ saved matches from server_match_results
    let processedCount = 0;
    let notificationCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Get user's push token
        const { data: pushTokenData, error: pushTokenError } = await supabase
          .from('user_push_tokens')
          .select('expo_push_token')
          .eq('user_id', user.id)
          .single();

        if (pushTokenError || !pushTokenData || !pushTokenData.expo_push_token) {
          console.log(`Skipping user ${user.id}: No push token`);
          continue;
        }

        // Get user's viewed jobs
        const { data: viewedJobs, error: viewedError } = await supabase
          .from('user_viewed_jobs')
          .select('job_id')
          .eq('user_id', user.id);

        if (viewedError) {
          console.error(`Error fetching viewed jobs for user ${user.id}:`, viewedError);
          continue;
        }

        const viewedJobIds = new Set((viewedJobs || []).map(vj => vj.job_id));

        // READ saved matches for today's jobs (already calculated when jobs were posted)
        const { data: savedMatches, error: matchesError } = await supabase
          .from('server_match_results')
          .select('job_id, match_score')
          .eq('user_id', user.id)
          .in('job_id', todayJobIds)
          .eq('notification_sent', false)
          .gte('match_score', 50);

        if (matchesError) {
          console.error(`Error fetching saved matches for user ${user.id}:`, matchesError);
          continue;
        }

        if (!savedMatches || savedMatches.length === 0) {
          console.log(`User ${user.id}: No matches >= 50% for today's jobs`);
          continue;
        }

        // Filter out already viewed jobs
        const matches = savedMatches
          .filter(m => !viewedJobIds.has(m.job_id))
          .map(m => ({ jobId: m.job_id, score: m.match_score }));

        if (matches.length === 0) {
          console.log(`User ${user.id}: All matches already viewed`);
          continue;
        }

        console.log(`User ${user.id}: Found ${matches.length} matches (threshold: >= 50%)`);

        // Send notification if there are matches
        if (matches.length > 0) {
          const message = matches.length === 1
            ? `You have 1 new job match! Check to apply.`
            : `You have ${matches.length} new job matches! Check to apply.`;

          const notificationSent = await sendExpoPushNotification(
            pushTokenData.expo_push_token,
            message
          );

          // Mark matches as notification sent
          const jobIds = matches.map(m => m.jobId);
          await supabase
            .from('server_match_results')
            .update({ 
              notification_sent: true,
              notification_sent_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .in('job_id', jobIds);

          // Log notification result
          const { error: logError } = await supabase
            .from('daily_notification_log')
            .upsert({
              user_id: user.id,
              notification_date: today,
              jobs_matched_count: matches.length,
              notification_sent: notificationSent,
              sent_at: notificationSent ? new Date().toISOString() : null,
              error_message: notificationSent ? null : 'Failed to send push notification',
            }, {
              onConflict: 'user_id,notification_date',
            });

          if (logError) {
            console.error(`Error logging notification for user ${user.id}:`, logError);
          }

          if (notificationSent) {
            notificationCount++;
            console.log(`✅ Sent notification to user ${user.id}: ${matches.length} matches`);
          } else {
            errorCount++;
            console.error(`❌ Failed to send notification to user ${user.id}`);
          }
        } else {
          console.log(`User ${user.id}: No matches >= 50% found. All job scores were below threshold.`);
          const { error: logError } = await supabase
            .from('daily_notification_log')
            .upsert({
              user_id: user.id,
              notification_date: today,
              jobs_matched_count: 0,
              notification_sent: false,
              sent_at: null,
              error_message: 'No matches >= 50%',
            }, {
              onConflict: 'user_id,notification_date',
            });

          if (logError) {
            console.error(`Error logging no matches for user ${user.id}:`, logError);
          }
        }

        processedCount++;
      } catch (error) {
        errorCount++;
        console.error(`Error processing user ${user.id}:`, error);
        
        try {
          await supabase
            .from('daily_notification_log')
            .upsert({
              user_id: user.id,
              notification_date: today,
              jobs_matched_count: 0,
              notification_sent: false,
              sent_at: null,
              error_message: error instanceof Error ? error.message : String(error),
            }, {
              onConflict: 'user_id,notification_date',
            });
        } catch (logError) {
          console.error('Error logging error:', logError);
        }
      }
    }

    console.log(`✅ Processed ${processedCount} users, sent ${notificationCount} notifications, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        notifications_sent: notificationCount,
        errors: errorCount,
        jobs_checked: todayJobIds.length,
        date: today,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Fatal error in daily job notifications:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

