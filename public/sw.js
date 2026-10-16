// v2: adds the offline page and caps the static cache. Changing CACHE makes
// the activate step below drop the old cache once, including the chunks v1
// collected from every deploy and never let go of.
const CACHE = "lan-pya-public-v2";
const OFFLINE = "/offline.html";
const PUBLIC_ASSETS = [
  "/favicon.svg",
  "/manifest.webmanifest",
  "/lan-pya-logo.jpg",
  OFFLINE
];
// Hashed chunks from old deploys are never asked for again; past this many
// entries the oldest go, so the cache cannot grow without end on a phone.
const MAX_ENTRIES = 160;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PUBLIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
    // Starts the page request while the worker boots, so routing navigations
    // through it does not add a delay.
    self.registration.navigationPreload ? self.registration.navigationPreload.enable() : null,
  ]));
  self.clients.claim();
});

async function trim(cache) {
  const keys = await cache.keys();
  const statics = keys.filter((request) => new URL(request.url).pathname.startsWith("/_next/static/"));
  await Promise.all(statics.slice(0, Math.max(0, statics.length - MAX_ENTRIES)).map((request) => cache.delete(request)));
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Pages always come from the network and are never stored: signed-in pages
  // hold personal data and phones are shared. Only when the network fails is
  // the static offline page shown instead of the browser's error.
  if (request.mode === "navigate") {
    if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;
    event.respondWith((async () => {
      try {
        return (await event.preloadResponse) || (await fetch(request));
      } catch {
        return (await caches.match(OFFLINE)) || Response.error();
      }
    })());
    return;
  }

  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.includes("/app/") ||
    url.pathname.includes("/proof/view/")
  ) return;

  // /fonts holds the self-hosted Padauk files, named by version like /_next/static.
  const cacheable = PUBLIC_ASSETS.includes(url.pathname) || url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/fonts/");
  if (!cacheable) return;
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok && response.type === "basic") {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy).then(() => trim(cache)));
      }
      return response;
    }))
  );
});
