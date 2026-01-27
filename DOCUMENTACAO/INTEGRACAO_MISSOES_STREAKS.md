# Integração de Missões Diárias & Streaks

## Visão Geral
Este documento detalha a integração dos módulos de missões diárias e streaks entre frontend React e backend Python (FastAPI), incluindo persistência, sincronização offline/online e testes automatizados.

---

## Endpoints Backend

### 1. GET `/api/missoes-diarias?user_id=...`
- Retorna as missões do dia para o usuário.
- Lê do arquivo `data/missoes_diarias.json`.
- Exemplo de resposta:
```json
[
  { "id": 1, "titulo": "Complete 1 treino hoje", "tipo": "treino", "meta": 1, "recompensa": "🔥 +5 pontos", "icone": "🔥", "progresso": 0, "concluida": false }
]
```

### 2. POST `/api/missoes-diarias`
- Salva o progresso das missões do usuário.
- Persiste em `data/missoes_diarias.json`.
- Payload:
```json
{
  "user_id": "test-user",
  "data": "2026-01-27",
  "missoes": [ ... ]
}
```

### 3. GET `/api/streak?user_id=...`
- Retorna o streak atual do usuário.
- Lê de `data/streaks.json`.
- Exemplo: `{ "streak": 3 }`

### 4. POST `/api/streak`
- Salva o streak do usuário.
- Payload:
```json
{
  "user_id": "test-user",
  "streak": 4
}
```

---

## Fluxo no Frontend
- O componente `MissoesDiariasStreaks` busca missões e streak do backend, com fallback local.
- Progresso e streak são salvos tanto no backend quanto no localStorage para garantir funcionamento offline.
- Ao voltar online, dados locais podem ser sincronizados manualmente ou automaticamente (expansível).
- Eventos de conclusão de missão e aumento de streak são registrados no feed de atividades.

---

## Testes Automatizados
- Testes cobrem cenários online, offline, atualização de progresso, streak e fallback local.
- Garantem que o componente funciona corretamente em todos os estados.

---

## Boas Práticas
- Persistência dupla (backend + localStorage) garante robustez.
- Fallback e sincronização evitam perda de dados.
- Testes automatizados validam todos os fluxos críticos.

---

## Expansão
- Novos tipos de missões podem ser adicionados facilmente.
- Sincronização offline/online pode ser aprimorada para envio automático dos dados locais.

---

## Manutenção
- Para atualizar regras ou formato, ajuste endpoints e componente conforme necessário.
- Para expandir, siga o padrão dos dados e endpoints já implementados.

---

## Dúvidas?
Consulte este documento ou os arquivos:
- `ml-service/main_ml.py` (backend)
- `dashboard-react/src/components/MissoesDiariasStreaks.jsx` (componente)
- `dashboard-react/src/components/MissoesDiariasStreaks.test.jsx` (testes)

---

Equipe APP Trainer
27/01/2026
