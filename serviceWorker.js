const cacheName = "colorThing-v1";
const shellFiles = [
    "ctlogo.svg",
    "index.html",
    "style.css",
    "script.js",
    "assets/darkMode.png",
    "assets/lightMode.png",
    "assets/logo.svg",
    "assets/names.json",
    "assets/wheel.png"
]

self.addEventListener('install', (e) => {
    console.log('Service Worker installed.');
    e.waitUntil((async () => {
      const cache = await caches.open(cacheName);
      console.log('Service worker caching all: app shell and content.');
      await cache.addAll(shellFiles);
      console.log("Service worker cached all: app shell and content.")
    })());
  });

self.addEventListener('fetch', (e) => {
    // Cache http and https only, skip unsupported chrome-extension:// and file://...
    if (!(
       e.request.url.startsWith('http:') || e.request.url.startsWith('https:')
    )){
        return; 
    }

    e.respondWith((async () => {
        const r = await caches.match(e.request);
        console.log(`Service worker fetching resource: ${e.request.url}`);
        if (r) return r;

        const response = await fetch(e.request);
        const cache = await caches.open(cacheName);
        console.log(`Service worker caching new resource: ${e.request.url}`);
        cache.put(e.request, response.clone());
        return response;
      })());
});