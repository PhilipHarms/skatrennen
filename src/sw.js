/* Offline-Modus fuer Naunins Skatrennen.
   Seite: erst Netz (damit Updates sofort ankommen), ohne Netz aus dem Speicher.
   Schriften und Bilder: aus dem Speicher. */
const CACHE = '__CACHE__';
const FILES = __FILES__;

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
