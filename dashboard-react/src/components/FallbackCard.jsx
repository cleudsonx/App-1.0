import React from 'react';

// Componente para exibir mensagem de dados ausentes
const FallbackCard = ({ message }) => {
  return (
    <div className="fallback-card">
      <p>{message || 'Dados não disponíveis.'}</p>
    </div>
  );
};

export default FallbackCard;
