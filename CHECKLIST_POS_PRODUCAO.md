# ✅ Checklist Pós-Produção - APP Trainer

## 1. Monitoramento
- [ ] Configurar alertas de erro (logs, healthcheck)
- [ ] Monitorar uso de CPU/RAM/DB
- [ ] Validar uptime dos serviços (Java, Python, PostgreSQL)
- [ ] Ativar healthcheck automático (scripts ou serviços)

## 2. Backup & Restore
- [ ] Agendar backup diário com backup-db.ps1
- [ ] Testar restore com psql -U usuario -d banco < arquivo.sql
- [ ] Validar integridade dos dados restaurados

## 3. Segurança
- [ ] Validar HTTPS ativo em todos domínios
- [ ] Auditar logs para garantir sanitização
- [ ] Revisar permissões de arquivos e diretórios
- [ ] Validar rotação de senhas/secrets

## 4. Usuários & Suporte
- [ ] Testar cadastro, login, onboarding, notificações
- [ ] Validar fluxo de recuperação de senha
- [ ] Disponibilizar canal de suporte (email, chat)

## 5. Deploy & Rollback
- [ ] Documentar processo de rollback (restore + restart)
- [ ] Validar rollback em ambiente de staging
- [ ] Manter backups dos últimos 7 dias

## 6. Documentação
- [ ] Atualizar README com instruções de uso, backup e restore
- [ ] Documentar endpoints, variáveis de ambiente e scripts

---

**Observação:** Execute este checklist após cada deploy ou atualização crítica.
