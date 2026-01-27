import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginRegister from './LoginRegister';

describe('LoginRegister', () => {
  it('exibe tela de boas-vindas e navega para login', () => {
    render(<LoginRegister onAuth={jest.fn()} />);
    expect(screen.getByText('Bem-vindo ao APP Trainer!')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Já tenho conta'));
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('exibe tela de cadastro ao clicar em "Sou novo por aqui"', () => {
    render(<LoginRegister onAuth={jest.fn()} />);
    fireEvent.click(screen.getByText('Sou novo por aqui'));
    expect(screen.getByText('Cadastro')).toBeInTheDocument();
  });

  it('mostra erro de login inválido', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({ detail: 'Login inválido' }) });
    render(<LoginRegister onAuth={jest.fn()} />);
    fireEvent.click(screen.getByText('Já tenho conta'));
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'a@a.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123', name: 'senha' } });
    fireEvent.click(screen.getByText('Entrar'));
    expect(await screen.findByText('Login inválido')).toBeInTheDocument();
    global.fetch.mockRestore && global.fetch.mockRestore();
  });

  it('autentica com sucesso e chama onAuth', async () => {
    const fakeUser = { access_token: 'abc123' };
    const onAuth = jest.fn();
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => fakeUser });
    render(<LoginRegister onAuth={onAuth} />);
    fireEvent.click(screen.getByText('Já tenho conta'));
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'a@a.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123', name: 'senha' } });
    fireEvent.click(screen.getByText('Entrar'));
    await waitFor(() => expect(onAuth).toHaveBeenCalledWith(fakeUser));
    global.fetch.mockRestore && global.fetch.mockRestore();
  });
});
