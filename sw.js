const CACHE_NAME = 'cerebrum-v7';
const PRECACHE_ASSETS = ['./main.html', './manifest.json', './questions.json', './levels_metadata.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      cache.addAll([
        'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@400;600;700;800&display=swap',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
      ]).catch(() => {});
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Delete ALL old caches so stale data can never trap users
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  let url = new URL(event.request.url);

  // Navigation requests: network first, cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(response => {
        let clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match('./main.html'))
    );
    return;
  }

  // sw.js itself: always fetch from network (never cache the service worker)
  if (url.pathname.endsWith('/sw.js')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Own assets: network first, cache fallback
  // This ensures users get fresh content on every load while still working offline
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.status === 200) {
          let clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() =>
        caches.match(event.request)
      )
    );
    return;
  }

  // External assets (fonts, CDN): cache first, then network
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        let clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
