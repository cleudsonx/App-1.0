# Checklist de Segurança para Produção

## 1. Variáveis Sensíveis e Segredos
- [x] JWT_SECRET, DB_PASSWORD, SMTP, etc. definidos via variáveis de ambiente
- [x] Nunca versionar segredos em código ou repositório
- [x] Validar presença de variáveis obrigatórias no startup

## 2. HTTPS e Headers de Segurança
- [x] HTTPS obrigatório em produção
- [x] Redirecionamento HTTP → HTTPS
- [x] Headers: Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Content-Security-Policy

## 3. CORS
- [x] CORS restritivo: apenas domínios autorizados
- [x] Métodos e headers permitidos explicitamente

## 4. Rate Limiting e Proteção de Endpoints
- [x] Rate limiting ativo em endpoints sensíveis (login, registro, etc.)
- [x] Proteção contra brute force
- [x] Bloqueio temporário após tentativas inválidas

## 5. Atualização de Dependências
- [x] Dependências revisadas e atualizadas
- [x] Sem vulnerabilidades conhecidas (npm audit, pip-audit, osv-scanner)

## 6. Proteção contra Ataques Comuns
- [x] SQL Injection: uso de prepared statements/ORM
- [x] XSS: sanitização de entradas e saídas
- [x] CSRF: tokens e SameSite cookies
- [x] Validação de input rigorosa

## 7. Backup e Restore
- [x] Backup automático agendado
- [x] Restore testado e documentado
- [x] Backups armazenados em local seguro

## 8. Logs e Auditoria
- [x] Logs de acesso, autenticação e erros ativos
- [x] Sanitização de dados sensíveis nos logs
- [x] Retenção e rotação de logs configuradas

## 9. Monitoramento e Alertas
- [x] Healthcheck automatizado
- [x] Alertas configuráveis para falhas críticas
- [x] Monitoramento de recursos (CPU, RAM, disco)

## 10. Revisão Final
- [x] Testes automatizados de segurança executados
- [x] Checklist pós-produção revisado
- [x] Documentação de incidentes e plano de resposta

---

> Checklist validado e pronto para auditoria. Última revisão: 27/01/2026.
