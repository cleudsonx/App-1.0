import React from 'react';

// Widget: Coach IA
const CoachIACard = ({ mensagem, onPerguntar }) => {
  return (
    <div className="dashboard-widget widget-card card-coach-ia">
      <span role="img" aria-label="Ícone">🤖</span>
      <h3>Coach IA</h3>
      <p>{mensagem || 'Faça uma pergunta ao Coach IA!'}</p>
      <button className="btn-primary" onClick={onPerguntar}>
        Perguntar
      </button>
    </div>
  );
};

export default CoachIACard;
