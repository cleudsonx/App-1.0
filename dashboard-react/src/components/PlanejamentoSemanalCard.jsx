import React from 'react';

// Widget: Planejamento Semanal
const PlanejamentoSemanalCard = ({ planejamento }) => {
  return (
    <div className="dashboard-widget widget-card card-planejamento">
      <span role="img" aria-label="Ícone">🗓️</span>
      <h3>Planejamento Semanal</h3>
      {planejamento && planejamento.length > 0 ? (
        <ul>
          {planejamento.map((item, idx) => (
            <li key={idx}>
              <strong>{item.dia}</strong>: {item.atividade}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum planejamento cadastrado.</p>
      )}
    </div>
  );
};

export default PlanejamentoSemanalCard;
