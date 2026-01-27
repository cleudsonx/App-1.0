import React, { createContext, useContext } from 'react';

const GamificationContext = createContext();

export function GamificationProvider({ children }) {
  // Mock dados de gamificação
  const badges = [
    { nome: 'Primeiro treino', descricao: 'Complete seu primeiro treino', icone: '🏆' },
    { nome: 'Desafio 7 dias', descricao: 'Complete 7 dias seguidos', icone: '🔥' }
  ];
  const ranking = [
    { id: 'test-user', nome: 'Usuário Teste', pontos: 120 },
    { id: 'user2', nome: 'Maria', pontos: 110 },
    { id: 'user3', nome: 'João', pontos: 90 }
  ];
  return (
    <GamificationContext.Provider value={{ badges, ranking }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  return useContext(GamificationContext);
}
