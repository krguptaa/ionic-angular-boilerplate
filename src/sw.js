// Ionic Boilerplate Service Worker
// Handles caching, offline functionality, and background sync

const CACHE_NAME = 'ionic-boilerplate-v1.0.0';
const API_CACHE_NAME = 'ionic-boilerplate-api-v1.0.0';

// Resources to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icon/favicon.png',
  '/assets/icon/icon-192x192.png',
  '/assets/icon/icon-512x512.png'
];

// API endpoints to cache
const API_CACHE_URLS = [
  '/api/user/profile',
  '/api/app/config'
];

// Files to exclude from cache
const EXCLUDE_FROM_CACHE = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/refresh'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static resources
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);

  // Skip auth endpoints from caching
  if (EXCLUDE_FROM_CACHE.some(endpoint => url.pathname.includes(endpoint))) {
    return fetch(request);
  }

  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
  }

  // Fallback to cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Return offline response
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'You are currently offline. Please check your internet connection.'
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Try network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Network failed for static resource:', request.url);
  }

  // Return offline fallback for HTML pages
  if (request.headers.get('accept').includes('text/html')) {
    const cache = await caches.open(CACHE_NAME);
    return cache.match('/index.html');
  }

  return new Response('', { status: 404 });
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(syncFailedRequests());
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body || 'New notification',
      icon: '/assets/icon/icon-192x192.png',
      badge: '/assets/icon/icon-72x72.png',
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'View'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      requireInteraction: true,
      silent: false
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Ionic Boilerplate', options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event);

  event.notification.close();

  if (event.action === 'view') {
    // Handle view action
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  } else if (event.action === 'dismiss') {
    // Handle dismiss action
    console.log('[SW] Notification dismissed');
  } else {
    // Default action
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Sync failed requests
async function syncFailedRequests() {
  try {
    console.log('[SW] Syncing failed requests');

    // Get stored failed requests from IndexedDB or similar
    // This is a placeholder - implement based on your storage strategy

    // For now, just log
    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Utility function to check if request is cacheable
function isCacheable(request) {
  const url = new URL(request.url);

  // Don't cache API auth endpoints
  if (EXCLUDE_FROM_CACHE.some(endpoint => url.pathname.includes(endpoint))) {
    return false;
  }

  // Don't cache non-GET requests
  if (request.method !== 'GET') {
    return false;
  }

  // Don't cache external resources
  if (!url.origin.includes(self.location.origin)) {
    return false;
  }

  return true;
}

// Clean up old caches periodically
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cleanup') {
    event.waitUntil(cleanupOldCaches());
  }
});

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name =>
    name !== CACHE_NAME &&
    name !== API_CACHE_NAME &&
    (name.startsWith('ionic-boilerplate') || name.startsWith('api-cache'))
  );

  await Promise.all(
    oldCaches.map(cacheName => caches.delete(cacheName))
  );

  console.log('[SW] Cleaned up old caches:', oldCaches);
}