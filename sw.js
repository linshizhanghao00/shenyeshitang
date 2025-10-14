const CACHE = "night-diner-v2";
const CORE = ["./","./index.html","./manifest.webmanifest","./menu.json","./icons/icon-192.png","./icons/icon-512.png","./icons/maskable-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => { e.respondWith(fetch(e.request).then(r => { const copy=r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request))); });
