import { NextRequest, NextResponse } from 'next/server';
import { handleSuccessfulPayment } from '@/lib/services/paymentService';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    // Verify the request actually came from Paystack
    if (hash !== req.headers.get('x-paystack-signature')) {
      return new NextResponse('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(body);

    // Only process successful charges
    if (event.event === 'charge.success') {
      await handleSuccessfulPayment(event.data);
    }

    return new NextResponse('Webhook Received', { status: 200 });
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }
}