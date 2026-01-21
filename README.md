# APP-1.0 Workspace

Este repositório reúne o backend Java (app-trainer-java-web), o serviço de ML em Python (ml-service) e a suíte de testes.

## Testes Automatizados
- Execução completa (Smoke, Pytest, SQLi):
```powershell
cd APP-1.0
./tests/run-all.ps1
```
- Detalhes e parâmetros dos testes (incluindo SQL injection) estão documentados em:
  - app-trainer-java-web/app-trainer-java-web/README.md

## Como Fazer Deploy
Para instruções completas de deploy (Render e Railway), consulte:
- [DEPLOYMENT.md](DEPLOYMENT.md)

Inclui:
- Dockerfiles para Java e ML
- Blueprint do Render (render.yaml)
- Variáveis de ambiente necessárias (JWT, DB, PORT)
