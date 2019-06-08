var CACHE_STATIC_NAME = 'static-v01';
var STATIC_FILES = [
    '/',
    '/index.html',
    '/img/favicon/favicon.ico',
    '/img/icons/Icon-144.png',
    '/img/icons/Icon-512.png',
    '/img/svg/me.svg',
    '/img/svg/me.svg#me-icon',
    '/img/svg/education.svg',
    '/img/svg/personal-projects.svg',
    '/img/svg/work.svg',
    '/img/svg/free-time.svg',
    '/img/card-back.png',
    '/img/main-back.png',
    '/img/no-javascript.svg',
    '/css/style.css',
    '/sw.js',
    '/js/utilities.js',
    '/manifest.json'
];

self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function (cache) {
                console.log('[Service Worker] Precaching App Shell');
                cache.addAll(STATIC_FILES);
            })
    )
});

function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
        // console.log('matched ', string);
        cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
        console.log('cachePath',cachePath)
    } else {
        cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
}


self.addEventListener('activate', function (event) {
    console.log('[Service Worker] Activating Service Worker ....', event);
    return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
    if(isInArray(event.request.url, STATIC_FILES)) {
        event.respondWith(
            caches.match(event.request)
        );
    } else {
        event.respondWith(fetch(event.request));
    }
});
