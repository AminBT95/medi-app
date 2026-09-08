const CACHE_NAME = 'mediRappel-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  // Add other static assets as needed
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Implement background sync logic here
  return Promise.resolve();
}

// Push notification handling
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Il est temps de prendre votre médicament',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'taken',
        title: 'Pris',
        icon: '/images/checkmark.png'
      },
      {
        action: 'snooze',
        title: 'Reporter',
        icon: '/images/snooze.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('MediRappel', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'taken') {
    // Handle medication taken
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'snooze') {
    // Handle snooze
    event.waitUntil(
      self.registration.showNotification('MediRappel', {
        body: 'Rappel reporté de 15 minutes',
        icon: '/favicon.ico'
      })
    );
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync for medication reminders
self.addEventListener('periodicsync', event => {
  if (event.tag === 'medication-check') {
    event.waitUntil(checkMedicationReminders());
  }
});

async function checkMedicationReminders() {
  try {
    // This would check for pending medication reminders
    // and show notifications if needed
    const response = await fetch('/api/reminders/today');
    const reminders = await response.json();
    
    reminders.forEach(reminder => {
      if (reminder.status === 'pending') {
        const now = new Date();
        const reminderTime = new Date();
        const [hours, minutes] = reminder.time.split(':');
        reminderTime.setHours(hours, minutes, 0, 0);
        
        // Show notification if it's time
        if (now >= reminderTime) {
          self.registration.showNotification('MediRappel', {
            body: `Il est temps de prendre ${reminder.medicationName}`,
            icon: '/favicon.ico',
            data: {
              reminderId: reminder.id
            }
          });
        }
      }
    });
  } catch (error) {
    console.error('Error checking medication reminders:', error);
  }
}
