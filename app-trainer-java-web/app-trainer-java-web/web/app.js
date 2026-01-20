/**
 * SHAIPADOS - Coach Virtual de Musculação
 * JavaScript Principal - v6.0 Professional
 * Build: 2026-01-19
 * Features: Dashboard customizável, Drag & Drop, Treinos interativos
 */

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================
window.onerror = (message, source, lineno, colno, error) => {
    console.error('[ERROR]', message, 'at', source, ':', lineno);
    return false;
};

window.addEventListener('unhandledrejection', (event) => {
    console.error('[PROMISE ERROR]', event.reason);
});

// =====================================================
// CONFIGURAÇÃO & ESTADO
// =====================================================
const API_BASE = '';
const ML_SERVICE = 'http://localhost:8001';

const AppState = {
    user: null,
    token: null,
    profile: null,
    currentTab: 'home',
    onboardingStep: 1,
    onboardingData: {
        idade: null, peso: null, altura: null, sexo: 'M',
        objetivo: null, nivel: null, dias: 4, duracao: 60, local: 'academia'
    },
    workouts: [],
    messages: []
};

// =====================================================
// HELPER: Verificar Perfil Completo
// =====================================================
function isProfileComplete() {
    const profile = AppState.profile;
    if (!profile) return false;
    // Perfil completo precisa ter: objetivo, nivel, dias e local
    return !!(profile.objetivo && profile.nivel && profile.dias && profile.local);
}

function showProfileReminderIfNeeded() {
    const reminder = $('#onboarding-reminder');
    if (reminder) {
        reminder.style.display = isProfileComplete() ? 'none' : 'flex';
    }
}

// =====================================================
// DASHBOARD WIDGETS SYSTEM
// =====================================================
const DashboardWidgets = {
    definitions: {
        'hero-treino': { id: 'hero-treino', name: 'Treino de Hoje', icon: '🏋️', size: 'full', category: 'treino', required: true, order: 0 },
        'ficha-atual': { id: 'ficha-atual', name: 'Minha Ficha', icon: '📑', size: 'half', category: 'treino', order: 1 },
        'quick-stats': { id: 'quick-stats', name: 'Estatísticas', icon: '📊', size: 'full', category: 'stats', order: 2 },
        'progresso': { id: 'progresso', name: 'Progresso', icon: '📈', size: 'half', category: 'stats', order: 3 },
        'coach-ia': { id: 'coach-ia', name: 'Coach IA', icon: '🤖', size: 'half', category: 'assistente', order: 4 },
        'templates': { id: 'templates', name: 'Fichas de Treino', icon: '📋', size: 'half', category: 'treino', order: 5 },
        'conquistas': { id: 'conquistas', name: 'Conquistas', icon: '🏆', size: 'half', category: 'gamificacao', order: 6 },
        'sua-divisao': { id: 'sua-divisao', name: 'Sua Divisão', icon: '📅', size: 'full', category: 'treino', order: 7 },
        'timer-descanso': { id: 'timer-descanso', name: 'Timer', icon: '⏱️', size: 'half', category: 'ferramentas', order: 8 },
        'agua': { id: 'agua', name: 'Hidratação', icon: '💧', size: 'half', category: 'saude', order: 9 },
        'motivacional': { id: 'motivacional', name: 'Motivacional', icon: '💪', size: 'full', category: 'motivacao', order: 10 },
        'planejamento-semanal': { id: 'planejamento-semanal', name: 'Planejamento', icon: '🗓️', size: 'full', category: 'treino', order: 11 },
        'prs-volume': { id: 'prs-volume', name: 'PRs e Volume', icon: '🏆', size: 'half', category: 'stats', order: 12 },
        'sono-recuperacao': { id: 'sono-recuperacao', name: 'Sono', icon: '😴', size: 'half', category: 'recuperacao', order: 13 }
    },

    defaultConfig: [
        { id: 'hero-treino', visible: true, order: 0 },
        { id: 'ficha-atual', visible: true, order: 1 },
        { id: 'quick-stats', visible: true, order: 2 },
        { id: 'progresso', visible: true, order: 3 },
        { id: 'coach-ia', visible: true, order: 4 },
        { id: 'templates', visible: true, order: 5 },
        { id: 'conquistas', visible: true, order: 6 },
        { id: 'sua-divisao', visible: true, order: 7 },
        { id: 'planejamento-semanal', visible: true, order: 8 },
        { id: 'motivacional', visible: true, order: 9 }
    ],

    currentConfig: [],
    draggedItem: null,
    draggedOverItem: null,

    init() {
        this.loadConfig();
    },

    loadConfig() {
        const saved = localStorage.getItem('dashboard_widgets_config');
        if (saved) {
            try {
                this.currentConfig = JSON.parse(saved);
                this.syncWithDefinitions();
            } catch (e) {
                this.currentConfig = [...this.defaultConfig];
            }
        } else {
            this.currentConfig = [...this.defaultConfig];
        }
    },

    syncWithDefinitions() {
        const existingIds = this.currentConfig.map(w => w.id);
        Object.keys(this.definitions).forEach(id => {
            if (!existingIds.includes(id)) {
                this.currentConfig.push({ id, visible: false, order: this.currentConfig.length });
            }
        });
    },

    saveConfig() {
        localStorage.setItem('dashboard_widgets_config', JSON.stringify(this.currentConfig));
    },

    getVisibleWidgets() {
        return this.currentConfig
            .filter(w => w.visible && this.definitions[w.id])
            .sort((a, b) => a.order - b.order)
            .map(w => ({ ...this.definitions[w.id], ...w }));
    },

    getHiddenWidgets() {
        return this.currentConfig
            .filter(w => !w.visible && this.definitions[w.id])
            .map(w => ({ ...this.definitions[w.id], ...w }));
    },

    toggleWidget(widgetId) {
        const widget = this.currentConfig.find(w => w.id === widgetId);
        if (widget && !this.definitions[widgetId]?.required) {
            widget.visible = !widget.visible;
            if (widget.visible) {
                widget.order = Math.max(...this.currentConfig.map(w => w.order)) + 1;
            }
        }
    },

    reorderWidgets(fromIndex, toIndex) {
        const visibleWidgets = this.getVisibleWidgets();
        const [moved] = visibleWidgets.splice(fromIndex, 1);
        visibleWidgets.splice(toIndex, 0, moved);
        visibleWidgets.forEach((w, i) => {
            const configWidget = this.currentConfig.find(c => c.id === w.id);
            if (configWidget) configWidget.order = i;
        });
    },

    resetToDefault() {
        this.currentConfig = [...this.defaultConfig];
        this.syncWithDefinitions();
        this.saveConfig();
    },

    renderWidget(widget) {
        const renderers = {
            'hero-treino': this.renderHeroTreino,
            'ficha-atual': this.renderFichaAtual,
            'quick-stats': this.renderQuickStats,
            'progresso': this.renderProgresso,
            'coach-ia': this.renderCoachIA,
            'templates': this.renderTemplates,
            'conquistas': this.renderConquistas,
            'sua-divisao': this.renderSuaDivisao,
            'timer-descanso': this.renderTimer,
            'agua': this.renderAgua,
            'motivacional': this.renderMotivacional,
            'planejamento-semanal': this.renderPlanejamento,
            'prs-volume': this.renderPRs,
            'sono-recuperacao': this.renderSono
        };
        return renderers[widget.id] ? renderers[widget.id].call(this) : '';
    },

    renderDragHandle() {
        return `<div class="widget-drag-handle"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg></div>`;
    },

    renderHeroTreino() {
        const treino = App.getTreinoAtual();
        const treinoHoje = treino?.dias?.[App.getTodayIndex(treino)] || {};
        const nome = treinoHoje.nome || 'Treino A';
        const grupos = treinoHoje.grupos || 'Peito e Tríceps';
        const exercicios = treinoHoje.exercicios?.length || 6;
        const duracao = treino?.duracao || 60;

        return `
            <div class="dashboard-widget dashboard-hero" data-widget-id="hero-treino" onclick="App.startWorkout()">
                ${this.renderDragHandle()}
                <div class="hero-gradient"></div>
                <div class="hero-content">
                    <div class="hero-badge"><span class="pulse-dot"></span><span>Hoje</span></div>
                    <h2 class="hero-title">${nome}</h2>
                    <p class="hero-subtitle">${grupos}</p>
                    <div class="hero-meta">
                        <span class="meta-item">⏱️ ~${duracao} min</span>
                        <span class="meta-item">💪 ${exercicios} exercícios</span>
                    </div>
                </div>
                <div class="hero-action">
                    <div class="hero-play-btn"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                    <span>Iniciar</span>
                </div>
            </div>
        `;
    },

    renderFichaAtual() {
        const treino = App.getTreinoAtual();
        if (!treino) {
            return `
                <div class="dashboard-widget widget-card card-ficha no-ficha" data-widget-id="ficha-atual" onclick="App.switchTab('treino')">
                    ${this.renderDragHandle()}
                    <div class="ficha-empty-icon">📋</div>
                    <div class="ficha-empty-text"><strong>Escolha sua Ficha</strong><span>Selecione um programa</span></div>
                </div>
            `;
        }
        return `
            <div class="dashboard-widget widget-card card-ficha" data-widget-id="ficha-atual" onclick="App.switchTab('treino')">
                ${this.renderDragHandle()}
                <div class="ficha-badge"><span>📋</span><span>Minha Ficha</span></div>
                <div class="ficha-content">
                    <h3>${treino.nome || 'Treino Personalizado'}</h3>
                    <span>${treino.dias?.length || 0}x/semana</span>
                </div>
                <div class="ficha-action">→</div>
            </div>
        `;
    },

    renderQuickStats() {
        const historico = JSON.parse(localStorage.getItem('historico_treinos') || '[]');
        const treinos = historico.length;
        const streak = this.calcStreak(historico);
        const meta = AppState.profile?.dias || 4;
        const semana = this.treinosSemana(historico);
        const pct = Math.min(100, Math.round((semana / meta) * 100));

        return `
            <div class="dashboard-widget dashboard-stats" data-widget-id="quick-stats">
                ${this.renderDragHandle()}
                <div class="mini-stat"><span class="mini-stat-value">${treinos}</span><span class="mini-stat-label">Treinos</span></div>
                <div class="mini-stat-divider"></div>
                <div class="mini-stat"><span class="mini-stat-value">${streak}</span><span class="mini-stat-label">Dias</span></div>
                <div class="mini-stat-divider"></div>
                <div class="mini-stat"><span class="mini-stat-value">${pct}%</span><span class="mini-stat-label">Meta</span></div>
            </div>
        `;
    },

    calcStreak(historico) {
        if (!historico.length) return 0;
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const ds = d.toISOString().split('T')[0];
            if (historico.some(t => t.data === ds)) streak++;
            else if (i > 0) break;
        }
        return streak;
    },

    treinosSemana(historico) {
        const inicio = new Date();
        inicio.setDate(inicio.getDate() - inicio.getDay());
        inicio.setHours(0,0,0,0);
        return historico.filter(t => new Date(t.data) >= inicio).length;
    },

    renderProgresso() {
        return `
            <div class="dashboard-widget widget-card card-progress" data-widget-id="progresso" onclick="App.switchTab('progresso')">
                ${this.renderDragHandle()}
                <div class="feature-icon">📈</div>
                <div class="feature-info"><h3>Progresso</h3><p>Evolução e métricas</p></div>
                <div class="feature-preview">
                    <div class="mini-chart">
                        <div class="chart-bar-mini" style="height:40%"></div>
                        <div class="chart-bar-mini" style="height:60%"></div>
                        <div class="chart-bar-mini" style="height:45%"></div>
                        <div class="chart-bar-mini" style="height:80%"></div>
                        <div class="chart-bar-mini active" style="height:70%"></div>
                    </div>
                </div>
            </div>
        `;
    },

    renderCoachIA() {
        return `
            <div class="dashboard-widget widget-card card-coach" data-widget-id="coach-ia" onclick="App.switchTab('coach')">
                ${this.renderDragHandle()}
                <div class="feature-icon">🤖</div>
                <div class="feature-info"><h3>Coach IA</h3><p>Seu personal virtual</p></div>
                <div class="feature-badge"><span class="ai-badge">IA</span></div>
            </div>
        `;
    },

    renderTemplates() {
        return `
            <div class="dashboard-widget widget-card card-templates" data-widget-id="templates" onclick="App.showTemplates()">
                ${this.renderDragHandle()}
                <div class="feature-icon">📋</div>
                <div class="feature-info"><h3>Fichas de Treino</h3><p>Programas prontos</p></div>
                <div class="feature-count"><span>8+</span></div>
            </div>
        `;
    },

    renderConquistas() {
        return `
            <div class="dashboard-widget widget-card card-achievements" data-widget-id="conquistas" onclick="App.showAchievements()">
                ${this.renderDragHandle()}
                <div class="feature-icon">🏆</div>
                <div class="feature-info"><h3>Conquistas</h3><p>Suas medalhas</p></div>
                <div class="feature-badges-preview"><span>🏆</span><span>💪</span><span>🔒</span></div>
            </div>
        `;
    },

    renderSuaDivisao() {
        const treino = App.getTreinoAtual();
        const dias = treino?.dias || [];
        const objetivo = AppState.profile?.objetivo || 'Hipertrofia';

        return `
            <div class="dashboard-widget widget-section" data-widget-id="sua-divisao">
                ${this.renderDragHandle()}
                <div class="section-header-v2">
                    <div class="section-title-area">
                        <h2>Sua Divisão</h2>
                        <span class="section-subtitle">${objetivo} • ${dias.length}x/sem</span>
                    </div>
                    <button class="btn-section-action" onclick="event.stopPropagation(); App.switchTab('treino')"><span>Ver</span>→</button>
                </div>
                <div class="split-carousel">
                    ${dias.map((d, i) => `
                        <div class="split-card ${i === App.getTodayIndex(treino) ? 'today' : ''}" onclick="App.viewWorkoutDay(${i})">
                            <span class="split-letter">${String.fromCharCode(65 + i)}</span>
                            <span class="split-name">${d.grupos || d.nome?.split('-')[1] || ''}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderTimer() {
        return `
            <div class="dashboard-widget widget-card card-timer" data-widget-id="timer-descanso" onclick="App.openTimer()">
                ${this.renderDragHandle()}
                <div class="feature-icon">⏱️</div>
                <div class="feature-info"><h3>Timer</h3><p>Descanso</p></div>
                <div class="timer-display">01:30</div>
            </div>
        `;
    },

    renderAgua() {
        const agua = parseInt(localStorage.getItem('agua_hoje') || '0');
        const meta = 8;
        const pct = Math.min(100, Math.round((agua / meta) * 100));
        return `
            <div class="dashboard-widget widget-card card-agua" data-widget-id="agua" onclick="App.addWater()">
                ${this.renderDragHandle()}
                <div class="feature-icon">💧</div>
                <div class="feature-info"><h3>Hidratação</h3><p>${agua}/${meta} copos</p></div>
                <div class="agua-progress"><div class="agua-fill" style="width:${pct}%"></div></div>
            </div>
        `;
    },

    renderMotivacional() {
        const frases = [
            "A dor que você sente hoje será a força que você sente amanhã.",
            "Não existe elevador para o sucesso. Use as escadas.",
            "Seu único limite é você.",
            "Cada treino te deixa mais forte que ontem.",
            "O corpo alcança o que a mente acredita.",
            "No pain, no gain. A dor é o caminho.",
            "Você tem as mesmas 24h que o Schwarzenegger tinha.",
            "Reps e sets não mentem.",
            "Bomba muscular é vida.",
            "Treino com foco. Nutrir com disciplina."
        ];
        const frase = frases[new Date().getDate() % frases.length];
        return `
            <div class="dashboard-widget widget-motivacional" data-widget-id="motivacional">
                ${this.renderDragHandle()}
                <div class="motivacional-icon">💪</div>
                <p class="motivacional-text">"${frase}"</p>
            </div>
        `;
    },

    renderPlanejamento() {
        const meta = AppState.profile?.dias || 4;
        const historico = JSON.parse(localStorage.getItem('historico_treinos') || '[]');
        const semana = this.treinosSemana(historico);
        const pct = Math.min(100, Math.round((semana / meta) * 100));
        const dias = ['D','S','T','Q','Q','S','S'];

        return `
            <div class="dashboard-widget widget-card card-planning" data-widget-id="planejamento-semanal">
                ${this.renderDragHandle()}
                <div class="planning-header">
                    <div class="planning-title"><span>🗓️ Planejamento</span><small>${meta} dias/sem</small></div>
                    <div class="planning-badge">${pct}%</div>
                </div>
                <div class="planning-progress"><div class="planning-bar" style="width:${pct}%"></div></div>
                <div class="planning-days">
                    ${dias.map((d, i) => {
                        const done = historico.some(h => new Date(h.data).getDay() === i);
                        return `<span class="planning-day ${done ? 'done' : ''}">${d}</span>`;
                    }).join('')}
                </div>
            </div>
        `;
    },

    renderPRs() {
        return `
            <div class="dashboard-widget widget-card card-prs" data-widget-id="prs-volume">
                ${this.renderDragHandle()}
                <div class="prs-top"><div><p class="prs-label">Volume semana</p><h3 class="prs-value">—</h3></div><div class="prs-chip">🏆 PR</div></div>
                <p class="prs-pr">Sem PR recente</p>
            </div>
        `;
    },

    renderSono() {
        return `
            <div class="dashboard-widget widget-card card-sono" data-widget-id="sono-recuperacao">
                ${this.renderDragHandle()}
                <div class="sono-header"><span>😴 Sono</span><small>OK</small></div>
                <div class="sono-body"><div class="sono-hours">7.0 h</div><div class="sono-score">Score 78</div></div>
            </div>
        `;
    }
};

// =====================================================
// UTILITIES
// =====================================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

async function api(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        });
        const text = await response.text();
        const data = JSON.parse(text);
        if (!response.ok) throw new Error(data.error || data.detail || `HTTP ${response.status}`);
        return data;
    } catch (error) {
        console.error('[API]', endpoint, error);
        throw error;
    }
}

// =====================================================
// TOAST & LOADING
// =====================================================
const Toast = {
    container: null,
    init() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    },
    show(message, type = 'success', duration = 3000) {
        if (!this.container) this.init();
        const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
        this.container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 200); }, duration);
    },
    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    warning(msg) { this.show(msg, 'warning'); },
    info(msg) { this.show(msg, 'info'); }
};

