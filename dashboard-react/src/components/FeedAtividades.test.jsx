import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FeedAtividades from './FeedAtividades';

describe('FeedAtividades', () => {
  it('renderiza feed vazio', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
    render(<FeedAtividades userId="test-user" />);
    expect(await screen.findByText('Nenhuma atividade recente.')).toBeInTheDocument();
    global.fetch.mockRestore && global.fetch.mockRestore();
  });

  it('renderiza conquistas do backend', async () => {
    const fakeFeed = [
      { tipo: 'conquista', titulo: 'Primeiro treino', data: new Date().toISOString() }
    ];
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => fakeFeed });
    render(<FeedAtividades userId="test-user" />);
    expect(await screen.findByText(/Conquista:/)).toBeInTheDocument();
    const conquistas = await screen.findAllByText((_, el) => el.textContent.includes('Primeiro treino'));
    expect(conquistas.length).toBeGreaterThan(0);
    global.fetch.mockRestore && global.fetch.mockRestore();
  });

  it('renderiza desafios do backend', async () => {
    const fakeFeed = [
      { tipo: 'desafio', titulo: 'Desafio 7 dias', data: new Date().toISOString() }
    ];
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => fakeFeed });
    render(<FeedAtividades userId="test-user" />);
    expect(await screen.findByText(/Desafio concluído:/)).toBeInTheDocument();
    const desafios = await screen.findAllByText((_, el) => el.textContent.includes('Desafio 7 dias'));
    expect(desafios.length).toBeGreaterThan(0);
    global.fetch.mockRestore && global.fetch.mockRestore();
  });

  it('renderiza feed do localStorage se backend falhar', async () => {
    const conquistas = [{ nome: 'Conquista Local', data: new Date().toISOString() }];
    const desafios = [{ titulo: 'Desafio Local', meta: 1, progresso: 1, data: new Date().toISOString() }];
    window.localStorage.setItem('dashboard_user_conquistas', JSON.stringify(conquistas));
    window.localStorage.setItem('dashboard_user_desafios', JSON.stringify(desafios));
    global.fetch = jest.fn().mockRejectedValue(new Error('Backend offline'));
    render(<FeedAtividades userId="test-user" />);
    const conquistasLocal = await screen.findAllByText((_, el) => el.textContent.includes('Conquista Local'));
    expect(conquistasLocal.length).toBeGreaterThan(0);
    const desafiosLocal = await screen.findAllByText((_, el) => el.textContent.includes('Desafio Local'));
    expect(desafiosLocal.length).toBeGreaterThan(0);
    global.fetch.mockRestore && global.fetch.mockRestore();
  });
});
