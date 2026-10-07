const CACHE = "tic-tac-toe-v3";
const SCOPE = "/tic-tac-toe/";
const ASSETS = [
  `${SCOPE}`,
  `${SCOPE}index.html`,
  `${SCOPE}styles.css`,
  `${SCOPE}game.js`,
  `${SCOPE}manifest.webmanifest`,
  `${SCOPE}icons/icon-180.png`,
  `${SCOPE}icons/icon-192.png`,
  `${SCOPE}icons/icon-512.png`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => caches.match(`${SCOPE}index.html`));
    })
  );
});