function showLoading(show = true, message = 'Carregando...') {
    let loading = $('#loading');
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
        const p = loading.querySelector('p');
        if (p) p.textContent = message;
    }
}

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
            tab.onclick = (e) => {
                e.preventDefault();
                const target = tab.dataset.tab;
                $$('.auth-tab').forEach(t => t.classList.remove('active'));
                $$('.auth-form').forEach(f => f.classList.remove('active'));
                tab.classList.add('active');
                const form = target === 'login' ? $('#login-form') : $('#register-form');
                if (form) form.classList.add('active');
            };
        });
    },

    setupForms() {
        $('#login-form')?.addEventListener('submit', async (e) => { e.preventDefault(); await this.login(); });
        $('#register-form')?.addEventListener('submit', async (e) => { e.preventDefault(); await this.register(); });
    },

    async login() {
        const email = $('#login-email')?.value?.trim();
        const senha = $('#login-senha')?.value;
        const errorEl = $('#login-error');
        if (errorEl) errorEl.textContent = '';
        if (!email || !senha) { if (errorEl) errorEl.textContent = 'Preencha todos os campos'; return; }
        
        try {
            showLoading(true, 'Entrando...');
            let response;
            try { response = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }); }
            catch (e) { response = await api(`${ML_SERVICE}/auth/login`, { method: 'POST', body: JSON.stringify({ email, senha }) }); }
            
            if (response.user_id || response.success) {
                this.saveSession(response);
                const temPerfil = response.tem_perfil_completo || response.perfil?.objetivo;
                this.enterApp(!!temPerfil, false);
                Toast.success(`Bem-vindo, ${response.nome}! 🎉`);
            } else {
                if (errorEl) errorEl.textContent = response.message || 'Credenciais inválidas';
            }
        } catch (error) {
            if (errorEl) errorEl.textContent = error.message || 'Erro de conexão';
        } finally { showLoading(false); }
    },

    async register() {
        const nome = $('#register-nome')?.value?.trim();
        const email = $('#register-email')?.value?.trim();
        const senha = $('#register-senha')?.value;
        const errorEl = $('#register-error');
        if (errorEl) errorEl.textContent = '';
        if (!nome || !email || !senha) { if (errorEl) errorEl.textContent = 'Preencha todos os campos'; return; }
        if (senha.length < 6) { if (errorEl) errorEl.textContent = 'Senha: mínimo 6 caracteres'; return; }
        
        try {
            showLoading(true, 'Criando conta...');
            let response;
            try { response = await api('/auth/registro', { method: 'POST', body: JSON.stringify({ nome, email, senha }) }); }
            catch (e) { response = await api(`${ML_SERVICE}/auth/registro`, { method: 'POST', body: JSON.stringify({ nome, email, senha }) }); }
            
            if (response.user_id || response.success) {
                this.saveSession(response);
                Toast.success(`Conta criada! Bem-vindo, ${response.nome}! 🎉`);
                this.enterApp(false, true);
            } else {
                if (errorEl) errorEl.textContent = response.detail || 'Erro ao criar conta';
            }
        } catch (error) {
            if (errorEl) errorEl.textContent = error.message?.includes('409') ? 'Email já cadastrado' : (error.message || 'Erro');
        } finally { showLoading(false); }
    },

    saveSession(data) {
        AppState.user = { id: data.user_id, nome: data.nome, email: data.email };
        AppState.token = data.token;
        AppState.profile = data.perfil || null;
        localStorage.setItem('shaipados_auth', JSON.stringify({ user: AppState.user, token: AppState.token, profile: AppState.profile }));
    },

    async checkSession() {
        const stored = localStorage.getItem('shaipados_auth');
        if (!stored) { this.showLogin(); return; }
        try {
            const data = JSON.parse(stored);
            if (!data.user?.id || !data.token) { this.showLogin(); return; }
            AppState.user = data.user;
            AppState.token = data.token;
            AppState.profile = data.profile;
            
            try {
                let response;
                try { response = await api(`/auth/verificar/${data.user.id}`); }
                catch (e) { response = await api(`${ML_SERVICE}/auth/verificar/${data.user.id}`); }
                if (response.valid !== false && (response.id || response.nome || response.valid)) {
                    AppState.user.nome = response.nome || AppState.user.nome;
                    this.enterApp(!!response.tem_perfil_completo || !!response.objetivo, false);
                    return;
                }
            } catch (e) {
                this.enterApp(!!AppState.profile?.objetivo, false);
                return;
            }
        } catch (e) {}
        this.showLogin();
    },

    showLogin() {
        $('#auth-screen') && ($('#auth-screen').style.display = 'flex');
        $('#app') && ($('#app').style.display = 'none');
        $('#onboarding') && ($('#onboarding').style.display = 'none');
        $('#modal-welcome') && ($('#modal-welcome').style.display = 'none');
        localStorage.removeItem('shaipados_auth');
        AppState.user = null; AppState.token = null; AppState.profile = null;
    },

    enterApp(temPerfil, isNewUser) {
        $('#auth-screen') && ($('#auth-screen').style.display = 'none');
        $('#app') && ($('#app').style.display = 'flex');
        this.updateHeader();
        App.init();
        if (isNewUser) this.showWelcomeModal();
        else if (!temPerfil) this.showOnboardingReminder();
    },

    updateHeader() {
        const nome = AppState.user?.nome || 'Usuário';
        $('#greeting-name') && ($('#greeting-name').textContent = nome.split(' ')[0]);
        $('#user-avatar') && ($('#user-avatar').textContent = nome.charAt(0).toUpperCase());
        $('#profile-name') && ($('#profile-name').textContent = nome);
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
        $('#greeting-time') && ($('#greeting-time').textContent = greeting);
    },

    showWelcomeModal() {
        const modal = $('#modal-welcome');
        if (modal) {
            modal.style.display = 'flex';
            $('#btn-welcome-start')?.addEventListener('click', () => { modal.style.display = 'none'; Onboarding.show(); });
            $('#btn-welcome-skip')?.addEventListener('click', () => { modal.style.display = 'none'; this.showOnboardingReminder(); Toast.info('Configure seu perfil quando quiser'); });
        } else Onboarding.show();
    },

    showOnboardingReminder() {
        // Só mostra o reminder se o perfil estiver incompleto
        if (isProfileComplete()) {
            const reminder = $('#onboarding-reminder');
            if (reminder) reminder.style.display = 'none';
            return;
        }
        
        const dismissed = sessionStorage.getItem('reminder_dismissed') === 'true';
        if (dismissed) return;
        
        const reminder = $('#onboarding-reminder');
        if (reminder) {
            reminder.style.display = 'flex';
        }
    },

    hideOnboardingReminder() {
        const reminder = $('#onboarding-reminder');
        if (reminder) reminder.style.display = 'none';
    },

    logout() {
        if (confirm('Deseja realmente sair?')) { this.showLogin(); Toast.info('Você saiu'); }
    }
};

