/**
 * APP TRAINER v2 - Modern JavaScript Application
 * Inspirado em: Hevy, Strong, FitBod, MyFitnessPal
 */

// =====================================================
// CONFIGURAÇÃO & ESTADO GLOBAL
// =====================================================

// Backend FastAPI roda em 8000; alinhar para evitar erros de "Failed to fetch" e navegação travada
const API_BASE = 'http://localhost:8000';

const AppState = {
    user: null,
    token: null,
    currentTab: 'home',
    onboardingStep: 1,
    onboardingData: {
        idade: null,
        peso: null,
        altura: null,
        sexo: 'M',
        objetivo: null,
        nivel: null,
        dias_disponiveis: [],
        local: null
    },
    profile: null,
    workouts: [],
    messages: []
};

// =====================================================
// UTILIDADES
// =====================================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const Utils = {
    async fetch(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (AppState.token) {
            headers['Authorization'] = `Bearer ${AppState.token}`;
        }
        
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.detail || 'Erro na requisição');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        }).format(date);
    },
    
    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    },
    
    getInitials(name) {
        if (!name) return '?';
        return name.split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }
};

// =====================================================
// TOAST NOTIFICATIONS
// =====================================================

const Toast = {
    container: null,
    
    init() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    },
    
    show(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${this.getIcon(type)}</span>
            <span>${message}</span>
        `;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 200);
        }, duration);
    },
    
    getIcon(type) {
        switch(type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            default: return 'ℹ';
        }
    },
    
    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    warning(msg) { this.show(msg, 'warning'); }
};

// =====================================================
// LOADING OVERLAY
// =====================================================

const Loading = {
    overlay: null,
    
    show(message = 'Carregando...') {
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'loading-overlay';
            this.overlay.innerHTML = `
                <div class="loading-spinner"></div>
                <p>${message}</p>
            `;
            document.body.appendChild(this.overlay);
        } else {
            this.overlay.querySelector('p').textContent = message;
            this.overlay.style.display = 'flex';
        }
    },
    
    hide() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
    }
};

// =====================================================
// AUTENTICAÇÃO
// =====================================================

const Auth = {
    init() {
        this.setupTabs();
        this.setupForms();
        this.checkSession();
    },
    
    setupTabs() {
        $$('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                
                $$('.auth-tab').forEach(t => t.classList.remove('active'));
                $$('.auth-form').forEach(f => f.classList.remove('active'));
                
                tab.classList.add('active');
                $(`#${target}-form`).classList.add('active');
            });
        });
    },
    
    setupForms() {
        // Login
        $('#login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = $('#login-email').value.trim();
            const senha = $('#login-senha').value;
            
            if (!email || !senha) {
                $('#login-error').textContent = 'Preencha todos os campos';
                return;
            }
            
            Loading.show('Entrando...');
            
            try {
                const data = await Utils.fetch('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, senha })
                });
                
                this.handleLoginSuccess(data);
            } catch (error) {
                $('#login-error').textContent = error.message;
            } finally {
                Loading.hide();
            }
        });
        
        // Registro
        $('#register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nome = $('#register-nome').value.trim();
            const email = $('#register-email').value.trim();
            const senha = $('#register-senha').value;
            
            if (!nome || !email || !senha) {
                $('#register-error').textContent = 'Preencha todos os campos';
                return;
            }
            
            if (senha.length < 6) {
                $('#register-error').textContent = 'Senha deve ter no mínimo 6 caracteres';
                return;
            }
            
            Loading.show('Criando conta...');
            
            try {
                const data = await Utils.fetch('/auth/registro', {
                    method: 'POST',
                    body: JSON.stringify({ nome, email, senha })
                });
                
                Toast.success('Conta criada com sucesso!');
                this.handleLoginSuccess(data);
            } catch (error) {
                $('#register-error').textContent = error.message;
            } finally {
                Loading.hide();
            }
        });
    },
    
    handleLoginSuccess(data) {
        AppState.user = {
            id: data.user_id || data.usuario_id,
            nome: data.nome,
            email: data.email
        };
        AppState.token = data.token;
        AppState.profile = data.perfil || null;
        
        localStorage.setItem('auth', JSON.stringify({
            user: AppState.user,
            token: AppState.token
        }));
        
        this.showApp();
    },
    
    async checkSession() {
        const stored = localStorage.getItem('auth');
        
        if (stored) {
            try {
                const { user, token } = JSON.parse(stored);
                AppState.token = token;
                
                // Verificar se usuário ainda existe
                const verifyData = await Utils.fetch(`/auth/verificar/${user.id}`);
                
                if (verifyData.valid) {
                    // Buscar dados atualizados do servidor
                    let perfilData = {};
                    try {
                        perfilData = await Utils.fetch(`/perfil/${user.id}`);
                        // Atualizar nome do localStorage com dados do servidor
                        if (perfilData.nome) {
                            user.nome = perfilData.nome;
                            // Atualizar localStorage com nome correto
                            localStorage.setItem('auth', JSON.stringify({ user, token }));
                        }
                    } catch (e) {
                        console.log('Perfil não encontrado, usando dados básicos');
                    }
                    
                    AppState.user = user;
                    AppState.profile = verifyData.tem_perfil_completo ? {
                        objetivo: verifyData.objetivo,
                        nivel: verifyData.nivel,
                        ...perfilData
                    } : null;
                    
                    console.log('Sessão válida para:', AppState.user.nome);
                    this.showApp();
                    return;
                }
            } catch (error) {
                console.log('Sessão expirada ou inválida:', error);
            }
            
            // Se chegou aqui, sessão inválida - limpar
            localStorage.removeItem('auth');
            AppState.user = null;
            AppState.token = null;
            AppState.profile = null;
            App.initialized = false;
        }
        
        this.showLogin();
    },
    
    showLogin() {
        const authScreen = $('#auth-screen');
        const app = $('#app');
        const onboarding = $('#onboarding');
        
        if (authScreen) authScreen.style.display = 'block';
        if (app) app.style.display = 'none';
        if (onboarding) onboarding.style.display = 'none';
    },
    
    showApp() {
        const authScreen = $('#auth-screen');
        const app = $('#app');
        
        if (authScreen) authScreen.style.display = 'none';
        if (app) app.style.display = 'block';
        
        // SEMPRE inicializa a navegação do app
        App.init();
        
        // Verificar se precisa onboarding (mostra por cima)
        if (!AppState.profile || !AppState.profile.objetivo) {
            Onboarding.show();
        }
    },
    
    logout() {
        localStorage.removeItem('auth');
        AppState.user = null;
        AppState.token = null;
        AppState.profile = null;
        App.initialized = false; // Resetar para permitir reinicialização
        this.showLogin();
        Toast.success('Desconectado com sucesso');
    }
};

