// Đăng ký Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("Service Worker đã đăng ký thành công:", reg);
      })
      .catch((err) => {
        console.error("Đăng ký Service Worker thất bại:", err);
      });
  });
}

// Xử lý yêu cầu cấp quyền thông báo
document
  .getElementById("requestNotificationPermission")
  .addEventListener("click", () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Quyền thông báo đã được cấp.");
          alert("Bạn đã cấp quyền thông báo! Giờ bạn có thể nhận thông báo.");
        } else if (permission === "denied") {
          console.log("Quyền thông báo bị từ chối.");
          alert("Bạn đã từ chối quyền thông báo. Không thể gửi thông báo.");
        } else {
          console.log("Quyền thông báo chưa được cấp.");
          alert(
            "Quyền thông báo chưa được cấp. Vui lòng chấp nhận khi được hỏi."
          );
        }
      });
    } else {
      alert("Trình duyệt của bạn không hỗ trợ Notifications API.");
    }
  });

// Gửi thông báo thử nghiệm
document
  .getElementById("sendTestNotification")
  .addEventListener("click", () => {
    if ("Notification" in window && Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification("Thông báo từ PWA!", {
          body: 'Đây là 1 một thông báo thử nghiệm từ website của bạn, ngay cả khi nó "chạy ngầm"!',
          icon: "icon-192x192.png",
          badge: "icon-192x192.png", // Chỉ hiển thị trên Android
          vibrate: [200, 100, 200],
          tag: "test-notification", // Để tránh hiển thị nhiều thông báo giống nhau
          renotify: true, // Hiển thị lại nếu thông báo có cùng tag
          actions: [
            {
              action: "explore",
              title: "Mở PWA",
              icon: "icon-192x192.png",
            },
            {
              action: "close",
              title: "Đóng",
              icon: "icon-192x192.png",
            },
          ],
        });
      });
    } else {
      alert("Vui lòng cấp quyền thông báo trước.");
    }
  });
