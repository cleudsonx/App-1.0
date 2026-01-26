import React, { useState } from 'react';

// Widget: Hidratação
const AguaCard = () => {
  const [copos, setCopos] = useState(0);

  const adicionarCopo = () => setCopos(c => c + 1);
  const removerCopo = () => setCopos(c => (c > 0 ? c - 1 : 0));

  return (
    <div className="dashboard-widget widget-card card-agua">
      <span role="img" aria-label="Ícone">💧</span>
      <h3>Hidratação</h3>
      <div>
        <p>Copos de água hoje: {copos}</p>
        <button className="btn-primary" onClick={adicionarCopo}>Adicionar</button>
        <button className="btn-secondary" onClick={removerCopo} disabled={copos === 0}>Remover</button>
      </div>
    </div>
  );
};

export default AguaCard;
