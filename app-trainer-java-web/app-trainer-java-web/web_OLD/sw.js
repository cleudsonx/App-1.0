// ================= PUSH NOTIFICATIONS =================
self.addEventListener('push', function(event) {
    let data = {};
    if (event.data) {
        data = event.data.json();
    }
    const title = data.title || 'Shaipados';
    const options = {
        body: data.body || 'Você recebeu uma nova notificação!',
        icon: '/assets/Designer01.png',
        badge: '/assets/Designer01.png',
        data: data.url || '/'
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(function(clientList) {
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url === event.notification.data && 'focus' in client)
                    return client.focus();
            }
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data);
            }
        })
    );
});

// ================= BACKGROUND SYNC =================
self.addEventListener('sync', function(event) {
    if (event.tag === 'sync-treinos') {
        // Aqui você pode implementar lógica para sincronizar treinos salvos offline
        // Exemplo: buscar dados no IndexedDB/localStorage e enviar para o backend
        event.waitUntil(
            // Exemplo fictício:
            fetch('/api/sync-treinos', { method: 'POST', body: JSON.stringify({ /* dados */ }) })
        );
    }
});
// Service Worker - Shaipados PWA
const CACHE_NAME = 'shaipados-v1.0.0';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/brand.css',
    '/app.js',
    '/manifest.webmanifest',
    '/assets/Designer01.png',
    '/offline.html'
];

// Instalação - Cache dos assets principais
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Cache aberto, adicionando assets...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Ativação - Limpa caches antigos
self.addEventListener('activate', (event) => {
    console.log('[SW] Ativando Service Worker...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - Estratégia: Cache First, fallback para Network
self.addEventListener('fetch', (event) => {
    // Ignora requisições não-GET e de outros domínios
    if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Ignora chamadas de API e autenticação
    if (event.request.url.includes('/api/') || event.request.url.includes('/auth/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Retorna do cache e atualiza em background
                    event.waitUntil(
                        fetch(event.request).then(networkResponse => {
                            return caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, networkResponse.clone());
                                return networkResponse;
                            });
                        }).catch(() => {})
                    );
                    return cachedResponse;
                }

                // Não está no cache, busca na rede
                return fetch(event.request)
                    .then(networkResponse => {
                        // Cacheia apenas respostas válidas
                        if (networkResponse && networkResponse.status === 200) {
                            return caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, networkResponse.clone());
                                return networkResponse;
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Fallback para página offline (opcional)
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }
                    });
            })
    );
});

// Mensagens do cliente (para atualizações)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