// =====================================================
// ONBOARDING
// =====================================================

const Onboarding = {
    totalSteps: 5,
    
    show() {
        const onboarding = $('#onboarding');
        if (onboarding) onboarding.style.display = 'flex';
        this.updateUI();
        this.setupListeners();
    },
    
    hide() {
        const onboarding = $('#onboarding');
        if (onboarding) onboarding.style.display = 'none';
        // App.init() já foi chamado em showApp(), não precisa chamar novamente
    },
    
    updateUI() {
        const step = AppState.onboardingStep;
        
        // Progress bar
        const progress = (step / this.totalSteps) * 100;
        const progressBar = $('#onboarding-progress-bar');
        if (progressBar) progressBar.style.width = `${progress}%`;
        
        // Step indicator
        const stepIndicator = $('#step-indicator');
        if (stepIndicator) stepIndicator.textContent = `${step} de ${this.totalSteps}`;
        
        // Show current step
        $$('.onboarding-step').forEach((s, i) => {
            s.classList.toggle('active', i + 1 === step);
        });
        
        // Back button visibility
        const btnBack = $('#btn-onboarding-back');
        if (btnBack) btnBack.style.visibility = step === 1 ? 'hidden' : 'visible';
        
        // Next button text
        const nextBtn = $('#btn-onboarding-next');
        if (nextBtn) {
            nextBtn.innerHTML = step === this.totalSteps 
                ? '<span>Começar</span> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>'
                : '<span>Continuar</span> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';
        }
    },
    
    setupListeners() {
        // Back
        const btnBack = $('#btn-onboarding-back');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                if (AppState.onboardingStep > 1) {
                    AppState.onboardingStep--;
                    this.updateUI();
                }
            });
        }
        
        // Next
        const btnNext = $('#btn-onboarding-next');
        if (btnNext) {
            btnNext.addEventListener('click', () => {
                if (this.validateStep()) {
                    if (AppState.onboardingStep < this.totalSteps) {
                        AppState.onboardingStep++;
                        this.updateUI();
                    } else {
                        this.complete();
                    }
                }
            });
        }
        
        // Skip
        const btnSkip = $('#btn-onboarding-skip');
        if (btnSkip) {
            btnSkip.addEventListener('click', () => {
                if (confirm('Você pode completar seu perfil depois. Deseja pular?')) {
                    this.hide();
                }
            });
        }
        
        // Sex pills
        $$('[data-step="1"] .pill').forEach(pill => {
            pill.addEventListener('click', () => {
                $$('[data-step="1"] .pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                AppState.onboardingData.sexo = pill.dataset.value;
            });
        });
        
        // Goal cards
        $$('.goal-card').forEach(card => {
            card.addEventListener('click', () => {
                $$('.goal-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                AppState.onboardingData.objetivo = card.dataset.goal;
            });
        });
        
        // Level cards
        $$('.level-card').forEach(card => {
            card.addEventListener('click', () => {
                $$('.level-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                AppState.onboardingData.nivel = card.dataset.level;
            });
        });
        
        // Days buttons
        $$('.day-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                const day = parseInt(btn.dataset.day);
                const days = AppState.onboardingData.dias_disponiveis;
                
                if (days.includes(day)) {
                    AppState.onboardingData.dias_disponiveis = days.filter(d => d !== day);
                } else {
                    days.push(day);
                    days.sort((a, b) => a - b);
                }
                
                this.updateDaysLabel();
            });
        });
        
        // Location cards
        $$('.location-card').forEach(card => {
            card.addEventListener('click', () => {
                $$('.location-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                AppState.onboardingData.local = card.dataset.location;
            });
        });
    },
    
    updateDaysLabel() {
        const count = AppState.onboardingData.dias_disponiveis.length;
        $('#days-label').textContent = count === 0 
            ? 'Selecione os dias' 
            : `${count} dia${count > 1 ? 's' : ''} por semana`;
    },
    
    validateStep() {
        const step = AppState.onboardingStep;
        const data = AppState.onboardingData;
        
        switch(step) {
            case 1: // Dados básicos
                const idadeEl = $('#onb-idade');
                const pesoEl = $('#onb-peso');
                const alturaEl = $('#onb-altura');
                
                data.idade = idadeEl ? parseInt(idadeEl.value) : null;
                data.peso = pesoEl ? parseFloat(pesoEl.value) : null;
                // HTML usa cm, converter para metros
                const alturaCm = alturaEl ? parseFloat(alturaEl.value) : null;
                data.altura = alturaCm ? alturaCm / 100 : null;
                
                if (!data.idade || data.idade < 14 || data.idade > 100) {
                    Toast.error('Informe uma idade válida');
                    return false;
                }
                if (!data.peso || data.peso < 30 || data.peso > 300) {
                    Toast.error('Informe um peso válido');
                    return false;
                }
                if (!data.altura || data.altura < 1.0 || data.altura > 2.5) {
                    Toast.error('Informe altura válida (ex: 175 cm)');
                    return false;
                }
                return true;
                
            case 2: // Objetivo
                if (!data.objetivo) {
                    Toast.error('Selecione seu objetivo');
                    return false;
                }
                return true;
                
            case 3: // Experiência
                if (!data.nivel) {
                    Toast.error('Selecione seu nível de experiência');
                    return false;
                }
                return true;
                
            case 4: // Disponibilidade
                if (data.dias_disponiveis.length === 0) {
                    Toast.error('Selecione pelo menos um dia');
                    return false;
                }
                return true;
                
            case 5: // Local
                if (!data.local) {
                    Toast.error('Selecione onde você vai treinar');
                    return false;
                }
                return true;
        }
        
        return true;
    },
    
    async complete() {
        Loading.show('Criando seu plano personalizado...');
        
        try {
            const profileData = {
                idade: AppState.onboardingData.idade,
                peso: AppState.onboardingData.peso,
                altura: AppState.onboardingData.altura,
                sexo: AppState.onboardingData.sexo,
                objetivo: AppState.onboardingData.objetivo,
                nivel: AppState.onboardingData.nivel,
                dias_disponiveis: AppState.onboardingData.dias_disponiveis,
                equipamentos: AppState.onboardingData.local === 'gym' 
                    ? ['halteres', 'barras', 'maquinas', 'cabos'] 
                    : AppState.onboardingData.local === 'home'
                    ? ['halteres', 'peso_corporal']
                    : ['peso_corporal']
            };
            
            const result = await Utils.fetch(`/perfil/${AppState.user.id}/completar`, {
                method: 'POST',
                body: JSON.stringify(profileData)
            });
            
            AppState.profile = result.perfil;
            
            Toast.success('Perfil completo! Bem-vindo ao seu treino!');
            this.hide();
            
        } catch (error) {
            Toast.error('Erro ao salvar perfil. Tente novamente.');
        } finally {
            Loading.hide();
        }
    }
};

