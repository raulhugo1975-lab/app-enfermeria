// Service Worker para EnferApp PWA
// Estrategia: Cache-First para assets estáticos, Network-First para API calls

const CACHE_NAME = 'enferapp-v1';
const STATIC_ASSETS = [
  '/',
  '/estudio',
  '/examen',
  '/mis-notas',
  '/manifest.json',
];

// Install: pre-cachear assets básicos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Error cacheando assets estáticos:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Cache-First para assets, Network-First para API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar extensiones de Chrome y requests no-HTTP
  if (!url.protocol.startsWith('http')) return;

  // Network-First para llamadas API (no cachear)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Sin conexión a internet.' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  // Cache-First para el resto
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then((response) => {
        // Solo cachear respuestas válidas de nuestro origen
        if (response.status === 200 && url.origin === self.location.origin) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
        }
        return response;
      });
    })
  );
});
