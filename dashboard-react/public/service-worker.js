// Service Worker para notificações push reais
self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  const title = data.title || 'Nova notificação';
  const options = {
    body: data.body || 'Você tem uma nova mensagem!',
    icon: '/vite.svg',
    badge: '/vite.svg',
    data: data.url || '/',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Recebe mensagens do app para exibir notificações locais como push
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'show-notification') {
    const { title, body, url } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: url || '/'
    });
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
