import React from 'react';

// Widget: Conquistas
const ConquistasCard = ({ conquistas }) => {
  return (
    <div className="dashboard-widget widget-card card-conquistas">
      <span role="img" aria-label="Ícone">🏆</span>
      <h3>Conquistas</h3>
      {conquistas && conquistas.length > 0 ? (
        <ul>
          {conquistas.map((c, idx) => (
            <li key={idx}>
              <strong>{c.titulo}</strong>: {c.descricao}
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
