// Função para registrar evento no feed de atividades do backend
export async function addFeedEvent({ user_id, tipo, descricao, extras = {} }) {
  const API_PYTHON = 'https://app-1-0-python.onrender.com';
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
    // fallback: pode salvar local ou ignorar
  }
}
