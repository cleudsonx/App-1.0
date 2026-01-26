import React from 'react';

// Widget: Fichas de Treino

// Estrutura esperada:
// templates = [
//   { categoria: 'Hipertrofia', fichas: [{ nome: 'Ficha A', ... }, { nome: 'Ficha B', ... }] },
//   { categoria: 'Resistência', fichas: [{ nome: 'Ficha X', ... }] }
// ]

const TemplatesCard = ({ templates, onSelecionar }) => {
  return (
    <div className="dashboard-widget widget-card card-templates">
      <span role="img" aria-label="Ícone">📋</span>
      <h3>Fichas de Treino</h3>
      {templates && templates.length > 0 ? (
        templates.map((cat, idx) => (
          <div key={idx} className="template-category">
            <h4>{cat.categoria}</h4>
            <ul>
              {cat.fichas.map((tpl, i) => (
                <li key={i}>
                  {tpl.nome}
                  <button className="btn-secondary" onClick={() => onSelecionar(tpl)}>
                    Selecionar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>Nenhuma ficha disponível.</p>
      )}
    </div>
  );
};

export default TemplatesCard;
