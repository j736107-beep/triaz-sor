const C='triaz-v2-74b9f483ee',F=["./", "app.js", "engine.js", "icon-180.png", "icon-192.png", "icon-512.png", "index.html", "manifest.webmanifest", "style.css"];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x.startsWith('triaz')).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.open(C).then(c=>c.match(e.request,{ignoreSearch:true})).then(r=>r||fetch(e.request).catch(()=>caches.match('./index.html'))));});
