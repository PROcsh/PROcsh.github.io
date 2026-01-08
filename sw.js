const CACHE_NAME = "rescue-gps-v1";

const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.9.0/proj4.js",
  "https://cdnjs.cloudflare.com/ajax/libs/mgrs/1.0.0/mgrs.min.js"
];

self.addEventListener("install", e=>{
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache=>cache.addAll(FILES))
  );
});

self.addEventListener("fetch", e=>{
  e.respondWith(
    caches.match(e.request).then(res=>res||fetch(e.request))
  );
});
