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
        ok: false,
        json: async () => ({ detail: 'Credenciais inválidas' })
      });
    }
    if (url.includes('/auth/registro')) {
      return Promise.resolve({
        ok: false,
        json: async () => ({ detail: 'E-mail já cadastrado' })
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

describe('Erros de autenticação', () => {
  it('exibe erro ao tentar login inválido', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Já tenho conta'));
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'user@exemplo.com' } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'errada' } });
    fireEvent.click(screen.getByText('Entrar'));
    await waitFor(() => expect(screen.getByText(/Credenciais inválidas/)).toBeInTheDocument());
  });

  it('exibe erro ao tentar cadastro com e-mail já cadastrado', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Sou novo por aqui'));
    fireEvent.change(screen.getByPlaceholderText('Nome'), { target: { value: 'Usuário' } });
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'user@exemplo.com' } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Cadastrar'));
    await waitFor(() => expect(screen.getByText(/E-mail já cadastrado/)).toBeInTheDocument());
  });
});
