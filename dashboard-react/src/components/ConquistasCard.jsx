import React, { useEffect, useRef } from 'react';
import { addFeedEvent } from '../utils/feed';

// Widget: Conquistas


function getBadgeIcon(conquista) {
  // Exemplo simples: pode ser expandido para mais tipos
  const nome = (conquista.titulo || conquista.nome || '').toLowerCase();
  if (nome.includes('primeiro')) return '🥇';
  if (nome.includes('meta')) return '🎯';
  if (nome.includes('desafio')) return '🔥';
  if (nome.includes('recorde')) return '🏅';
  if (nome.includes('treino')) return '💪';
  return '🏆';
}

function shareConquista(conquista) {
  const text = `${getBadgeIcon(conquista)} Conquista: ${conquista.titulo || conquista.nome}\n${conquista.descricao}`;
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ text, title: 'Minha conquista no APP Trainer!', url });
    return;
  }
  const wa = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
  const tg = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + '\n' + url)}`;
  navigator.clipboard.writeText(text + '\n' + url);
  alert('Conquista copiada! Compartilhe onde quiser.');
  window.open(wa, '_blank');
}


const ConquistasCard = ({ conquistas }) => {
  const prevConquistas = useRef([]);

  useEffect(() => {
    // Detecta novas conquistas e registra no feed
    if (conquistas && prevConquistas.current.length > 0) {
      const novas = conquistas.filter(c => !prevConquistas.current.some(pc => pc.titulo === c.titulo && pc.descricao === c.descricao));
      const user = JSON.parse(localStorage.getItem('dashboard_user') || '{}');
      novas.forEach(c => {
        addFeedEvent({
          user_id: user.id || user.email || 'anon',
          tipo: 'conquista',
          descricao: `Conquista: ${c.titulo || c.nome}`,
          extras: { ...c }
        });
      });
    }
    prevConquistas.current = conquistas || [];
  }, [conquistas]);

  return (
    <div className="dashboard-widget widget-card card-conquistas">
      <span role="img" aria-label="Ícone">🏆</span>
      <h3>Conquistas</h3>
      {conquistas && conquistas.length > 0 ? (
        <ul>
          {conquistas.map((c, idx) => (
            <li key={idx} style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:22}}>{getBadgeIcon(c)}</span>
              <span><strong>{c.titulo || c.nome}</strong>: {c.descricao}</span>
              <button title="Compartilhar conquista" onClick={() => shareConquista(c)} style={{fontSize:16, cursor:'pointer'}}>🔗</button>
              <a href={`https://wa.me/?text=${encodeURIComponent(getBadgeIcon(c)+' Conquista: '+(c.titulo||c.nome)+'\n'+c.descricao+'\n'+window.location.href)}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" style={{marginLeft:4,fontSize:17}}>🟢</a>
              <a href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(getBadgeIcon(c)+' Conquista: '+(c.titulo||c.nome)+'\n'+c.descricao)}`} target="_blank" rel="noopener noreferrer" title="Telegram" style={{marginLeft:2,fontSize:17}}>🔵</a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getBadgeIcon(c)+' Conquista: '+(c.titulo||c.nome)+'\n'+c.descricao+'\n'+window.location.href)}`} target="_blank" rel="noopener noreferrer" title="Compartilhar no X" style={{marginLeft:2,fontSize:17}}>✖️</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma conquista registrada.</p>
      )}
    </div>
  );
};

export default ConquistasCard;
