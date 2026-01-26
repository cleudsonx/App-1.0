
import React, { useState } from 'react';
import DashboardGrid from './components/DashboardGrid';
import DashboardCard from './components/DashboardCard';
import FallbackCard from './components/FallbackCard';
import PersonalizationModal from './components/PersonalizationModal';

const mockCards = [
  { id: 1, title: 'Card 1', content: 'Conteúdo do Card 1' },
  { id: 2, title: 'Card 2', content: 'Conteúdo do Card 2' },
  { id: 3, title: 'Card 3', content: 'Conteúdo do Card 3' },
];

function App() {
  const [showModal, setShowModal] = useState(false);
  const [cards, setCards] = useState(mockCards);

  return (
    <div className="dashboard-root">
      <h2>Dashboard React</h2>
      <button onClick={() => setShowModal(true)}>
        Personalizar Dashboard
      </button>
      <DashboardGrid>
        {cards.length > 0 ? (
          cards.map(card => (
            <DashboardCard key={card.id} title={card.title}>
              {card.content}
            </DashboardCard>
          ))
        ) : (
          <FallbackCard message="Nenhum card disponível." />
        )}
      </DashboardGrid>
      <PersonalizationModal isOpen={showModal} onClose={() => setShowModal(false)}>
        <p>Conteúdo do modal de personalização</p>
      </PersonalizationModal>
    </div>
  );
}

export default App;
