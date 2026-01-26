import React from 'react';

// Widget: Progresso
const ProgressoCard = ({ progresso }) => {
  return (
    <div className="dashboard-widget widget-card card-progresso">
      <span role="img" aria-label="Ícone">📈</span>
      <h3>Progresso</h3>
      {progresso ? (
        <div>
          <p>Volume: {progresso.volume}</p>
          <p>PRs: {progresso.prs}</p>
          <p>Última evolução: {progresso.ultimaEvolucao}</p>
        </div>
      ) : (
        <p>Nenhum progresso registrado.</p>
      )}
    </div>
  );
};

export default ProgressoCard;
