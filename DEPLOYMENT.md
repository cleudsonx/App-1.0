# Deploy (Render e Railway)

Este guia descreve como publicar os serviços Java (backend) e Python (ML) usando Render e Railway.

## Render.com

Pré-requisitos:
- Conta Render e repositório App-1.0 no GitHub.
- Branch `main` com `render.yaml` na raiz.

Passos:
1. Acesse Render > New + > Blueprint > selecione o repo `App-1.0`.
2. Render detectará `render.yaml` criando:
   - Web Service `app-trainer-java` (porta 8081)
   - Web Service `ml-service` (porta 8001)
   - Database `app-trainer-db` (PostgreSQL gerenciado)
3. Em `app-trainer-java` > Environment, defina:
  - `JWT_SECRET_KEY` (secret forte)
  - Mantenha `HTTPS_ENABLED=false` no Render (TLS já é terminado pela borda do provedor)
4. Em `ml-service` > Environment, defina:
   - `JWT_SECRET_KEY` (igual ao backend)
5. Deploy: Render fará build dos Dockerfiles e exporá URLs públicas.

Notas:
- Health checks: `/api/health` (Java), `/ml/health` (ML).
- Conexão com Postgres é injetada via `DB_URL`, `DB_USER`, `DB_PASSWORD`.
- Se precisar de TLS dentro do container (ex: VPS/K8s), habilite `HTTPS_ENABLED=true` e forneça o keystore conforme seção "HTTPS" abaixo.

## Railway.app

Pré-requisitos:
- Railway CLI instalado (`npm i -g @railway/cli`).
- Conta Railway e projeto novo.

Estratégia: 2 serviços Docker + Postgres plugin.

Passos:
```bash
# Inicialize o projeto (na raiz APP-1.0)
railway init

# Crie serviço Java apontando para subpasta
railway up --service app-trainer-java --dockerfile "app-trainer-java-web/app-trainer-java-web/Dockerfile" \
  --environment production

# Crie serviço ML apontando para subpasta
railway up --service ml-service --dockerfile "ml-service/Dockerfile" \
  --environment production

# Adicione Postgres
railway add --plugin postgresql
```

Configure variáveis de ambiente no Railway (ambos serviços):
- `JWT_SECRET_KEY` (mesmo valor nos dois)
- `PORT`: Java=8081, ML=8001 (ou deixe Railway definir automaticamente e respeite `$PORT`)
- Java (se usar DB gerenciado Railway):
  - `DB_URL`, `DB_USER`, `DB_PASSWORD` (copiar de `POSTGRES*` ou `DATABASE_URL` conforme plugin)

Dicas:
- Exponha `0.0.0.0` e respeite `PORT` (já no Dockerfile).
- Para HTTPS, prefira TLS terminado pelo provedor (proxy) e mantenha `HTTPS_ENABLED=false` no Java. Para TLS dentro do container, veja seção "HTTPS".

## HTTPS

- Padrão recomendado em Render/Railway: TLS terminado na borda → `HTTPS_ENABLED=false` no container.
- Para TLS no próprio Java (self-managed):
  - Gere um keystore PKCS12 e **não** versione o arquivo.
  - Monte o keystore em `/app/certs/app-trainer.p12` (diretório já criado na imagem).
  - Variáveis obrigatórias quando `HTTPS_ENABLED=true`:
    - `HTTPS_PORT` (ex: 8443)
    - `TLS_KEYSTORE_PATH` (ex: `/app/certs/app-trainer.p12`)
    - `TLS_KEYSTORE_PASSWORD` (senha do keystore)
    - `JWT_SECRET_KEY` (segredo forte)
  - Suba expondo 8081/8443 conforme necessidade:
    ```bash
    docker run -d \
      -p 8081:8081 -p 8443:8443 \
      -v /path/para/certs:/app/certs:ro \
      -e HTTPS_ENABLED=true \
      -e HTTPS_PORT=8443 \
      -e TLS_KEYSTORE_PATH=/app/certs/app-trainer.p12 \
      -e TLS_KEYSTORE_PASSWORD=CHANGEME \
      -e JWT_SECRET_KEY=CHANGEME_SUPER_SECRET \
      --name app-trainer app-trainer:latest
    ```
- Se `HTTPS_ENABLED=true` e o keystore não existir ou não tiver senha, o servidor falha na inicialização (fail-fast).
