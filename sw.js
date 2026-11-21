const CACHE_STATIC = "alba9yat-static-v3";
const CACHE_DYNAMIC = "alba9yat-dynamic-v3";

const CORE_FILES = [
  "/aitlahcen/alba9yat.html",
  "/aitlahcen/manifest.json",
  "/aitlahcen/"
];

// 1. التثبيت: كيخبي الملفات الأساسية
self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_STATIC).then(c => c.addAll(CORE_FILES))
  );
});

// 2. التفعيل: كيمسح الكاش القديم باش ما يبقاش معمر التليفون
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_STATIC && k !== CACHE_DYNAMIC)
          .map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// 3. كل طلب كيدوز من هنا
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // ما كنخبيوش طلبات POST ولا طلبات ديال Google Analytics
  if (e.request.method !== "GET") return;

  // أ) الصفحة HTML: جرب الانترنيت أولا، إلا ما كاينش رجع للكاش
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_DYNAMIC).then(c => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request)
          .then(cached => cached || caches.match("/aitlahcen/alba9yat.html")))
    );
    return;
  }

  // ب) التصاور والخطوط و CSS و JS: من الكاش أولا، إلا ما كاينش جيب من الانترنيت وخبيها
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) {
        // في الخلفية كيحدث النسخة الجديدة
        fetch(e.request).then(res => {
          if (res.ok) caches.open(CACHE_DYNAMIC).then(c => c.put(e.request, res));
        }).catch(()=>{});
        return cached;
      }
      return fetch(e.request).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_DYNAMIC).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => {
        // إلا كانت تصويرة وما كايناش انترنيت، رجع والو باش ما تبلوكيش الصفحة
        if (e.request.destination === "image") return new Response("", {status: 404});
      });
    })
  );
});
