# Teste de Navegabilidade - Coach Virtual de Musculação

**Data:** 16/01/2026  
**Versão:** 2.0  
**Testador:** Automatizado + Manual

---

## 👤 PERSONA DE TESTE

### Marina Silva Santos
| Atributo | Valor |
|----------|-------|
| **Idade** | 28 anos |
| **Sexo** | Feminino |
| **Peso** | 62 kg |
| **Altura** | 165 cm |
| **Objetivo** | Ganhar Massa (Hipertrofia) |
| **Nível** | Intermediário (1 ano de treino) |
| **Disponibilidade** | 4 dias por semana |
| **Local** | Academia |
| **Email** | marina.teste@email.com |
| **Senha** | teste123 |

### Contexto da Persona
Marina é analista de sistemas, trabalha em home office e quer ganhar massa muscular. Já treina há 1 ano mas não teve os resultados esperados por falta de orientação personalizada. Busca um coach virtual que entenda suas limitações de tempo e crie treinos eficientes.

---

## 📋 ROTEIRO DE TESTE

### FASE 1: Tela de Autenticação

#### Teste 1.1 - Carregamento Inicial
- [ ] Aplicação carrega sem erros no console
- [ ] Tela de login aparece corretamente
- [ ] Logo e branding visíveis
- [ ] Tabs "Entrar" e "Criar conta" funcionais

#### Teste 1.2 - Registro de Novo Usuário
- [ ] Clicar na tab "Criar conta"
- [ ] Formulário de registro aparece
- [ ] Preencher nome: "Marina Silva Santos"
- [ ] Preencher email: "marina.teste@email.com"
- [ ] Preencher senha: "teste123"
- [ ] Clicar em "Criar conta"
- [ ] Loading overlay aparece
- [ ] Registro bem-sucedido (toast de sucesso)

### FASE 2: Onboarding

#### Teste 2.1 - Step 1: Dados Básicos
- [ ] Tela de onboarding aparece após registro
- [ ] Título "Vamos começar!" visível
- [ ] Preencher idade: 28
- [ ] Selecionar sexo: Feminino
- [ ] Preencher peso: 62
- [ ] Preencher altura: 165
- [ ] Botão "Continuar" funciona
- [ ] Avança para step 2

#### Teste 2.2 - Step 2: Objetivo
- [ ] Título "Qual seu objetivo?" visível
- [ ] 4 cards de objetivo visíveis
- [ ] Clicar em "Ganhar Massa"
- [ ] Card fica selecionado (active)
- [ ] Botão "Continuar" funciona

#### Teste 2.3 - Step 3: Experiência
- [ ] Título "Sua experiência" visível
- [ ] 3 cards de nível visíveis
- [ ] Clicar em "Intermediário"
- [ ] Card fica selecionado
- [ ] Botão "Continuar" funciona

#### Teste 2.4 - Step 4: Disponibilidade
- [ ] Título "Disponibilidade" visível
- [ ] Botões de dias (2-6) visíveis
- [ ] Selecionar 4 dias
- [ ] Label atualiza para "4 dias por semana"
- [ ] Opções de tempo visíveis
- [ ] Botão "Continuar" funciona

#### Teste 2.5 - Step 5: Local
- [ ] Título "Onde você treina?" visível
- [ ] Cards Academia/Casa visíveis
- [ ] Clicar em "Academia"
- [ ] Card fica selecionado
- [ ] Botão "Começar" aparece
- [ ] Clicar em "Começar"
- [ ] Loading "Criando seu plano..."
- [ ] Toast de sucesso

### FASE 3: Aplicativo Principal

#### Teste 3.1 - Dashboard (Home)
- [ ] Tela principal aparece
- [ ] Header com saudação personalizada ("Bom dia, Marina")
- [ ] Avatar com iniciais "MS"
- [ ] Card de treino do dia visível
- [ ] Progresso semanal visível
- [ ] Navegação inferior visível

