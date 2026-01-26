import React from 'react';

// Widget: Treino de Hoje
const HeroTreinoCard = ({ onStartWorkout, treino }) => {
  return (
    <div className="dashboard-widget dashboard-hero" onClick={onStartWorkout}>
      <span role="img" aria-label="Ícone">🏋️</span>
      <h3>Treino de Hoje</h3>
      {treino ? (
        <>
          <p>{treino.resumo}</p>
          <button className="btn-primary" onClick={onStartWorkout}>
            Iniciar Treino
          </button>
        </>
      ) : (
        <p>Nenhum treino disponível.</p>
      )}
    </div>
  );
};

export default HeroTreinoCard;
