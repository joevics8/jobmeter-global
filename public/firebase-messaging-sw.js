importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDuwib21LFI9hdkAMJ1L1iyddnYv3Llmyc',
  authDomain: 'jobmeter-3a05f.firebaseapp.com',
  projectId: 'jobmeter-3a05f',
  storageBucket: 'jobmeter-3a05f.firebasestorage.app',
  messagingSenderId: '513719973107',
  appId: '1:513719973107:web:b9c85fb27e3f8cc89cf386',
  measurementId: 'G-315B0S5RGE',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('📬 Background notification:', payload);
  
  const notificationTitle = payload.notification?.title || 'JobMeter';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    tag: payload.data?.tag || 'jobmeter-notification',
    data: payload.data,
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };

  console.log('🔔 Attempting to show notification:', notificationTitle);
  
  // Check if notification permission is granted
  if (Notification.permission === 'granted') {
    self.registration.showNotification(notificationTitle, notificationOptions)
      .then(() => console.log('✅ Notification displayed successfully'))
      .catch(err => console.error('❌ Failed to display notification:', err));
  } else {
    console.error('❌ Notification permission not granted:', Notification.permission);
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.notification);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/jobs';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (let client of windowClients) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});