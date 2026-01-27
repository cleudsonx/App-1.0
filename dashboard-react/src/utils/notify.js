// Notificação local e push real via service worker
export function notificar(msg, opts = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    // Se service worker estiver ativo, usar push real
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'show-notification',
        title: opts.title || 'Dashboard Fitness',
        body: msg,
        url: opts.url || window.location.href
      });
    } else {
      new Notification(msg, { icon: '/favicon.ico' });
    }
  }
}