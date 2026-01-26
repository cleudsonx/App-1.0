import React from 'react';

// Componente para cada card/widget do dashboard
const DashboardCard = ({ title, children }) => {
  return (
    <div className="dashboard-card">
      <h3>{title}</h3>
      <div className="dashboard-card-content">
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;
