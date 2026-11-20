self.addEventListener('install', e=>{
  e.waitUntil(caches.open('baqiyat-v1').then(c=>c.addAll(['alba9yat.html','manifest-baqiyat.json','icon-baqiyat-512.png'])))
});
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))
});
