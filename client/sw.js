const CACHE_NAME = "collegehub-v1";
const urlsToCache = ["/", "/index.html", "/manifest.json", "/icon-192-192.png"];

self.addEventListener("install", event => {
	event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener("fetch", event => {
	event.respondWith(
		caches.match(event.request).then(response => response || fetch(event.request))
	);
});

self.addEventListener("push", event => {
	const data = event.data.json();
	const options = {
		body: data.body,
		icon: "/icon-192-192.png",
	};

	event.waitUntil(self.registration.showNotification(data.title, options));
});
