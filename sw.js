const CACHE_NAME = "my-pwa-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json",
  "/offline.html",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

// Sự kiện install: Cài đặt Service Worker và cache các tài nguyên ban đầu
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Buộc Service Worker mới kích hoạt ngay lập tức
  );
});

// Sự kiện activate: Dọn dẹp các cache cũ
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName); // Xóa cache cũ
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Yêu cầu tất cả các client hiện tại sử dụng SW mới
  );
});

// Sự kiện fetch: Phục vụ tài nguyên từ cache hoặc mạng
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Nếu có trong cache, trả về từ cache
      if (response) {
        return response;
      }
      // Nếu không có trong cache, fetch từ mạng
      return fetch(event.request)
        .then((networkResponse) => {
          // Kiểm tra phản hồi mạng hợp lệ trước khi cache
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }
          // Thêm phản hồi vào cache để sử dụng cho lần sau
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // Nếu fetch thất bại (mất mạng), trả về trang ngoại tuyến
          return caches.match("/offline.html");
        });
    })
  );
});

// Sự kiện push: Xử lý thông báo đẩy từ server
// (Lưu ý: Để nhận được thông báo đẩy thực sự từ server, bạn cần cài đặt Push API và Web Push Protocol)
// Đây chỉ là một ví dụ đơn giản để minh họa.
self.addEventListener("push", (event) => {
  const data = event.data
    ? event.data.json()
    : { title: "Thông báo chung", body: "Nội dung thông báo." };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "icon-192x192.png",
      badge: data.badge || "icon-192x192.png",
      tag: data.tag || "generic-notification",
    })
  );
});

// Sự kiện notificationclick: Xử lý khi người dùng nhấp vào thông báo
self.addEventListener("notificationclick", (event) => {
  event.notification.close(); // Đóng thông báo
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes("index.html") && "focus" in client) {
            return client.focus(); // Tập trung vào tab PWA nếu đã mở
          }
        }
        // Nếu PWA chưa mở, mở một tab mới
        if (clients.openWindow) {
          return clients.openWindow("/index.html");
        }
      })
  );
});

// Sự kiện notificationclose: Xử lý khi thông báo bị đóng
self.addEventListener("notificationclose", (event) => {
  console.log("Thông báo đã bị đóng:", event.notification.tag);
});
