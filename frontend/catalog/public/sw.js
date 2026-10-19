/* Catalog service worker: makes the app installable, quick to start and
 * friendly offline. Registered by src/pwa.ts (production builds only).
 *
 * - Pages and page data: network first, so a deploy shows up right away;
 *   the last copy (or the offline page) when there's no network.
 * - Hashed build files (/assets/, /chunks/): cache first, they never change.
 * - Same-origin images and fonts: from cache, refreshed in the background.
 * - The API, other origins and non-GET requests are never touched.
 *
 * Bump VERSION to drop every cache on the next visit.
 */
const VERSION = "v1";
const PAGES = `catalog-pages-${VERSION}`;
const STATIC = `catalog-static-${VERSION}`;
const MEDIA = `catalog-media-${VERSION}`;
const OFFLINE_PAGES = ["/offline", "/hu/offline"];
const MAX_ENTRIES = { [PAGES]: 40, [STATIC]: 120, [MEDIA]: 80 };

self.addEventListener("install", (event) => {
  event.waitUntil(precacheOfflinePages().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  const current = new Set([PAGES, STATIC, MEDIA]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("catalog-") && !current.has(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname === "/sw.js") return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, PAGES, offlinePage(url)));
  } else if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/chunks/")) {
    event.respondWith(cacheFirst(request, STATIC));
  } else if (request.destination === "image" || request.destination === "font") {
    event.respondWith(staleWhileRevalidate(event, request, MEDIA));
  } else {
    // Page data for client-side navigation (*.pageContext.json) and the rest.
    event.respondWith(networkFirst(request, PAGES));
  }
});

// The offline pages and the build files they load (scripts, styles,
// fonts), so they also work when nothing else was cached yet. Some hosts
// redirect "/offline" to "/offline/" (or back); a redirected response can't
// answer a navigation, so it's stored as a plain copy.
async function precacheOfflinePages() {
  const pages = await caches.open(PAGES);
  const assets = new Set();
  for (const path of OFFLINE_PAGES) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Couldn't precache ${path}`);
    const html = await response.text();
    for (const [, url] of html.matchAll(/(?:src|href)="(\/(?:assets|chunks)\/[^"]+)"/g)) {
      assets.add(url);
    }
    await pages.put(
      path,
      new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } })
    );
  }
  await (await caches.open(STATIC)).addAll([...assets]);
}

function offlinePage(url) {
  return url.pathname === "/hu" || url.pathname.startsWith("/hu/") ? "/hu/offline" : "/offline";
}

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      trim(cacheName);
    }
    return response;
  } catch (error) {
    const cached =
      (await cache.match(request)) ?? (fallbackUrl && (await cache.match(fallbackUrl)));
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
    trim(cacheName);
  }
  return response;
}

async function staleWhileRevalidate(event, request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
        trim(cacheName);
      }
      return response;
    })
    .catch(() => undefined);
  if (cached) {
    event.waitUntil(refresh);
    return cached;
  }
  return (await refresh) ?? Response.error();
}

// Keeps each cache to its size by dropping the oldest entries.
async function trim(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const excess = keys.length - MAX_ENTRIES[cacheName];
  for (let i = 0; i < excess; i++) {
    if (!OFFLINE_PAGES.includes(new URL(keys[i].url).pathname)) await cache.delete(keys[i]);
  }
}
