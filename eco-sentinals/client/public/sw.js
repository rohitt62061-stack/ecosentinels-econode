const CACHE_NAME = 'econode-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Special handling for Supabase edge functions or RPCs if offline
  if (event.request.url.includes('supabase.co')) {
     event.respondWith(
        fetch(event.request)
           .then(response => {
              // Clone and cache the response
              const resClone = response.clone();
              caches.open('econode-api-cache').then(cache => {
                 cache.put(event.request, resClone);
              });
              return response;
           })
           .catch(() => {
              // Fallback to cache if network fails
              return caches.match(event.request).then(res => {
                  if (res) return res;
                  // Return custom offline JSON if it is AQI reading
                  return new Response(JSON.stringify({ 
                     offline: true, 
                     aqi_value: 0, 
                     ward_name: "Offline Mode", 
                     suggestion_text: "You are offline. Showing last known air quality metrics."
                  }), { headers: { 'Content-Type': 'application/json' } });
              });
           })
     );
     return;
  }

  // Standard static caching fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
