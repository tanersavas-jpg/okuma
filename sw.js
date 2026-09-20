/* Okuma — Service Worker (çevrimdışı önbellek)
   Uygulama kabuğunu önbelleğe alır; çevrimdışı açılır.
   Dosyalar değişince CACHE sürümünü artır (okuma-v2, v3 ...). */
const CACHE = "okuma-v13";
const KABUK = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(KABUK)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        const url = new URL(req.url);
        if (url.origin === location.origin) {
          const kopya = res.clone();
          caches.open(CACHE).then((c) => c.put(req, kopya));
        }
        return res;
      }).catch(() => caches.match("./index.html")); // çevrimdışı geri düşüş
    })
  );
});
