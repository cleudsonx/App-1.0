import React from 'react';

// Widget: Sono e Recuperação
const SonoRecuperacaoCard = ({ sono }) => {
  return (
    <div className="dashboard-widget widget-card card-sono-recuperacao">
      <span role="img" aria-label="Ícone">😴</span>
      <h3>Sono e Recuperação</h3>
      {sono ? (
        <div>
          <p>Horas de sono: {sono.horas}</p>
          <p>Qualidade: {sono.qualidade}</p>
        </div>
      ) : (
        <p>Sem dados de sono.</p>
      )}
    </div>
  );
};

export default SonoRecuperacaoCard;
