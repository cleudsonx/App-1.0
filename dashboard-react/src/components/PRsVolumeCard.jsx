import React from 'react';

// Widget: PRs e Volume
const PRsVolumeCard = ({ prsVolume }) => {
  return (
    <div className="dashboard-widget widget-card card-prs-volume">
      <span role="img" aria-label="Ícone">🏆</span>
      <h3>PRs e Volume</h3>
      {prsVolume ? (
        <div>
          <p>PRs: {prsVolume.prs}</p>
          <p>Volume total: {prsVolume.volume}</p>
        </div>
      ) : (
        <p>Sem dados de PRs ou volume.</p>
      )}
    </div>
  );
};

export default PRsVolumeCard;
