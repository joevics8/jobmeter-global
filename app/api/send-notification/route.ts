import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { token, title, body, data } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const result = await sendNotification(token, title, body, data);

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}