/* firebase-messaging-sw.js —— 后台接收推送并展示通知 */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA45H7MVPejI-09EmX3Y9RP0G-BzxKUA0M",
  authDomain: "shenyeshitang-9a3c2.firebaseapp.com",
  projectId: "shenyeshitang-9a3c2",
  storageBucket: "shenyeshitang-9a3c2.firebasestorage.app",
  messagingSenderId: "293937999981",
  appId: "1:293937999981:web:364b69c1ea61b48e8acf64"
});

const messaging = firebase.messaging();

// 后台推送到达（即便页面没打开）
messaging.onBackgroundMessage((payload) => {
  const n = payload.notification || {};
  const title = n.title || '新订单';
  const body  = n.body  || '';
  const data  = payload.data || {};
  self.registration.showNotification(title, {
    body,
    icon: '/shenyeshitang/icons/moon-180.png',
    badge: '/shenyeshitang/icons/moon-180.png',
    data
  });
});

// 点击通知可自定义跳转（可选）
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = '/shenyeshitang/?admin=1'; // 例如：点击通知回到管理员模式
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(win => {
      for (let i of win) { if (i.url.includes('/shenyeshitang/')) { return i.focus(); } }
      return clients.openWindow(url);
    })
  );
});
