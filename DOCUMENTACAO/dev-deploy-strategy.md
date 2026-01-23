# Estratégia de Deploy em Ambiente de Desenvolvimento

Este documento descreve o fluxo recomendado para testar e validar o sistema antes de subir para produção.

## 1. Ambiente Isolado (Local/Dev)
- Utilize Docker Compose para subir todos os serviços (Java, Python, banco de dados) localmente.
- Configure variáveis de ambiente específicas para desenvolvimento usando arquivos `.env`.
- Garanta que ML_SERVICE_URL, JWT_SECRET_KEY, DB_URL e demais variáveis estejam ajustadas para dev.

## 2. Banco de Dados Separado
- Use um banco local ou em nuvem exclusivo para desenvolvimento.
- Utilize dados de teste ou anonimizado.

## 3. Build e Testes Automatizados
- Compile todos os serviços localmente.
- Execute a suíte de testes automatizados (pytest, smoke-tests, etc).

## 4. Deploy em Cloud de Desenvolvimento
- Suba uma versão dev em Render, Heroku ou AWS (ex: app-trainer-java-dev, ml-service-dev).
- Configure domínios/endpoints separados para dev.

## 5. Validação de Integração
- Teste o fluxo completo: frontend → gateway Java → ML Python → banco de dados.
- Valide CORS, autenticação, proxy e integração entre serviços.

## 6. Revisão de Logs e Erros
- Monitore logs dos serviços para identificar problemas antes do deploy em produção.
- Corrija warnings, erros e falhas de integração.

## 7. Checklist Antes do Deploy em Produção
- Confirme dependências em requirements.txt/Dockerfile.
- Revise variáveis sensíveis (não use segredos reais em dev).
- Faça backup do banco de produção antes de alterações.

---

> Mantenha este documento atualizado conforme o fluxo evoluir.
