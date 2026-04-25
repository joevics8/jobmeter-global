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

    const { data: tokens } = await supabase
      .from('notification_tokens')
      .select('token');

    if (!tokens || tokens.length === 0) {
      console.log('ℹ️ No tokens found in notification_tokens table');
      return NextResponse.json({ 
        success: true, 
        message: 'No notification tokens available',
        notificationsSent: 0 
      });
    }

    let successCount = 0;

    const title = '💼 Boost Your Interview Skills';
    const body = 'Practice common interview questions and ace your next interview!';
    const data = { url: '/interview-practice', tag: 'interview-tip' };

    for (const { token } of tokens) {
      const result = await sendNotification(token, title, body, data);
      if (result.success) successCount++;
    }

    return NextResponse.json({
      success: true,
      tipSent: 'Interview Practice',
      notificationsSent: successCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}