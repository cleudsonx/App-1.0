import React from 'react';

// Componente container dos cards/widgets do dashboard
const DashboardGrid = ({ children }) => {
  return (
    <div className="dashboard-grid">
      {children}
    </div>
  );
};

export default DashboardGrid;
