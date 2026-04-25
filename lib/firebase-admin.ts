import * as admin from 'firebase-admin';

// Validate environment variables
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Missing Firebase environment variables:');
  console.error('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', !!projectId);
  console.error('FIREBASE_CLIENT_EMAIL:', !!clientEmail);
  console.error('FIREBASE_PRIVATE_KEY:', !!privateKey);
  throw new Error('Firebase configuration missing');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export const messaging = admin.messaging();

export async function sendNotification(
  token: string,
  title: string,
  body: string,
  data?: { [key: string]: string }
) {
  try {
    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: data || {},
      webpush: {
        notification: {
          icon: '/android-chrome-192x192.png',
          badge: '/android-chrome-192x192.png',
          vibrate: [200, 100, 200],
        },
      },
    };

    const response = await messaging.send(message);
    console.log('✅ Notification sent:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return { success: false, error };
  }
}