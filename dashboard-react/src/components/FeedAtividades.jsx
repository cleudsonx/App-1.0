import React, { useEffect, useState } from 'react';

// Feed de atividades em tempo real
// Exibe conquistas, desafios, treinos, badges, etc.
export default function FeedAtividades({ userId }) {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simula fetch de feed (pode ser integrado ao backend futuramente)
  useEffect(() => {
    function carregarFeed() {
      // Busca do localStorage ou mock
      const conquistas = JSON.parse(localStorage.getItem('dashboard_user_conquistas') || '[]');
      const desafios = JSON.parse(localStorage.getItem('dashboard_user_desafios') || '[]');
      const feedData = [];
      conquistas.forEach(c => feedData.push({ tipo: 'conquista', ...c, data: c.data || new Date().toISOString() }));
      desafios.filter(d => d.progresso >= d.meta).forEach(d => feedData.push({ tipo: 'desafio', ...d, data: d.data || new Date().toISOString() }));
      // Pode adicionar treinos, badges, etc.
      feedData.sort((a, b) => new Date(b.data) - new Date(a.data));
      setFeed(feedData);
      setLoading(false);
    }
    carregarFeed();
    // Atualização automática a cada 30s
    const interval = setInterval(carregarFeed, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="dashboard-widget widget-card card-feed">
      <span role="img" aria-label="Feed">📰</span>
      <h3>Feed de Atividades</h3>
      {loading ? <div>Carregando feed...</div> : (
        feed.length === 0 ? <p>Nenhuma atividade recente.</p> :
        <ul style={{paddingLeft:0}}>
          {feed.map((item, idx) => (
            <li key={idx} style={{marginBottom:10,listStyle:'none',background:'#f7f7f7',borderRadius:8,padding:8}}>
              {item.tipo === 'conquista' && <span>🏆 <b>Conquista:</b> {item.titulo || item.nome}</span>}
              {item.tipo === 'desafio' && <span>🔥 <b>Desafio concluído:</b> {item.titulo}</span>}
              <span style={{float:'right',fontSize:12,color:'#888'}}>{new Date(item.data).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
      <p style={{fontSize:13,marginTop:8}}>O feed é atualizado automaticamente.</p>
    </div>
  );
}
