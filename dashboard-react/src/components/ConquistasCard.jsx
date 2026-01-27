import React from 'react';

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
  if (navigator.share) {
    navigator.share({ text, title: 'Minha conquista no APP Trainer!' });
  } else {
    navigator.clipboard.writeText(text);
    alert('Conquista copiada! Compartilhe onde quiser.');
  }
}

const ConquistasCard = ({ conquistas }) => {
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
