// lib/services/paymentService.ts

import { supabaseAdmin } from '@/lib/supabase-server';

export interface InitializePaymentParams {
  email: string;
  amount: number;
  userId: string;
  paymentType: 'subscription' | 'credits';
  planId?: string;
  planType?: string;
  creditAmount?: number;
  metadata?: Record<string, any>;
  callback_url?: string;
}

export interface PaymentResult {
  success: boolean;
  reference?: string;
  authorizationUrl?: string;
  message?: string;
  error?: string;
}

/**
 * Initializes a transaction with Paystack and records a pending transaction in Supabase.
 * Includes a fix for the 22P02 UUID error by validating the planId format.
 */
export async function initializePayment(params: InitializePaymentParams): Promise<PaymentResult> {
  const { email, amount, userId, paymentType, planId, planType, creditAmount, metadata, callback_url } = params;

  // FIX: Catch missing env vars early and surface a clear error instead of
  // sending "Bearer undefined" to Paystack (which causes a silent auth failure
  // and returns { status: false } with no authorizationUrl).
  if (!process.env.PAYSTACK_SECRET_KEY) {
    console.error('[initializePayment] PAYSTACK_SECRET_KEY is not set in environment variables.');
    return { success: false, error: 'Payment service is not configured. Please contact support.' };
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    console.error('[initializePayment] NEXT_PUBLIC_APP_URL is not set in environment variables.');
    return { success: false, error: 'App URL is not configured. Please contact support.' };
  }

  try {
    const reference = `JP_${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Paystack expects amount in kobo
        reference,
        callback_url: callback_url || `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
        metadata: {
          user_id: userId,
          payment_type: paymentType,
          plan_type: planType,
          plan_slug: planId,
          credit_amount: creditAmount,
          ...metadata,
        },
      }),
    });

    const data = await response.json();

    // FIX: Log the full Paystack response when it fails so the actual reason
    // (invalid key, domain not whitelisted, etc.) is visible in server logs.
    if (!data.status) {
      console.error('[initializePayment] Paystack rejected the request:', {
        message: data.message,
        httpStatus: response.status,
      });
      return { success: false, error: data.message || 'Paystack declined the request' };
    }

    // FIX: Validate that Paystack actually returned a checkout URL before
    // proceeding. A missing URL here would propagate to the client and cause
    // a silent redirect to the callback page.
    if (!data.data?.authorization_url) {
      console.error('[initializePayment] Paystack returned no authorization_url:', data);
      return { success: false, error: 'No checkout URL returned by Paystack' };
    }

    // Validate if planId is a valid UUID before inserting into the plan_id column.
    // If it's a slug like 'pro' or 'apply-for-me', we leave plan_id null to avoid DB rejection.
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(planId || '');

    const { error: dbError } = await supabaseAdmin.from('payment_transactions').insert({
      user_id: userId,
      reference: data.data.reference,
      amount,
      payment_type: paymentType,
      status: 'pending',
      plan_id: isUuid ? planId : null,
      plan_type: planType,
      credit_amount: creditAmount,
    });

    if (dbError) {
      console.error('[initializePayment] Database error:', dbError);
      throw new Error(`Failed to record transaction: ${dbError.message}`);
    }

    return {
      success: true,
      reference: data.data.reference,
      authorizationUrl: data.data.authorization_url,
    };
  } catch (error: any) {
    console.error('[initializePayment] Unexpected error:', error);
    return { success: false, error: error.message || 'Failed to initialize payment' };
  }
}

/**
 * Verifies the transaction status with Paystack using the reference.
 */
export async function verifyPayment(reference: string) {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (!data.status) {
      console.error('[verifyPayment] Paystack verification failed:', data.message);
      return { success: false, error: data.message };
    }

    return { success: true, data: data.data };
  } catch (error: any) {
    console.error('[verifyPayment] Error:', error);
    return { success: false, error: error.message || 'Failed to verify payment' };
  }
}

/**
 * Updates user credits and marks the transaction as completed.
 * Uses plan_type to determine how many credits to award.
 */
export async function handleSuccessfulPayment(paymentData: any) {
  const metadata = paymentData.metadata || {};
  const userId = metadata.user_id;
  const paymentType = metadata.payment_type;
  const planType = metadata.plan_type;

  console.log('[handleSuccessfulPayment] Processing:', { userId, paymentType, planType });

  if (!userId) {
    throw new Error('No user_id found in payment metadata');
  }

  let creditsToAdd = 0;
  let allocation = 5;

  if (planType === 'apply_for_me') {
    creditsToAdd = 15;
    allocation = 15;
  } else if (planType === 'pro') {
    creditsToAdd = 30;
    allocation = 30;
  } else if (paymentType === 'credits') {
    creditsToAdd = metadata.credit_amount || 0;
  }

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('user_credits')
    .select('credits_remaining, plan_allocation')
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error(`Error fetching user credits: ${fetchError.message}`);
  }

  if (existing) {
    const newAllocation = (planType === 'pro' || planType === 'apply_for_me')
      ? allocation
      : (existing.plan_allocation ?? 5);

    const { error: updateError } = await supabaseAdmin
      .from('user_credits')
      .update({
        credits_remaining: (existing.credits_remaining ?? 0) + creditsToAdd,
        plan_allocation: newAllocation,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) throw new Error(`Update failed: ${updateError.message}`);
  } else {
    const { error: insertError } = await supabaseAdmin
      .from('user_credits')
      .insert({
        user_id: userId,
        credits_remaining: creditsToAdd + 5,
        plan_allocation: allocation,
        welcome_credits_assigned: true,
      });

    if (insertError) throw new Error(`Insert failed: ${insertError.message}`);
  }

  const { error: txError } = await supabaseAdmin
    .from('payment_transactions')
    .update({ status: 'completed' })
    .eq('reference', paymentData.reference);

  if (txError) {
    console.error('[handleSuccessfulPayment] Transaction status update failed:', txError);
  }

  return { success: true };
}