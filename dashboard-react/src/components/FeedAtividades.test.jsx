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

  it('sincroniza feed offline ao voltar online', async () => {
    // Simula evento offline salvo
    const offlineFeed = [
      { user_id: 'test-user', tipo: 'conquista', descricao: 'Conquista Offline', data: new Date().toISOString(), extras: {} }
    ];
    window.localStorage.setItem('dashboard_offline_feed', JSON.stringify(offlineFeed));
    // Mock fetch para backend
    let postCalled = false;
    global.fetch = jest.fn().mockImplementation((url, opts) => {
      if (url.includes('/api/feed') && opts.method === 'POST') {
        postCalled = true;
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });
    // Dispara evento online e aguarda feedSyncComplete
    window.dispatchEvent(new Event('online'));
    await waitFor(() => postCalled);
    await waitFor(() => expect(window.localStorage.getItem('dashboard_offline_feed')).toBeNull());
    global.fetch.mockRestore && global.fetch.mockRestore();
  });
});
