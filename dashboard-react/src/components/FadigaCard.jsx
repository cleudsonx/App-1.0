import React from 'react';

// Widget: Fadiga
const FadigaCard = ({ fadiga }) => {
  return (
    <div className="dashboard-widget widget-card card-fadiga">
      <span role="img" aria-label="Ícone">🧭</span>
      <h3>Fadiga</h3>
      {fadiga ? (
        <div>
          <p>Nível de fadiga: {fadiga.nivel}</p>
          <p>Recomendação: {fadiga.recomendacao}</p>
        </div>
      ) : (
        <p>Sem dados de fadiga.</p>
      )}
    </div>
  );
};

export default FadigaCard;
