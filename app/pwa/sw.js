const CACHE = {
  STATIC: 'military-static-v2',
  API: 'military-api-v2',
  PAGE: 'military-page-v2',
};

// 仅缓存公共内容 API（支持离线刷题/浏览），用户私有数据一律网络直连
const PUBLIC_API_PREFIXES = [
  '/api/regions',
  '/api/questions/',
  '/api/simulation/questions',
  '/api/ww-test/info',
  '/api/rw-test/info',
  '/api/cj-test/info',
  '/api/jx-test/info',
  '/api/forum/posts',
  '/api/forum/announcements',
  '/api/forum/activity',
  '/api/shop/products',
  '/api/shop/categories',
  '/api/notifications/active',
  '/api/notices',
  '/api/agent/site-config',
  '/api/rank',
  '/api/tineng/rank/query',
  '/api/app/check-update',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE.PAGE);
      await cache.addAll(['/offline.html']);
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set(Object.values(CACHE));
      for (const key of await caches.keys()) {
        if (!keep.has(key)) await caches.delete(key);
      }
      await self.clients.claim();
    })()
  );
});

function isNavigation(req) {
  return req.mode === 'navigate';
}

function isStaticAsset(url) {
  return /\.(css|js)(\?|$)/.test(url.pathname) || /^\/assets\//.test(url.pathname) || /^\/fonts\//.test(url.pathname);
}

function isApiGet(req, url) {
  return url.pathname.startsWith('/api/') && req.method === 'GET';
}

function isPublicApi(url) {
  return PUBLIC_API_PREFIXES.some((p) => url.pathname === p || url.pathname.startsWith(p + (p.endsWith('/') ? '' : '/')));
}

async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone());
    }
    return res;
  } catch (e) {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(req, cacheName) {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone());
    }
    return res;
  } catch (e) {
    const cached = await caches.match(req);
    if (cached) return cached;
    if (isNavigation(req)) {
      const fallback = await caches.match('/offline.html');
      if (fallback) return fallback;
    }
    return new Response('Offline', { status: 503 });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // 商城文件下载/视频播放走浏览器原生流程：不缓存、不拦截。
  // 下载需保留 Content-Disposition 触发原生下载；流媒体需原生 Range 直连。
  if (/^\/api\/shop\/products\/\d+\/(download|play)$/.test(url.pathname)) return;

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, CACHE.STATIC));
    return;
  }

  if (isApiGet(request, url)) {
    if (isPublicApi(url)) {
      event.respondWith(networkFirst(request, CACHE.API));
    }
    return;
  }

  if (isNavigation(request)) {
    event.respondWith(networkFirst(request, CACHE.PAGE));
    return;
  }

  if (request.method === 'GET') {
    event.respondWith(networkFirst(request, CACHE.PAGE));
    return;
  }
});
