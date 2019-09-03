var CACHE_STATIC_NAME = 'static-v04';
var STATIC_FILES = [
    '/',
    '/index.html',
    '/manifest.json',
    '/js/utilities.js',
    '/img/favicon/favicon.ico',
    '/css/style.css',
    '/img/icons/Icon-144.png',
    '/img/icons/Icon-512.png',
    '/img/svg/me.svg',
    '/img/svg/education.svg',
    '/img/svg/personal-projects.svg',
    '/img/svg/work.svg',
    '/img/svg/free-time.svg',
    '/img/card-back.png',
    '/img/main-back.png',
    '/img/no-javascript.svg',
    'https://fonts.googleapis.com/css?family=Raleway:100,300,400,700,900&subset=latin-ext'
];

self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function (cache) {
                console.log('[Service Worker] Precaching App Shell');
                return cache.addAll(STATIC_FILES);
            })
    );
});

function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
        cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
        cachePath = cachePath.indexOf('#') > -1
            ? cachePath.substring(0, cachePath.indexOf('#'))
            : cachePath;  // removes #... from svg href elements
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
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (isInArray(event.request.url, STATIC_FILES)) {
                    return response;
                } else {
                    return fetch(event.request)
                }
            })
    );
});