// =====================================================
// APLICATIVO PRINCIPAL
// =====================================================

const App = {
    initialized: false,
    
    init() {
        console.log('App.init() called, initialized:', this.initialized);
        
        // Sempre atualizar header e dashboard, mas navegação só uma vez
        this.updateHeader();
        this.loadDashboard();
        
        if (!this.initialized) {
            this.initialized = true;
            this.setupNavigation();
            Chat.init();
        }
        
        console.log('App.init() complete');
    },
    
    updateHeader() {
        const greeting = Utils.getGreeting();
        const nome = AppState.user?.nome?.split(' ')[0] || 'Atleta';
        const initials = Utils.getInitials(AppState.user?.nome);
        
        const greetingTime = $('#greeting-time');
        const greetingName = $('#greeting-name');
        const userAvatar = $('#user-avatar');
        
        if (greetingTime) greetingTime.textContent = greeting;
        if (greetingName) greetingName.textContent = nome;
        if (userAvatar) userAvatar.textContent = initials;
    },
    
    setupNavigation() {
        // Remover listeners antigos e adicionar novos
        $$('.nav-item').forEach(item => {
            // Clone para remover listeners antigos
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
        });
        
        // Adicionar listeners novos
        $$('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tab = item.dataset.tab;
                console.log('Nav click:', tab);
                if (tab) {
                    this.switchTab(tab);
                }
            });
        });
        
        // Logout - verificar se elemento existe
        const logoutBtn = $('#btn-logout');
        if (logoutBtn) {
            const newLogoutBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
            newLogoutBtn.addEventListener('click', () => {
                if (confirm('Deseja sair da sua conta?')) {
                    Auth.logout();
                }
            });
        }
        
        console.log('Navigation setup complete. Found', $$('.nav-item').length, 'nav items');
    },
    
    switchTab(tab) {
        AppState.currentTab = tab;
        
        // Update nav
        $$('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tab);
        });
        
        // Update content
        $$('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tab}`);
        });
        
        // Special handling
        if (tab === 'profile') {
            this.loadProfile();
        }
    },
    
    loadDashboard() {
        // Renderizar cards do dashboard
        this.renderDashboardCards();
        
        // Treino do dia
        this.loadTodayWorkout();
        
        // Week progress
        this.updateWeekProgress();
    },
    
    renderDashboardCards() {
        const container = $('#home-dashboard');
        if (!container) return;
        
        const nome = AppState.user?.nome?.split(' ')[0] || 'Atleta';
        const objetivo = AppState.profile?.objetivo || 'treino';
        const nivel = AppState.profile?.nivel || 'iniciante';
        
        container.innerHTML = `
            <!-- Card Hero - Treino de Hoje -->
            <div class="dashboard-grid">
                <div class="dashboard-card card-treino">
                    <div class="card-icon">🏋️</div>
                    <div class="card-content">
                        <h3>Treino de Hoje</h3>
                        <p id="treino-hoje-titulo">Carregando...</p>
                    </div>
                    <button class="card-action" onclick="App.switchTab('treino')">Iniciar →</button>
                </div>
                
                <div class="dashboard-card card-coach">
                    <div class="card-icon">🤖</div>
                    <div class="card-content">
                        <h3>Coach IA</h3>
                        <p>Tire suas dúvidas</p>
                    </div>
                    <button class="card-action" onclick="App.switchTab('coach')">Perguntar →</button>
                </div>
            </div>
            
            <!-- Stats Rápidas -->
            <div class="dashboard-card card-stats full-width">
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-value" id="stat-streak">0</span>
                        <span class="stat-label">🔥 Sequência</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="stat-workouts">0</span>
                        <span class="stat-label">💪 Treinos</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="stat-semana">0/4</span>
                        <span class="stat-label">📅 Semana</span>
                    </div>
                </div>
            </div>
            
            <!-- Seu Objetivo -->
            <div class="dashboard-grid">
                <div class="dashboard-card card-objetivo">
                    <div class="card-icon">🎯</div>
                    <div class="card-content">
                        <h3>Seu Objetivo</h3>
                        <p>${this.formatObjetivo(objetivo)}</p>
                    </div>
                </div>
                
                <div class="dashboard-card card-nivel">
                    <div class="card-icon">📊</div>
                    <div class="card-content">
                        <h3>Nível</h3>
                        <p>${this.formatNivel(nivel)}</p>
                    </div>
                </div>
            </div>
            
            <!-- Progresso Semanal -->
            <div class="dashboard-card card-progresso full-width">
                <h3>📈 Progresso da Semana</h3>
                <div class="week-progress-mini">
                    <div class="week-day" data-day="0">D</div>
                    <div class="week-day" data-day="1">S</div>
                    <div class="week-day" data-day="2">T</div>
                    <div class="week-day" data-day="3">Q</div>
                    <div class="week-day" data-day="4">Q</div>
                    <div class="week-day" data-day="5">S</div>
                    <div class="week-day" data-day="6">S</div>
                </div>
            </div>
        `;
        
        // Atualizar stats (valores de exemplo por enquanto)
        this.updateDashboardStats();
    },
    
    formatObjetivo(objetivo) {
        const map = {
            'hipertrofia': '💪 Hipertrofia',
            'forca': '🏋️ Força',
            'perda_peso': '🔥 Perda de Peso',
            'resistencia': '🏃 Resistência',
            'treino': '🎯 Bem-estar'
        };
        return map[objetivo] || objetivo;
    },
    
    formatNivel(nivel) {
        const map = {
            'iniciante': '🌱 Iniciante',
            'intermediario': '⚡ Intermediário',
            'avancado': '🔥 Avançado'
        };
        return map[nivel] || nivel;
    },
    
    updateDashboardStats() {
        // Stats de exemplo (integrar com API real depois)
        const statStreak = $('#stat-streak');
        const statWorkouts = $('#stat-workouts');
        const statSemana = $('#stat-semana');
        
        if (statStreak) statStreak.textContent = '5';
        if (statWorkouts) statWorkouts.textContent = '23';
        if (statSemana) statSemana.textContent = '2/4';
    },
    
    async loadTodayWorkout() {
        const treinoTitulo = $('#treino-hoje-titulo');
        
        try {
            const objetivo = AppState.profile?.objetivo || 'hipertrofia';
            const nivel = AppState.profile?.nivel || 'iniciante';
            
            const response = await Utils.fetch(`/suggest?objetivo=${objetivo}&nivel=${nivel}&diasSemana=4`);
            
            if (response.titulo && treinoTitulo) {
                treinoTitulo.textContent = response.treinos?.[0]?.nome || response.titulo;
            }
        } catch (error) {
            console.log('Erro ao carregar treino:', error);
            if (treinoTitulo) treinoTitulo.textContent = 'Treino disponível';
        }
    },
    
    renderWorkoutCard(treino) {
        const container = $('#today-workout');
        if (!container) return;
        
        // Atualizar título do treino
        const title = container.querySelector('.workout-info h3');
        if (title && treino.nome) {
            title.textContent = treino.nome;
        }
    },
    
    updateWeekProgress() {
        const today = new Date().getDay(); // 0 = Domingo
        const daysMap = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
        
        $$('.week-day').forEach((day, i) => {
            day.classList.toggle('today', i === today);
            
            // Simular dias completados (integrar com API)
            if (i < today && Math.random() > 0.3) {
                day.classList.add('completed');
            }
        });
    },
    
    loadProfile() {
        // Atualizar informações do usuário
        const profileName = $('#profile-name');
        const profileGoal = $('#profile-goal');
        const profileAvatarLetter = $('#profile-avatar-letter');
        
        if (profileName) profileName.textContent = AppState.user?.nome || 'Atleta';
        if (profileGoal) {
            const objetivo = AppState.profile?.objetivo || 'Não definido';
            profileGoal.textContent = 'Objetivo: ' + this.formatObjetivo(objetivo).replace(/[^\w\sáéíóúàâãêôç]/gi, '');
        }
        if (profileAvatarLetter) profileAvatarLetter.textContent = Utils.getInitials(AppState.user?.nome);
        
        // Atualizar stats do perfil
        const statPeso = $('#stat-peso');
        const statAltura = $('#stat-altura');
        const statIdade = $('#stat-idade');
        const statImc = $('#stat-imc');
        
        if (statPeso) statPeso.textContent = AppState.profile?.peso || '-';
        if (statAltura) statAltura.textContent = AppState.profile?.altura ? Math.round(AppState.profile.altura * 100) : '-';
        if (statIdade) statIdade.textContent = AppState.profile?.idade || '-';
        
        // Calcular IMC se tiver peso e altura
        if (statImc && AppState.profile?.peso && AppState.profile?.altura) {
            const imc = AppState.profile.peso / (AppState.profile.altura * AppState.profile.altura);
            statImc.textContent = imc.toFixed(1);
        }
    }
};

