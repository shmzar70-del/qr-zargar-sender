const CACHE_NAME = "qr-zargar-v1";

const FILES_TO_CACHE = [
  "/qr-zargar-sender/",
  "/qr-zargar-sender/index.html",
  "/qr-zargar-sender/manifest.json",
  "/qr-zargar-sender/qrcode.main.js",
  "/qr-zargar-sender/jsQR.js",
  "/qr-zargar-sender/camera.js",
  "/qr-zargar-sender/launchericon-192x192.png",
  "/qr-zargar-sender/launchericon-512x512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
      .catch(() => caches.match("/qr-zargar-sender/index.html"))
  );
});