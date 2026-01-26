import React from 'react';

// Widget: Minha Ficha
const FichaAtualCard = ({ ficha, onSwitchTab }) => {
  return (
    <div className={`dashboard-widget widget-card card-ficha${!ficha ? ' no-ficha' : ''}`} onClick={() => onSwitchTab('treino')}>
      <span role="img" aria-label="Ícone">📑</span>
      <h3>Minha Ficha</h3>
      {ficha ? (
        <div>
          <p>{ficha.resumo}</p>
          <button className="btn-primary">Ver Ficha Completa</button>
        </div>
      ) : (
        <p>Nenhuma ficha disponível.</p>
      )}
    </div>
  );
};

export default FichaAtualCard;
