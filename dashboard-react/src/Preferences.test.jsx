import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

const mockNotifySettings = {
  horario: '08:30',
  tipos: { missoes: true, desafios: false, conquistas: true, streaks: false },
  push: true
};

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
    if (url.includes('/api/notify-settings')) {
      return Promise.resolve({
        ok: true,
        json: async () => mockNotifySettings
      });
    }
    if (url.includes('/api/feed')) {
      return Promise.resolve({
        ok: true,
        json: async () => ([
          { tipo: 'conquista', titulo: 'Primeiro treino', data: new Date().toISOString() }
        ])
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

describe('Preferências do usuário', () => {
  it('salva e restaura preferências de notificações após login', async () => {
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
    // Preferências devem ser salvas no localStorage
    const prefs = JSON.parse(localStorage.getItem('dashboard_notify_settings'));
    expect(prefs).toEqual(mockNotifySettings);
    // Simula reload do app
    window.location.reload();
    // Preferências devem ser restauradas
    expect(JSON.parse(localStorage.getItem('dashboard_notify_settings'))).toEqual(mockNotifySettings);
  });
});
