import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

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
        json: async () => ([
          { tipo: 'conquista', titulo: 'Primeiro treino', data: new Date().toISOString() },
          { tipo: 'desafio', titulo: 'Desafio 7 dias', data: new Date().toISOString() }
        ])
      });
    }
    if (url.includes('/api/notify-settings')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ horario: '09:00', tipos: { missoes: true, desafios: true, conquistas: true, streaks: true }, push: false })
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

describe('Logout flow', () => {
  it('realiza login e logout limpando estado e localStorage', async () => {
    render(<App />);
    // Login
    fireEvent.click(screen.getByText('Já tenho conta'));
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'user@exemplo.com' } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Entrar'));
    await waitFor(() => expect(screen.getByText('Feed de Atividades')).toBeInTheDocument());
    // Logout
    fireEvent.click(screen.getByText('Sair'));
    // Deve voltar para tela de login
    expect(screen.getByText(/Bem-vindo/)).toBeInTheDocument();
    // localStorage deve estar limpo
    expect(localStorage.getItem('dashboard_user')).toBeNull();
    expect(localStorage.getItem('dashboard_onboarding')).toBeNull();
  });
});
