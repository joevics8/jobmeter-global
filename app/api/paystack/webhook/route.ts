import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { handleSuccessfulPayment } from '@/lib/services/paymentService';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    // Verify webhook signature (security)
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Only process successful charge events
    if (event.event === 'charge.success') {
      await handleSuccessfulPayment(event.data);
      console.log('Webhook: Credits added successfully for', event.data.reference);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}