import { NextRequest, NextResponse } from 'next/server';
import { initializePayment } from '@/lib/services/paymentService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, amount, userId, paymentType, planId, planType, creditAmount, callback_url } = body;

    if (!email || !amount || !userId || !paymentType) {
      return NextResponse.json(
        { error: 'Missing required fields: email, amount, userId, paymentType' },
        { status: 400 }
      );
    }

    if (paymentType === 'subscription' && (!planId || !planType)) {
      return NextResponse.json(
        { error: 'Subscription payments require planId and planType' },
        { status: 400 }
      );
    }

    if (paymentType === 'credits' && !creditAmount) {
      return NextResponse.json(
        { error: 'Credit purchases require creditAmount' },
        { status: 400 }
      );
    }

    const result = await initializePayment({
      email,
      amount,
      userId,
      paymentType,
      planId,
      planType,
      creditAmount,
      callback_url,   // ← Only this was added
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      reference: result.reference,
      authorizationUrl: result.authorizationUrl,
    });
  } catch (error: any) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}