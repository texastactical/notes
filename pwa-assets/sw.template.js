// Service worker for Arthur's Notes (Quartz PWA).
// CACHE_VERSION and PRECACHE_URLS are injected at build time by scripts/inject-pwa.mjs.
const CACHE_VERSION = "__CACHE_VERSION__";
const CACHE_NAME = "arthurs-notes-" + CACHE_VERSION;
const PRECACHE_URLS = __PRECACHE_URLS__;

// Install: precache the whole site so it works fully offline.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS.map((u) => new Request(u, { cache: "reload" }))).catch(() => {})
    ).then(() => self.skipWaiting())
  );
});

// Activate: drop old caches.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: stale-while-revalidate for same-origin GET; navigations fall back to
// the cached page (or /index.html) when offline.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((r) => r || caches.match("/index.html") || caches.match("/"))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
