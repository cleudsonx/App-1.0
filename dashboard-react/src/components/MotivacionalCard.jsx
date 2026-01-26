import React from 'react';

// Widget: Motivacional
const MotivacionalCard = ({ mensagem }) => {
  return (
    <div className="dashboard-widget widget-card card-motivacional">
      <span role="img" aria-label="Ícone">💪</span>
      <h3>Motivacional</h3>
      <blockquote>
        {mensagem || 'Acredite no seu potencial!'}
      </blockquote>
    </div>
  );
};

export default MotivacionalCard;
