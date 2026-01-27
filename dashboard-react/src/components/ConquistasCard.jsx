import React from 'react';

// Widget: Conquistas

function shareConquista(conquista) {
  const text = `🏆 Conquista: ${conquista.titulo || conquista.nome}\n${conquista.descricao}`;
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
