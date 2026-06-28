// Empty service worker placeholder for production.
// This prevents /sw.js 404/ENOENT errors on Render.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
