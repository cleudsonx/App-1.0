import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

const mockNotifySettings = {
  horario: '09:00',
  tipos: { missoes: true, desafios: true, conquistas: true, streaks: true },
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
  // Mock Notification API
  global.Notification = {
    permission: 'granted',
    requestPermission: jest.fn(() => Promise.resolve('granted'))
  };
  global.notificar = jest.fn();
});
afterEach(() => {
  if (global.fetch && global.fetch.mockRestore) {
    global.fetch.mockRestore();
  }
  window.localStorage.clear();
  delete global.Notification;
  delete global.notificar;
});

describe('Notificações', () => {
  it('agenda e exibe notificações após login se permitido', async () => {
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
    // Aguarda agendamento de notificações
    await waitFor(() => expect(global.notificar).toHaveBeenCalled(), { timeout: 3000 });
    expect(global.notificar.mock.calls.length).toBeGreaterThan(0);
  });
});
