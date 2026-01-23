# Estratégia de Deploy em Ambiente de Desenvolvimento

Este documento descreve o fluxo recomendado para testar e validar o sistema antes de subir para produção.

## Configuração da variável JWT_SECRET_KEY

Para evitar erros de execução, defina JWT_SECRET_KEY conforme o ambiente:

- **Local/dev:**
	- Crie um arquivo `.env` na raiz do projeto e adicione:
		JWT_SECRET_KEY=sua_chave_secreta
	- Ou exporte no terminal antes de rodar:
		export JWT_SECRET_KEY=sua_chave_secreta

- **Docker:**
	- Adicione no Dockerfile:
		ENV JWT_SECRET_KEY=sua_chave_secreta
	- Ou no docker-compose:
		environment:
			- JWT_SECRET_KEY=sua_chave_secreta

- **Render.com:**
	- No arquivo `render.yaml`, inclua em `envVars`:
		- key: JWT_SECRET_KEY
			value: sua_chave_secreta
	- Ou configure pelo painel web do Render.

> Para desenvolvimento, o código possui fallback para `dev_secret_key` caso a variável não esteja definida. Nunca use esse valor em produção!

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
