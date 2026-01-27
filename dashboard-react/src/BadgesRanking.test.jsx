import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

const mockFeed = [
  { tipo: 'conquista', titulo: 'Primeiro treino', data: new Date().toISOString() },
  { tipo: 'desafio', titulo: 'Desafio 7 dias', data: new Date().toISOString() }
];

beforeEach(() => {
  if (!global.fetch) {
    global.fetch = jest.fn();
  }
  jest.spyOn(global, 'fetch').mockImplementation((url, opts) => {
    if (url.includes('/auth/login')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ access_token: 'fake-token', email: 'user@exemplo.com', nome: 'Usuário Teste', id: 'test-user' })
      });
    }
    if (url.includes('/api/feed')) {
      return Promise.resolve({
        ok: true,
        json: async () => mockFeed
      });
    }
    if (url.includes('/api/notify-settings')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ horario: '09:00', tipos: { missoes: true, desafios: true, conquistas: true, streaks: true }, push: false })
      });
    }
    if (url.includes('/api/badges')) {
      return Promise.resolve({
        ok: true,
        json: async () => [
          { nome: 'Primeiro treino', descricao: 'Complete seu primeiro treino', icone: '🏆' },
          { nome: 'Desafio 7 dias', descricao: 'Complete 7 dias seguidos', icone: '🔥' }
        ]
      });
    }
    if (url.includes('/api/ranking')) {
      return Promise.resolve({
        ok: true,
        json: async () => [
          { id: 'test-user', nome: 'Usuário Teste', pontos: 120 },
          { id: 'user2', nome: 'Maria', pontos: 110 },
          { id: 'user3', nome: 'João', pontos: 90 }
        ]
      });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  });
  window.localStorage.clear();
});
afterEach(() => {
  if (global.fetch && global.fetch.mockRestore) {
    global.fetch.mockRestore();
  }
  window.localStorage.clear();
});

describe('Integração Badges + Ranking', () => {
  it('exibe badges e ranking após login', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Já tenho conta'));
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'user@exemplo.com' } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Entrar'));
    // Preencher onboarding
    await waitFor(() => expect(screen.getByText(/Personalize seu perfil/)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Idade/), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText(/Sexo/), { target: { value: 'M' } });
    fireEvent.click(screen.getByText('Próximo'));
    fireEvent.click(screen.getByText('Próximo'));
    fireEvent.change(screen.getByLabelText(/Dias por semana/), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText(/Duração média/), { target: { value: '60' } });
    fireEvent.click(screen.getByText('Finalizar'));
    await waitFor(() => expect(screen.getByText('Feed de Atividades')).toBeInTheDocument());
    // Badges
    expect(screen.getByText('Complete seu primeiro treino')).toBeInTheDocument();
    expect(screen.getByText('Complete 7 dias seguidos')).toBeInTheDocument();
    // Ranking
    expect(screen.getByText('Ranking')).toBeInTheDocument();
    expect(screen.getByText(/Usuário Teste/)).toBeInTheDocument();
    expect(screen.getByText(/Maria/)).toBeInTheDocument();
    expect(screen.getByText(/João/)).toBeInTheDocument();
  });
});
