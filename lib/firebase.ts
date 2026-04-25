import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    if (typeof window === 'undefined') return null;

    const messagingSupported = await isSupported();
    if (!messagingSupported) {
      console.log('Messaging not supported');
      return null;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const messaging = getMessaging(app);
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      console.log('✅ FCM Token obtained:', token);
      return token;
    } else {
      console.log('❌ Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
}

export async function setupForegroundNotifications(callback: (payload: any) => void) {
  try {
    if (typeof window === 'undefined') return;

    const messagingSupported = await isSupported();
    if (!messagingSupported) return;

    const messaging = getMessaging(app);
    
    onMessage(messaging, (payload) => {
      console.log('📬 Foreground notification received:', payload);
      callback(payload);
    });
  } catch (error) {
    console.error('Error setting up foreground notifications:', error);
  }
}