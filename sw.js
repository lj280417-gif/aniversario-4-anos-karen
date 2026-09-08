/**
 * Service Worker para PWA - "Nuestra Historia ❤️"
 * Optimizado para compatibilidad total con iOS Safari y GitHub Pages
 */

const CACHE_NAME = 'nuestra-historia-v5';

// Recursos esenciales pre-cacheados
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/style.css?v=5.0',
  './js/script.js?v=5.0',
  './css/style.css',
  './js/script.js',
  './manifest.json',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/favicon.png'
];

// Instalación: Precargar recursos esenciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activación: Limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercepción de peticiones de red
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // IMPORTANTE PARA iOS SAFARI:
  // Safari utiliza peticiones HTTP Range (206 Partial Content) para audio y video.
  // Las peticiones con header Range o multimedia pesada se deben delegar al navegador directamente.
  if (
    request.headers.get('range') ||
    url.pathname.includes('/assets/music/') ||
    url.pathname.includes('/assets/videos/')
  ) {
    return;
  }

  // Peticiones de navegación (HTML): Network-first para ver siempre las últimas actualizaciones
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match('./index.html') || caches.match('./');
        })
    );
    return;
  }

  // CSS, JS y recursos versionados: Network-first con fallback a caché
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.search.includes('v=')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Recursos estáticos (imágenes, fuentes, etc.): Cache-first con actualización en segundo plano
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Actualizar en segundo plano si hay red
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
