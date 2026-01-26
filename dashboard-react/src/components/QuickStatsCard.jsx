import React from 'react';

// Widget: Estatísticas
const QuickStatsCard = ({ stats }) => {
  return (
    <div className="dashboard-widget widget-card card-stats">
      <span role="img" aria-label="Ícone">📊</span>
      <h3>Estatísticas</h3>
      {stats ? (
        <ul>
          <li>Treinos: {stats.treinos}</li>
          <li>Volume: {stats.volume}</li>
          <li>PRs: {stats.prs}</li>
        </ul>
      ) : (
        <p>Nenhuma estatística disponível.</p>
      )}
    </div>
  );
};

export default QuickStatsCard;
