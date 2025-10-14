// sw.js — 深夜食堂（GitHub Pages 子路径：/shenyeshitang）
// 目的：PWA 在线优先；gstatic(Firebase SDK) 永远直连网络；静态资源离线可用

const CACHE = "deepnight-v2-ghpages";
const CORE = [
  "/shenyeshitang/",
  "/shenyeshitang/index.html",
  "/shenyeshitang/manifest.webmanifest",
  "/shenyeshitang/menu.json",
  "/shenyeshitang/icons/icon-192.png",
  "/shenyeshitang/icons/icon-512.png",
  "/shenyeshitang/icons/maskable-512.png"
];

// 安装：预缓存核心静态文件（图标/清单/首页/菜单）
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)));
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

// 获取策略：
// 1) Firebase SDK（gstatic）总是走网络（避免被 PWA 缓存住导致无法连接）
// 2) 其它资源：在线优先，失败时回退缓存
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Firebase 模块：永远直连，不缓存
  if (url.origin === "https://www.gstatic.com") {
    e.respondWith(fetch(e.request));
    return;
  }

  // 其余：网络优先，网络失败再用缓存
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
