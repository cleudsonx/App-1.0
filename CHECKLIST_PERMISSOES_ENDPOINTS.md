# Checklist de Revisão de Permissões e Segurança de Endpoints

## 1. Autenticação Obrigatória
- [ ] Todos os endpoints sensíveis exigem autenticação (token JWT ou sessão)
- [ ] Endpoints públicos documentados e revisados

## 2. Autorização e Perfis de Usuário
- [ ] Endpoints administrativos acessíveis apenas por usuários autorizados
- [ ] Perfis de usuário (admin, comum, coach, etc.) testados em todos os fluxos
- [ ] Testes de acesso negado para usuários não autenticados ou sem permissão

## 3. Métodos HTTP Restritos
- [ ] Apenas métodos necessários expostos (ex: GET para leitura, POST para criação)
- [ ] Métodos não utilizados (PUT, DELETE, PATCH) desabilitados onde não aplicável

## 4. Validação de Input e Output
- [ ] Validação rigorosa de parâmetros recebidos
- [ ] Sanitização de dados enviados e recebidos
- [ ] Respostas de erro não expõem detalhes sensíveis

## 5. Testes Automatizados de Permissão
- [ ] Testes automatizados para endpoints críticos (login, registro, perfil, admin)
- [ ] Testes de acesso negado para usuários não autenticados
- [ ] Testes de acesso negado para usuários sem permissão

## 6. Documentação
- [ ] Documentação dos endpoints públicos e privados
- [ ] Exemplos de uso e respostas esperadas

## 7. Auditoria e Logs
- [ ] Logs de tentativas de acesso negado
- [ ] Logs de ações administrativas

---

> Última revisão: 27/01/2026. Checklist pronto para validação em ambiente de homologação e produção.
