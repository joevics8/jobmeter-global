import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendNotification } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Protect with secret key - only allow authorized cron jobs
    const secretKey = request.nextUrl.searchParams.get('key');
    const cronSecret = process.env.CRON_SECRET_KEY;

    if (secretKey !== cronSecret) {
      console.log('🚫 Unauthorized notification attempt blocked');
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Missing or invalid secret key' 
      }, { status: 401 });
    }
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, slug, company')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);

    if (jobsError) {
      return NextResponse.json({ error: 'Failed to fetch jobs', details: jobsError }, { status: 500 });
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ error: 'No jobs found' }, { status: 404 });
    }

    const { data: tokens, error: tokensError } = await supabase
      .from('notification_tokens')
      .select('token, updated_at, last_used_at, user_id');

    if (tokensError) {
      return NextResponse.json({ error: 'Failed to fetch tokens', details: tokensError }, { status: 500 });
    }

    if (!tokens || tokens.length === 0) {
      console.log('ℹ️ No tokens found in notification_tokens table');
      return NextResponse.json({ 
        success: true, 
        message: 'No notification tokens available',
        notificationsSent: 0 
      });
    }

    // Log token details for debugging
    console.log(`📋 Found ${tokens.length} tokens:`);
    tokens.forEach((token, index) => {
      console.log(`  ${index + 1}. Token: ${token.token.substring(0, 20)}... User: ${token.user_id} Updated: ${token.updated_at}`);
    });

    // Send ONE summary notification
    const title = `${jobs.length} New Jobs Posted Today! 🎉`;
    const topJobs = jobs.slice(0, 3).map(j => j.title).join(', ');
    const body = jobs.length > 3 
      ? `${topJobs} and ${jobs.length - 3} more...` 
      : topJobs;
    
    const data = {
      url: '/jobs',
      jobCount: jobs.length.toString(),
      tag: 'daily-jobs-summary',
    };

    let successCount = 0;
    let failCount = 0;

    for (const { token } of tokens) {
      const result = await sendNotification(token, title, body, data);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
        
        // If token is invalid (not registered), remove it from database
        if (result.error && (result.error.toString().includes('not-registered') || 
                           result.error.toString().includes('registration-token-not-registered'))) {
          console.log(`🗑️ Removing invalid token: ${token.substring(0, 20)}...`);
          await supabase
            .from('notification_tokens')
            .delete()
            .eq('token', token);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      jobCount: jobs.length,
      notificationsSent: successCount,
      failed: failCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}