#### Teste 3.2 - Navegação
- [ ] Tab Home ativa por padrão
- [ ] Clicar em "Treino" - muda conteúdo
- [ ] Clicar em "Coach" (central) - abre chat
- [ ] Clicar em "Progresso" - muda conteúdo
- [ ] Clicar em "Perfil" - mostra perfil

#### Teste 3.3 - Chat com Coach
- [ ] Área de chat carrega
- [ ] Campo de input visível
- [ ] Perguntas rápidas visíveis
- [ ] Digitar: "Qual treino devo fazer hoje?"
- [ ] Enviar mensagem
- [ ] Indicador de digitação aparece
- [ ] Resposta do coach chega
- [ ] Mensagem aparece formatada

#### Teste 3.4 - Tela de Perfil
- [ ] Avatar e nome visíveis
- [ ] Objetivo exibido
- [ ] Stats (peso, altura, idade) corretos
- [ ] Botão de logout funciona

### FASE 4: Persistência de Sessão

#### Teste 4.1 - Recarregar Página
- [ ] Recarregar página (F5)
- [ ] Usuário continua logado
- [ ] Vai direto para dashboard
- [ ] Dados do perfil mantidos

#### Teste 4.2 - Logout
- [ ] Clicar no botão de logout
- [ ] Confirmação aparece
- [ ] Confirmar logout
- [ ] Volta para tela de login
- [ ] Toast "Desconectado com sucesso"

#### Teste 4.3 - Login Novamente
- [ ] Na tab "Entrar"
- [ ] Preencher email: marina.teste@email.com
- [ ] Preencher senha: teste123
- [ ] Clicar em "Entrar"
- [ ] Vai direto para dashboard (pula onboarding)

---

## 🔍 CHECKLIST DE RESPONSIVIDADE

### Desktop (1280px+)
- [ ] Layout em grid funciona
- [ ] Espaçamentos adequados
- [ ] Cards lado a lado

### Tablet (768px - 1024px)
- [ ] Layout adapta
- [ ] Navegação funciona
- [ ] Touch targets adequados

### Mobile (até 480px)
- [ ] Layout em coluna única
- [ ] Navegação inferior fixa
- [ ] Inputs usáveis
- [ ] Teclado não sobrepõe

---

## 🐛 PROBLEMAS ENCONTRADOS

| # | Severidade | Descrição | Status |
|---|------------|-----------|--------|
| 1 | Alta | IDs de inputs não correspondiam (onboard-* vs onb-*) | ✅ Corrigido |
| 2 | Alta | Atributos data-* não correspondiam (data-goal vs data-value) | ✅ Corrigido |
| 3 | Média | Validação de altura em metros vs cm | ✅ Corrigido |
| 4 | Média | Valores de local (gym/home vs academia/casa) | ✅ Corrigido |

---

## ✅ RESULTADO FINAL

- **Total de Testes API:** 4
- **Passou:** 4
- **Falhou:** 0
- **Taxa de Sucesso:** 100%

### Testes de API Executados:
- ✅ POST /auth/registro - Registro de usuário
- ✅ POST /perfil/{id}/completar - Completar perfil (onboarding)
- ✅ POST /coach/{id}/mensagem - Chat com coach IA
- ✅ POST /treino/recomendar/{id} - Gerar treino personalizado

---

## 📝 NOTAS DO TESTADOR

**Data/Hora:** 16/01/2026 22:58

**Observações:**
1. Servidores Java (8081) e Python (8001) funcionando corretamente
2. Fluxo de registro → onboarding → chat → treino funcional via API
3. Interface frontend precisa de teste manual para validar UX
4. Responsividade implementada para mobile/tablet/desktop

**Próximos Passos:**
1. Executar teste manual no navegador usando o script `teste-automatizado.js`
2. Testar em diferentes resoluções
3. Validar persistência de sessão (localStorage)