// =====================================================
// CHAT
// =====================================================

const Chat = {
    initialized: false,
    
    init() {
        if (this.initialized) return;
        this.initialized = true;
        
        this.setupInput();
        this.setupQuickQuestions();
    },
    
    setupInput() {
        const form = $('#chat-form');
        const input = $('#chat-input');
        
        if (!form || !input) {
            console.log('Chat form or input not found');
            return;
        }
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (text) {
                this.send(text);
                input.value = '';
            }
        });
    },
    
    setupQuickQuestions() {
        $$('.quick-q').forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.dataset.q || btn.textContent;
                this.send(question);
            });
        });
    },
    
    async send(message) {
        this.addMessage(message, 'user');
        
        // Mostrar typing indicator
        this.showTyping();
        
        try {
            // Usar endpoint /coach que existe
            const params = new URLSearchParams({
                q: message,
                nome: AppState.user?.nome || '',
                objetivo: AppState.profile?.objetivo || '',
                nivel: AppState.profile?.nivel || ''
            });
            
            const response = await Utils.fetch(`/coach?${params.toString()}`);
            
            this.hideTyping();
            this.addMessage(response.answer || response.resposta || 'Não consegui gerar uma resposta.', 'bot');
            
        } catch (error) {
            this.hideTyping();
            this.addMessage('Desculpe, não consegui processar sua mensagem. Tente novamente.', 'bot');
        }
    },
    
    addMessage(text, type) {
        const container = $('#chat-messages');
        
        const message = document.createElement('div');
        message.className = `message ${type}`;
        
        if (type === 'bot') {
            message.innerHTML = `
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <p>${text}</p>
                </div>
            `;
        } else {
            message.innerHTML = `
                <div class="message-avatar">${Utils.getInitials(AppState.user?.nome)}</div>
                <div class="message-content">
                    <p>${text}</p>
                </div>
            `;
        }
        
        container.appendChild(message);
        container.scrollTop = container.scrollHeight;
    },
    
    showTyping() {
        const container = $('#chat-messages');
        const typing = document.createElement('div');
        typing.className = 'message bot typing-indicator';
        typing.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>Digitando...</p>
            </div>
        `;
        typing.id = 'typing-indicator';
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
    },
    
    hideTyping() {
        const typing = $('#typing-indicator');
        if (typing) typing.remove();
    }
};

// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    Toast.init();
    Auth.init();
});

// Export para debug
window.AppState = AppState;
window.Auth = Auth;
window.App = App;
