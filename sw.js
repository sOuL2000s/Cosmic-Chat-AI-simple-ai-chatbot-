const CACHE_NAME = 'cosmic-chat-v5'; // Increment cache version
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/star.png', // Your app icon
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
    'https://unpkg.com/lucide@latest',
    // Google Fonts
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&display=swap',
    'https://fonts.gstatic.com', // For font files themselves
    // Add any other static assets (images, fonts, etc.) that your app uses
];

// Install event: Caches all the static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Failed to cache:', error);
            })
    );
});

// Fetch event: Intercepts network requests and serves from cache if available
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // No cache hit - fetch from network
                return fetch(event.request).then(
                    (response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and can only be consumed once. We consume it once to cache it,
                        // and once the browser consumes it.
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
            .catch((error) => {
                console.error('Fetch failed:', error);
                // You could return an offline page here if desired
                // For example: return caches.match('/offline.html');
            })
    );
});

// Activate event: Cleans up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName); // Delete old caches
                    }
                })
            );
        })
    );
});
