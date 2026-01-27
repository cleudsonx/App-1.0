// Função para registrar evento no feed de atividades do backend
export async function addFeedEvent({ user_id, tipo, descricao, extras = {} }) {
  const API_PYTHON = import.meta.env.VITE_API_PYTHON_URL;
  const event = {
    id: '', // será preenchido pelo backend
    user_id,
    tipo, // conquista, desafio, missao, streak
    data: new Date().toISOString(),
    descricao,
    extras
  };
  try {
    await fetch(`${API_PYTHON}/api/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
  } catch (e) {
    // fallback: salva localmente para sincronizar depois
    const offlineFeed = JSON.parse(localStorage.getItem('dashboard_offline_feed') || '[]');
    offlineFeed.push(event);
    localStorage.setItem('dashboard_offline_feed', JSON.stringify(offlineFeed));
  }
}

// Sincroniza eventos locais do feed com o backend quando online
export async function syncOfflineFeed() {
  const API_PYTHON = import.meta.env.VITE_API_PYTHON_URL;
  let offlineFeed = JSON.parse(localStorage.getItem('dashboard_offline_feed') || '[]');
  if (!offlineFeed.length) return;
  const failedEvents = [];
  for (const event of offlineFeed) {
    try {
      await fetch(`${API_PYTHON}/api/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (e) {
      failedEvents.push(event);
    }
  }
  if (failedEvents.length) {
    localStorage.setItem('dashboard_offline_feed', JSON.stringify(failedEvents));
  } else {
    localStorage.removeItem('dashboard_offline_feed');
  }
}

// Detecta reconexão e sincroniza feed offline
window.addEventListener('online', () => {
  syncOfflineFeed().then(() => {
    // Para testes, pode disparar evento customizado
    window.dispatchEvent(new Event('feedSyncComplete'));
  });
});
