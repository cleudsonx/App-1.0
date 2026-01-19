/**
 * SCRIPT DE TESTE AUTOMATIZADO - Coach Virtual de Musculação
 * VERSÃO 2.0 - Atualizado com novos campos
 * 
 * Persona: Marina Silva Santos (28 anos, intermediária, hipertrofia)
 * 
 * Instruções:
 * 1. Abra http://localhost:8081 no navegador
 * 2. Abra o Console (F12 > Console)
 * 3. Cole e execute este script
 * 4. Siga as instruções no console
 */

const TesteNavegabilidade = {
    persona: {
        nome: 'Marina Silva Santos',
        email: 'marina.teste@email.com',
        senha: 'teste123',
        idade: 28,
        sexo: 'F',
        peso: 62,
        altura: 165,
        objetivo: 'hipertrofia',
        nivel: 'intermediario',
        dias: 4,
        duracao: 60,
        local: 'academia'
    },
    
    resultados: [],
    fase: 0,
    
    log(msg, tipo = 'info') {
        const icons = { info: 'ℹ️', ok: '✅', erro: '❌', aviso: '⚠️', etapa: '📍' };
        const styles = {
            info: 'color: #64b5f6',
            ok: 'color: #81c784',
            erro: 'color: #e57373',
            aviso: 'color: #ffb74d',
            etapa: 'color: #ba68c8; font-weight: bold; font-size: 14px'
        };
        console.log(`%c${icons[tipo]} ${msg}`, styles[tipo]);
        this.resultados.push({ msg, tipo, timestamp: new Date() });
    },
    
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    verificar(condicao, mensagem) {
        if (condicao) {
            this.log(`${mensagem}`, 'ok');
            return true;
        } else {
            this.log(`FALHOU: ${mensagem}`, 'erro');
            return false;
        }
    },
    
    async iniciar() {
        console.clear();
        console.log('%c🏋️ TESTE DE NAVEGABILIDADE - COACH VIRTUAL DE MUSCULAÇÃO v2.0', 
            'color: #6366f1; font-size: 18px; font-weight: bold');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #6366f1');
        this.log(`Persona: ${this.persona.nome}`, 'info');
        this.log(`Email: ${this.persona.email}`, 'info');
        console.log('');
        
        await this.fase1_carregamento();
    },
    
    // ========== FASE 1: CARREGAMENTO ==========
    async fase1_carregamento() {
        this.log('FASE 1: CARREGAMENTO INICIAL', 'etapa');
        
        this.verificar(document.querySelector('#auth-screen'), 'Tela de autenticação presente');
        this.verificar(document.querySelector('.auth-card'), 'Card de auth visível');
        this.verificar(document.querySelector('.auth-tab[data-tab="login"]'), 'Tab Login presente');
        this.verificar(document.querySelector('.auth-tab[data-tab="register"]'), 'Tab Registro presente');
        this.verificar(document.querySelector('#login-form'), 'Formulário de login presente');
        this.verificar(document.querySelector('#register-form'), 'Formulário de registro presente');
        
        console.log('');
        this.log('Pronto para FASE 2. Execute: TesteNavegabilidade.fase2_registro()', 'aviso');
    },
    
    // ========== FASE 2: REGISTRO ==========
    async fase2_registro() {
        this.log('FASE 2: REGISTRO DE USUÁRIO', 'etapa');
        
        // Clicar na tab de registro
        const tabRegister = document.querySelector('.auth-tab[data-tab="register"]');
        if (tabRegister) {
            tabRegister.click();
            await this.delay(300);
            this.log('Clicou na tab "Criar conta"', 'ok');
        }
        
        // Verificar formulário de registro ativo
        const registerForm = document.querySelector('#register-form');
        this.verificar(registerForm?.classList.contains('active'), 'Formulário de registro ativo');
        
        // Preencher campos
        const nome = document.querySelector('#register-nome');
        const email = document.querySelector('#register-email');
        const senha = document.querySelector('#register-senha');
        
        if (nome) { nome.value = this.persona.nome; this.log(`Nome: ${this.persona.nome}`, 'ok'); }
        if (email) { email.value = this.persona.email; this.log(`Email: ${this.persona.email}`, 'ok'); }
        if (senha) { senha.value = this.persona.senha; this.log('Senha: ********', 'ok'); }
        
        console.log('');
        this.log('Campos preenchidos. Clique em "Criar conta" manualmente.', 'aviso');
        this.log('Após sucesso, execute: TesteNavegabilidade.fase3_onboarding_step1()', 'aviso');
    },
    
    // ========== FASE 3: ONBOARDING ==========
    async fase3_onboarding_step1() {
        this.log('FASE 3: ONBOARDING - STEP 1 (Dados Básicos)', 'etapa');
        
        const onboarding = document.querySelector('#onboarding');
        this.verificar(onboarding && getComputedStyle(onboarding).display !== 'none', 'Tela de onboarding visível');
        
        const step1 = document.querySelector('#step-1');
        this.verificar(step1?.classList.contains('active'), 'Step 1 ativo');
        
        // Verificar se campos estão vazios (teste de limpeza)
        const idade = document.querySelector('#onb-idade');
        const peso = document.querySelector('#onb-peso');
        const altura = document.querySelector('#onb-altura');
        
        this.verificar(idade && idade.value === '', 'Campo idade está limpo');
        this.verificar(peso && peso.value === '', 'Campo peso está limpo');
        this.verificar(altura && altura.value === '', 'Campo altura está limpo');
        
        // Preencher dados
        if (idade) { idade.value = this.persona.idade; this.log(`Idade preenchida: ${this.persona.idade}`, 'ok'); }
        if (peso) { peso.value = this.persona.peso; this.log(`Peso preenchido: ${this.persona.peso} kg`, 'ok'); }
        if (altura) { altura.value = this.persona.altura; this.log(`Altura preenchida: ${this.persona.altura} cm`, 'ok'); }
        
        // Selecionar sexo
        const pillFeminino = document.querySelector('#step-1 .pill[data-value="F"]');
        if (pillFeminino) {
            pillFeminino.click();
            await this.delay(200);
            this.verificar(pillFeminino.classList.contains('active'), 'Sexo Feminino selecionado');
        }
        
        console.log('');
        this.log('Step 1 preenchido. Clique em "Continuar".', 'aviso');
        this.log('Após avançar, execute: TesteNavegabilidade.fase3_onboarding_step2()', 'aviso');
    },
    
    async fase3_onboarding_step2() {
        this.log('FASE 3: ONBOARDING - STEP 2 (Objetivo)', 'etapa');
        
        const step2 = document.querySelector('.onboarding-step[data-step="2"]');
        this.verificar(step2?.classList.contains('active'), 'Step 2 ativo');
        
        // Selecionar objetivo
        const goalCard = document.querySelector('.goal-card[data-value="hipertrofia"]');
        if (goalCard) {
            goalCard.click();
            await this.delay(200);
            this.verificar(goalCard.classList.contains('active'), 'Objetivo "Ganhar Massa" selecionado');
        }
        
        console.log('');
        this.log('Clique em "Continuar".', 'aviso');
        this.log('Após avançar, execute: TesteNavegabilidade.fase3_onboarding_step3()', 'aviso');
    },
    
    async fase3_onboarding_step3() {
        this.log('FASE 3: ONBOARDING - STEP 3 (Experiência)', 'etapa');
        
        const step3 = document.querySelector('.onboarding-step[data-step="3"]');
        this.verificar(step3?.classList.contains('active'), 'Step 3 ativo');
        
        // Selecionar nível
        const levelCard = document.querySelector('.level-card[data-value="intermediario"]');
        if (levelCard) {
            levelCard.click();
            await this.delay(200);
            this.verificar(levelCard.classList.contains('active'), 'Nível "Intermediário" selecionado');
        }
        
        console.log('');
        this.log('Clique em "Continuar".', 'aviso');
        this.log('Após avançar, execute: TesteNavegabilidade.fase3_onboarding_step4()', 'aviso');
    },
    
    async fase3_onboarding_step4() {
        this.log('FASE 3: ONBOARDING - STEP 4 (Disponibilidade)', 'etapa');
        
        const step4 = document.querySelector('.onboarding-step[data-step="4"]');
        this.verificar(step4?.classList.contains('active'), 'Step 4 ativo');
        
        // Verificar opções de dias (2-7)
        const dayBtns = document.querySelectorAll('.day-btn');
        this.verificar(dayBtns.length >= 6, `${dayBtns.length} opções de dias disponíveis (2-7)`);
        
        // Verificar se opção 7 dias existe
        const day7Btn = document.querySelector('.day-btn[data-value="7"]');
        this.verificar(day7Btn, 'Opção 7 dias existe');
        
        // Selecionar 4 dias
        const dayBtn = document.querySelector('.day-btn[data-value="4"]');
        if (dayBtn) {
            dayBtn.click();
            await this.delay(200);
            this.verificar(dayBtn.classList.contains('active'), '4 dias selecionado');
        }
        
        const label = document.querySelector('#days-label');
        this.verificar(label?.textContent.includes('4'), 'Label mostra "4 dias"');
        
        // Verificar opções de tempo (45min, 1h, 1h30, 2h)
        const timePills = document.querySelectorAll('#step-4 .pill');
        this.verificar(timePills.length >= 4, `${timePills.length} opções de tempo disponíveis`);
        
        // Verificar se opção 2h existe
        const time2h = document.querySelector('#step-4 .pill[data-value="120"]');
        this.verificar(time2h, 'Opção 2h (120min) existe');
        
        // Testar seleção de tempo
        if (time2h) {
            time2h.click();
            await this.delay(200);
            this.verificar(time2h.classList.contains('active'), 'Tempo 2h selecionado');
        }
        
        // Voltar para 1h
        const time1h = document.querySelector('#step-4 .pill[data-value="60"]');
        if (time1h) {
            time1h.click();
            await this.delay(200);
            this.verificar(time1h.classList.contains('active'), 'Tempo 1h selecionado');
        }
        
        console.log('');
        this.log('Step 4 testado com sucesso! Clique em "Continuar".', 'aviso');
        this.log('Após avançar, execute: TesteNavegabilidade.fase3_onboarding_step5()', 'aviso');
    },
    
    async fase3_onboarding_step5() {
        this.log('FASE 3: ONBOARDING - STEP 5 (Local)', 'etapa');
        
        const step5 = document.querySelector('.onboarding-step[data-step="5"]');
        this.verificar(step5?.classList.contains('active'), 'Step 5 ativo');
        
        // Selecionar academia (já é padrão)
        const locationCard = document.querySelector('.location-card[data-value="academia"]');
        if (locationCard) {
            locationCard.click();
            await this.delay(200);
            this.verificar(locationCard.classList.contains('active'), 'Local "Academia" selecionado');
        }
        
        console.log('');
        this.log('Clique em "Começar" para finalizar.', 'aviso');
        this.log('Após carregar o app, execute: TesteNavegabilidade.fase4_dashboard()', 'aviso');
    },
    
    // ========== FASE 4: DASHBOARD ==========
    async fase4_dashboard() {
        this.log('FASE 4: DASHBOARD PRINCIPAL', 'etapa');
        
        const app = document.querySelector('#app');
        this.verificar(app && getComputedStyle(app).display !== 'none', 'App principal visível');
        
        const greeting = document.querySelector('#greeting-time');
        this.verificar(greeting?.textContent.length > 0, 'Saudação presente');
        
        const nome = document.querySelector('#greeting-name');
        this.verificar(nome?.textContent === 'Marina', 'Nome "Marina" exibido');
        
        const avatar = document.querySelector('#user-avatar');
        this.verificar(avatar?.textContent === 'MS', 'Avatar "MS" correto');
        
        const navItems = document.querySelectorAll('.nav-item');
        this.verificar(navItems.length === 5, '5 itens de navegação presentes');
        
        console.log('');
        this.log('Dashboard OK! Execute: TesteNavegabilidade.fase5_navegacao()', 'aviso');
    },
    
    // ========== FASE 5: NAVEGAÇÃO ==========
    async fase5_navegacao() {
        this.log('FASE 5: NAVEGAÇÃO ENTRE TABS', 'etapa');
        
        const tabs = ['treino', 'coach', 'progresso', 'perfil', 'home'];
        
        for (const tab of tabs) {
            const navItem = document.querySelector(`.nav-item[data-tab="${tab}"]`);
            if (navItem) {
                navItem.click();
                await this.delay(500);
                
                const content = document.querySelector(`#tab-${tab}`);
                const isActive = content?.classList.contains('active');
                this.verificar(isActive, `Tab "${tab}" funciona`);
            }
        }
        
        console.log('');
        this.log('Navegação OK! Execute: TesteNavegabilidade.fase6_chat()', 'aviso');
    },
    
    // ========== FASE 6: CHAT ==========
    async fase6_chat() {
        this.log('FASE 6: CHAT COM COACH', 'etapa');
        
        // Ir para tab coach
        const coachTab = document.querySelector('.nav-item[data-tab="coach"]');
        if (coachTab) coachTab.click();
        await this.delay(500);
        
        const chatInput = document.querySelector('#chat-input');
        this.verificar(chatInput, 'Campo de input do chat presente');
        
        const quickQuestions = document.querySelectorAll('.quick-question');
        this.verificar(quickQuestions.length > 0, 'Perguntas rápidas presentes');
        
        // Testar envio de mensagem
        if (chatInput) {
            chatInput.value = 'Qual treino devo fazer hoje?';
            this.log('Mensagem digitada: "Qual treino devo fazer hoje?"', 'ok');
        }
        
        console.log('');
        this.log('Pressione Enter ou clique em enviar para testar o chat.', 'aviso');
        this.log('Após resposta, execute: TesteNavegabilidade.fase7_perfil()', 'aviso');
    },
    
    // ========== FASE 7: PERFIL ==========
    async fase7_perfil() {
        this.log('FASE 7: TELA DE PERFIL', 'etapa');
        
        // Ir para tab perfil
        const perfilTab = document.querySelector('.nav-item[data-tab="perfil"]');
        if (perfilTab) perfilTab.click();
        await this.delay(500);
        
        const profileName = document.querySelector('#profile-name');
        this.verificar(profileName?.textContent.includes('Marina'), 'Nome no perfil correto');
        
        const logoutBtn = document.querySelector('#btn-logout');
        this.verificar(logoutBtn, 'Botão de logout presente');
        
        console.log('');
        this.log('Perfil OK! Execute: TesteNavegabilidade.relatorio() para ver o resultado final', 'aviso');
    },
    
    // ========== RELATÓRIO FINAL ==========
    relatorio() {
        console.log('');
        console.log('%c📊 RELATÓRIO FINAL DO TESTE', 'color: #6366f1; font-size: 16px; font-weight: bold');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #6366f1');
        
        const ok = this.resultados.filter(r => r.tipo === 'ok').length;
        const erro = this.resultados.filter(r => r.tipo === 'erro').length;
        const total = ok + erro;
        const taxa = total > 0 ? ((ok / total) * 100).toFixed(1) : 0;
        
        console.log(`%c✅ Passou: ${ok}`, 'color: #81c784; font-size: 14px');
        console.log(`%c❌ Falhou: ${erro}`, 'color: #e57373; font-size: 14px');
        console.log(`%c📈 Taxa de Sucesso: ${taxa}%`, 'color: #64b5f6; font-size: 14px');
        
        if (erro === 0) {
            console.log('%c🎉 TODOS OS TESTES PASSARAM!', 'color: #81c784; font-size: 18px; font-weight: bold');
        } else {
            console.log('%c⚠️ Alguns testes falharam. Verifique os erros acima.', 'color: #ffb74d; font-size: 14px');
        }
        
        return { ok, erro, total, taxa: `${taxa}%` };
    }
};

// Instruções de uso
console.log('%c🧪 SCRIPT DE TESTE CARREGADO', 'color: #6366f1; font-size: 16px; font-weight: bold');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #6366f1');
console.log('%cPara iniciar o teste, execute:', 'color: #fff');
console.log('%cTesteNavegabilidade.iniciar()', 'color: #81c784; font-size: 14px');
console.log('');
console.log('%cFases disponíveis:', 'color: #fff');
console.log('  fase2_registro()');
console.log('  fase3_onboarding_step1() até step5()');
console.log('  fase4_dashboard()');
console.log('  fase5_navegacao()');
console.log('  fase6_chat()');
console.log('  fase7_perfil()');
console.log('  relatorio()');
