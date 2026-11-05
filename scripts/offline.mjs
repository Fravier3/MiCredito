import { readdir,readFile,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const files=['index.html','manifest.webmanifest','icon.svg','icon-180.png','icon-192.png','icon-512.png',...(await readdir('dist/assets')).map(f=>'assets/'+f)];
const hash=createHash('sha256');for(const f of files)hash.update(await readFile('dist/'+f));
const version=hash.digest('hex').slice(0,12);
await writeFile('dist/sw.js',`const CACHE='micredito-${version}',BASE='/MiCredito/',FILES=${JSON.stringify(files)}.map(f=>BASE+f);
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('micredito-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||!u.pathname.startsWith(BASE))return;
if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match(BASE+'index.html')));return}
if(FILES.includes(u.pathname))e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));});`);
