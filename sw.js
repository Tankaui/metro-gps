// 每次修改 index.html 的程式碼後，請務必在此更改版本號
// 這樣才能觸發更新機制並刪除舊快取
const CACHE_VERSION = 'v30.0.5'; 
const CACHE_NAME = `pace-assistant-${CACHE_VERSION}`;

// 這裡列出離線時需要的所有靜態檔案
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// 1. 安裝階段：將檔案寫入當前版本的快取中
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting()) // 強制立即接管控制權，不等待舊版 SW 關閉
    );
});

// 2. 啟動階段：這是清除舊快取的關鍵
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // 如果快取名稱不等於當前版本，且屬於本應用的快取，則將其刪除
                    if (cacheName !== CACHE_NAME && cacheName.startsWith('pace-assistant-')) {
                        console.log('[Service Worker] 已清除舊版快取:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // 立即讓新的 Service Worker 控制所有開啟的網頁
    );
});

// 3. 攔截請求階段：優先讀取快取，若無快取才發送網路請求 (Cache-First 策略)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});