import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock fetch para login, cadastro e feed
beforeEach(() => {
  jest.spyOn(global, 'fetch').mockImplementation((url, opts) => {
    if (url.includes('/auth/login')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ access_token: 'fake-token', email: 'user@exemplo.com', nome: 'Usuário Teste', id: 'test-user' })
      });
    }
    if (url.includes('/auth/registro')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ access_token: 'fake-token', email: 'novo@exemplo.com', nome: 'Novo Usuário', id: 'novo-user' })
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
  global.fetch.mockRestore && global.fetch.mockRestore();
  window.localStorage.clear();
});

describe('Fluxo completo: login + onboarding + feed', () => {
  it('realiza login, onboarding e exibe feed', async () => {
    render(<App />);
    // Bem-vindo
    expect(screen.getByText(/Bem-vindo/)).toBeInTheDocument();
    // Ir para login
    fireEvent.click(screen.getByText('Já tenho conta'));
    // Preencher login
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'user@exemplo.com' } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Entrar'));
    // Feed deve aparecer após login
    await waitFor(() => expect(screen.getByText('Feed de Atividades')).toBeInTheDocument());
    // Conquista e desafio do feed
    expect(screen.getByText(/Conquista:/)).toBeInTheDocument();
    expect(screen.getByText(/Desafio concluído:/)).toBeInTheDocument();
  });

  it('realiza cadastro, onboarding e exibe feed', async () => {
    render(<App />);
    // Bem-vindo
    expect(screen.getByText(/Bem-vindo/)).toBeInTheDocument();
    // Ir para cadastro
    fireEvent.click(screen.getByText('Sou novo por aqui'));
    // Preencher cadastro
    fireEvent.change(screen.getByPlaceholderText('Nome'), { target: { value: 'Novo Usuário' } });
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'novo@exemplo.com' } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Cadastrar'));
    // Onboarding profile
    await waitFor(() => expect(screen.getByText(/Personalize seu perfil/)).toBeInTheDocument());
    // Preencher idade e sexo
    fireEvent.change(screen.getByLabelText(/Idade/), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText(/Sexo/), { target: { value: 'M' } });
    fireEvent.click(screen.getByText('Próximo'));
    // Objetivo e nível
    fireEvent.click(screen.getByText('Próximo'));
    // Dias e tempo
    fireEvent.change(screen.getByLabelText(/Dias por semana/), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText(/Duração média/), { target: { value: '60' } });
    fireEvent.click(screen.getByText('Finalizar'));
    // Feed deve aparecer após onboarding
    await waitFor(() => expect(screen.getByText('Feed de Atividades')).toBeInTheDocument());
    expect(screen.getByText(/Conquista:/)).toBeInTheDocument();
    expect(screen.getByText(/Desafio concluído:/)).toBeInTheDocument();
  });
});
