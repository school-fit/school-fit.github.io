/* SCHOOL FIT — PWA cache; obrázky vždy z networku (až nahraješ pictures/ na server) */
const CACHE = 'school-fit-pwa-v7';
const PRECACHE = ['index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

function scopeUrl(path) {
  return new URL(path, self.registration.scope).href;
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(
        PRECACHE.map((p) =>
          cache.add(scopeUrl(p)).catch(() => {})
        )
      )
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  /* SVG/PNG návodů neskládáme do cache — po nahrání pictures/ na Git se hned projeví */
  if (url.pathname.includes('/pictures/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(scopeUrl('index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((hit) => hit || fetch(event.request))
  );
});
