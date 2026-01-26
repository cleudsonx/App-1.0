import React from 'react';

// Widget: Treino de Hoje
const HeroTreinoCard = ({ onStartWorkout }) => {
  return (
    <div className="dashboard-widget dashboard-hero" onClick={onStartWorkout}>
      <span role="img" aria-label="Ícone">🏋️</span>
      <h3>Treino de Hoje</h3>
      <p>Resumo do treino do dia e botão para iniciar.</p>
      <button className="btn-primary" onClick={onStartWorkout}>
        Iniciar Treino
      </button>
    </div>
  );
};

export default HeroTreinoCard;
