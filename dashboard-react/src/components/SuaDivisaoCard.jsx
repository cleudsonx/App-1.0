import React from 'react';

// Widget: Sua Divisão
const SuaDivisaoCard = ({ divisao }) => {
  return (
    <div className="dashboard-widget widget-card card-divisao">
      <span role="img" aria-label="Ícone">📅</span>
      <h3>Sua Divisão</h3>
      {divisao ? (
        <div>
          <p>{divisao.descricao}</p>
          <ul>
            {divisao.dias.map((dia, idx) => (
              <li key={idx}>{dia}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Sem divisão cadastrada.</p>
      )}
    </div>
  );
};

export default SuaDivisaoCard;
