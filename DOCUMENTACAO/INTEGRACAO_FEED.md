# Integração do Feed de Atividades

## Visão Geral
Este documento explica o funcionamento da integração do feed de atividades entre o frontend React e o backend Python (FastAPI), incluindo persistência, sincronização offline/online e testes automatizados.

---

## Endpoints Backend

### 1. GET `/api/feed?user_id=...`
- Retorna o feed de atividades do usuário (conquistas, desafios, etc).
- Lê os eventos do arquivo `data/feed.json`.
- Ordena por data decrescente.
- Exemplo de resposta:
```json
[
  { "id": "...", "user_id": "test-user", "tipo": "conquista", "descricao": "Conquista: Primeiro treino", "data": "2026-01-27T13:00:00.000Z", "extras": {} }
]
```

### 2. POST `/api/feed`
- Adiciona novo evento ao feed do usuário.
- Evita duplicidade (mesmo user_id, tipo, descricao e data próxima).
- Persiste em `data/feed.json`.
- Exemplo de payload:
```json
{
  "user_id": "test-user",
  "tipo": "conquista",
  "descricao": "Conquista: Primeiro treino",
  "data": "2026-01-27T13:00:00.000Z",
  "extras": {}
}
```

---

## Fluxo no Frontend

- O componente `FeedAtividades` busca o feed do backend. Se offline, usa dados locais do `localStorage`.
- Eventos (conquistas, desafios) são registrados via `addFeedEvent`, que faz POST para o backend. Se offline, salva localmente em `dashboard_offline_feed`.
- Ao voltar online, a função `syncOfflineFeed` envia todos os eventos locais para o backend e limpa o localStorage.
- Listener automático: `window.addEventListener('online', ...)` garante sincronização assim que a conexão retorna.

---

## Testes Automatizados

- Testes simulam fetch do backend e fallback local.
- Teste específico valida que eventos offline são sincronizados ao voltar online e removidos do localStorage.
- Mock do fetch garante que todos os eventos são enviados com sucesso.

---

## Boas Práticas e Observações

- Persistência robusta: eventos nunca são perdidos, mesmo offline.
- Sincronização automática evita duplicidade e garante integridade dos dados.
- Testes cobrem todos os fluxos críticos (online, offline, sincronização).
- Backend valida duplicidade para evitar registros repetidos.

---

## Expansão
- Para novos tipos de eventos, basta seguir o mesmo padrão (tipo, descricao, extras).
- Para auditoria, o feed pode ser exportado ou consultado diretamente via endpoint.

---

## Manutenção
- Para atualizar regras de duplicidade ou formato, ajuste apenas o backend.
- Para expandir sincronização, ajuste a função `syncOfflineFeed`.

---

## Dúvidas?
Consulte este documento ou o código dos arquivos:
- `ml-service/main.py` (backend)
- `dashboard-react/src/utils/feed.js` (frontend)
- `dashboard-react/src/components/FeedAtividades.jsx` (componente)
- `dashboard-react/src/components/FeedAtividades.test.jsx` (testes)

---

Equipe APP Trainer
27/01/2026
