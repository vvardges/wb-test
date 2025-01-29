const CACHE_NAME = 'wb-orders-cache-v1';
const API_URL = 'https://statistics-api.wildberries.ru/api/v1/supplier/orders?dateFrom=2024-12-01';
const CACHE_EXPIRY = 60 * 60 * 1000; // Cache expiry time (1 hour)

self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Check if the fetch is for the API URL
    if (event.request.url === API_URL) {
        event.respondWith(
            // Try to fetch the data from the network
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    // Cache the new data if request is successful
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                    return response;
                })
                .catch(() => {
                    // If network fails, check the cache
                    return caches.match(event.request).then((cachedResponse) => {
                        if (cachedResponse) {
                            console.log('Serving cached data');
                            return cachedResponse;
                        }
                        throw new Error('No cached data available');
                    });
                })
        );
    }
});
