      it('exibe mensagem de erro ao falhar backend', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Backend offline'));
        window.localStorage.removeItem('missoes_test-user_' + new Date().toISOString().slice(0,10));
        window.localStorage.removeItem('streak_test-user');
        render(<MissoesDiariasStreaks userId="test-user" />);
        expect(await screen.findByText('(Offline)')).toBeInTheDocument();
        global.fetch.mockRestore && global.fetch.mockRestore();
      });
    it('exibe streak atualizado ao concluir todas as missões', async () => {
      const fakeMissoes = [
        { id: 1, titulo: 'Missão 1', tipo: 'treino', meta: 1, recompensa: '🔥 +5 pontos', icone: '🔥', progresso: 0, concluida: false },
        { id: 2, titulo: 'Missão 2', tipo: 'agua', meta: 1, recompensa: '💧 +3 pontos', icone: '💧', progresso: 0, concluida: false }
      ];
      const fakeStreak = { streak: 1 };
      global.fetch = jest.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => fakeMissoes }) // GET missões
        .mockResolvedValueOnce({ ok: true, json: async () => fakeStreak }) // GET streak
        .mockResolvedValue({ ok: true, json: async () => ({}) }); // POSTs
      render(<MissoesDiariasStreaks userId="test-user" />);
      // Concluir todas as missões
      const botoes = await screen.findAllByRole('button', { name: '+1' });
      for (const botao of botoes) {
        userEvent.click(botao);
      }
      // O streak deve ser atualizado para 2 (1 + 1)
      expect(await screen.findByText('2 🔥')).toBeInTheDocument();
      global.fetch.mockRestore && global.fetch.mockRestore();
    });
  import userEvent from '@testing-library/user-event';
    it('botão +1 atualiza progresso e exibe missão concluída', async () => {
      const fakeMissoes = [
        { id: 1, titulo: 'Missão Interativa', tipo: 'treino', meta: 1, recompensa: '🔥 +5 pontos', icone: '🔥', progresso: 0, concluida: false }
      ];
      const fakeStreak = { streak: 0 };
      // Mock para todas as chamadas fetch (GET missões, GET streak, POST missões, POST streak)
      global.fetch = jest.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => fakeMissoes }) // GET missões
        .mockResolvedValueOnce({ ok: true, json: async () => fakeStreak }) // GET streak
        .mockResolvedValue({ ok: true, json: async () => ({}) }); // POST missões e POST streak
      render(<MissoesDiariasStreaks userId="test-user" />);
      expect(await screen.findByText('Missão Interativa')).toBeInTheDocument();
      const botao = await screen.findByRole('button', { name: '+1' });
      userEvent.click(botao);
      expect(await screen.findByText('Concluída!')).toBeInTheDocument();
      global.fetch.mockRestore && global.fetch.mockRestore();
    });
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
