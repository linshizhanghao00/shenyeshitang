// sw.js — 深夜食堂 v7（GitHub Pages 子路径：/shenyeshitang）
// 策略：在线优先；Firebase SDK 永远直连；静态资源离线可用。

const CACHE = "deepnight-v7-ghpages";
const CORE = [
  "/shenyeshitang/",
  "/shenyeshitang/index.html",
  "/shenyeshitang/manifest.webmanifest",
  "/shenyeshitang/menu.json",
  "/shenyeshitang/icons/icon-192.png",
  "/shenyeshitang/icons/icon-512.png",
  "/shenyeshitang/icons/maskable-512.png"
];

// 安装：缓存核心文件
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)));
  self.skipWaiting();
});

// 激活：清除旧缓存
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 获取：gstatic 永远直连，其余网络优先→写入缓存；失败则回退缓存
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Firebase SDK 不缓存，防止旧版本被锁
  if (url.origin === "https://www.gstatic.com") {
    e.respondWith(fetch(e.request));
    return;
  }

  // 其它资源
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});

// Web Push 通知（占位，未来可启用 FCM）
self.addEventListener("push", (event) => {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "新订单提醒";
    const body = data.body || "有新的订单到达";
    const url = data.url || self.registration.scope;

    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: `${self.registration.scope}icons/icon-192.png`,
        badge: `${self.registration.scope}icons/icon-192.png`,
        data: { url }
      })
    );
  } catch (e) {}
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || self.registration.scope;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) {
          c.focus();
          c.navigate(url);
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});