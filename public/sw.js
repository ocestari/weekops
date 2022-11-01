const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
        try {
            const registration = await navigator.serviceWorker.register("/sw.js", {
                scope: "/",
            });
            if (registration.installing) {
                console.log("Service worker installing");
            } else if (registration.waiting) {
                console.log("Service worker installed");
            } else if (registration.active) {
                console.log("Service worker active");
            }

            const CACHE_NAME = "cache-v1";
            const urlsToCache = ["/", "/index.html"];

            self.addEventListener("install", (event) => {
                // Perform install steps
                event.waitUntil(
                    caches.open(CACHE_NAME).then((cache) => {
                        console.log("Opened cache");
                        return cache.addAll(urlsToCache);
                    })
                );
            });


            self.addEventListener("fetch", (event) => {
                event.respondWith(
                    caches.match(event.request).then((response) => {
                        // Cache hit - return response
                        if (response) {
                            return response;
                        }

                        return fetch(event.request).then((response) => {
                            // Check if we received a valid response
                            if (!response || response.status !== 200 || response.type !== "basic") {
                                return response;
                            }

                            // IMPORTANT: Clone the response. A response is a stream
                            // and because we want the browser to consume the response
                            // as well as the cache consuming the response, we need
                            // to clone it so we have two streams.
                            const responseToCache = response.clone();

                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                            return response;
                        });
                    })
                );
            });



            self.addEventListener("online", function () {
                console.log("You are online!");
            });
            self.addEventListener("offline", function () {
                console.log("Oh no, you lost your network connection.");
            });


        } catch (error) {
            console.error(`Registration failed with ${error}`);
        }
    }
};

// …

registerServiceWorker();