// =====================================================
// ONBOARDING
// =====================================================
const Onboarding = {
    totalSteps: 5,
    listenersAdded: false,

    show() {
        $('#onboarding') && ($('#onboarding').style.display = 'flex');
        AppState.onboardingStep = 1;
        this.resetData();
        this.updateUI();
        if (!this.listenersAdded) { this.setupListeners(); this.listenersAdded = true; }
    },

    hide() { $('#onboarding') && ($('#onboarding').style.display = 'none'); },

    resetData() {
        AppState.onboardingData = { idade: null, peso: null, altura: null, sexo: 'M', objetivo: null, nivel: null, dias: 4, duracao: 60, local: 'academia' };
        $$('.goal-card, .level-card, .location-card').forEach(c => c.classList.remove('active'));
        $$('.day-btn').forEach(b => b.classList.toggle('active', b.dataset.value === '4'));
        $$('#step-1 .pill, #step-4 .pill').forEach(p => p.classList.remove('active'));
        $('#onb-idade') && ($('#onb-idade').value = '');
        $('#onb-peso') && ($('#onb-peso').value = '');
        $('#onb-altura') && ($('#onb-altura').value = '');
    },

    updateUI() {
        const step = AppState.onboardingStep;
        const progress = (step / this.totalSteps) * 100;
        $('#onboarding-progress-bar') && ($('#onboarding-progress-bar').style.width = `${progress}%`);
        $('#step-indicator') && ($('#step-indicator').textContent = `${step} de ${this.totalSteps}`);
        $$('.onboarding-step').forEach((s, i) => s.classList.toggle('active', i + 1 === step));
        $('#btn-onboarding-back') && ($('#btn-onboarding-back').style.visibility = step === 1 ? 'hidden' : 'visible');
        const nextBtn = $('#btn-onboarding-next');
        if (nextBtn) { const span = nextBtn.querySelector('span'); if (span) span.textContent = step === this.totalSteps ? 'Finalizar' : 'Continuar'; }
    },

    setupListeners() {
        $('#btn-onboarding-back')?.addEventListener('click', () => this.prevStep());
        $('#btn-onboarding-next')?.addEventListener('click', () => this.nextStep());
        $('#btn-onboarding-skip')?.addEventListener('click', () => this.skip());
        
        $$('#step-1 .pill').forEach(p => p.addEventListener('click', () => { $$('#step-1 .pill').forEach(x => x.classList.remove('active')); p.classList.add('active'); AppState.onboardingData.sexo = p.dataset.value; }));
        $$('.goal-card').forEach(c => c.addEventListener('click', () => { $$('.goal-card').forEach(x => x.classList.remove('active')); c.classList.add('active'); AppState.onboardingData.objetivo = c.dataset.value; }));
        $$('.level-card').forEach(c => c.addEventListener('click', () => { $$('.level-card').forEach(x => x.classList.remove('active')); c.classList.add('active'); AppState.onboardingData.nivel = c.dataset.value; }));
        $$('.day-btn').forEach(b => b.addEventListener('click', () => { $$('.day-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); AppState.onboardingData.dias = parseInt(b.dataset.value); }));
        $$('#step-4 .pill').forEach(p => p.addEventListener('click', () => { $$('#step-4 .pill').forEach(x => x.classList.remove('active')); p.classList.add('active'); AppState.onboardingData.duracao = parseInt(p.dataset.value); }));
        $$('.location-card').forEach(c => c.addEventListener('click', () => { $$('.location-card').forEach(x => x.classList.remove('active')); c.classList.add('active'); AppState.onboardingData.local = c.dataset.value; }));
    },

    prevStep() { if (AppState.onboardingStep > 1) { AppState.onboardingStep--; this.updateUI(); } },

    nextStep() {
        this.collectData();
        if (!this.validate()) return;
        if (AppState.onboardingStep < this.totalSteps) { AppState.onboardingStep++; this.updateUI(); }
        else this.finish();
    },

    collectData() {
        if (AppState.onboardingStep === 1) {
            AppState.onboardingData.idade = parseInt($('#onb-idade')?.value) || null;
            AppState.onboardingData.peso = parseFloat($('#onb-peso')?.value) || null;
            AppState.onboardingData.altura = parseInt($('#onb-altura')?.value) || null;
        }
    },

    validate() {
        const step = AppState.onboardingStep;
        const data = AppState.onboardingData;
        if (step === 1 && (!data.idade || !data.peso || !data.altura)) { Toast.warning('Preencha todos os campos'); return false; }
        if (step === 2 && !data.objetivo) { Toast.warning('Selecione seu objetivo'); return false; }
        if (step === 3 && !data.nivel) { Toast.warning('Selecione seu nível'); return false; }
        return true;
    },

    skip() {
        if (confirm('Pular configuração?')) { this.hide(); Auth.showOnboardingReminder(); Toast.info('Configure seu perfil depois'); }
    },

    async finish() {
        showLoading(true, 'Salvando perfil...');
        try {
            const perfilData = { ...AppState.onboardingData, dias_disponiveis: Array.from({length: AppState.onboardingData.dias}, (_, i) => i + 1) };
            await api(`${ML_SERVICE}/perfil/${AppState.user.id}`, { method: 'POST', body: JSON.stringify(perfilData) });
            AppState.profile = perfilData;
            const stored = JSON.parse(localStorage.getItem('shaipados_auth') || '{}');
            stored.profile = perfilData;
            localStorage.setItem('shaipados_auth', JSON.stringify(stored));
            this.hide();
            $('#onboarding-reminder') && ($('#onboarding-reminder').style.display = 'none');
            Toast.success('Perfil configurado! 🎉');
            App.loadDashboard();
        } catch (error) {
            AppState.profile = AppState.onboardingData;
            this.hide();
            Toast.warning('Perfil salvo localmente');
        } finally { showLoading(false); }
    }
};

// =====================================================
// APP PRINCIPAL
// =====================================================
const App = {
    initialized: false,

    init() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[App] Inicializando...');
        
        DashboardWidgets.init();
        this.setupNavigation();
        this.setupHeader();
        this.setupModals();
        this.setupOnboardingReminder();
        this.loadDashboard();
        this.loadTreinoTab();
        this.setupProfileTab();
        
        $('#btn-logout')?.addEventListener('click', () => Auth.logout());
        $('#btn-restart-onboarding')?.addEventListener('click', () => Onboarding.show());
        
        this.switchTab('home');
    },

    setupOnboardingReminder() {
        // Setup listeners do reminder uma única vez
        const reminder = $('#onboarding-reminder');
        if (reminder && !reminder.dataset.listenersAdded) {
            reminder.dataset.listenersAdded = 'true';
            $('#btn-complete-onboarding')?.addEventListener('click', () => { 
                reminder.style.display = 'none'; 
                Onboarding.show(); 
            });
            $('#btn-dismiss-reminder')?.addEventListener('click', () => { 
                reminder.style.display = 'none'; 
                sessionStorage.setItem('reminder_dismissed', 'true');
            });
        }
    },

    setupNavigation() {
        $$('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.dataset.tab;
                this.switchTab(tab);
            });
        });
    },

    switchTab(tab) {
        AppState.currentTab = tab;
        $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.tab === tab));
        $$('.tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-${tab}`));
        
        // Mostrar/ocultar botão flutuante de customização
        const floatingBtn = $('#btn-customize-floating');
        if (floatingBtn) {
            floatingBtn.style.display = tab === 'home' ? 'flex' : 'none';
        }
        
        if (tab === 'home') this.loadDashboard();
        else if (tab === 'treino') this.loadTreinoTab();
        else if (tab === 'progresso') this.loadProgress();
        else if (tab === 'perfil') this.loadProfile();
    },

    setupHeader() {
        $('#btn-settings')?.addEventListener('click', () => this.switchTab('perfil'));
        $('#btn-notifications')?.addEventListener('click', () => Toast.info('Sem notificações'));
        $('#btn-customize-dashboard')?.addEventListener('click', () => this.openDashboardCustomizer());
    },

    setupModals() {
        $$('.modal-close, [data-close]').forEach(btn => {
            btn.addEventListener('click', (e) => { 
                e.preventDefault(); 
                const modal = btn.closest('.modal-overlay'); 
                if (modal) {
                    modal.classList.remove('active');
                    modal.style.display = 'none'; 
                }
            });
        });
        $$('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => { 
                if (e.target === modal) {
                    modal.classList.remove('active');
                    modal.style.display = 'none'; 
                }
            });
        });

        // Dashboard Customizer buttons
        $('#btn-save-dashboard')?.addEventListener('click', () => {
            DashboardWidgets.saveConfig();
            this.loadDashboard();
            this.closeDashboardCustomizer();
            Toast.success('Dashboard atualizado!');
        });

        $('#btn-reset-dashboard')?.addEventListener('click', () => {
            DashboardWidgets.resetToDefault();
            this.renderCustomizerWidgets();
            this.setupCustomizerDragDrop();
            Toast.info('Dashboard restaurado ao padrão');
        });
    },

    // === DASHBOARD ===
    loadDashboard() {
        const container = $('#home-dashboard');
        if (!container) return;

        // Atualizar visibilidade do reminder de perfil incompleto
        const reminder = $('#onboarding-reminder');
        const dismissed = sessionStorage.getItem('reminder_dismissed') === 'true';
        if (reminder) {
            reminder.style.display = (!isProfileComplete() && !dismissed) ? 'flex' : 'none';
        }

        const visibleWidgets = DashboardWidgets.getVisibleWidgets();
        let html = '<div class="dashboard-header-brand"><h1>💪 SHAIPADOS</h1><div class="badge-brand">Pronto para treinar</div></div>';
        
        let halfWidgets = [];
        visibleWidgets.forEach(widget => {
            if (widget.size === 'half') {
                halfWidgets.push(widget);
                if (halfWidgets.length === 2) {
                    html += '<div class="dashboard-grid">';
                    halfWidgets.forEach(w => { html += DashboardWidgets.renderWidget(w); });
                    html += '</div>';
                    halfWidgets = [];
                }
            } else {
                if (halfWidgets.length > 0) {
                    html += '<div class="dashboard-grid">';
                    halfWidgets.forEach(w => { html += DashboardWidgets.renderWidget(w); });
                    html += '</div>';
                    halfWidgets = [];
                }
                html += DashboardWidgets.renderWidget(widget);
            }
        });
        if (halfWidgets.length > 0) {
            html += '<div class="dashboard-grid">';
            halfWidgets.forEach(w => { html += DashboardWidgets.renderWidget(w); });
            html += '</div>';
        }

        container.innerHTML = html;
        this.setupDashboardDragDrop();
    },

    setupDashboardDragDrop() {
        const container = $('#home-dashboard');
        if (!container) return;

        const widgets = container.querySelectorAll('.dashboard-widget');
        widgets.forEach((widget, index) => {
            const handle = widget.querySelector('.widget-drag-handle');
            if (!handle) return;

            // Touch events
            let touchStartY = 0, isDragging = false;
            handle.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
                isDragging = true;
                widget.classList.add('dragging');
                e.preventDefault();
            }, { passive: false });

            handle.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                const diff = e.touches[0].clientY - touchStartY;
                widget.style.transform = `translateY(${diff}px)`;
                const rect = widget.getBoundingClientRect();
                const centerY = rect.top + rect.height / 2;
                widgets.forEach((other, otherIdx) => {
                    if (other === widget) return;
                    const otherRect = other.getBoundingClientRect();
                    if (centerY > otherRect.top && centerY < otherRect.bottom) {
                        other.classList.add('drag-over');
                        DashboardWidgets.draggedOverItem = otherIdx;
                    } else other.classList.remove('drag-over');
                });
                e.preventDefault();
            }, { passive: false });

            handle.addEventListener('touchend', () => {
                if (!isDragging) return;
                isDragging = false;
                widget.classList.remove('dragging');
                widget.style.transform = '';
                widgets.forEach(w => w.classList.remove('drag-over'));
                if (DashboardWidgets.draggedOverItem !== null && DashboardWidgets.draggedOverItem !== index) {
                    DashboardWidgets.reorderWidgets(index, DashboardWidgets.draggedOverItem);
                    DashboardWidgets.saveConfig();
                    this.loadDashboard();
                }
                DashboardWidgets.draggedOverItem = null;
            });

            // Mouse events
            handle.addEventListener('mousedown', (e) => { e.preventDefault(); widget.setAttribute('draggable', 'true'); });
            widget.addEventListener('dragstart', () => { widget.classList.add('dragging'); DashboardWidgets.draggedItem = index; });
            widget.addEventListener('dragend', () => {
                widget.classList.remove('dragging');
                widget.removeAttribute('draggable');
                widgets.forEach(w => w.classList.remove('drag-over'));
                if (DashboardWidgets.draggedOverItem !== null && DashboardWidgets.draggedOverItem !== DashboardWidgets.draggedItem) {
                    DashboardWidgets.reorderWidgets(DashboardWidgets.draggedItem, DashboardWidgets.draggedOverItem);
                    DashboardWidgets.saveConfig();
                    this.loadDashboard();
                }
                DashboardWidgets.draggedItem = null;
                DashboardWidgets.draggedOverItem = null;
            });
            widget.addEventListener('dragover', (e) => { e.preventDefault(); widget.classList.add('drag-over'); DashboardWidgets.draggedOverItem = index; });
            widget.addEventListener('dragleave', () => widget.classList.remove('drag-over'));
        });
    },

    openDashboardCustomizer() {
        const modal = $('#modal-dashboard-customizer');
        if (!modal) { 
            Toast.info('Personalizador em breve!'); 
            return; 
        }
        modal.classList.add('active');
        modal.style.display = 'flex';
        this.renderCustomizerWidgets();
        this.setupCustomizerDragDrop();
    },

    closeDashboardCustomizer() {
        const modal = $('#modal-dashboard-customizer');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    },

    setupCustomizerDragDrop() {
        const container = $('#customizer-widgets-list');
        if (!container) return;

        const items = container.querySelectorAll('.customizer-widget-item');
        items.forEach((item, index) => {
            item.draggable = true;
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', index);
                item.classList.add('dragging');
                DashboardWidgets.draggedItem = index;
            });
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                container.querySelectorAll('.customizer-widget-item').forEach(i => i.classList.remove('drag-over'));
                if (DashboardWidgets.draggedItem !== null && DashboardWidgets.draggedOverItem !== null && 
                    DashboardWidgets.draggedItem !== DashboardWidgets.draggedOverItem) {
                    DashboardWidgets.reorderWidgets(DashboardWidgets.draggedItem, DashboardWidgets.draggedOverItem);
                    DashboardWidgets.saveConfig();
                    this.renderCustomizerWidgets();
                    this.setupCustomizerDragDrop();
                }
                DashboardWidgets.draggedItem = null;
                DashboardWidgets.draggedOverItem = null;
            });
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                item.classList.add('drag-over');
                DashboardWidgets.draggedOverItem = index;
            });
            item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
        });
    },

    renderCustomizerWidgets() {
        const activeList = $('#customizer-widgets-list');
        const availableList = $('#available-widgets-list');
        if (!activeList || !availableList) return;

        const visible = DashboardWidgets.getVisibleWidgets();
        const hidden = DashboardWidgets.getHiddenWidgets();

        activeList.innerHTML = visible.map(w => `
            <div class="customizer-widget-item active" data-widget-id="${w.id}">
                <div class="widget-item-icon">${w.icon}</div>
                <div class="widget-item-info"><strong>${w.name}</strong></div>
                ${w.required ? '<span class="widget-required">Obrigatório</span>' : `<button class="widget-item-remove" onclick="App.toggleWidget('${w.id}')">✕</button>`}
            </div>
        `).join('');

        availableList.innerHTML = hidden.length === 0 ? '<p class="no-widgets">Todos os widgets estão no dashboard</p>' :
            hidden.map(w => `
                <div class="customizer-widget-item available" data-widget-id="${w.id}" onclick="App.toggleWidget('${w.id}')">
                    <div class="widget-item-icon">${w.icon}</div>
                    <div class="widget-item-info"><strong>${w.name}</strong></div>
                    <div class="widget-item-add">+</div>
                </div>
            `).join('');
    },

    toggleWidget(widgetId) {
        DashboardWidgets.toggleWidget(widgetId);
        DashboardWidgets.saveConfig();
        this.renderCustomizerWidgets();
        this.loadDashboard();
    },

    // === TREINO ===
    getTreinoAtual() {
        return AppState.workouts[0] || JSON.parse(localStorage.getItem('treino_atual') || 'null') || this.createDefaultTreino();
    },

    createDefaultTreino() {
        const objetivo = AppState.profile?.objetivo || 'hipertrofia';
        const dias = AppState.profile?.dias || 4;
        const treino = {
            nome: 'Treino Personalizado',
            divisao: dias <= 2 ? 'AB' : dias <= 3 ? 'ABC' : 'ABCD',
            duracao: AppState.profile?.duracao || 60,
            dias: []
        };
        
        const divisoes = {
            2: [{ nome: 'Treino A - Superior', grupos: 'Peito, Costas, Ombros, Braços' }, { nome: 'Treino B - Inferior', grupos: 'Quadríceps, Posterior, Glúteos, Panturrilha' }],
            3: [{ nome: 'Treino A - Push', grupos: 'Peito, Ombro, Tríceps' }, { nome: 'Treino B - Pull', grupos: 'Costas, Bíceps, Antebraço' }, { nome: 'Treino C - Legs', grupos: 'Quadríceps, Posterior, Glúteos' }],
            4: [{ nome: 'Treino A - Peito/Tríceps', grupos: 'Peito, Tríceps' }, { nome: 'Treino B - Costas/Bíceps', grupos: 'Costas, Bíceps' }, { nome: 'Treino C - Pernas', grupos: 'Quadríceps, Posterior, Glúteos' }, { nome: 'Treino D - Ombros/Abs', grupos: 'Ombros, Abdômen' }]
        };
        
        const base = divisoes[Math.min(4, Math.max(2, dias))] || divisoes[4];
        treino.dias = base.map(d => ({
            ...d,
            exercicios: this.generateExercises(d.grupos, objetivo)
        }));
        
        localStorage.setItem('treino_atual', JSON.stringify(treino));
        AppState.workouts = [treino];
        return treino;
    },

    generateExercises(grupos, objetivo) {
        const exercises = {
            'Peito': ['Supino Reto', 'Supino Inclinado', 'Crucifixo', 'Crossover'],
            'Costas': ['Puxada Frontal', 'Remada Curvada', 'Remada Baixa', 'Pulldown'],
            'Ombros': ['Desenvolvimento', 'Elevação Lateral', 'Elevação Frontal', 'Face Pull'],
            'Tríceps': ['Tríceps Corda', 'Tríceps Francês', 'Mergulho'],
            'Bíceps': ['Rosca Direta', 'Rosca Alternada', 'Rosca Martelo'],
            'Quadríceps': ['Agachamento', 'Leg Press', 'Cadeira Extensora'],
            'Posterior': ['Stiff', 'Mesa Flexora', 'Cadeira Flexora'],
            'Glúteos': ['Hip Thrust', 'Elevação Pélvica', 'Abdução'],
            'Abdômen': ['Abdominal Crunch', 'Prancha', 'Elevação de Pernas']
        };
        
        const result = [];
        const groupList = grupos.split(',').map(g => g.trim());
        groupList.forEach(grupo => {
            const exs = exercises[grupo] || [];
            exs.slice(0, 3).forEach(ex => {
                result.push({
                    nome: ex,
                    series: objetivo === 'forca' ? 5 : objetivo === 'hipertrofia' ? 4 : 3,
                    repeticoes: objetivo === 'forca' ? '4-6' : objetivo === 'hipertrofia' ? '8-12' : '12-15',
                    descanso: objetivo === 'forca' ? '180s' : objetivo === 'hipertrofia' ? '90s' : '60s'
                });
            });
        });
        return result.slice(0, 8);
    },

    getTodayIndex(treino) {
        if (!treino?.dias?.length) return 0;
        const diaSemana = new Date().getDay();
        return (diaSemana === 0 ? 6 : diaSemana - 1) % treino.dias.length;
    },

    loadTreinoTab() {
        const container = $('#treino-content');
        if (!container) return;

        const treino = this.getTreinoAtual();
        if (!treino?.dias?.length) {
            container.innerHTML = '<div class="empty-state"><p>Nenhum treino configurado</p><button class="btn-primary" onclick="App.showTemplates()">Escolher Ficha</button></div>';
            return;
        }

        const todayIdx = this.getTodayIndex(treino);
        
        container.innerHTML = `
            <div class="treino-header">
                <h2>${treino.nome}</h2>
                <p>${treino.divisao} • ${treino.dias.length}x/semana</p>
            </div>
            <div class="treino-tabs">
                ${treino.dias.map((d, i) => `
                    <button class="treino-tab ${i === todayIdx ? 'active' : ''}" onclick="App.showTreinoDay(${i})">
                        ${String.fromCharCode(65 + i)}
                    </button>
                `).join('')}
            </div>
            <div class="treino-day-content" id="treino-day-content"></div>
            <div class="treino-actions">
                <button class="btn-primary btn-lg" onclick="App.startWorkout()">🏋️ Iniciar Treino</button>
                <button class="btn-secondary" onclick="App.editWorkout()">✏️ Editar</button>
            </div>
        `;

        this.showTreinoDay(todayIdx);
    },

    showTreinoDay(index) {
        const treino = this.getTreinoAtual();
        const dia = treino?.dias?.[index];
        if (!dia) return;

        $$('.treino-tab').forEach((t, i) => t.classList.toggle('active', i === index));

        const container = $('#treino-day-content');
        if (!container) return;

        container.innerHTML = `
            <div class="treino-day-header">
                <h3>${dia.nome}</h3>
                <span>${dia.grupos || ''}</span>
            </div>
            <div class="exercises-list">
                ${dia.exercicios.map((ex, i) => `
                    <div class="exercise-card">
                        <div class="exercise-number">${i + 1}</div>
                        <div class="exercise-info">
                            <strong>${ex.nome}</strong>
                            <div class="exercise-details">
                                <span>📊 ${ex.series} séries</span>
                                <span>🔄 ${ex.repeticoes} reps</span>
                                <span>⏱️ ${ex.descanso}</span>
                            </div>
                        </div>
                        <input type="text" class="input-carga" placeholder="Carga" value="${ex.carga_usuario || ''}" data-dia="${index}" data-ex="${i}">
                    </div>
                `).join('')}
            </div>
        `;
    },

    viewWorkoutDay(index) {
        this.switchTab('treino');
        setTimeout(() => this.showTreinoDay(index), 100);
    },

    startWorkout(dayIndex = null) {
        // Usar o sistema ActiveWorkout profissional
        ActiveWorkout.start(dayIndex);
    },

    editWorkout() {
        Toast.info('Editor de treino em breve!');
    },

    showTemplates() {
        WorkoutTemplates.showTemplateSelector();
    },

    showAchievements() {
        Toast.info('Conquistas em breve!');
    },

    addWater() {
        let agua = parseInt(localStorage.getItem('agua_hoje') || '0');
        agua++;
        localStorage.setItem('agua_hoje', agua.toString());
        Toast.success(`💧 ${agua} copo${agua > 1 ? 's' : ''} de água!`);
        this.loadDashboard();
    },

    openTimer() {
        Toast.info('Timer de descanso em breve!');
    },

    // === PROGRESSO ===
    loadProgress() {
        const container = $('#progress-content');
        if (!container) return;

        const historico = JSON.parse(localStorage.getItem('historico_treinos') || '[]');
        const total = historico.length;
        const semana = DashboardWidgets.treinosSemana(historico);
        const streak = DashboardWidgets.calcStreak(historico);

        container.innerHTML = `
            <div class="progress-stats">
                <div class="progress-stat"><span class="stat-value">${total}</span><span class="stat-label">Total Treinos</span></div>
                <div class="progress-stat"><span class="stat-value">${semana}</span><span class="stat-label">Esta Semana</span></div>
                <div class="progress-stat"><span class="stat-value">${streak}</span><span class="stat-label">Dias Seguidos</span></div>
            </div>
            <div class="progress-chart">
                <h3>Últimos 7 dias</h3>
                <div class="week-chart">
                    ${['D','S','T','Q','Q','S','S'].map((d, i) => {
                        const done = historico.some(h => new Date(h.data).getDay() === i);
                        return `<div class="chart-day ${done ? 'done' : ''}"><span>${d}</span></div>`;
                    }).join('')}
                </div>
            </div>
        `;
    },

    // === PERFIL ===
    loadProfile() {
        const p = AppState.profile || {};
        const complete = isProfileComplete();
        
        // Atualizar stats
        $('#stat-peso') && ($('#stat-peso').textContent = p.peso || '--');
        $('#stat-altura') && ($('#stat-altura').textContent = p.altura || '--');
        $('#stat-idade') && ($('#stat-idade').textContent = p.idade || '--');
        
        // Atualizar info do usuário
        const nome = AppState.user?.nome || 'Usuário';
        $('#profile-name') && ($('#profile-name').textContent = nome);
        $('#profile-avatar-letter') && ($('#profile-avatar-letter').textContent = nome.charAt(0).toUpperCase());
        
        // Objetivo
        const objetivos = { hipertrofia: 'Hipertrofia', forca: 'Força', emagrecimento: 'Emagrecimento', condicionamento: 'Condicionamento' };
        $('#profile-goal') && ($('#profile-goal').textContent = `Objetivo: ${objetivos[p.objetivo] || 'Não definido'}`);
        
        // Status do perfil
        const statusEl = $('#profile-status');
        if (statusEl) {
            if (complete) {
                statusEl.innerHTML = '<span class="status-complete">✓ Perfil completo</span>';
                statusEl.className = 'profile-status complete';
            } else {
                statusEl.innerHTML = '<span class="status-incomplete">⚠ Perfil incompleto</span>';
                statusEl.className = 'profile-status incomplete';
            }
        }
        
        // Alerta de perfil incompleto
        const alertEl = $('#profile-incomplete-alert');
        if (alertEl) {
            alertEl.style.display = complete ? 'none' : 'flex';
        }
        
        // Calcular IMC se tiver dados
        if (p.peso && p.altura) {
            const alturaM = p.altura / 100;
            const imc = (p.peso / (alturaM * alturaM)).toFixed(1);
            $('#stat-imc') && ($('#stat-imc').textContent = imc);
        }
    },

    setupProfileTab() {
        // Menu items
        $$('.menu-item[data-action]').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                if (action === 'edit-profile') Onboarding.show();
                else if (action === 'logout') Auth.logout();
                else Toast.info('Em breve!');
            });
        });
        
        // Botão editar perfil
        $('#btn-edit-profile')?.addEventListener('click', () => Onboarding.show());
        
        // Botão completar perfil (no alerta)
        $('#btn-complete-profile')?.addEventListener('click', () => Onboarding.show());
    }
};

