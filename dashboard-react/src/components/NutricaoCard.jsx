import React from 'react';

// Widget: Nutrição
const NutricaoCard = ({ refeicoes }) => {
  return (
    <div className="dashboard-widget widget-card card-nutricao">
      <span role="img" aria-label="Ícone">🍽️</span>
      <h3>Nutrição</h3>
      {refeicoes && refeicoes.length > 0 ? (
        <ul>
          {refeicoes.map((r, idx) => (
            <li key={idx}>
              <strong>{r.horario}</strong>: {r.descricao}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma refeição registrada.</p>
      )}
    </div>
  );
};

export default NutricaoCard;
