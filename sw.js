const CACHE='murshid-v60';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  // الصفحة نفسها: من الشبكة أولاً (لتصل التحديثات فوراً)، ومن الذاكرة عند انقطاع الإنترنت
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(res=>{
      if(res.ok){ const copy=res.clone(); caches.open(CACHE).then(c=>c.put('./',copy)); }
      return res;
    }).catch(()=>caches.match('./').then(r=>r||caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
    if(res.ok && (e.request.url.startsWith(self.location.origin)||/fonts\.(googleapis|gstatic)\.com/.test(e.request.url))){
      const copy=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy));
    }
    return res;
  }).catch(()=>caches.match('index.html'))));
});
