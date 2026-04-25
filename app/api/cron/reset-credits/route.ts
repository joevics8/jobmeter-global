// app/api/cron/reset-credits/route.ts
// https://yourdomain.com/api/cron/reset-credits


import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { error } = await supabase.rpc('reset_monthly_credits');
  
  if (error) {
    console.error(error);
    return Response.json({ success: false }, { status: 500 });
  }

  return Response.json({ success: true });
}