  it('renderiza fallback offline com localStorage', async () => {
    const fakeMissoes = [
      { id: 1, titulo: 'Missão Offline', tipo: 'treino', meta: 1, recompensa: '🔥 +5 pontos', icone: '🔥', progresso: 0, concluida: false }
    ];
    window.localStorage.setItem('missoes_test-user_' + new Date().toISOString().slice(0,10), JSON.stringify(fakeMissoes));
    window.localStorage.setItem('streak_test-user', '5');
    global.fetch = jest.fn().mockRejectedValue(new Error('Backend offline'));
    render(<MissoesDiariasStreaks userId="test-user" />);
    expect(await screen.findByText('Missão Offline')).toBeInTheDocument();
    expect(await screen.findByText('5 🔥')).toBeInTheDocument();
    expect(screen.getByText('(Offline)')).toBeInTheDocument();
    global.fetch.mockRestore && global.fetch.mockRestore();
  });
import { render, screen } from '@testing-library/react';
import MissoesDiariasStreaks from './MissoesDiariasStreaks';
import React from 'react';
import '@testing-library/jest-dom';

describe('MissoesDiariasStreaks', () => {
  it('renderiza sem crashar', () => {
    render(<MissoesDiariasStreaks userId="test-user" />);
    expect(screen.getByText('Missões Diárias & Streak')).toBeInTheDocument();
  });

  it('renderiza missões do backend', async () => {
    const fakeMissoes = [
      { id: 1, titulo: 'Missão Teste', tipo: 'treino', meta: 1, recompensa: '🔥 +5 pontos', icone: '🔥', progresso: 0, concluida: false }
    ];
    const fakeStreak = { streak: 2 };
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => fakeMissoes })
      .mockResolvedValueOnce({ ok: true, json: async () => fakeStreak });
    render(<MissoesDiariasStreaks userId="test-user" />);
    expect(await screen.findByText('Missão Teste')).toBeInTheDocument();
    expect(await screen.findByText('2 🔥')).toBeInTheDocument();
    global.fetch.mockRestore && global.fetch.mockRestore();
  });
});
