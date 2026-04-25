import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment, handleSuccessfulPayment } from '@/lib/services/paymentService';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 });
    }

    // Idempotency guard: if this reference is already completed, don't double-credit
    const { data: existingTx } = await supabaseAdmin
      .from('payment_transactions')
      .select('status, plan_id, plan_type')
      .eq('reference', reference)
      .single();

    if (existingTx?.status === 'completed') {
      console.log(`[route] Payment ${reference} already processed. Skipping.`);
      return NextResponse.json({
        success: true,
        planId: existingTx.plan_id ?? 'apply-for-me',
        message: 'Payment already processed',
      });
    }

    // Verify with Paystack
    const result = await verifyPayment(reference);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const paymentData = result.data;

    if (paymentData.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment not successful', status: paymentData.status },
        { status: 400 }
      );
    }

    // Award credits + mark transaction complete
    await handleSuccessfulPayment(paymentData);

    const planId = paymentData.metadata?.plan_id ?? 'apply-for-me';

    return NextResponse.json({
      success: true,
      planId,
      message: 'Payment verified and processed successfully',
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}