// =====================================================
// ACTIVE WORKOUT - Sistema de Treino Ativo
// Inspirado em: Strong, Hevy, Nike Training Club
// Features: Timer, Controle de Séries, Descanso Inteligente
// =====================================================
const ActiveWorkout = {
    isActive: false,
    startTime: null,
    timerInterval: null,
    restInterval: null,
    currentExerciseIndex: 0,
    currentWorkout: null,
    setsCompleted: [],
    restTime: 0,
    
    start(dayIndex = null) {
        const treino = App.getTreinoAtual();
        
        if (!treino || !treino.dias?.length) {
            Toast.error('Nenhum treino disponível');
            return;
        }
        
        // Determinar dia do treino
        const idx = dayIndex !== null ? dayIndex : App.getTodayIndex(treino);
        this.currentWorkout = treino.dias[idx];
        
        if (!this.currentWorkout?.exercicios?.length) {
            Toast.error('Treino sem exercícios');
            return;
        }
        
        // Inicializar controle de séries
        this.setsCompleted = this.currentWorkout.exercicios.map(ex => 
            Array(parseInt(ex.series) || 3).fill(null).map(() => ({ 
                reps: null, 
                weight: null, 
                completed: false 
            }))
        );
        
        this.currentExerciseIndex = 0;
        this.isActive = true;
        this.startTime = Date.now();
        
        this.renderActiveWorkout();
        this.startTimer();
        
        Toast.success(`💪 Iniciando ${this.currentWorkout.nome}!`);
    },
    
    renderActiveWorkout() {
        const exercicios = this.currentWorkout.exercicios;
        
        const overlay = document.createElement('div');
        overlay.className = 'active-workout-overlay';
        overlay.id = 'active-workout';
        
        overlay.innerHTML = `
            <div class="active-workout-container">
                <!-- Header -->
                <div class="aw-header">
                    <div class="aw-header-left">
                        <button class="btn-aw-close" onclick="ActiveWorkout.confirmEnd()">✕</button>
                        <div class="aw-timer" id="aw-timer">00:00</div>
                    </div>
                    <h2 class="aw-title">${this.currentWorkout.nome}</h2>
                    <button class="btn-aw-finish" onclick="ActiveWorkout.finish()">Finalizar</button>
                </div>
                
                <!-- Progress -->
                <div class="aw-progress-container">
                    <div class="aw-progress-bar" id="aw-progress-bar" style="width: 0%"></div>
                </div>
                
                <!-- Exercises -->
                <div class="aw-exercises" id="aw-exercises">
                    ${exercicios.map((ex, i) => this.renderExerciseCard(ex, i)).join('')}
                </div>
                
                <!-- Rest Timer Modal -->
                <div class="rest-timer-modal" id="rest-timer-modal">
                    <div class="rest-timer-content">
                        <div class="rest-timer-circle">
                            <svg viewBox="0 0 100 100">
                                <circle class="rest-bg" cx="50" cy="50" r="45"/>
                                <circle class="rest-progress" id="rest-circle" cx="50" cy="50" r="45"/>
                            </svg>
                            <div class="rest-timer-display" id="rest-timer-display">60</div>
                        </div>
                        <h3>⏱️ Descanso</h3>
                        <div class="rest-timer-actions">
                            <button class="btn-rest" onclick="ActiveWorkout.addRestTime(-15)">-15s</button>
                            <button class="btn-rest-skip" onclick="ActiveWorkout.skipRest()">Pular</button>
                            <button class="btn-rest" onclick="ActiveWorkout.addRestTime(15)">+15s</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Abrir primeiro exercício
        const firstSets = document.getElementById('aw-sets-0');
        if (firstSets) firstSets.style.display = 'block';
    },
    
    renderExerciseCard(exercise, exIdx) {
        const sets = this.setsCompleted[exIdx] || [];
        const isActive = exIdx === this.currentExerciseIndex;
        const defaultWeight = exercise.carga_usuario || exercise.carga_sugerida || '';
        const defaultReps = exercise.repeticoes?.toString().split('-')[0] || '10';
        
        return `
            <div class="aw-exercise-card ${isActive ? 'active' : ''}" id="aw-exercise-${exIdx}">
                <div class="aw-exercise-header" onclick="ActiveWorkout.toggleExercise(${exIdx})">
                    <div class="aw-exercise-number">${exIdx + 1}</div>
                    <div class="aw-exercise-info">
                        <span class="aw-exercise-name">${exercise.nome}</span>
                        <span class="aw-exercise-meta">${exercise.series}×${exercise.repeticoes} • ${exercise.descanso}</span>
                    </div>
                    <div class="aw-exercise-status">
                        <span class="aw-exercise-completed" id="aw-completed-${exIdx}">0/${sets.length}</span>
                        <span class="aw-expand-icon">${isActive ? '▼' : '▶'}</span>
                    </div>
                </div>
                
                <div class="aw-sets-container" id="aw-sets-${exIdx}" style="${isActive ? '' : 'display: none;'}">
                    <div class="aw-sets-header">
                        <span>SÉRIE</span>
                        <span>CARGA (kg)</span>
                        <span>REPS</span>
                        <span></span>
                    </div>
                    ${sets.map((set, setIdx) => `
                        <div class="aw-set-row ${set.completed ? 'completed' : ''}" id="aw-set-${exIdx}-${setIdx}">
                            <span class="aw-set-number">${setIdx + 1}</span>
                            <div class="aw-input-group">
                                <button class="aw-adjust-btn" onclick="ActiveWorkout.adjustValue(${exIdx}, ${setIdx}, 'weight', -2.5)">−</button>
                                <input type="number" class="aw-input" id="aw-weight-${exIdx}-${setIdx}" 
                                       placeholder="${defaultWeight}" value="${set.weight || ''}"
                                       onchange="ActiveWorkout.updateSet(${exIdx}, ${setIdx})">
                                <button class="aw-adjust-btn" onclick="ActiveWorkout.adjustValue(${exIdx}, ${setIdx}, 'weight', 2.5)">+</button>
                            </div>
                            <div class="aw-input-group">
                                <button class="aw-adjust-btn" onclick="ActiveWorkout.adjustValue(${exIdx}, ${setIdx}, 'reps', -1)">−</button>
                                <input type="number" class="aw-input" id="aw-reps-${exIdx}-${setIdx}" 
                                       placeholder="${defaultReps}" value="${set.reps || ''}"
                                       onchange="ActiveWorkout.updateSet(${exIdx}, ${setIdx})">
                                <button class="aw-adjust-btn" onclick="ActiveWorkout.adjustValue(${exIdx}, ${setIdx}, 'reps', 1)">+</button>
                            </div>
                            <button class="btn-complete-set ${set.completed ? 'completed' : ''}" 
                                    id="btn-set-${exIdx}-${setIdx}"
                                    onclick="ActiveWorkout.completeSet(${exIdx}, ${setIdx})">
                                ${set.completed ? '✓' : '○'}
                            </button>
                        </div>
                    `).join('')}
                    
                    <button class="btn-add-set" onclick="ActiveWorkout.addSet(${exIdx})">
                        + Adicionar Série
                    </button>
                </div>
            </div>
        `;
    },
    
    toggleExercise(exIdx) {
        const container = document.getElementById(`aw-sets-${exIdx}`);
        const icon = document.querySelector(`#aw-exercise-${exIdx} .aw-expand-icon`);
        if (container) {
            const isVisible = container.style.display !== 'none';
            container.style.display = isVisible ? 'none' : 'block';
            if (icon) icon.textContent = isVisible ? '▶' : '▼';
        }
    },
    
    adjustValue(exIdx, setIdx, field, delta) {
        const inputId = field === 'weight' ? `aw-weight-${exIdx}-${setIdx}` : `aw-reps-${exIdx}-${setIdx}`;
        const input = document.getElementById(inputId);
        if (input) {
            const currentVal = parseFloat(input.value) || parseFloat(input.placeholder) || 0;
            const newVal = Math.max(0, currentVal + delta);
            input.value = field === 'weight' ? newVal.toFixed(1).replace('.0', '') : Math.round(newVal);
            this.updateSet(exIdx, setIdx);
        }
    },
    
    updateSet(exIdx, setIdx) {
        const weight = document.getElementById(`aw-weight-${exIdx}-${setIdx}`)?.value;
        const reps = document.getElementById(`aw-reps-${exIdx}-${setIdx}`)?.value;
        
        if (this.setsCompleted[exIdx]?.[setIdx]) {
            this.setsCompleted[exIdx][setIdx].weight = parseFloat(weight) || null;
            this.setsCompleted[exIdx][setIdx].reps = parseInt(reps) || null;
        }
    },
    
    completeSet(exIdx, setIdx) {
        this.updateSet(exIdx, setIdx);
        
        const set = this.setsCompleted[exIdx]?.[setIdx];
        if (!set) return;
        
        set.completed = !set.completed;
        
        // Update UI
        const row = document.getElementById(`aw-set-${exIdx}-${setIdx}`);
        const btn = document.getElementById(`btn-set-${exIdx}-${setIdx}`);
        
        if (row) row.classList.toggle('completed', set.completed);
        if (btn) {
            btn.classList.toggle('completed', set.completed);
            btn.innerHTML = set.completed ? '✓' : '○';
        }
        
        this.updateExerciseCounter(exIdx);
        this.updateProgress();
        
        // Se completou, iniciar timer de descanso
        if (set.completed) {
            const restSec = this.parseRestTime(this.currentWorkout.exercicios[exIdx]?.descanso);
            this.startRestTimer(restSec);
            
            // Vibração haptica
            if (navigator.vibrate) navigator.vibrate(50);
            
            // Verificar se completou todas séries do exercício
            const allComplete = this.setsCompleted[exIdx].every(s => s.completed);
            if (allComplete && exIdx < this.currentWorkout.exercicios.length - 1) {
                setTimeout(() => {
                    // Fechar exercício atual
                    const currentSets = document.getElementById(`aw-sets-${exIdx}`);
                    if (currentSets) currentSets.style.display = 'none';
                    
                    // Abrir próximo
                    this.currentExerciseIndex = exIdx + 1;
                    const nextSets = document.getElementById(`aw-sets-${this.currentExerciseIndex}`);
                    if (nextSets) {
                        nextSets.style.display = 'block';
                        document.getElementById(`aw-exercise-${this.currentExerciseIndex}`)?.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 300);
            }
        }
    },
    
    addSet(exIdx) {
        if (!this.setsCompleted[exIdx]) return;
        
        this.setsCompleted[exIdx].push({ reps: null, weight: null, completed: false });
        
        // Re-render
        const card = document.getElementById(`aw-exercise-${exIdx}`);
        if (card) {
            card.outerHTML = this.renderExerciseCard(this.currentWorkout.exercicios[exIdx], exIdx);
            document.getElementById(`aw-sets-${exIdx}`).style.display = 'block';
        }
    },
    
    updateExerciseCounter(exIdx) {
        const counter = document.getElementById(`aw-completed-${exIdx}`);
        if (counter && this.setsCompleted[exIdx]) {
            const done = this.setsCompleted[exIdx].filter(s => s.completed).length;
            counter.textContent = `${done}/${this.setsCompleted[exIdx].length}`;
        }
    },
    
    updateProgress() {
        const total = this.setsCompleted.reduce((sum, sets) => sum + sets.length, 0);
        const done = this.setsCompleted.reduce((sum, sets) => sum + sets.filter(s => s.completed).length, 0);
        const pct = total > 0 ? (done / total) * 100 : 0;
        
        const bar = document.getElementById('aw-progress-bar');
        if (bar) bar.style.width = `${pct}%`;
    },
    
    parseRestTime(str) {
        if (!str) return 60;
        const match = str.match(/(\d+)/);
        return match ? parseInt(match[1]) : 60;
    },
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const min = Math.floor(elapsed / 60);
            const sec = elapsed % 60;
            const el = document.getElementById('aw-timer');
            if (el) el.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
        }, 1000);
    },
    
    startRestTimer(seconds) {
        this.restTime = seconds;
        this.restTimeMax = seconds;
        
        const modal = document.getElementById('rest-timer-modal');
        const display = document.getElementById('rest-timer-display');
        const circle = document.getElementById('rest-circle');
        
        if (modal) modal.classList.add('active');
        if (display) display.textContent = this.restTime;
        
        // Vibrar
        if (navigator.vibrate) navigator.vibrate(100);
        
        this.restInterval = setInterval(() => {
            this.restTime--;
            if (display) display.textContent = Math.max(0, this.restTime);
            
            // Atualizar círculo SVG
            if (circle) {
                const pct = this.restTime / this.restTimeMax;
                const circumference = 2 * Math.PI * 45;
                circle.style.strokeDasharray = circumference;
                circle.style.strokeDashoffset = circumference * (1 - pct);
            }
            
            if (this.restTime <= 0) {
                this.skipRest();
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            }
        }, 1000);
    },
    
    skipRest() {
        if (this.restInterval) {
            clearInterval(this.restInterval);
            this.restInterval = null;
        }
        const modal = document.getElementById('rest-timer-modal');
        if (modal) modal.classList.remove('active');
    },
    
    addRestTime(seconds) {
        this.restTime = Math.max(0, this.restTime + seconds);
        const display = document.getElementById('rest-timer-display');
        if (display) display.textContent = this.restTime;
    },
    
    confirmEnd() {
        if (confirm('Cancelar treino? O progresso não será salvo.')) {
            this.cancel();
        }
    },
    
    cancel() {
        this.cleanup();
        document.getElementById('active-workout')?.remove();
        Toast.warning('Treino cancelado');
    },
    
    finish() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        
        const totalSets = this.setsCompleted.reduce((sum, sets) => sum + sets.length, 0);
        const completedSets = this.setsCompleted.reduce((sum, sets) => sum + sets.filter(s => s.completed).length, 0);
        
        let totalVolume = 0;
        this.setsCompleted.forEach(sets => {
            sets.forEach(set => {
                if (set.completed && set.weight && set.reps) {
                    totalVolume += set.weight * set.reps;
                }
            });
        });
        
        // Salvar no histórico
        const registro = {
            data: new Date().toISOString().split('T')[0],
            treino: this.currentWorkout.nome,
            duracao: minutes,
            series_feitas: completedSets,
            series_total: totalSets,
            volume: totalVolume
        };
        
        const historico = JSON.parse(localStorage.getItem('historico_treinos') || '[]');
        historico.push(registro);
        localStorage.setItem('historico_treinos', JSON.stringify(historico));
        
        // Salvar cargas usadas no treino
        this.saveCargas();
        
        this.cleanup();
        document.getElementById('active-workout')?.remove();
        
        // Mostrar resumo
        this.showSummary(registro, completedSets, totalSets, totalVolume);
    },
    
    saveCargas() {
        const treino = App.getTreinoAtual();
        if (!treino) return;
        
        const idx = treino.dias.findIndex(d => d.nome === this.currentWorkout.nome);
        if (idx === -1) return;
        
        this.setsCompleted.forEach((sets, exIdx) => {
            // Pegar a maior carga usada
            const maxWeight = Math.max(...sets.filter(s => s.weight).map(s => s.weight), 0);
            if (maxWeight > 0 && treino.dias[idx].exercicios[exIdx]) {
                treino.dias[idx].exercicios[exIdx].carga_usuario = maxWeight;
            }
        });
        
        localStorage.setItem('treino_atual', JSON.stringify(treino));
    },
    
    showSummary(registro, completedSets, totalSets, volume) {
        const pct = Math.round((completedSets / totalSets) * 100);
        let msg = '✊ Cada treino conta!';
        if (pct === 100) msg = '💪 TREINO PERFEITO!';
        else if (pct >= 80) msg = '🔥 Excelente treino!';
        else if (pct >= 60) msg = '👍 Bom trabalho!';
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'workout-summary';
        modal.innerHTML = `
            <div class="modal-content workout-summary">
                <div class="summary-header">
                    <div class="summary-icon">🎉</div>
                    <h2>Treino Finalizado!</h2>
                    <p>${registro.treino}</p>
                </div>
                <div class="summary-stats">
                    <div class="summary-stat">
                        <span class="stat-value">${registro.duracao}</span>
                        <span class="stat-label">minutos</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-value">${completedSets}/${totalSets}</span>
                        <span class="stat-label">séries</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-value">${Math.round(volume)}</span>
                        <span class="stat-label">kg volume</span>
                    </div>
                </div>
                <div class="summary-message">${msg}</div>
                <button class="btn-primary btn-lg" onclick="document.getElementById('workout-summary').remove(); App.loadDashboard();">
                    Fechar
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    cleanup() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.restInterval) clearInterval(this.restInterval);
        this.isActive = false;
        this.timerInterval = null;
        this.restInterval = null;
    }
};

// =====================================================
// WORKOUT GENERATOR - Gerador de Treinos Profissional
// Baseado em: NSCA, ACSM, Strength & Conditioning Research
// =====================================================
const WorkoutGenerator = {
    version: 2,

    // Banco de exercícios expandido por grupo muscular
    exerciseDatabase: {
        // PEITO
        peito: {
            compostos: [
                { nome: 'Supino Reto com Barra', equipamento: 'barra', dificuldade: 'intermediario' },
                { nome: 'Supino Reto com Halteres', equipamento: 'halteres', dificuldade: 'iniciante' },
                { nome: 'Supino Inclinado com Barra', equipamento: 'barra', dificuldade: 'intermediario' },
                { nome: 'Supino Inclinado com Halteres', equipamento: 'halteres', dificuldade: 'iniciante' },
                { nome: 'Supino Declinado', equipamento: 'barra', dificuldade: 'avancado' }
            ],
            isolados: [
                { nome: 'Crucifixo com Halteres', equipamento: 'halteres', dificuldade: 'iniciante' },
                { nome: 'Crucifixo na Máquina (Peck Deck)', equipamento: 'maquina', dificuldade: 'iniciante' },
                { nome: 'Crossover (Cabo)', equipamento: 'cabo', dificuldade: 'intermediario' },
                { nome: 'Pullover com Halter', equipamento: 'halteres', dificuldade: 'intermediario' },
                { nome: 'Flexão de Braço', equipamento: 'corpo', dificuldade: 'iniciante' },
                { nome: 'Flexão Diamante', equipamento: 'corpo', dificuldade: 'intermediario' }
            ]
        },
        // COSTAS
        costas: {
            compostos: [
                { nome: 'Barra Fixa (Pull-up)', equipamento: 'barra', dificuldade: 'intermediario' },
                { nome: 'Puxada Frontal na Polia', equipamento: 'cabo', dificuldade: 'iniciante' },
                { nome: 'Remada Curvada com Barra', equipamento: 'barra', dificuldade: 'intermediario' },
                { nome: 'Remada Cavalinho (T-Bar)', equipamento: 'barra', dificuldade: 'intermediario' },
                { nome: 'Levantamento Terra', equipamento: 'barra', dificuldade: 'avancado' }
            ],
            isolados: [
                { nome: 'Remada Unilateral com Halter', equipamento: 'halteres', dificuldade: 'iniciante' },
                { nome: 'Remada Baixa (Seated Row)', equipamento: 'cabo', dificuldade: 'iniciante' },
                { nome: 'Puxada com Triângulo', equipamento: 'cabo', dificuldade: 'iniciante' },
                { nome: 'Pulldown com Corda', equipamento: 'cabo', dificuldade: 'iniciante' },
                { nome: 'Hiperextensão Lombar', equipamento: 'banco', dificuldade: 'iniciante' },
                { nome: 'Face Pull', equipamento: 'cabo', dificuldade: 'intermediario' }
            ]
        },
        // OMBROS
        ombros: {
            compostos: [
                { nome: 'Desenvolvimento com Barra', equipamento: 'barra', dificuldade: 'intermediario' },
                { nome: 'Desenvolvimento com Halteres', equipamento: 'halteres', dificuldade: 'iniciante' },
                { nome: 'Desenvolvimento Arnold', equipamento: 'halteres', dificuldade: 'intermediario' },
                { nome: 'Desenvolvimento na Máquina', equipamento: 'maquina', dificuldade: 'iniciante' }
            ],
            isolados: [
                { nome: 'Elevação Lateral com Halteres', equipamento: 'halteres', dificuldade: 'iniciante' },
                { nome: 'Elevação Frontal', equipamento: 'halteres', dificuldade: 'iniciante' },
                { nome: 'Crucifixo Inverso', equipamento: 'halteres', dificuldade: 'iniciante' },
                { nome: 'Elevação Lateral no Cabo', equipamento: 'cabo', dificuldade: 'intermediario' },
                { nome: 'Encolhimento (Trapézio)', equipamento: 'halteres', dificuldade: 'iniciante' }
            ]
        },
        // BÍCEPS
        biceps: {
            compostos: [
                { nome: 'Rosca Direta com Barra', equipamento: 'barra', dificuldade: 'iniciante' },
                { nome: 'Rosca Direta com Halteres', equipamento: 'halteres', dificuldade: 'iniciante' }
            ],
            isolados: [
                { nome: 'Rosca Alternada', equipamento: 'halteres', dificuldade: 'iniciante' },
                { nome: 'Rosca Martelo', equipamento: 'halteres', dificuldade: 'iniciante' },
                { nome: 'Rosca Scott (Banco)', equipamento: 'barra', dificuldade: 'intermediario' },
                { nome: 'Rosca Concentrada', equipamento: 'halteres', dificuldade: 'intermediario' },
                { nome: 'Rosca no Cabo', equipamento: 'cabo', dificuldade: 'iniciante' },
                { nome: 'Rosca Spider', equipamento: 'barra', dificuldade: 'avancado' }
            ]
        },
        // TRÍCEPS
        triceps: {
            compostos: [
                { nome: 'Supino Fechado', equipamento: 'barra', dificuldade: 'intermediario' },
                { nome: 'Mergulho em Paralelas', equipamento: 'corpo', dificuldade: 'intermediario' }
            ],
            isolados: [
                { nome: 'Tríceps Testa (Skull Crusher)', equipamento: 'barra', dificuldade: 'intermediario' },
                { nome: 'Tríceps Corda (Pushdown)', equipamento: 'cabo', dificuldade: 'iniciante' },
                { nome: 'Tríceps Francês', equipamento: 'halteres', dificuldade: 'intermediario' },
                { nome: 'Tríceps Banco (Dips)', equipamento: 'corpo', dificuldade: 'iniciante' },
                { nome: 'Extensão de Tríceps Unilateral', equipamento: 'cabo', dificuldade: 'iniciante' },
                { nome: 'Kickback', equipamento: 'halteres', dificuldade: 'iniciante' }
            ]
        },
        // QUADRÍCEPS
        quadriceps: {
            compostos: [
                { nome: 'Agachamento Livre', equipamento: 'barra', dificuldade: 'intermediario' },
                { nome: 'Agachamento no Smith', equipamento: 'maquina', dificuldade: 'iniciante' },
                { nome: 'Leg Press 45°', equipamento: 'maquina', dificuldade: 'iniciante' },
                { nome: 'Agachamento Frontal', equipamento: 'barra', dificuldade: 'avancado' },
                { nome: 'Agachamento Hack', equipamento: 'maquina', dificuldade: 'intermediario' },
                { nome: 'Avanço (Lunge)', equipamento: 'halteres', dificuldade: 'iniciante' }
            ],
            isolados: [
                { nome: 'Cadeira Extensora', equipamento: 'maquina', dificuldade: 'iniciante' },
                { nome: 'Agachamento Búlgaro', equipamento: 'halteres', dificuldade: 'intermediario' },
                { nome: 'Passada', equipamento: 'halteres', dificuldade: 'iniciante' }
            ]
        },
        // POSTERIOR DE COXA
        posterior: {
            compostos: [
                { nome: 'Levantamento Terra Romeno', equipamento: 'barra', dificuldade: 'intermediario' },
                { nome: 'Stiff', equipamento: 'barra', dificuldade: 'intermediario' },
                { nome: 'Good Morning', equipamento: 'barra', dificuldade: 'avancado' }
            ],
            isolados: [
                { nome: 'Mesa Flexora', equipamento: 'maquina', dificuldade: 'iniciante' },
                { nome: 'Cadeira Flexora', equipamento: 'maquina', dificuldade: 'iniciante' },
                { nome: 'Flexão Nórdica', equipamento: 'corpo', dificuldade: 'avancado' }
            ]
        },
        // GLÚTEOS
        gluteos: {
            compostos: [
                { nome: 'Hip Thrust', equipamento: 'barra', dificuldade: 'intermediario' },
                { nome: 'Agachamento Sumô', equipamento: 'barra', dificuldade: 'intermediario' }
            ],
            isolados: [
                { nome: 'Elevação Pélvica', equipamento: 'corpo', dificuldade: 'iniciante' },
                { nome: 'Abdução de Quadril na Máquina', equipamento: 'maquina', dificuldade: 'iniciante' },
                { nome: 'Coice na Polia (Glúteo)', equipamento: 'cabo', dificuldade: 'intermediario' },
                { nome: 'Abdução com Elástico', equipamento: 'elastico', dificuldade: 'iniciante' }
            ]
        },
        // PANTURRILHA
        panturrilha: {
            isolados: [
                { nome: 'Panturrilha em Pé (Máquina)', equipamento: 'maquina', dificuldade: 'iniciante' },
                { nome: 'Panturrilha Sentado', equipamento: 'maquina', dificuldade: 'iniciante' },
                { nome: 'Panturrilha no Leg Press', equipamento: 'maquina', dificuldade: 'iniciante' },
                { nome: 'Panturrilha Unilateral', equipamento: 'corpo', dificuldade: 'intermediario' }
            ]
        },
        // CORE/ABDÔMEN
        core: {
            isolados: [
                { nome: 'Prancha Frontal', equipamento: 'corpo', dificuldade: 'iniciante' },
                { nome: 'Prancha Lateral', equipamento: 'corpo', dificuldade: 'intermediario' },
                { nome: 'Abdominal Crunch', equipamento: 'corpo', dificuldade: 'iniciante' },
                { nome: 'Abdominal Infra', equipamento: 'corpo', dificuldade: 'iniciante' },
                { nome: 'Elevação de Pernas (Barra)', equipamento: 'barra', dificuldade: 'intermediario' },
                { nome: 'Abdominal na Polia (Crunch)', equipamento: 'cabo', dificuldade: 'intermediario' },
                { nome: 'Russian Twist', equipamento: 'corpo', dificuldade: 'intermediario' },
                { nome: 'Dead Bug', equipamento: 'corpo', dificuldade: 'iniciante' },
                { nome: 'Mountain Climbers', equipamento: 'corpo', dificuldade: 'iniciante' }
            ]
        }
    },

    // Esquemas de repetição por objetivo (baseado em pesquisa)
    repSchemes: {
        hipertrofia: { 
            reps: '8-12', 
            rest: '60-90s', 
            sets: { iniciante: 3, intermediario: 4, avancado: 4 },
            rpe: '7-8'
        },
        forca: { 
            reps: '3-6', 
            rest: '180-300s', 
            sets: { iniciante: 3, intermediario: 4, avancado: 5 },
            rpe: '8-9'
        },
        emagrecimento: { 
            reps: '12-15', 
            rest: '30-60s', 
            sets: { iniciante: 2, intermediario: 3, avancado: 3 },
            rpe: '6-7'
        },
        condicionamento: { 
            reps: '15-20', 
            rest: '30-45s', 
            sets: { iniciante: 2, intermediario: 3, avancado: 3 },
            rpe: '6-7'
        },
        resistencia: { 
            reps: '15-25', 
            rest: '20-30s', 
            sets: { iniciante: 2, intermediario: 3, avancado: 4 },
            rpe: '5-6'
        }
    },

    // Divisões de treino
    splits: {
        1: [{ key: 'full', label: 'Full Body', grupos: 'Corpo Completo' }],
        2: [
            { key: 'upper', label: 'Superior', grupos: 'Peito • Costas • Ombros • Braços' },
            { key: 'lower', label: 'Inferior', grupos: 'Quadríceps • Posterior • Glúteos • Panturrilha' }
        ],
        3: [
            { key: 'push', label: 'Push', grupos: 'Peito • Ombros • Tríceps' },
            { key: 'pull', label: 'Pull', grupos: 'Costas • Bíceps • Posterior' },
            { key: 'legs', label: 'Legs', grupos: 'Quadríceps • Glúteos • Panturrilha' }
        ],
        4: [
            { key: 'upperA', label: 'Superior A', grupos: 'Peito • Costas (Força)' },
            { key: 'lowerA', label: 'Inferior A', grupos: 'Quadríceps • Posterior (Força)' },
            { key: 'upperB', label: 'Superior B', grupos: 'Ombros • Braços (Volume)' },
            { key: 'lowerB', label: 'Inferior B', grupos: 'Glúteos • Panturrilha (Volume)' }
        ],
        5: [
            { key: 'peito', label: 'Peito', grupos: 'Peito • Tríceps' },
            { key: 'costas', label: 'Costas', grupos: 'Costas • Bíceps' },
            { key: 'ombros', label: 'Ombros', grupos: 'Ombros • Trapézio' },
            { key: 'legs', label: 'Pernas', grupos: 'Quadríceps • Posterior' },
            { key: 'arms', label: 'Braços', grupos: 'Bíceps • Tríceps • Antebraço' }
        ],
        6: [
            { key: 'push1', label: 'Push A', grupos: 'Peito • Ombros • Tríceps (Força)' },
            { key: 'pull1', label: 'Pull A', grupos: 'Costas • Bíceps (Força)' },
            { key: 'legs1', label: 'Legs A', grupos: 'Quadríceps • Posterior (Força)' },
            { key: 'push2', label: 'Push B', grupos: 'Peito • Ombros • Tríceps (Volume)' },
            { key: 'pull2', label: 'Pull B', grupos: 'Costas • Bíceps (Volume)' },
            { key: 'legs2', label: 'Legs B', grupos: 'Glúteos • Panturrilha (Volume)' }
        ]
    },

    pickExercises(grupo, tipo, count, nivel) {
        const pool = this.exerciseDatabase[grupo]?.[tipo] || [];
        const filtered = pool.filter(ex => {
            if (nivel === 'iniciante') return ex.dificuldade !== 'avancado';
            return true;
        });
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count).map(ex => ex.nome);
    },

    buildDayExercises(focusKey, objetivo, nivel) {
        const scheme = this.repSchemes[objetivo] || this.repSchemes.hipertrofia;
        const sets = scheme.sets[nivel] || 3;
        const reps = scheme.reps;
        const rest = scheme.rest;

        const makeExercise = (nome) => ({ nome, series: sets, repeticoes: reps, descanso: rest });

        let exercises = [];

        switch (focusKey) {
            case 'full':
                exercises = [
                    ...this.pickExercises('quadriceps', 'compostos', 1, nivel),
                    ...this.pickExercises('peito', 'compostos', 1, nivel),
                    ...this.pickExercises('costas', 'compostos', 1, nivel),
                    ...this.pickExercises('ombros', 'compostos', 1, nivel),
                    ...this.pickExercises('posterior', 'compostos', 1, nivel),
                    ...this.pickExercises('core', 'isolados', 1, nivel)
                ];
                break;
            case 'upper':
            case 'upperA':
                exercises = [
                    ...this.pickExercises('peito', 'compostos', 2, nivel),
                    ...this.pickExercises('costas', 'compostos', 2, nivel),
                    ...this.pickExercises('ombros', 'compostos', 1, nivel),
                    ...this.pickExercises('biceps', 'isolados', 1, nivel),
                    ...this.pickExercises('triceps', 'isolados', 1, nivel)
                ];
                break;
            case 'upperB':
                exercises = [
                    ...this.pickExercises('ombros', 'compostos', 2, nivel),
                    ...this.pickExercises('peito', 'isolados', 1, nivel),
                    ...this.pickExercises('costas', 'isolados', 1, nivel),
                    ...this.pickExercises('biceps', 'isolados', 2, nivel),
                    ...this.pickExercises('triceps', 'isolados', 2, nivel)
                ];
                break;
            case 'lower':
            case 'lowerA':
                exercises = [
                    ...this.pickExercises('quadriceps', 'compostos', 2, nivel),
                    ...this.pickExercises('posterior', 'compostos', 1, nivel),
                    ...this.pickExercises('quadriceps', 'isolados', 1, nivel),
                    ...this.pickExercises('posterior', 'isolados', 1, nivel),
                    ...this.pickExercises('panturrilha', 'isolados', 1, nivel),
                    ...this.pickExercises('core', 'isolados', 1, nivel)
                ];
                break;
            case 'lowerB':
                exercises = [
                    ...this.pickExercises('gluteos', 'compostos', 2, nivel),
                    ...this.pickExercises('posterior', 'isolados', 1, nivel),
                    ...this.pickExercises('quadriceps', 'isolados', 1, nivel),
                    ...this.pickExercises('gluteos', 'isolados', 1, nivel),
                    ...this.pickExercises('panturrilha', 'isolados', 2, nivel)
                ];
                break;
            case 'push':
            case 'push1':
            case 'push2':
                exercises = [
                    ...this.pickExercises('peito', 'compostos', 2, nivel),
                    ...this.pickExercises('ombros', 'compostos', 1, nivel),
                    ...this.pickExercises('peito', 'isolados', 1, nivel),
                    ...this.pickExercises('ombros', 'isolados', 1, nivel),
                    ...this.pickExercises('triceps', 'isolados', 2, nivel)
                ];
                break;
            case 'pull':
            case 'pull1':
            case 'pull2':
                exercises = [
                    ...this.pickExercises('costas', 'compostos', 2, nivel),
                    ...this.pickExercises('costas', 'isolados', 2, nivel),
                    ...this.pickExercises('biceps', 'isolados', 2, nivel),
                    ...this.pickExercises('ombros', 'isolados', 1, nivel)
                ];
                break;
            case 'legs':
            case 'legs1':
            case 'legs2':
                exercises = [
                    ...this.pickExercises('quadriceps', 'compostos', 2, nivel),
                    ...this.pickExercises('posterior', 'compostos', 1, nivel),
                    ...this.pickExercises('gluteos', 'compostos', 1, nivel),
                    ...this.pickExercises('quadriceps', 'isolados', 1, nivel),
                    ...this.pickExercises('panturrilha', 'isolados', 1, nivel),
                    ...this.pickExercises('core', 'isolados', 1, nivel)
                ];
                break;
            case 'peito':
                exercises = [
                    ...this.pickExercises('peito', 'compostos', 3, nivel),
                    ...this.pickExercises('peito', 'isolados', 2, nivel),
                    ...this.pickExercises('triceps', 'isolados', 2, nivel)
                ];
                break;
            case 'costas':
                exercises = [
                    ...this.pickExercises('costas', 'compostos', 3, nivel),
                    ...this.pickExercises('costas', 'isolados', 2, nivel),
                    ...this.pickExercises('biceps', 'isolados', 2, nivel)
                ];
                break;
            case 'ombros':
                exercises = [
                    ...this.pickExercises('ombros', 'compostos', 2, nivel),
                    ...this.pickExercises('ombros', 'isolados', 3, nivel),
                    ...this.pickExercises('triceps', 'isolados', 1, nivel)
                ];
                break;
            case 'arms':
                exercises = [
                    ...this.pickExercises('biceps', 'compostos', 1, nivel),
                    ...this.pickExercises('biceps', 'isolados', 3, nivel),
                    ...this.pickExercises('triceps', 'compostos', 1, nivel),
                    ...this.pickExercises('triceps', 'isolados', 2, nivel)
                ];
                break;
            default:
                exercises = this.pickExercises('peito', 'compostos', 5, nivel);
        }

        return exercises.map(makeExercise);
    },

    generatePlan({ objetivo = 'hipertrofia', dias = 4, nivel = 'iniciante' }) {
        const split = this.splits[dias] || this.splits[4];
        const divisaoLabel = dias <= 2 ? 'AB' : dias <= 3 ? 'ABC' : dias <= 4 ? 'ABCD' : dias <= 5 ? 'Bro Split' : 'PPL';

        const diasTreino = split.map((s, idx) => ({
            nome: `Treino ${String.fromCharCode(65 + idx)} - ${s.label}`,
            grupos: s.grupos,
            exercicios: this.buildDayExercises(s.key, objetivo, nivel)
        }));

        return {
            nome: `Plano ${objetivo.charAt(0).toUpperCase() + objetivo.slice(1)} (${dias}x/sem)`,
            descricao: `${nivel} • ${divisaoLabel}`,
            divisao: divisaoLabel,
            dias: diasTreino,
            duracao: dias <= 3 ? 45 : 60
        };
    }
};

// =====================================================
// WORKOUT TEMPLATES - Fichas de Treino Profissionais
// Baseado em: Jeff Nippard, Renaissance Periodization, NSCA
// =====================================================
const WorkoutTemplates = {
    templates: [
        // === INICIANTE ===
        {
            id: 'beginner_full_body_3x',
            name: 'Full Body Iniciante',
            subtitle: 'Iniciante • 3x/semana',
            description: 'Programa perfeito para quem está começando. Trabalha todo o corpo em cada sessão, construindo base sólida de força e técnica. Ideal para os primeiros 3-6 meses de treino.',
            level: 'iniciante',
            days: 3,
            duration: '45-55',
            icon: '🌱',
            category: 'full_body',
            objetivos: ['hipertrofia', 'condicionamento'],
            benefits: ['Aprenda os movimentos', 'Adaptação neural', 'Recuperação adequada'],
            featured: true
        },
        {
            id: 'beginner_upper_lower_4x',
            name: 'Upper/Lower Básico',
            subtitle: 'Iniciante • 4x/semana',
            description: 'Divisão simples alternando superior e inferior. Permite maior volume por grupo muscular mantendo boa recuperação. Transição natural após Full Body.',
            level: 'iniciante',
            days: 4,
            duration: '50-60',
            icon: '📊',
            category: 'upper_lower',
            objetivos: ['hipertrofia', 'forca'],
            benefits: ['Mais volume', 'Boa recuperação', 'Progressão fácil']
        },
        // === INTERMEDIÁRIO ===
        {
            id: 'ppl_classic_6x',
            name: 'Push/Pull/Legs Clássico',
            subtitle: 'Intermediário • 6x/semana',
            description: 'A divisão mais popular do mundo! Empurrar, puxar e pernas com frequência 2x por semana. Alto volume e ótima progressão para ganho de massa.',
            level: 'intermediario',
            days: 6,
            duration: '60-75',
            icon: '💪',
            category: 'ppl',
            objetivos: ['hipertrofia'],
            benefits: ['Frequência 2x', 'Alto volume', 'Máximo ganho'],
            featured: true
        },
        {
            id: 'upper_lower_4x',
            name: 'Upper/Lower Intermediário',
            subtitle: 'Intermediário • 4x/semana',
            description: 'Versão avançada do Upper/Lower com periodização de força e hipertrofia. Dias A focam em força, dias B em volume.',
            level: 'intermediario',
            days: 4,
            duration: '55-70',
            icon: '⚡',
            category: 'upper_lower',
            objetivos: ['hipertrofia', 'forca'],
            benefits: ['Periodização', 'Força + Volume', 'Flexível']
        },
        {
            id: 'ppl_5x',
            name: 'PPL Compacto',
            subtitle: 'Intermediário • 5x/semana',
            description: 'Push/Pull/Legs para quem tem 5 dias. Alterna intensidade alta e volume, com um dia extra de braços ou fraquezas.',
            level: 'intermediario',
            days: 5,
            duration: '55-65',
            icon: '🎯',
            category: 'ppl',
            objetivos: ['hipertrofia'],
            benefits: ['5 dias práticos', 'Foco em fraquezas', 'Balanceado']
        },
        {
            id: 'strength_531',
            name: 'Força 5/3/1 Wendler',
            subtitle: 'Intermediário • 4x/semana',
            description: 'Baseado no programa 5/3/1 de Jim Wendler. Foco nos 4 grandes levantamentos: Agachamento, Terra, Supino e Desenvolvimento. Progressão mensal garantida.',
            level: 'intermediario',
            days: 4,
            duration: '60-75',
            icon: '🏋️',
            category: 'strength',
            objetivos: ['forca'],
            benefits: ['Força máxima', 'Progressão lenta', 'Compostos']
        },
        {
            id: 'hypertrophy_high_freq',
            name: 'Alta Frequência',
            subtitle: 'Intermediário • 6x/semana',
            description: 'Cada grupo muscular 3x por semana! Baseado em pesquisas de Brad Schoenfeld. Volume distribuído para máxima síntese proteica.',
            level: 'intermediario',
            days: 6,
            duration: '45-55',
            icon: '📈',
            category: 'hypertrophy',
            objetivos: ['hipertrofia'],
            benefits: ['Frequência 3x', 'Síntese máxima', 'Menos fadiga']
        },
        // === AVANÇADO ===
        {
            id: 'bro_split_5x',
            name: 'Bro Split Clássico',
            subtitle: 'Avançado • 5x/semana',
            description: 'Um grupo por dia - a divisão dos fisiculturistas. Máximo volume e pump em cada sessão. Requer boa capacidade de recuperação.',
            level: 'avancado',
            days: 5,
            duration: '70-90',
            icon: '🔥',
            category: 'bro_split',
            objetivos: ['hipertrofia'],
            benefits: ['Volume máximo', 'Pump intenso', 'Foco total'],
            featured: true
        },
        {
            id: 'powerbuilding_4x',
            name: 'Powerbuilding',
            subtitle: 'Avançado • 4x/semana',
            description: 'O melhor dos dois mundos: força de powerlifter + estética de bodybuilder. Começa com composto pesado, finaliza com isolados.',
            level: 'avancado',
            days: 4,
            duration: '75-90',
            icon: '⚔️',
            category: 'powerbuilding',
            objetivos: ['forca', 'hipertrofia'],
            benefits: ['Força + Estética', 'PRs constantes', 'Completo']
        },
        {
            id: 'arnold_split_6x',
            name: 'Arnold Split',
            subtitle: 'Avançado • 6x/semana',
            description: 'A divisão usada por Arnold Schwarzenegger. Peito/Costas, Ombros/Braços, Pernas. Volume insano e pump lendário.',
            level: 'avancado',
            days: 6,
            duration: '75-90',
            icon: '🏆',
            category: 'arnold',
            objetivos: ['hipertrofia'],
            benefits: ['Clássico', 'Alto volume', 'Antagonistas']
        },
        // === EMAGRECIMENTO ===
        {
            id: 'fat_loss_circuit_4x',
            name: 'Circuito Queima Total',
            subtitle: 'Todos os níveis • 4x/semana',
            description: 'Circuito metabólico com pouco descanso. Combina musculação com cardio para máxima queima calórica. Perfeito para cutting.',
            level: 'intermediario',
            days: 4,
            duration: '40-50',
            icon: '🔥',
            category: 'circuit',
            objetivos: ['emagrecimento'],
            benefits: ['Alta queima', 'EPOC', 'Tempo eficiente'],
            featured: true
        },
        {
            id: 'hiit_strength_3x',
            name: 'HIIT + Força',
            subtitle: 'Intermediário • 3x/semana',
            description: 'Combina treino de força com finalizadores HIIT. Mantém massa muscular enquanto maximiza a queima de gordura.',
            level: 'intermediario',
            days: 3,
            duration: '45-55',
            icon: '⚡',
            category: 'hiit',
            objetivos: ['emagrecimento', 'condicionamento'],
            benefits: ['Preserva músculo', 'Cardio integrado', 'Eficiente']
        },
        {
            id: 'metabolic_6x',
            name: 'Metabólico Intenso',
            subtitle: 'Avançado • 6x/semana',
            description: 'Programa de cutting agressivo. Supersets, drop sets e giant sets para manter intensidade alta em déficit calórico.',
            level: 'avancado',
            days: 6,
            duration: '50-60',
            icon: '💀',
            category: 'metabolic',
            objetivos: ['emagrecimento'],
            benefits: ['Cutting agressivo', 'Manutenção muscular', 'Definição']
        },
        // === CONDICIONAMENTO ===
        {
            id: 'functional_4x',
            name: 'Funcional Atlético',
            subtitle: 'Intermediário • 4x/semana',
            description: 'Treino funcional inspirado em atletas de CrossFit. Melhora força, resistência, coordenação e mobilidade.',
            level: 'intermediario',
            days: 4,
            duration: '45-55',
            icon: '🏃',
            category: 'functional',
            objetivos: ['condicionamento', 'forca'],
            benefits: ['Funcionalidade', 'Cardio + Força', 'Atletismo']
        },
        {
            id: 'sports_performance_4x',
            name: 'Performance Esportiva',
            subtitle: 'Intermediário • 4x/semana',
            description: 'Foco em explosão, agilidade e potência. Ideal para praticantes de esportes coletivos como futebol, basquete, vôlei.',
            level: 'intermediario',
            days: 4,
            duration: '50-60',
            icon: '⚽',
            category: 'athletic',
            objetivos: ['condicionamento'],
            benefits: ['Explosão', 'Agilidade', 'Prevenção lesões']
        },
        // === DESAFIOS ESPECIAIS ===
        {
            id: 'challenge_30_days',
            name: 'Desafio 30 Dias',
            subtitle: 'Intermediário • 5x/semana',
            description: 'Programa intensivo de 30 dias! Volume progressivo que aumenta a cada semana. Termine transformado.',
            level: 'intermediario',
            days: 5,
            duration: '55-65',
            icon: '🎯',
            category: 'challenge',
            objetivos: ['hipertrofia', 'condicionamento'],
            benefits: ['Transformação rápida', 'Motivação', 'Disciplina'],
            featured: true
        },
        {
            id: 'beach_body_8_weeks',
            name: 'Projeto Verão 8 Semanas',
            subtitle: 'Intermediário • 5x/semana',
            description: 'Programa completo de 8 semanas para chegar no shape perfeito para o verão. Combina hipertrofia nas primeiras semanas e cutting nas finais.',
            level: 'intermediario',
            days: 5,
            duration: '60-70',
            icon: '🏖️',
            category: 'transformation',
            objetivos: ['hipertrofia', 'emagrecimento'],
            benefits: ['Shape de verão', '8 semanas', 'Completo']
        },
        {
            id: 'strength_challenge_12_weeks',
            name: 'Desafio de Força 12 Semanas',
            subtitle: 'Intermediário • 4x/semana',
            description: 'Foque em aumentar seus PRs em 12 semanas. Periodização linear com testes no final. Acompanhe sua evolução.',
            level: 'intermediario',
            days: 4,
            duration: '60-75',
            icon: '💪',
            category: 'strength',
            objetivos: ['forca'],
            benefits: ['Aumento de PRs', 'Periodização', 'Mensurável']
        },
        // === CASA/SEM EQUIPAMENTO ===
        {
            id: 'home_bodyweight_4x',
            name: 'Treino em Casa',
            subtitle: 'Iniciante • 4x/semana',
            description: 'Treino completo usando apenas peso corporal. Perfeito para treinar em casa sem equipamentos. Inclui progressões.',
            level: 'iniciante',
            days: 4,
            duration: '35-45',
            icon: '🏠',
            category: 'home',
            objetivos: ['condicionamento', 'hipertrofia'],
            benefits: ['Sem equipamento', 'Qualquer lugar', 'Progressivo']
        },
        {
            id: 'home_dumbbells_4x',
            name: 'Casa com Halteres',
            subtitle: 'Intermediário • 4x/semana',
            description: 'Treino efetivo usando apenas um par de halteres ajustáveis. Maximiza o ganho muscular em casa.',
            level: 'intermediario',
            days: 4,
            duration: '45-55',
            icon: '🏋️',
            category: 'home',
            objetivos: ['hipertrofia'],
            benefits: ['Só halteres', 'Efetivo', 'Prático']
        },
        // === FEMININO FOCADO ===
        {
            id: 'glute_focus_4x',
            name: 'Glúteos de Aço',
            subtitle: 'Intermediário • 4x/semana',
            description: 'Programa focado em desenvolvimento de glúteos. 2 dias de perna com ênfase em posterior e glúteos. Baseado em Bret Contreras.',
            level: 'intermediario',
            days: 4,
            duration: '55-65',
            icon: '🍑',
            category: 'glute_focus',
            objetivos: ['hipertrofia'],
            benefits: ['Foco glúteos', 'Científico', 'Resultados visíveis']
        },
        {
            id: 'toned_body_5x',
            name: 'Corpo Definido',
            subtitle: 'Intermediário • 5x/semana',
            description: 'Programa para corpo tonificado e definido. Combina resistência com trabalho cardiovascular integrado.',
            level: 'intermediario',
            days: 5,
            duration: '50-60',
            icon: '✨',
            category: 'toning',
            objetivos: ['emagrecimento', 'hipertrofia'],
            benefits: ['Definição', 'Tonificação', 'Cardio incluso']
        },
        // === MAROMBA - ERA DE OURO DO BODYBUILDING ===
        {
            id: 'arnold_golden_6x',
            name: 'Arnold Golden Era',
            subtitle: 'Avançado • 6x/semana',
            description: 'O lendário treino usado por Arnold Schwarzenegger nos anos 70. Peito/Costas, Ombros/Braços, Pernas com volume brutal. O treino que construiu o maior fisiculturista de todos os tempos.',
            level: 'avancado',
            days: 6,
            duration: '90-120',
            icon: '🏆',
            category: 'golden_era',
            objetivos: ['maromba', 'hipertrofia'],
            benefits: ['Volume extremo', 'Pump lendário', 'Clássico'],
            featured: true,
            workout: {
                dias: [
                    { nome: 'Dia 1 - Peito/Costas', grupos: 'Peito, Costas', exercicios: [
                        { nome: 'Supino Reto com Barra', series: 5, repeticoes: '6-10', descanso: '90s' },
                        { nome: 'Supino Inclinado com Barra', series: 5, repeticoes: '6-10', descanso: '90s' },
                        { nome: 'Crucifixo com Halteres', series: 5, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Mergulho', series: 5, repeticoes: '10-15', descanso: '60s' },
                        { nome: 'Barra Fixa', series: 5, repeticoes: '8-12', descanso: '90s' },
                        { nome: 'Remada Curvada com Barra', series: 5, repeticoes: '6-10', descanso: '90s' },
                        { nome: 'Remada T-Bar', series: 5, repeticoes: '6-10', descanso: '90s' },
                        { nome: 'Puxada Frontal', series: 4, repeticoes: '10-12', descanso: '60s' }
                    ]},
                    { nome: 'Dia 2 - Ombros/Braços', grupos: 'Ombros, Bíceps, Tríceps', exercicios: [
                        { nome: 'Desenvolvimento com Barra (Atrás)', series: 5, repeticoes: '6-10', descanso: '90s' },
                        { nome: 'Elevação Lateral', series: 5, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Elevação Frontal com Barra', series: 4, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Rosca Direta com Barra', series: 5, repeticoes: '6-10', descanso: '60s' },
                        { nome: 'Rosca Alternada', series: 5, repeticoes: '6-10', descanso: '60s' },
                        { nome: 'Rosca Concentrada', series: 5, repeticoes: '8-10', descanso: '45s' },
                        { nome: 'Tríceps Mergulho', series: 5, repeticoes: '8-12', descanso: '60s' },
                        { nome: 'Tríceps Testa (Barra EZ)', series: 5, repeticoes: '8-10', descanso: '60s' }
                    ]},
                    { nome: 'Dia 3 - Pernas', grupos: 'Quadríceps, Posterior, Panturrilha', exercicios: [
                        { nome: 'Agachamento Livre', series: 5, repeticoes: '6-10', descanso: '120s' },
                        { nome: 'Leg Press', series: 5, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Cadeira Extensora', series: 5, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Mesa Flexora', series: 5, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Stiff', series: 5, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Panturrilha em Pé', series: 5, repeticoes: '15-20', descanso: '45s' },
                        { nome: 'Panturrilha Sentado', series: 5, repeticoes: '15-20', descanso: '45s' }
                    ]},
                    { nome: 'Dia 4 - Peito/Costas', grupos: 'Peito, Costas', exercicios: [
                        { nome: 'Supino Inclinado com Halteres', series: 5, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Crossover (Cabo)', series: 5, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Pullover com Halter', series: 5, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Puxada Frontal Pegada Aberta', series: 5, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Remada Baixa (Cabo)', series: 5, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Remada Unilateral', series: 4, repeticoes: '10-12', descanso: '60s' }
                    ]},
                    { nome: 'Dia 5 - Ombros/Braços', grupos: 'Ombros, Bíceps, Tríceps', exercicios: [
                        { nome: 'Desenvolvimento com Halteres', series: 5, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Elevação Lateral Inclinado', series: 5, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Crucifixo Inverso', series: 4, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Rosca Scott', series: 5, repeticoes: '8-10', descanso: '60s' },
                        { nome: 'Rosca Martelo', series: 4, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Tríceps Pulley', series: 5, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Tríceps Francês (Halter)', series: 4, repeticoes: '10-12', descanso: '60s' }
                    ]},
                    { nome: 'Dia 6 - Pernas', grupos: 'Quadríceps, Posterior, Panturrilha', exercicios: [
                        { nome: 'Agachamento Frontal', series: 5, repeticoes: '8-10', descanso: '120s' },
                        { nome: 'Agachamento Hack', series: 5, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Passada (Lunges)', series: 4, repeticoes: '12 cada', descanso: '60s' },
                        { nome: 'Cadeira Flexora', series: 5, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Panturrilha Burro', series: 5, repeticoes: '15-20', descanso: '45s' },
                        { nome: 'Abdominal', series: 5, repeticoes: '25', descanso: '30s' }
                    ]}
                ]
            }
        },
        {
            id: 'reg_park_5x5',
            name: 'Reg Park 5x5',
            subtitle: 'Intermediário • 3x/semana',
            description: 'O treino do mentor de Arnold! Reg Park foi o pioneiro do 5x5. Foco em compostos pesados: Agachamento, Supino, Remada, Desenvolvimento. Base de força bruta.',
            level: 'intermediario',
            days: 3,
            duration: '60-75',
            icon: '👑',
            category: 'golden_era',
            objetivos: ['maromba', 'forca'],
            benefits: ['Força bruta', 'Compostos', 'Old School'],
            workout: {
                dias: [
                    { nome: 'Treino A - Força Superior', grupos: 'Peito, Ombros, Tríceps', exercicios: [
                        { nome: 'Supino Reto com Barra', series: 5, repeticoes: '5', descanso: '180s', nota: '5x5 - Aumentar peso a cada semana' },
                        { nome: 'Desenvolvimento com Barra', series: 5, repeticoes: '5', descanso: '180s' },
                        { nome: 'Mergulho', series: 3, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Rosca Direta com Barra', series: 3, repeticoes: '8', descanso: '90s' }
                    ]},
                    { nome: 'Treino B - Força Inferior', grupos: 'Pernas, Costas', exercicios: [
                        { nome: 'Agachamento Livre', series: 5, repeticoes: '5', descanso: '180s', nota: '5x5 - Aumentar peso a cada semana' },
                        { nome: 'Levantamento Terra', series: 5, repeticoes: '5', descanso: '180s' },
                        { nome: 'Remada Curvada com Barra', series: 5, repeticoes: '5', descanso: '120s' },
                        { nome: 'Panturrilha em Pé', series: 3, repeticoes: '15', descanso: '60s' }
                    ]},
                    { nome: 'Treino C - Full Body', grupos: 'Corpo Completo', exercicios: [
                        { nome: 'Agachamento Livre', series: 5, repeticoes: '5', descanso: '180s' },
                        { nome: 'Supino Reto com Barra', series: 5, repeticoes: '5', descanso: '180s' },
                        { nome: 'Remada Curvada com Barra', series: 5, repeticoes: '5', descanso: '120s' },
                        { nome: 'Desenvolvimento com Barra', series: 3, repeticoes: '8', descanso: '90s' },
                        { nome: 'Rosca Direta', series: 3, repeticoes: '8', descanso: '60s' }
                    ]}
                ]
            }
        },
        {
            id: 'franco_columbu_6x',
            name: 'Franco Columbu Power',
            subtitle: 'Avançado • 6x/semana',
            description: 'Treino do parceiro de Arnold e campeão Mr. Olympia 1976/81. Combina força extrema de powerlifter com volume de bodybuilder. Franco levantava 700lbs no terra!',
            level: 'avancado',
            days: 6,
            duration: '75-90',
            icon: '🦁',
            category: 'golden_era',
            objetivos: ['maromba', 'forca'],
            benefits: ['Força + Massa', 'Powerbuilding raiz', 'Intenso'],
            workout: {
                dias: [
                    { nome: 'Dia 1 - Peito/Tríceps (Força)', grupos: 'Peito, Tríceps', exercicios: [
                        { nome: 'Supino Reto com Barra', series: 6, repeticoes: '4-6', descanso: '180s', nota: 'Franco: 500lbs!' },
                        { nome: 'Supino Inclinado com Barra', series: 4, repeticoes: '6-8', descanso: '120s' },
                        { nome: 'Crucifixo com Halteres', series: 4, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Mergulho', series: 4, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Tríceps Pulley', series: 4, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Tríceps Testa', series: 3, repeticoes: '10-12', descanso: '60s' }
                    ]},
                    { nome: 'Dia 2 - Costas/Bíceps (Força)', grupos: 'Costas, Bíceps', exercicios: [
                        { nome: 'Levantamento Terra', series: 5, repeticoes: '3-5', descanso: '180s', nota: 'Franco: 700lbs!' },
                        { nome: 'Remada Curvada com Barra', series: 5, repeticoes: '5-6', descanso: '120s' },
                        { nome: 'Barra Fixa', series: 4, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Puxada Frontal', series: 4, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Rosca Direta com Barra', series: 4, repeticoes: '6-8', descanso: '90s' },
                        { nome: 'Rosca Concentrada', series: 3, repeticoes: '10-12', descanso: '60s' }
                    ]},
                    { nome: 'Dia 3 - Pernas (Força)', grupos: 'Quadríceps, Posterior', exercicios: [
                        { nome: 'Agachamento Livre', series: 6, repeticoes: '4-6', descanso: '180s', nota: 'Franco: 600lbs!' },
                        { nome: 'Agachamento Frontal', series: 4, repeticoes: '6-8', descanso: '120s' },
                        { nome: 'Leg Press', series: 4, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Mesa Flexora', series: 4, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Stiff', series: 4, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Panturrilha em Pé', series: 5, repeticoes: '15-20', descanso: '45s' }
                    ]},
                    { nome: 'Dia 4 - Ombros (Volume)', grupos: 'Ombros, Trapézio', exercicios: [
                        { nome: 'Desenvolvimento com Barra (Atrás)', series: 5, repeticoes: '6-8', descanso: '120s' },
                        { nome: 'Desenvolvimento com Halteres', series: 4, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Elevação Lateral', series: 4, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Elevação Frontal', series: 3, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Crucifixo Inverso', series: 4, repeticoes: '12', descanso: '60s' },
                        { nome: 'Encolhimento com Barra', series: 4, repeticoes: '10-12', descanso: '60s' }
                    ]},
                    { nome: 'Dia 5 - Peito/Costas (Volume)', grupos: 'Peito, Costas', exercicios: [
                        { nome: 'Supino Inclinado com Halteres', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Crossover (Cabo)', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Pullover', series: 4, repeticoes: '12', descanso: '60s' },
                        { nome: 'Puxada Frontal', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Remada Baixa', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Remada Unilateral', series: 3, repeticoes: '12', descanso: '60s' }
                    ]},
                    { nome: 'Dia 6 - Braços (Volume)', grupos: 'Bíceps, Tríceps', exercicios: [
                        { nome: 'Rosca Direta (Barra Reta)', series: 4, repeticoes: '8-10', descanso: '60s' },
                        { nome: 'Tríceps Francês', series: 4, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Rosca Alternada', series: 4, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Tríceps Pulley (Corda)', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Rosca Scott', series: 3, repeticoes: '12', descanso: '45s' },
                        { nome: 'Tríceps Coice', series: 3, repeticoes: '12', descanso: '45s' }
                    ]}
                ]
            }
        },
        {
            id: 'mike_mentzer_hit',
            name: 'Mike Mentzer HIT',
            subtitle: 'Avançado • 3x/semana',
            description: 'Heavy Duty - o oposto do volume! Mike Mentzer revolucionou com treinos curtos e intensos. 1-2 séries até a falha absoluta. Mr. Olympia 1979 (Heavy Weight).',
            level: 'avancado',
            days: 3,
            duration: '30-45',
            icon: '⚡',
            category: 'golden_era',
            objetivos: ['maromba', 'hipertrofia'],
            benefits: ['Alta intensidade', 'Baixo volume', 'Eficiente'],
            workout: {
                dias: [
                    { nome: 'Treino A - Peito/Costas/Ombros', grupos: 'Peito, Costas, Ombros', exercicios: [
                        { nome: 'Peck Deck ou Crucifixo Máquina', series: 1, repeticoes: '6-10', descanso: '120s', nota: 'ATÉ A FALHA - Pré-exaustão' },
                        { nome: 'Supino Inclinado', series: 1, repeticoes: '6-10', descanso: '120s', nota: 'ATÉ A FALHA' },
                        { nome: 'Pullover na Máquina', series: 1, repeticoes: '6-10', descanso: '120s', nota: 'ATÉ A FALHA - Pré-exaustão' },
                        { nome: 'Puxada Frontal', series: 1, repeticoes: '6-10', descanso: '120s', nota: 'ATÉ A FALHA' },
                        { nome: 'Elevação Lateral na Máquina', series: 1, repeticoes: '6-10', descanso: '120s', nota: 'ATÉ A FALHA - Pré-exaustão' },
                        { nome: 'Desenvolvimento na Máquina', series: 1, repeticoes: '6-10', descanso: '120s', nota: 'ATÉ A FALHA' }
                    ]},
                    { nome: 'Treino B - Pernas', grupos: 'Quadríceps, Posterior, Panturrilha', exercicios: [
                        { nome: 'Cadeira Extensora', series: 1, repeticoes: '10-15', descanso: '120s', nota: 'ATÉ A FALHA - Pré-exaustão' },
                        { nome: 'Leg Press ou Agachamento', series: 1, repeticoes: '10-15', descanso: '120s', nota: 'ATÉ A FALHA' },
                        { nome: 'Mesa Flexora', series: 2, repeticoes: '10-12', descanso: '90s', nota: 'ATÉ A FALHA' },
                        { nome: 'Panturrilha em Pé', series: 2, repeticoes: '12-15', descanso: '60s', nota: 'ATÉ A FALHA' }
                    ]},
                    { nome: 'Treino C - Braços', grupos: 'Bíceps, Tríceps', exercicios: [
                        { nome: 'Tríceps Pulley', series: 1, repeticoes: '6-10', descanso: '90s', nota: 'ATÉ A FALHA' },
                        { nome: 'Mergulho na Máquina', series: 1, repeticoes: '6-10', descanso: '90s', nota: 'ATÉ A FALHA' },
                        { nome: 'Rosca Scott na Máquina', series: 1, repeticoes: '6-10', descanso: '90s', nota: 'ATÉ A FALHA' },
                        { nome: 'Rosca Concentrada', series: 1, repeticoes: '6-10', descanso: '90s', nota: 'ATÉ A FALHA' }
                    ]}
                ]
            }
        },
        {
            id: 'tom_platz_legs',
            name: 'Tom Platz Leg Day',
            subtitle: 'Avançado • Especializado',
            description: 'O homem com as melhores pernas da história! Agachamento com 500lbs por 23 reps. Este treino de pernas é lendário e brutal. Não é para fracos.',
            level: 'avancado',
            days: 2,
            duration: '90-120',
            icon: '🦵',
            category: 'golden_era',
            objetivos: ['maromba', 'hipertrofia'],
            benefits: ['Pernas brutais', 'Alto volume', 'Lendário'],
            workout: {
                dias: [
                    { nome: 'Tom Platz Leg Day - Quadríceps', grupos: 'Quadríceps (Foco Total)', exercicios: [
                        { nome: 'Agachamento Livre', series: 8, repeticoes: '8-20', descanso: '120s', nota: 'Tom fazia 23 reps com 500lbs!' },
                        { nome: 'Agachamento Hack', series: 5, repeticoes: '10-15', descanso: '90s' },
                        { nome: 'Leg Press', series: 5, repeticoes: '15-20', descanso: '90s' },
                        { nome: 'Cadeira Extensora', series: 5, repeticoes: '15-20', descanso: '60s', nota: 'Contraia no topo!' },
                        { nome: 'Passada (Walking Lunges)', series: 4, repeticoes: '20 passos', descanso: '60s' },
                        { nome: 'Sissy Squat', series: 3, repeticoes: '15-20', descanso: '45s' }
                    ]},
                    { nome: 'Tom Platz Leg Day - Posterior', grupos: 'Posterior, Panturrilha', exercicios: [
                        { nome: 'Stiff (Romeno)', series: 5, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Mesa Flexora', series: 5, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Cadeira Flexora', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Panturrilha em Pé', series: 6, repeticoes: '15-20', descanso: '45s', nota: 'Tom: panturrilhas todos os dias!' },
                        { nome: 'Panturrilha Sentado', series: 5, repeticoes: '20-25', descanso: '45s' }
                    ]}
                ]
            }
        },
        {
            id: 'lou_ferrigno_mass',
            name: 'Lou Ferrigno Mass',
            subtitle: 'Avançado • 6x/semana',
            description: 'O treino do Hulk original! Lou tinha 1,96m e 130kg de massa. Volume pesado com foco em ganho de tamanho máximo. Rival de Arnold no Pumping Iron.',
            level: 'avancado',
            days: 6,
            duration: '75-90',
            icon: '💚',
            category: 'golden_era',
            objetivos: ['maromba', 'hipertrofia'],
            benefits: ['Massa máxima', 'Gigantismo', 'Heavy duty']
        },
        {
            id: 'double_split_classic',
            name: 'Double Split Clássico',
            subtitle: 'Avançado • 6x/semana (2x/dia)',
            description: 'Como os campeões treinavam nos anos 70-80: duas sessões por dia! Manhã para músculos grandes, tarde para menores. Usado por Arnold e todos os pros.',
            level: 'avancado',
            days: 6,
            duration: '45+45',
            icon: '🌅',
            category: 'golden_era',
            objetivos: ['maromba', 'hipertrofia'],
            benefits: ['2x por dia', 'Volume máximo', 'Pro level']
        },
        {
            id: 'gold_gym_venice_6x',
            name: "Gold's Gym Venice",
            subtitle: 'Avançado • 6x/semana',
            description: 'O treino da Meca do Bodybuilding! Baseado no que era feito na Gold\'s Gym Venice Beach nos anos 70. Onde Arnold, Franco, Zane e todos os grandes treinavam.',
            level: 'avancado',
            days: 6,
            duration: '90-120',
            icon: '🏛️',
            category: 'golden_era',
            objetivos: ['maromba', 'hipertrofia'],
            benefits: ['Meca do BB', 'Clássico', 'Completo'],
            featured: true
        },
        // === LENDAS DO MR. OLYMPIA - ERA MODERNA ===
        {
            id: 'mentzer_heavy_duty_revised',
            name: 'Mike Mentzer Heavy Duty Revisado',
            subtitle: 'Avançado • 3-4x/semana',
            description: 'A filosofia revolucionária de Mike Mentzer atualizada! High Intensity Training (HIT) no seu máximo: cada série até a falha muscular absoluta, com técnicas como rest-pause, negativas forçadas e static holds. Menos é mais - resultados máximos com volume mínimo.',
            level: 'avancado',
            days: 4,
            duration: '35-50',
            icon: '🧠',
            category: 'legends_olympia',
            objetivos: ['lendas', 'maromba', 'hipertrofia', 'forca'],
            benefits: ['Intensidade máxima', 'Recuperação otimizada', 'Treinos curtos'],
            featured: true,
            workout: {
                dias: [
                    { nome: 'Dia 1 - Peito/Costas', grupos: 'Peito, Costas (Antagonistas)', exercicios: [
                        { nome: 'Supino Inclinado com Halteres', series: 1, repeticoes: '6-10', descanso: '120s', nota: 'ATÉ A FALHA + Rest-Pause' },
                        { nome: 'Peck Deck (Crucifixo Máquina)', series: 1, repeticoes: '6-10', descanso: '120s', nota: 'ATÉ A FALHA' },
                        { nome: 'Puxada Frontal Pegada Supinada', series: 1, repeticoes: '6-10', descanso: '120s', nota: 'ATÉ A FALHA + Negativas' },
                        { nome: 'Remada na Máquina', series: 1, repeticoes: '6-10', descanso: '120s', nota: 'ATÉ A FALHA' },
                        { nome: 'Pullover na Máquina', series: 1, repeticoes: '8-12', descanso: '90s', nota: 'ATÉ A FALHA' },
                        { nome: 'Levantamento Terra', series: 1, repeticoes: '5-8', descanso: '180s', nota: 'ATÉ A FALHA' }
                    ]},
                    { nome: 'Dia 2 - Pernas', grupos: 'Quadríceps, Posterior, Panturrilha', exercicios: [
                        { nome: 'Leg Press', series: 1, repeticoes: '8-15', descanso: '180s', nota: 'ATÉ A FALHA + Rest-Pause' },
                        { nome: 'Cadeira Extensora', series: 1, repeticoes: '10-15', descanso: '120s', nota: 'ATÉ A FALHA + Negativas' },
                        { nome: 'Agachamento Hack', series: 1, repeticoes: '8-12', descanso: '120s', nota: 'ATÉ A FALHA' },
                        { nome: 'Stiff (Romeno)', series: 1, repeticoes: '8-12', descanso: '120s', nota: 'ATÉ A FALHA' },
                        { nome: 'Mesa Flexora', series: 1, repeticoes: '10-12', descanso: '90s', nota: 'ATÉ A FALHA' },
                        { nome: 'Panturrilha em Pé', series: 2, repeticoes: '12-15', descanso: '60s', nota: 'ATÉ A FALHA cada série' }
                    ]},
                    { nome: 'Dia 3 - Ombros/Braços', grupos: 'Ombros, Tríceps, Bíceps', exercicios: [
                        { nome: 'Desenvolvimento na Máquina', series: 1, repeticoes: '6-10', descanso: '120s', nota: 'ATÉ A FALHA + Rest-Pause' },
                        { nome: 'Elevação Lateral na Máquina', series: 1, repeticoes: '10-12', descanso: '90s', nota: 'ATÉ A FALHA' },
                        { nome: 'Crucifixo Inverso', series: 1, repeticoes: '10-12', descanso: '90s', nota: 'ATÉ A FALHA' },
                        { nome: 'Tríceps Mergulho (Graviton)', series: 1, repeticoes: '6-10', descanso: '90s', nota: 'ATÉ A FALHA + Negativas' },
                        { nome: 'Tríceps Pulley', series: 1, repeticoes: '8-12', descanso: '60s', nota: 'ATÉ A FALHA' },
                        { nome: 'Rosca Scott na Máquina', series: 1, repeticoes: '6-10', descanso: '90s', nota: 'ATÉ A FALHA + Negativas' },
                        { nome: 'Rosca Direta com Barra', series: 1, repeticoes: '8-10', descanso: '60s', nota: 'ATÉ A FALHA' }
                    ]},
                    { nome: 'Dia 4 - Descanso Ativo/Abdômen', grupos: 'Core, Recuperação', exercicios: [
                        { nome: 'Crunch na Máquina', series: 2, repeticoes: '15-20', descanso: '60s', nota: 'ATÉ A FALHA' },
                        { nome: 'Prancha', series: 2, repeticoes: '60s', descanso: '60s' },
                        { nome: 'Elevação de Pernas', series: 2, repeticoes: '15-20', descanso: '60s' }
                    ]}
                ]
            }
        },
        {
            id: 'mentzer_consolidation',
            name: 'Mentzer Consolidation Routine',
            subtitle: 'Avançado • 2x/semana',
            description: 'O programa mais extremo de Mentzer para atletas avançados que pararam de progredir. Apenas 2 treinos por semana, máximo 3-4 exercícios por sessão. Cada série é uma batalha contra seus limites.',
            level: 'avancado',
            days: 2,
            duration: '25-35',
            icon: '💎',
            category: 'legends_olympia',
            objetivos: ['lendas', 'maromba', 'forca'],
            benefits: ['Recuperação total', 'Supercompensação', 'Plateau breaker'],
            workout: {
                dias: [
                    { nome: 'Treino A - Upper + Legs', grupos: 'Peito, Costas, Pernas', exercicios: [
                        { nome: 'Supino na Máquina', series: 1, repeticoes: '6-10', descanso: '180s', nota: 'ATÉ FALHA ABSOLUTA' },
                        { nome: 'Puxada Frontal', series: 1, repeticoes: '6-10', descanso: '180s', nota: 'ATÉ FALHA ABSOLUTA' },
                        { nome: 'Agachamento ou Leg Press', series: 1, repeticoes: '10-15', descanso: '180s', nota: 'ATÉ FALHA ABSOLUTA' },
                        { nome: 'Stiff', series: 1, repeticoes: '8-12', descanso: '120s', nota: 'ATÉ FALHA ABSOLUTA' }
                    ]},
                    { nome: 'Treino B - Push/Pull/Arms', grupos: 'Ombros, Braços', exercicios: [
                        { nome: 'Desenvolvimento na Máquina', series: 1, repeticoes: '6-10', descanso: '180s', nota: 'ATÉ FALHA ABSOLUTA' },
                        { nome: 'Tríceps Mergulho', series: 1, repeticoes: '6-10', descanso: '120s', nota: 'ATÉ FALHA ABSOLUTA' },
                        { nome: 'Rosca Scott', series: 1, repeticoes: '6-10', descanso: '120s', nota: 'ATÉ FALHA ABSOLUTA' },
                        { nome: 'Panturrilha em Pé', series: 1, repeticoes: '12-15', descanso: '90s', nota: 'ATÉ FALHA ABSOLUTA' }
                    ]}
                ]
            }
        },
        {
            id: 'jay_cutler_classic',
            name: 'Jay Cutler 4x Mr. Olympia',
            subtitle: 'Avançado • 5x/semana',
            description: 'O treino do único homem a reconquistar o Mr. Olympia! Jay "The Comeback Kid" Cutler usava volume alto com periodização inteligente. Foco em construir massa densa e qualidade muscular incomparável.',
            level: 'avancado',
            days: 5,
            duration: '75-90',
            icon: '🏅',
            category: 'legends_olympia',
            objetivos: ['lendas', 'maromba', 'hipertrofia'],
            benefits: ['Massa densa', 'Simetria', 'Volume controlado'],
            featured: true,
            workout: {
                dias: [
                    { nome: 'Dia 1 - Peito', grupos: 'Peito (Completo)', exercicios: [
                        { nome: 'Supino Inclinado com Halteres', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Supino Reto na Máquina (Hammer)', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Crossover Alto (Cabo)', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Supino Declinado com Halteres', series: 3, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Peck Deck', series: 3, repeticoes: '12-15', descanso: '60s' }
                    ]},
                    { nome: 'Dia 2 - Costas', grupos: 'Costas (Largura + Espessura)', exercicios: [
                        { nome: 'Puxada Frontal Pegada Aberta', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Remada Curvada com Barra', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Remada na Máquina (Hammer)', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Puxada Triângulo', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Pullover com Halter', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Hiperextensão', series: 3, repeticoes: '15', descanso: '45s' }
                    ]},
                    { nome: 'Dia 3 - Ombros/Trapézio', grupos: 'Ombros, Trapézio', exercicios: [
                        { nome: 'Desenvolvimento com Halteres Sentado', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Elevação Lateral com Halteres', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Elevação Frontal (Cabo)', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Crucifixo Inverso na Máquina', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Encolhimento com Halteres', series: 4, repeticoes: '12-15', descanso: '60s' }
                    ]},
                    { nome: 'Dia 4 - Braços', grupos: 'Bíceps, Tríceps', exercicios: [
                        { nome: 'Rosca Direta com Barra EZ', series: 4, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Tríceps Pulley (Barra Reta)', series: 4, repeticoes: '12', descanso: '60s' },
                        { nome: 'Rosca Alternada com Halteres', series: 3, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Tríceps Testa com Barra EZ', series: 3, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Rosca Scott na Máquina', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Tríceps Mergulho', series: 3, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Rosca Martelo', series: 3, repeticoes: '12', descanso: '45s' }
                    ]},
                    { nome: 'Dia 5 - Pernas', grupos: 'Quadríceps, Posterior, Panturrilha', exercicios: [
                        { nome: 'Cadeira Extensora', series: 4, repeticoes: '15', descanso: '60s', nota: 'Aquecimento' },
                        { nome: 'Leg Press', series: 4, repeticoes: '12-15', descanso: '120s' },
                        { nome: 'Agachamento Hack', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Passada (Lunges)', series: 3, repeticoes: '12 cada', descanso: '60s' },
                        { nome: 'Stiff (Romeno)', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Mesa Flexora', series: 4, repeticoes: '12', descanso: '60s' },
                        { nome: 'Panturrilha no Leg Press', series: 5, repeticoes: '15-20', descanso: '45s' }
                    ]}
                ]
            }
        },
        {
            id: 'jay_cutler_offseason',
            name: 'Jay Cutler Offseason Mass',
            subtitle: 'Avançado • 6x/semana',
            description: 'O programa de offseason que levou Cutler a 290lbs! Foco em movimentos compostos pesados com volume progressivo. Cutler era famoso por seu ético de trabalho incansável.',
            level: 'avancado',
            days: 6,
            duration: '80-100',
            icon: '🦬',
            category: 'legends_olympia',
            objetivos: ['lendas', 'maromba', 'hipertrofia'],
            benefits: ['Ganho de massa', 'Compostos pesados', 'Volume alto'],
            workout: {
                dias: [
                    { nome: 'Dia 1 - Peito Pesado', grupos: 'Peito', exercicios: [
                        { nome: 'Supino Reto com Barra', series: 5, repeticoes: '8-12', descanso: '120s' },
                        { nome: 'Supino Inclinado com Halteres', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Supino Declinado na Máquina', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Crossover (Cabo)', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Mergulho', series: 3, repeticoes: '10-12', descanso: '60s' }
                    ]},
                    { nome: 'Dia 2 - Costas Pesada', grupos: 'Costas', exercicios: [
                        { nome: 'Levantamento Terra', series: 4, repeticoes: '6-10', descanso: '180s' },
                        { nome: 'Remada Curvada com Barra', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Puxada Frontal', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Remada T-Bar', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Remada Baixa (Cabo)', series: 3, repeticoes: '12', descanso: '60s' }
                    ]},
                    { nome: 'Dia 3 - Pernas Quadríceps', grupos: 'Quadríceps, Panturrilha', exercicios: [
                        { nome: 'Agachamento Livre', series: 5, repeticoes: '8-12', descanso: '180s' },
                        { nome: 'Leg Press', series: 4, repeticoes: '12-15', descanso: '120s' },
                        { nome: 'Agachamento Hack', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Cadeira Extensora', series: 4, repeticoes: '15', descanso: '60s' },
                        { nome: 'Panturrilha em Pé', series: 5, repeticoes: '15-20', descanso: '45s' }
                    ]},
                    { nome: 'Dia 4 - Ombros/Trapézio', grupos: 'Ombros, Trapézio', exercicios: [
                        { nome: 'Desenvolvimento com Barra', series: 4, repeticoes: '8-12', descanso: '120s' },
                        { nome: 'Desenvolvimento com Halteres', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Elevação Lateral', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Elevação Frontal', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Crucifixo Inverso', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Encolhimento com Barra', series: 4, repeticoes: '12-15', descanso: '60s' }
                    ]},
                    { nome: 'Dia 5 - Braços', grupos: 'Bíceps, Tríceps', exercicios: [
                        { nome: 'Rosca Direta com Barra', series: 4, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Tríceps Francês com Barra EZ', series: 4, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Rosca Alternada', series: 3, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Tríceps Pulley (Corda)', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Rosca Concentrada', series: 3, repeticoes: '12', descanso: '45s' },
                        { nome: 'Tríceps Coice', series: 3, repeticoes: '12', descanso: '45s' }
                    ]},
                    { nome: 'Dia 6 - Pernas Posterior', grupos: 'Posterior, Glúteos', exercicios: [
                        { nome: 'Stiff (Romeno)', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Mesa Flexora', series: 4, repeticoes: '12', descanso: '60s' },
                        { nome: 'Cadeira Flexora', series: 4, repeticoes: '12', descanso: '60s' },
                        { nome: 'Hip Thrust', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Abdução na Máquina', series: 3, repeticoes: '15', descanso: '45s' },
                        { nome: 'Panturrilha Sentado', series: 4, repeticoes: '15-20', descanso: '45s' }
                    ]}
                ]
            }
        },
        {
            id: 'jay_cutler_precontest',
            name: 'Jay Cutler Pre-Contest',
            subtitle: 'Avançado • 6x/semana',
            description: 'O programa de preparação de palco de Jay Cutler. Aumenta a intensidade, adiciona cardio estratégico e foca em separação e detalhamento muscular. O segredo dos 4 títulos Olympia.',
            level: 'avancado',
            days: 6,
            duration: '90-110',
            icon: '🎯',
            category: 'legends_olympia',
            objetivos: ['lendas', 'maromba', 'emagrecimento'],
            benefits: ['Definição extrema', 'Detalhamento', 'Stage ready'],
            workout: {
                dias: [
                    { nome: 'Dia 1 - Peito (Alto Volume)', grupos: 'Peito', exercicios: [
                        { nome: 'Supino Inclinado com Halteres', series: 5, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Supino Reto na Máquina', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Crucifixo Inclinado', series: 4, repeticoes: '15', descanso: '45s' },
                        { nome: 'Crossover Baixo', series: 4, repeticoes: '15', descanso: '45s' },
                        { nome: 'Peck Deck', series: 4, repeticoes: '15', descanso: '45s' },
                        { nome: 'Cardio LISS', series: 1, repeticoes: '30 min', descanso: '0s' }
                    ]},
                    { nome: 'Dia 2 - Costas (Detalhamento)', grupos: 'Costas', exercicios: [
                        { nome: 'Puxada Frontal Pegada Aberta', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Puxada Triângulo', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Remada na Máquina Unilateral', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Remada Baixa (Cabo)', series: 4, repeticoes: '15', descanso: '45s' },
                        { nome: 'Pullover na Máquina', series: 3, repeticoes: '15', descanso: '45s' },
                        { nome: 'Cardio LISS', series: 1, repeticoes: '30 min', descanso: '0s' }
                    ]},
                    { nome: 'Dia 3 - Pernas (Separação)', grupos: 'Quadríceps, Posterior', exercicios: [
                        { nome: 'Cadeira Extensora', series: 5, repeticoes: '15-20', descanso: '45s' },
                        { nome: 'Leg Press (Pés Juntos)', series: 4, repeticoes: '15', descanso: '60s' },
                        { nome: 'Agachamento Hack', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Passada', series: 4, repeticoes: '15 cada', descanso: '45s' },
                        { nome: 'Mesa Flexora', series: 4, repeticoes: '15', descanso: '45s' },
                        { nome: 'Stiff com Halteres', series: 4, repeticoes: '15', descanso: '45s' },
                        { nome: 'Panturrilha', series: 5, repeticoes: '20', descanso: '30s' }
                    ]},
                    { nome: 'Dia 4 - Ombros (Definição)', grupos: 'Ombros', exercicios: [
                        { nome: 'Desenvolvimento na Máquina', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Elevação Lateral (Drop Set)', series: 4, repeticoes: '15+10+10', descanso: '60s' },
                        { nome: 'Elevação Frontal Alternada', series: 4, repeticoes: '15', descanso: '45s' },
                        { nome: 'Crucifixo Inverso', series: 4, repeticoes: '15', descanso: '45s' },
                        { nome: 'Encolhimento com Halteres', series: 4, repeticoes: '15', descanso: '45s' },
                        { nome: 'Cardio LISS', series: 1, repeticoes: '30 min', descanso: '0s' }
                    ]},
                    { nome: 'Dia 5 - Braços (Pump)', grupos: 'Bíceps, Tríceps', exercicios: [
                        { nome: 'Rosca Direta (Superset)', series: 4, repeticoes: '15', descanso: '0s' },
                        { nome: 'Tríceps Pulley (Superset)', series: 4, repeticoes: '15', descanso: '45s' },
                        { nome: 'Rosca Scott', series: 4, repeticoes: '15', descanso: '45s' },
                        { nome: 'Tríceps Testa', series: 4, repeticoes: '15', descanso: '45s' },
                        { nome: 'Rosca Concentrada', series: 3, repeticoes: '15', descanso: '30s' },
                        { nome: 'Tríceps Corda', series: 3, repeticoes: '15', descanso: '30s' },
                        { nome: 'Cardio LISS', series: 1, repeticoes: '30 min', descanso: '0s' }
                    ]},
                    { nome: 'Dia 6 - Pernas + Glúteos', grupos: 'Glúteos, Posterior', exercicios: [
                        { nome: 'Hip Thrust', series: 5, repeticoes: '15', descanso: '60s' },
                        { nome: 'Stiff', series: 4, repeticoes: '15', descanso: '60s' },
                        { nome: 'Abdução na Máquina', series: 4, repeticoes: '20', descanso: '45s' },
                        { nome: 'Agachamento Sumô', series: 4, repeticoes: '15', descanso: '60s' },
                        { nome: 'Elevação Pélvica', series: 4, repeticoes: '20', descanso: '45s' },
                        { nome: 'Cardio LISS', series: 1, repeticoes: '45 min', descanso: '0s' }
                    ]}
                ]
            }
        },
        {
            id: 'ronnie_coleman_8x',
            name: 'Ronnie Coleman 8x Mr. Olympia',
            subtitle: 'Avançado • 6x/semana',
            description: '"Yeah Buddy! Light Weight Baby!" O treino do maior Mr. Olympia de todos os tempos! Ronnie levantava pesos que ninguém acreditava. 800lbs agachamento, 800lbs leg press. Força bruta absoluta.',
            level: 'avancado',
            days: 6,
            duration: '90-120',
            icon: '👑',
            category: 'legends_olympia',
            objetivos: ['lendas', 'maromba', 'forca', 'hipertrofia'],
            benefits: ['Força máxima', 'Massa monstruosa', 'GOAT'],
            featured: true,
            workout: {
                dias: [
                    { nome: 'Dia 1 - Costas/Bíceps', grupos: 'Costas, Bíceps', exercicios: [
                        { nome: 'Barra Fixa', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Remada Curvada com Barra', series: 4, repeticoes: '10-12', descanso: '120s' },
                        { nome: 'Remada T-Bar', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Puxada Frontal', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Remada Baixa (Cabo)', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Levantamento Terra', series: 4, repeticoes: '6-8', descanso: '180s' },
                        { nome: 'Rosca Direta com Barra', series: 4, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Rosca Alternada', series: 3, repeticoes: '10-12', descanso: '60s' }
                    ]},
                    { nome: 'Dia 2 - Peito/Tríceps', grupos: 'Peito, Tríceps', exercicios: [
                        { nome: 'Supino Reto com Barra', series: 5, repeticoes: '6-12', descanso: '120s' },
                        { nome: 'Supino Inclinado com Barra', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Supino Declinado', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Crucifixo Inclinado', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Crossover (Cabo)', series: 3, repeticoes: '15', descanso: '60s' },
                        { nome: 'Tríceps Pulley (Corda)', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Tríceps Testa', series: 3, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Mergulho', series: 3, repeticoes: '10-12', descanso: '60s' }
                    ]},
                    { nome: 'Dia 3 - Pernas (Quadríceps)', grupos: 'Quadríceps, Panturrilha', exercicios: [
                        { nome: 'Agachamento Livre', series: 5, repeticoes: '6-12', descanso: '180s' },
                        { nome: 'Leg Press 45°', series: 4, repeticoes: '12-15', descanso: '120s' },
                        { nome: 'Agachamento Hack', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Cadeira Extensora', series: 4, repeticoes: '15', descanso: '60s' },
                        { nome: 'Passada (Lunges)', series: 3, repeticoes: '12 cada', descanso: '60s' },
                        { nome: 'Panturrilha em Pé', series: 5, repeticoes: '15-20', descanso: '45s' },
                        { nome: 'Panturrilha Sentado', series: 4, repeticoes: '15-20', descanso: '45s' }
                    ]},
                    { nome: 'Dia 4 - Ombros/Trapézio', grupos: 'Ombros, Trapézio', exercicios: [
                        { nome: 'Desenvolvimento com Barra', series: 4, repeticoes: '8-12', descanso: '120s' },
                        { nome: 'Desenvolvimento com Halteres', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Elevação Lateral', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Elevação Frontal', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Crucifixo Inverso', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Encolhimento com Barra', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Encolhimento com Halteres', series: 3, repeticoes: '12', descanso: '60s' }
                    ]},
                    { nome: 'Dia 5 - Pernas (Posterior)', grupos: 'Posterior, Glúteos', exercicios: [
                        { nome: 'Stiff (Romeno)', series: 4, repeticoes: '10-12', descanso: '120s' },
                        { nome: 'Mesa Flexora', series: 4, repeticoes: '12', descanso: '60s' },
                        { nome: 'Cadeira Flexora', series: 4, repeticoes: '12', descanso: '60s' },
                        { nome: 'Agachamento Sumô', series: 3, repeticoes: '12', descanso: '90s' },
                        { nome: 'Hip Thrust', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Abdução na Máquina', series: 3, repeticoes: '15', descanso: '45s' },
                        { nome: 'Panturrilha em Pé', series: 4, repeticoes: '15-20', descanso: '45s' }
                    ]},
                    { nome: 'Dia 6 - Braços', grupos: 'Bíceps, Tríceps, Antebraço', exercicios: [
                        { nome: 'Rosca Direta com Barra', series: 4, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Rosca Scott', series: 3, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Rosca Concentrada', series: 3, repeticoes: '12', descanso: '45s' },
                        { nome: 'Tríceps Pulley (Barra Reta)', series: 4, repeticoes: '12', descanso: '60s' },
                        { nome: 'Tríceps Francês', series: 3, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Tríceps Coice', series: 3, repeticoes: '12', descanso: '45s' },
                        { nome: 'Rosca Punho', series: 3, repeticoes: '15', descanso: '30s' }
                    ]}
                ]
            }
        },
        {
            id: 'ronnie_coleman_back',
            name: 'Ronnie Coleman Back Day',
            subtitle: 'Avançado • Especializado',
            description: 'O treino de costas mais brutal já documentado! Ronnie tinha as costas mais largas e grossas do bodybuilding. Remada com 500lbs, Terra com 800lbs. "Ain\'t nothin\' but a peanut!"',
            level: 'avancado',
            days: 1,
            duration: '75-90',
            icon: '🦍',
            category: 'legends_olympia',
            objetivos: ['lendas', 'maromba', 'forca'],
            benefits: ['Costas brutais', 'Força extrema', 'Lendário'],
            workout: {
                dias: [
                    { nome: 'Ronnie Coleman Back Day', grupos: 'Costas (Largura + Espessura)', exercicios: [
                        { nome: 'Levantamento Terra', series: 4, repeticoes: '6-10', descanso: '180s', nota: 'Ronnie: 800lbs!' },
                        { nome: 'Remada Curvada com Barra', series: 4, repeticoes: '10-12', descanso: '120s', nota: '500lbs de remada' },
                        { nome: 'Remada T-Bar', series: 4, repeticoes: '10-12', descanso: '120s' },
                        { nome: 'Puxada Frontal', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Puxada Triângulo', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Remada Baixa (Cabo)', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Remada Unilateral com Halter', series: 3, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Pullover na Máquina', series: 3, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Hiperextensão', series: 3, repeticoes: '15', descanso: '45s' }
                    ]}
                ]
            }
        },
        {
            id: 'ronnie_coleman_legs',
            name: 'Ronnie Coleman Leg Day',
            subtitle: 'Avançado • Especializado',
            description: '"Everybody wanna be a bodybuilder, but nobody wanna lift no heavy ass weight!" Agachamento frontal com 600lbs, Leg Press com 2300lbs. O treino de pernas mais pesado da história.',
            level: 'avancado',
            days: 1,
            duration: '90-120',
            icon: '🦏',
            category: 'legends_olympia',
            objetivos: ['lendas', 'maromba', 'forca'],
            benefits: ['Pernas monstruosas', 'Força lendária', 'Hardcore'],
            workout: {
                dias: [
                    { nome: 'Ronnie Coleman Leg Day', grupos: 'Quadríceps, Posterior, Glúteos', exercicios: [
                        { nome: 'Agachamento Livre', series: 5, repeticoes: '4-12', descanso: '180s', nota: 'Ronnie: 800lbs!' },
                        { nome: 'Agachamento Frontal', series: 4, repeticoes: '10-12', descanso: '120s' },
                        { nome: 'Leg Press 45°', series: 4, repeticoes: '12-15', descanso: '120s', nota: '2300lbs no leg press!' },
                        { nome: 'Agachamento Hack', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Cadeira Extensora', series: 4, repeticoes: '15', descanso: '60s' },
                        { nome: 'Stiff (Romeno)', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Mesa Flexora', series: 4, repeticoes: '12', descanso: '60s' },
                        { nome: 'Passada (Walking Lunges)', series: 3, repeticoes: '20 passos', descanso: '60s' },
                        { nome: 'Panturrilha em Pé', series: 5, repeticoes: '15-20', descanso: '45s' }
                    ]}
                ]
            }
        },
        {
            id: 'ronnie_coleman_chest',
            name: 'Ronnie Coleman Chest Day',
            subtitle: 'Avançado • Especializado',
            description: 'Supino com 500lbs como aquecimento! Ronnie fazia inclinado com 200lbs em cada mão. Este é o treino que construiu um peito digno de 8x Mr. Olympia.',
            level: 'avancado',
            days: 1,
            duration: '60-75',
            icon: '💪',
            category: 'legends_olympia',
            objetivos: ['lendas', 'maromba', 'hipertrofia'],
            benefits: ['Peito massivo', 'Força explosiva', 'Intenso'],
            workout: {
                dias: [
                    { nome: 'Ronnie Coleman Chest Day', grupos: 'Peito (Superior, Médio, Inferior)', exercicios: [
                        { nome: 'Supino Reto com Barra', series: 5, repeticoes: '6-12', descanso: '120s', nota: 'Ronnie: 500lbs!' },
                        { nome: 'Supino Inclinado com Halteres', series: 4, repeticoes: '10-12', descanso: '90s', nota: '200lbs cada mão!' },
                        { nome: 'Supino Inclinado com Barra', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Supino Declinado com Barra', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Crucifixo com Halteres (Reto)', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Crucifixo Inclinado', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Crossover (Cabo)', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Mergulho', series: 3, repeticoes: '10-12', descanso: '60s' }
                    ]}
                ]
            }
        }
    ],

    getFilteredTemplates(filter = 'all') {
        if (filter === 'all') return this.templates;
        return this.templates.filter(t => t.objetivos?.includes(filter));
    },

    getFeatured() {
        return this.templates.filter(t => t.featured);
    },

    getByLevel(level) {
        return this.templates.filter(t => t.level === level);
    },

    getById(id) {
        return this.templates.find(t => t.id === id);
    },

    // Gera o treino baseado no template - usa workout específico se disponível
    generateWorkoutFromTemplate(template) {
        // Se o template tem um workout específico definido, usa ele
        if (template.workout && template.workout.dias) {
            return {
                nome: template.name,
                descricao: template.description,
                divisao: template.category,
                duracao: template.duration,
                template_id: template.id,
                dias: template.workout.dias.map(d => ({
                    nome: d.nome,
                    grupos: d.grupos,
                    exercicios: d.exercicios.map(ex => ({
                        nome: ex.nome,
                        series: ex.series,
                        repeticoes: ex.repeticoes,
                        descanso: ex.descanso,
                        nota: ex.nota || null
                    }))
                }))
            };
        }
        
        // Caso contrário, gera um treino genérico baseado nos parâmetros
        const treino = WorkoutGenerator.generatePlan({
            objetivo: template.objetivos?.[0] || 'hipertrofia',
            dias: template.days,
            nivel: template.level
        });
        
        treino.nome = template.name;
        treino.descricao = template.description;
        treino.template_id = template.id;
        
        return treino;
    },

    async applyTemplate(templateId) {
        const template = this.getById(templateId);
        if (!template) {
            Toast.error('Template não encontrado');
            return;
        }

        Toast.info('Gerando treino...');

        // Gerar treino baseado no template (específico ou genérico)
        const treino = this.generateWorkoutFromTemplate(template);

        // Salvar
        localStorage.setItem('treino_atual', JSON.stringify(treino));

        // Fechar modais
        document.getElementById('template-modal')?.remove();
        document.getElementById('template-preview')?.remove();

        Toast.success(`✅ ${template.name} aplicado!`);
        
        // Atualizar dashboard
        App.loadDashboard();
        App.switchTab('treino');
    },

    showTemplateSelector() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'template-modal';

        const renderCards = (filter = 'all') => {
            const templates = this.getFilteredTemplates(filter);
            return templates.map(t => `
                <div class="template-card" onclick="WorkoutTemplates.previewTemplate('${t.id}')">
                    <div class="template-icon">${t.icon}</div>
                    <div class="template-info">
                        <h4>${t.name}</h4>
                        <p>${t.subtitle}</p>
                    </div>
                    <div class="template-meta">
                        <span class="template-days">${t.days}x/sem</span>
                        <span class="template-level ${t.level}">${t.level.charAt(0).toUpperCase()}</span>
                    </div>
                </div>
            `).join('');
        };

        modal.innerHTML = `
            <div class="modal-content modal-templates">
                <div class="modal-header">
                    <h2>📋 Fichas de Treino</h2>
                    <button class="modal-close" onclick="document.getElementById('template-modal').remove()">✕</button>
                </div>
                
                <div class="template-filters">
                    <button class="filter-btn active" data-filter="all">🏠 Todos</button>
                    <button class="filter-btn" data-filter="hipertrofia">💪 Massa</button>
                    <button class="filter-btn" data-filter="forca">🏋️ Força</button>
                    <button class="filter-btn" data-filter="emagrecimento">🔥 Queima</button>
                    <button class="filter-btn" data-filter="condicionamento">⚡ Cardio</button>
                    <button class="filter-btn" data-filter="maromba">🏛️ Golden Era</button>
                    <button class="filter-btn" data-filter="lendas">👑 Lendas</button>
                </div>
                
                <div class="templates-list" id="templates-list">
                    ${renderCards('all')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Filter buttons
        modal.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('templates-list').innerHTML = renderCards(btn.dataset.filter);
            });
        });
    },

    previewTemplate(templateId) {
        const t = this.getById(templateId);
        if (!t) return;

        // Gerar preview do treino usando o método correto
        const preview = this.generateWorkoutFromTemplate(t);

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'template-preview';

        modal.innerHTML = `
            <div class="modal-content modal-preview">
                <div class="preview-header">
                    <button class="back-btn" onclick="document.getElementById('template-preview').remove()">
                        ← Voltar
                    </button>
                    <span class="preview-icon">${t.icon}</span>
                </div>
                
                <div class="preview-body">
                    <h2>${t.name}</h2>
                    <p class="preview-subtitle">${t.subtitle}</p>
                    <p class="preview-desc">${t.description}</p>
                    
                    <div class="preview-stats">
                        <div class="stat">
                            <span class="value">${t.days}</span>
                            <span class="label">dias/sem</span>
                        </div>
                        <div class="stat">
                            <span class="value">${t.duration}</span>
                            <span class="label">minutos</span>
                        </div>
                        <div class="stat">
                            <span class="value">${t.level}</span>
                            <span class="label">nível</span>
                        </div>
                    </div>
                    
                    <div class="preview-benefits">
                        ${(t.benefits || []).map(b => `<span class="benefit-tag">${b}</span>`).join('')}
                    </div>
                    
                    <h3>Prévia dos Dias</h3>
                    <div class="preview-days">
                        ${preview.dias.map((d, i) => `
                            <details class="day-preview">
                                <summary>
                                    <span class="day-letter">${String.fromCharCode(65 + i)}</span>
                                    <span class="day-name">${d.grupos}</span>
                                    <span class="day-count">${d.exercicios.length} exercícios</span>
                                </summary>
                                <div class="day-exercises">
                                    ${d.exercicios.map(ex => `
                                        <div class="exercise-row">
                                            <span>${ex.nome}</span>
                                            <span>${ex.series}×${ex.repeticoes}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </details>
                        `).join('')}
                    </div>
                </div>
                
                <div class="preview-footer">
                    <button class="btn-secondary" onclick="document.getElementById('template-preview').remove()">
                        Voltar
                    </button>
                    <button class="btn-primary" onclick="WorkoutTemplates.applyTemplate('${t.id}')">
                        ✓ Usar Este Treino
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }
};

// =====================================================
// INICIALIZAÇÃO
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Shaipados] Iniciando v6.0...');
    Toast.init();
    fetch('/api/health').then(r => r.json()).then(() => console.log('✅ API Java OK')).catch(() => console.warn('⚠️ API Java offline'));
    Auth.init();
});

// Exports para debug
window.AppState = AppState;
window.Auth = Auth;
window.App = App;
window.Onboarding = Onboarding;
window.DashboardWidgets = DashboardWidgets;
window.Toast = Toast;
window.ActiveWorkout = ActiveWorkout;
window.WorkoutGenerator = WorkoutGenerator;
window.WorkoutTemplates = WorkoutTemplates;

