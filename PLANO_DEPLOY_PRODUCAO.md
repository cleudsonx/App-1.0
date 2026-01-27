# Plano de Deploy em Produção - APP Trainer

## 1. Pré-Deploy
- [ ] Validar todos os itens dos checklists pós-produção, segurança e permissões
- [ ] Realizar backup completo do banco de dados (backup-db.ps1)
- [ ] Notificar equipe e agendar janela de manutenção
- [ ] Garantir scripts de restore e rollback prontos

## 2. Deploy
- [ ] Parar serviços antigos (Java, Python, banco, frontend)
- [ ] Substituir artefatos (binários, containers, scripts, frontend)
- [ ] Aplicar variáveis de ambiente e segredos atualizados
- [ ] Iniciar serviços na ordem: banco → backend → frontend
- [ ] Executar healthcheck_all.ps1 e monitoramento_recursos.ps1

## 3. Pós-Deploy
- [ ] Validar acesso ao sistema (login, cadastro, funcionalidades principais)
- [ ] Verificar logs de erro e alertas automáticos
- [ ] Validar monitoramento de recursos e healthcheck
- [ ] Testar restore em ambiente de staging (opcional)
- [ ] Atualizar documentação de deploy e incidentes

## 4. Rollback (se necessário)
- [ ] Parar serviços
- [ ] Restaurar backup mais recente (restore-db.ps1)
- [ ] Reverter artefatos para versão anterior
- [ ] Iniciar serviços e validar funcionamento

## 5. Comunicação
- [ ] Avisar stakeholders sobre conclusão do deploy
- [ ] Registrar ocorrências e lições aprendidas

---

> Última revisão: 27/01/2026. Siga este plano para garantir um deploy seguro, controlado e auditável.
