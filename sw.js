const CACHE_NAME = 'next-train-cache-v1';
const urlsToCache = [
  '/', // Cache the root directory (served by GitHub Pages)
  '/next-train-commute/', // Explicitly cache the start URL
  '/next-train-commute/index.html',
  '/next-train-commute/style.css',
  '/next-train-commute/script.js',
  '/next-train-commute/manifest.json'
  // Add paths to icons once created, e.g., '/next-train-commute/icon-192x192.png'
];

// Install event: Cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // AddAll can fail if any single resource fails to fetch
        return cache.addAll(urlsToCache).catch(error => {
          console.error('Failed to cache resources during install:', error);
          // Optional: Handle specific errors or skip caching problematic resources
        });
      })
  );
});

// Fetch event: Serve cached assets first, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
