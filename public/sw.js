const CACHE_NAME = "carbonsense-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/src/main.tsx",
  "/src/App.tsx",
  "/src/index.css",
  "/src/assets/images/healthy_earth_1781010556530.png",
  "/src/assets/images/polluted_earth_1781010577732.png"
];

// Install Event
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[CarbonSense Service Worker] Pre-caching Core Cockpit Shell");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[CarbonSense Service Worker] Erasing depreciated grid systems:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Offline fallbacks for shell & images)
self.addEventListener("fetch", (e) => {
  // Avoid caching non-GET or cross-origin requests like Firebase or local api endpoints
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Fetch from network, cache on the fly
      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Safe offline response for primary routes
        if (e.request.mode === "navigate") {
          return caches.match("/index.html");
        }
        return new Response("CarbonSense Cockpit Offline. Standing by...", {
          status: 503,
          statusText: "Service Unavailable Offline"
        });
      });
    })
  );
});
