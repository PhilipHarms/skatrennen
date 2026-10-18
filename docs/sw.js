/* Offline-Modus fuer Naunins Skatrennen.
   Seite: erst Netz (damit Updates sofort ankommen), ohne Netz aus dem Speicher.
   Schriften und Bilder: aus dem Speicher. */
const CACHE = 'skatrennen-1.3-818694d7c9';
const FILES = ["./", "fonts/jacquard-24-latin-400-normal.woff2", "fonts/pixelify-sans-latin-400-normal.woff2", "fonts/pixelify-sans-latin-600-normal.woff2", "fonts/pixelify-sans-latin-700-normal.woff2", "fonts/press-start-2p-latin-400-normal.woff2", "icons/apple-touch-icon.png", "icons/favicon-48.png", "icons/favicon-96.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "manifest.webmanifest"];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('skatrennen-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function fromNetwork(req) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), 4000);
    fetch(req).then(res => { clearTimeout(t); resolve(res); }, err => { clearTimeout(t); reject(err); });
  });
}

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    ev.respondWith(
      fromNetwork(req)
        .then(res => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./', copy)); }
          return res;
        })
        .catch(() => caches.match('./'))
    );
    return;
  }
  ev.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
