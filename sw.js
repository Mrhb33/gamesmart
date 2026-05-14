// ============================================================================
// Cerebrum Quest — Service Worker
// ============================================================================
// Data version: 2026-05-14 — bump when data files change for cache busting
const CACHE_VERSION = 'v15';
const CACHE_NAME = `cerebrum-${CACHE_VERSION}`;
const DATA_VERSION = '2026-05-14';

// Core assets that must be cached during install for offline support.
const CORE_ASSETS = [
  './main.html',
  './styles.css',
  './src/settings.js',
  './src/i18n.js',
  './src/state.js',
  './src/data.js',
  './src/audio.js',
  './src/ui.js',
  './src/game.js',
  './src/screens.js',
  './manifest.json',
  './questions.json',
  './levels_metadata.json',
];

// External CDN assets — cached on first successful fetch.
const CDN_ASSETS = [
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
];

// ---- Install ----
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        cache.addAll(CDN_ASSETS).catch(err => {
          console.warn('[SW] CDN pre-cache failed (non-fatal):', err.message);
        });
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// ---- Activate ----
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names
          .filter(n => n !== CACHE_NAME)
          .map(n => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

// ---- Message ----
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ---- Fetch ----
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.pathname.endsWith('/sw.js')) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match('./main.html'))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    // For data files, always try network first to detect stale data
    if (url.pathname.endsWith('.json')) {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
              const headers = new Headers(response.headers);
              headers.set('X-Data-Version', DATA_VERSION);
              return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
            }
            return response;
          })
          .catch(() => {
            // Offline — serve cached data and notify about potential staleness
            return caches.match(event.request).then(cached => {
              if (cached) {
                const headers = new Headers(cached.headers);
                headers.set('X-Data-Version', DATA_VERSION);
                headers.set('X-Served-From-Cache', 'true');
                return new Response(cached.body, { status: cached.status, statusText: cached.statusText, headers });
              }
              return new Response(JSON.stringify({ error: 'offline' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            });
          })
      );
      return;
    }
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.ok && response.type !== 'opaque') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(r => r || new Response('Offline', { status: 503 })))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || !response.ok || response.type === 'opaque') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // Offline fallback for external CDN requests (fonts, icons)
        const accept = event.request.headers.get('Accept') || '';
        if (accept.includes('text/css')) return new Response('/* offline */', { status: 200, headers: { 'Content-Type': 'text/css' } });
        if (accept.includes('font') || url.pathname.endsWith('.woff2') || url.pathname.endsWith('.woff') || url.pathname.endsWith('.ttf')) {
          return new Response('', { status: 200, headers: { 'Content-Type': 'font/woff2' } });
        }
        return new Response('', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      });
    })
  );
});
