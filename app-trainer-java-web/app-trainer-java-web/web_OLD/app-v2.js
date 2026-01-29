/**
 * APP TRAINER v2 - Modern JavaScript Application
 * Inspirado em: Hevy, Strong, FitBod, MyFitnessPal
 * Build: 2026-01-18
 */

// =====================================================
// HANDLER GLOBAL DE ERROS
// =====================================================

window.onerror = function(message, source, lineno, colno, error) {
    console.error('[GLOBAL ERROR]', message, 'at', source, 'line', lineno, 'col', colno);
    console.error('[GLOBAL ERROR] Stack:', error?.stack);
    return false;
};

window.addEventListener('unhandledrejection', function(event) {
    console.error('[UNHANDLED PROMISE]', event.reason);
});

// =====================================================
// CONFIGURAÇÃO & ESTADO GLOBAL
// =====================================================

// Usa o mesmo host/porta do servidor web (Java)
const API_BASE = window.location.origin;

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
        duracao: 60,
        local: null
    },
    profile: null,
    workouts: [],
    messages: []
};

// =====================================================
// DASHBOARD WIDGETS SYSTEM
// =====================================================

const DashboardWidgets = {
    // Definição de todos os widgets disponíveis
    definitions: {
        'hero-treino': {
            id: 'hero-treino',
            name: 'Treino de Hoje',
            description: 'Card destacado com o treino do dia atual',
            icon: '🏋️',
            size: 'half',
            category: 'treino',
            required: true,
            order: 0
        },
        'ficha-atual': {
            id: 'ficha-atual',
            name: 'Minha Ficha',
            description: 'A ficha de treino ativa',
            icon: '📑',
            size: 'half',
            category: 'treino',
            required: false,
            order: 1
        },
        'quick-stats': {
            id: 'quick-stats',
            name: 'Estatísticas Rápidas',
            description: 'Treinos, sequência e meta da semana',
            icon: '📊',
            size: 'full',
            category: 'stats',
            required: false,
            order: 1
        },
        'progresso': {
            id: 'progresso',
            name: 'Progresso',
            description: 'Sua evolução e métricas de treino',
            icon: '📈',
            size: 'half',
            category: 'stats',
            required: false,
            order: 2
        },
        'coach-ia': {
            id: 'coach-ia',
            name: 'Coach IA',
            description: 'Seu personal trainer virtual',
            icon: '🤖',
            size: 'half',
            category: 'assistente',
            required: false,
            order: 3
        },
        'templates': {
            id: 'templates',
            name: 'Fichas de Treino',
            description: 'Suas fichas prontas para usar',
            icon: '📋',
            size: 'half',
            category: 'treino',
            required: false,
            order: 4
        },
        'conquistas': {
            id: 'conquistas',
            name: 'Conquistas',
            description: 'Suas medalhas e badges',
            icon: '🏆',
            size: 'half',
            category: 'gamificacao',
            required: false,
            order: 5
        },
        'sua-divisao': {
            id: 'sua-divisao',
            name: 'Sua Divisão',
            description: 'Visão geral do seu plano de treino',
            icon: '📅',
            size: 'full',
            category: 'treino',
            required: false,
            order: 6
        },
        'timer-descanso': {
            id: 'timer-descanso',
            name: 'Timer de Descanso',
            description: 'Controle o tempo entre séries',
            icon: '⏱️',
            size: 'half',
            category: 'ferramentas',
            required: false,
            order: 7
        },
        'agua': {
            id: 'agua',
            name: 'Hidratação',
            description: 'Controle sua ingestão de água',
            icon: '💧',
            size: 'half',
            category: 'saude',
            required: false,
            order: 8
        },
        'calorias': {
            id: 'calorias',
            name: 'Calorias do Dia',
            description: 'Estimativa de calorias queimadas',
            icon: '🔥',
            size: 'half',
            category: 'saude',
            required: false,
            order: 9
        },
        'peso-atual': {
            id: 'peso-atual',
            name: 'Peso Atual',
            description: 'Acompanhe seu peso',
            icon: '⚖️',
            size: 'half',
            category: 'saude',
            required: false,
            order: 10
        },
        'proximos-treinos': {
            id: 'proximos-treinos',
            name: 'Próximos Treinos',
            description: 'Seus próximos treinos da semana',
            icon: '📆',
            size: 'full',
            category: 'treino',
            required: false,
            order: 11
        },
        'motivacional': {
            id: 'motivacional',
            name: 'Frase Motivacional',
            description: 'Inspiração diária para seu treino',
            icon: '💪',
            size: 'full',
            category: 'motivacao',
            required: false,
            order: 12
        },
        'recordes': {
            id: 'recordes',
            name: 'Seus Recordes',
            description: 'PRs e melhores marcas',
            icon: '🎯',
            size: 'half',
            category: 'stats',
            required: false,
            order: 13
        },
        'planejamento-semanal': {
            id: 'planejamento-semanal',
            name: 'Planejamento Semanal',
            description: 'Dias planejados vs concluídos',
            icon: '🗓️',
            size: 'full',
            category: 'treino',
            required: false,
            order: 14
        },
        'prs-volume': {
            id: 'prs-volume',
            name: 'PRs e Volume',
            description: 'Recordes recentes e volume semanal',
            icon: '🏆',
            size: 'half',
            category: 'stats',
            required: false,
            order: 15
        },
        'aquecimento-inteligente': {
            id: 'aquecimento-inteligente',
            name: 'Aquecimento Inteligente',
            description: 'Sequência rápida antes do treino',
            icon: '🔥',
            size: 'half',
            category: 'ferramentas',
            required: false,
            order: 16
        },
        'checklist-tecnico': {
            id: 'checklist-tecnico',
            name: 'Checklist Técnico',
            description: 'Lembretes rápidos de execução',
            icon: '✔️',
            size: 'half',
            category: 'tecnica',
            required: false,
            order: 17
        },
        'macro-tracker': {
            id: 'macro-tracker',
            name: 'Macros de Hoje',
            description: 'Proteína, carbo e gordura',
            icon: '🥗',
            size: 'half',
            category: 'nutricao',
            required: false,
            order: 18
        },
        'sono-recuperacao': {
            id: 'sono-recuperacao',
            name: 'Sono & Recuperação',
            description: 'Horas de sono e score rápido',
            icon: '😴',
            size: 'half',
            category: 'recuperacao',
            required: false,
            order: 19
        },
        'habitos-semana': {
            id: 'habitos-semana',
            name: 'Hábito da Semana',
            description: 'Streak de hábitos saudáveis',
            icon: '📅',
            size: 'half',
            category: 'habitos',
            required: false,
            order: 20
        },
        'readiness-score': {
            id: 'readiness-score',
            name: 'Readiness',
            description: 'Pronto para treinar?',
            icon: '🟢',
            size: 'half',
            category: 'recuperacao',
            required: false,
            order: 21
        },
        'tendencia-agua': {
            id: 'tendencia-agua',
            name: 'Hidratação Semanal',
            description: 'Copos por dia (7d)',
            icon: '💧',
            size: 'half',
            category: 'nutricao',
            required: false,
            order: 22
        },
        'resumo-semanal': {
            id: 'resumo-semanal',
            name: 'Resumo Semanal',
            description: 'Treinos, volume e consistência',
            icon: '📊',
            size: 'full',
            category: 'stats',
            required: false,
            order: 23
        }
    },

    // Configuração padrão de widgets ativos
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
        { id: 'prs-volume', visible: true, order: 9 },
        { id: 'aquecimento-inteligente', visible: true, order: 10 },
        { id: 'checklist-tecnico', visible: true, order: 11 },
        { id: 'macro-tracker', visible: true, order: 12 },
        { id: 'sono-recuperacao', visible: true, order: 13 },
        { id: 'habitos-semana', visible: true, order: 14 },
        { id: 'readiness-score', visible: true, order: 15 },
        { id: 'tendencia-agua', visible: false, order: 16 },
        { id: 'resumo-semanal', visible: false, order: 17 }
    ],

    // Estado atual
    currentConfig: [],
    draggedItem: null,
    draggedOverItem: null,

    // Inicializar sistema
    init() {
        this.loadConfig();
    },

    // Carregar configuração do localStorage
    loadConfig() {
        const saved = localStorage.getItem('dashboard_widgets_config');
        if (saved) {
            try {
                this.currentConfig = JSON.parse(saved);
                // Verificar se há novos widgets não incluídos
                this.syncWithDefinitions();
            } catch (e) {
                console.error('Erro ao carregar config de widgets:', e);
                this.currentConfig = [...this.defaultConfig];
            }
        } else {
            this.currentConfig = [...this.defaultConfig];
        }
    },

    // Sincronizar com definições (adicionar novos widgets)
    syncWithDefinitions() {
        const existingIds = this.currentConfig.map(w => w.id);
        Object.keys(this.definitions).forEach(id => {
            if (!existingIds.includes(id)) {
                this.currentConfig.push({
                    id,
                    visible: false,
                    order: this.currentConfig.length
                });
            }
        });
    },

    // Salvar configuração no localStorage
    saveConfig() {
        localStorage.setItem('dashboard_widgets_config', JSON.stringify(this.currentConfig));
    },

    // Obter widgets visíveis ordenados
    getVisibleWidgets() {
        const visibleWidgets = this.currentConfig
            .filter(w => w.visible && this.definitions[w.id])
            .sort((a, b) => a.order - b.order)
            .map(w => ({ ...this.definitions[w.id], ...w }));

        if (!visibleWidgets.length) {
            // Configuração inválida/zerada: restaurar padrão
            this.currentConfig = [...this.defaultConfig];
            this.syncWithDefinitions();
            this.saveConfig();
            return this.currentConfig
                .filter(w => w.visible && this.definitions[w.id])
                .sort((a, b) => a.order - b.order)
                .map(w => ({ ...this.definitions[w.id], ...w }));
        }

        return visibleWidgets;
    },

    // Obter widgets não visíveis
    getHiddenWidgets() {
        return this.currentConfig
            .filter(w => !w.visible && this.definitions[w.id])
            .map(w => ({ ...this.definitions[w.id], ...w }));
    },

    // Toggle visibilidade de widget
    toggleWidget(widgetId) {
        const widget = this.currentConfig.find(w => w.id === widgetId);
        if (widget && !this.definitions[widgetId]?.required) {
            widget.visible = !widget.visible;
            if (widget.visible) {
                // Adicionar no final
                widget.order = Math.max(...this.currentConfig.map(w => w.order)) + 1;
            }
        }
    },

    // Reordenar widgets
    reorderWidgets(fromIndex, toIndex) {
        const visibleWidgets = this.getVisibleWidgets();
        const [moved] = visibleWidgets.splice(fromIndex, 1);
        visibleWidgets.splice(toIndex, 0, moved);
        
        // Atualizar ordens
        visibleWidgets.forEach((w, i) => {
            const configWidget = this.currentConfig.find(c => c.id === w.id);
            if (configWidget) {
                configWidget.order = i;
            }
        });
    },

    // Resetar para padrão
    resetToDefault() {
        this.currentConfig = [...this.defaultConfig];
        this.syncWithDefinitions();
        this.saveConfig();
    },

    // Renderizar widget individual
    renderWidget(widget) {
        let html = '';
        switch(widget.id) {
            case 'hero-treino':
                html = this.renderHeroTreino();
                break;
            case 'ficha-atual':
                html = this.renderFichaAtual();
                break;
            case 'quick-stats':
                html = this.renderQuickStats();
                break;
            case 'progresso':
                html = this.renderProgresso();
                break;
            case 'coach-ia':
                html = this.renderCoachIA();
                break;
            case 'templates':
                html = this.renderTemplates();
                break;
            case 'conquistas':
                html = this.renderConquistas();
                break;
            case 'sua-divisao':
                html = this.renderSuaDivisao();
                break;
            case 'timer-descanso':
                html = this.renderTimerDescanso();
                break;
            case 'agua':
                html = this.renderAgua();
                break;
            case 'calorias':
                html = this.renderCalorias();
                break;
            case 'peso-atual':
                html = this.renderPesoAtual();
                break;
            case 'proximos-treinos':
                html = this.renderProximosTreinos();
                break;
            case 'motivacional':
                html = this.renderMotivacional();
                break;
            case 'recordes':
                html = this.renderRecordes();
                break;
            case 'planejamento-semanal':
                html = this.renderPlanejamentoSemanal();
                break;
            case 'prs-volume':
                html = this.renderPRsVolume();
                break;
            case 'aquecimento-inteligente':
                html = this.renderAquecimentoInteligente();
                break;
            case 'checklist-tecnico':
                html = this.renderChecklistTecnico();
                break;
            case 'macro-tracker':
                html = this.renderMacroTracker();
                break;
            case 'sono-recuperacao':
                html = this.renderSonoRecuperacao();
                break;
            case 'habitos-semana':
                html = this.renderHabitosSemana();
                break;
            case 'readiness-score':
                html = this.renderReadinessScore();
                break;
            case 'tendencia-agua':
                html = this.renderTendenciaAgua();
                break;
            case 'resumo-semanal':
                html = this.renderResumoSemanal();
                break;
            default:
                html = '';
        }
        
        return html;

    // Renderizadores de cada widget
    renderHeroTreino() {
        return `
            <div class="dashboard-widget dashboard-hero" data-widget-id="hero-treino" onclick="App.goToSection('treino-hoje')">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="hero-gradient"></div>
                <div class="hero-content">
                    <div class="hero-badge">
                        <span class="pulse-dot"></span>
                        <span>Hoje</span>
                    </div>
                    <h2 class="hero-title" id="hero-workout-name">Treino A</h2>
                    <p class="hero-subtitle" id="hero-workout-groups">Peito e Tríceps</p>
                    <div class="hero-meta">
                        <span class="meta-item">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
                            </svg>
                            <span id="hero-workout-duration">~60 min</span>
                        </span>
                        <span class="meta-item">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                            </svg>
                            <span id="hero-workout-exercises">6 exercícios</span>
                        </span>
                    </div>
                </div>
                <div class="hero-action">
                    <div class="hero-play-btn">
                        <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                    <span>Iniciar</span>
                </div>
                <div class="hero-illustration">
                    <svg viewBox="0 0 100 100" fill="none" opacity="0.15">
                        <circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="2"/>
                        <path d="M30 50 L45 50 L50 35 L55 65 L60 50 L70 50" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
        `;
    },

    renderFichaAtual() {
        // Buscar treino atual salvo (que contém info do template)
        const treinoAtual = JSON.parse(localStorage.getItem('treino_atual') || 'null');
        const templateName = treinoAtual?.meta?.template_name || null;
        const personalizado = treinoAtual?.meta?.personalizado || false;
        const diasSemana = treinoAtual?.dias?.length || 0;
        const objetivo = treinoAtual?.meta?.objetivo || '';

        // Se não tem treino nenhum, mostrar card para escolher
        if (!treinoAtual || diasSemana === 0) {
            return `
                <div class="dashboard-widget widget-card card-ficha-atual no-ficha" data-widget-id="ficha-atual" onclick="App.switchTab('treino')">
                    <div class="widget-drag-handle">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                            <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                            <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                        </svg>
                    </div>
                    <div class="ficha-empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <line x1="12" y1="8" x2="12" y2="16"/>
                            <line x1="8" y1="12" x2="16" y2="12"/>
                        </svg>
                    </div>
                    <div class="ficha-empty-text">
                        <strong>Escolha sua Ficha</strong>
                        <span>Selecione um programa de treino</span>
                    </div>
                </div>
            `;
        }

        // Determinar nome da ficha: template ou personalizado
        const fichaNome = templateName || 'Treino Personalizado';
        const fichaIcon = templateName ? '📋' : '✨';
        const fichaBadge = templateName ? 'Minha Ficha' : 'Personalizado';

        // Mostrar ficha ativa
        return `
            <div class="dashboard-widget widget-card card-ficha-atual ${!templateName ? 'personalizado' : ''}" data-widget-id="ficha-atual" onclick="App.switchTab('treino')">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="ficha-badge">
                    <span>${fichaIcon}</span>
                    <span>${fichaBadge}</span>
                </div>
                <div class="ficha-content">
                    <h3 class="ficha-nome">${fichaNome}</h3>
                    <div class="ficha-meta">
                        <span class="ficha-dias">${diasSemana}x/semana</span>
                        ${objetivo ? `<span class="ficha-objetivo">${this.formatObjetivo(objetivo)}</span>` : ''}
                    </div>
                </div>
                <div class="ficha-action">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </div>
            </div>
        `;
    },

    formatObjetivo(objetivo) {
        const map = {
            'hipertrofia': 'Hipertrofia',
            'forca': 'Força',
            'emagrecimento': 'Emagrecimento',
            'resistencia': 'Resistência',
            'condicionamento': 'Condicionamento',
            'funcional': 'Funcional'
        };
        return map[objetivo] || objetivo;
    },

    renderQuickStats() {
        return `
            <div class="dashboard-widget dashboard-stats" data-widget-id="quick-stats">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="mini-stat">
                    <span class="mini-stat-value" id="stat-treinos-mes">0</span>
                    <span class="mini-stat-label">Treinos</span>
                </div>
                <div class="mini-stat-divider"></div>
                <div class="mini-stat">
                    <span class="mini-stat-value" id="stat-streak">0</span>
                    <span class="mini-stat-label">Dias</span>
                </div>
                <div class="mini-stat-divider"></div>
                <div class="mini-stat">
                    <span class="mini-stat-value" id="stat-meta-percent">0%</span>
                    <span class="mini-stat-label">Meta</span>
                </div>
            </div>
        `;
    },

    renderProgresso() {
        return `
            <div class="dashboard-widget widget-card card-progress" data-widget-id="progresso" onclick="App.goToSection('progresso')">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>
                    </svg>
                </div>
                <div class="feature-info">
                    <h3>Progresso</h3>
                    <p>Evolução e métricas</p>
                </div>
                <div class="feature-preview">
                    <div class="mini-chart">
                        <div class="chart-bar-mini" style="height: 40%"></div>
                        <div class="chart-bar-mini" style="height: 60%"></div>
                        <div class="chart-bar-mini" style="height: 45%"></div>
                        <div class="chart-bar-mini" style="height: 80%"></div>
                        <div class="chart-bar-mini active" style="height: 70%"></div>
                    </div>
                </div>
            </div>
        `;
    },

    renderCoachIA() {
        return `
            <div class="dashboard-widget widget-card card-coach" data-widget-id="coach-ia" onclick="App.goToSection('coach')">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                        <circle cx="9" cy="13" r="1.5" fill="currentColor"/><circle cx="15" cy="13" r="1.5" fill="currentColor"/>
                        <path d="M9 17h6" stroke-linecap="round"/>
                    </svg>
                </div>
                <div class="feature-info">
                    <h3>Coach IA</h3>
                    <p>Seu personal virtual</p>
                </div>
                <div class="feature-badge"><span class="ai-badge">IA</span></div>
            </div>
        `;
    },

    renderTemplates() {
        return `
            <div class="dashboard-widget widget-card card-templates" data-widget-id="templates" onclick="App.goToSection('templates')">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                </div>
                <div class="feature-info">
                    <h3>Fichas de Treino</h3>
                    <p>Suas fichas prontas</p>
                </div>
                <div class="feature-count"><span>8+</span></div>
            </div>
        `;
    },

    renderConquistas() {
        return `
            <div class="dashboard-widget widget-card card-achievements" data-widget-id="conquistas" onclick="App.goToSection('conquistas')">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                        <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                    </svg>
                </div>
                <div class="feature-info">
                    <h3>Conquistas</h3>
                    <p>Suas medalhas</p>
                </div>
                <div class="feature-badges-preview">
                    <span class="badge-mini">🏆</span><span class="badge-mini">💪</span><span class="badge-mini locked">🔒</span>
                </div>
            </div>
        `;
    },

    renderSuaDivisao() {
        return `
            <div class="dashboard-widget widget-section" data-widget-id="sua-divisao">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="section-header-v2">
                    <div class="section-title-area">
                        <h2>Sua Divisão</h2>
                        <span class="section-subtitle" id="split-objetivo">Hipertrofia • 4x/sem</span>
                    </div>
                    <button class="btn-section-action" onclick="event.stopPropagation(); App.goToSection('divisao')">
                        <span>Ver</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                    </button>
                </div>
                <div class="split-carousel" id="split-preview"></div>
            </div>
        `;
    },

    renderTimerDescanso() {
        return `
            <div class="dashboard-widget widget-card card-timer" data-widget-id="timer-descanso" onclick="App.openRestTimer()">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="feature-icon timer-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                </div>
                <div class="feature-info">
                    <h3>Timer</h3>
                    <p>Descanso entre séries</p>
                </div>
                <div class="timer-display" id="widget-timer-display">01:30</div>
            </div>
        `;
    },

    renderAgua() {
        const aguaHoje = parseInt(localStorage.getItem('agua_hoje') || '0');
        const metaAgua = 8; // copos
        const percent = Math.min(100, Math.round((aguaHoje / metaAgua) * 100));
        return `
            <div class="dashboard-widget widget-card card-agua" data-widget-id="agua" onclick="App.addWater()">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="feature-icon agua-icon">💧</div>
                <div class="feature-info">
                    <h3>Hidratação</h3>
                    <p>${aguaHoje}/${metaAgua} copos</p>
                </div>
                <div class="agua-progress">
                    <div class="agua-fill" style="width: ${percent}%"></div>
                </div>
                <span class="tap-hint">+ Toque para adicionar</span>
            </div>
        `;
    },

    renderCalorias() {
        const historico = JSON.parse(localStorage.getItem('historico_treinos') || '[]');
        const hoje = new Date().toISOString().split('T')[0];
        const treinoHoje = historico.find(t => t.data === hoje);
        const calorias = treinoHoje ? Math.round(treinoHoje.duracao * 5) : 0;
        return `
            <div class="dashboard-widget widget-card card-calorias" data-widget-id="calorias">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="feature-icon calorias-icon">🔥</div>
                <div class="feature-info">
                    <h3>Calorias</h3>
                    <p>Queimadas hoje</p>
                </div>
                <div class="calorias-value" id="widget-calorias">${calorias} kcal</div>
            </div>
        `;
    },

    renderPesoAtual() {
        const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
        const peso = profile.peso || '--';
        return `
            <div class="dashboard-widget widget-card card-peso" data-widget-id="peso-atual" onclick="App.goToSection('perfil')">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="feature-icon peso-icon">⚖️</div>
                <div class="feature-info">
                    <h3>Peso</h3>
                    <p>Atual</p>
                </div>
                <div class="peso-value" id="widget-peso">${peso} kg</div>
            </div>
        `;
    },

    renderProximosTreinos() {
        return `
            <div class="dashboard-widget widget-section" data-widget-id="proximos-treinos">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="section-header-v2">
                    <div class="section-title-area">
                        <h2>Próximos Treinos</h2>
                        <span class="section-subtitle">Esta semana</span>
                    </div>
                </div>
                <div class="proximos-list" id="proximos-treinos-list"></div>
            </div>
        `;
    },

    renderMotivacional() {
        const frases = [
            // Originais
            "A dor que você sente hoje será a força que você sentirá amanhã.",
            "Não existe elevador para o sucesso. Use as escadas.",
            "Seu único limite é você.",
            "Transforme seus QUERO em VOU.",
            "Cada treino te deixa mais forte que ontem.",
            "Resultados acontecem com o tempo, não da noite pro dia.",
            "Desistir nunca é uma opção.",
            "Você é mais forte do que pensa.",
            "O corpo alcança o que a mente acredita.",
            // Hardcore Musculação
            "No pain, no gain. A dor é o caminho.",
            "Músculos são construídos na academia, mas nutrição na cozinha.",
            "Champions não nascem. São feitos de dedicação e treino.",
            "Sua mente vai dar up antes de seus músculos. Não deixe isso acontecer.",
            "Levante pesado ou vá para casa.",
            "Treinar é escolher. Ficar fraco é permitir.",
            "Ganho de massa vem de repetições. Repetições vêm de vontade pura.",
            "Um dia você não vai estar aqui. Treina forte hoje.",
            "Você tem as mesmas 24h que o Schwarzenegger tinha.",
            "Lute pelo seu corpo como se fosse a última luta da sua vida.",
            "O treino duro mata a preguiça.",
            "Músculos querem ser usados. Força quer ser testada.",
            "Reps e sets não mentem. Seu corpo é o resultado do seu esforço.",
            "Treino fácil = resultados fáceis de não aparecer.",
            "Cada série é uma oportunidade de ser melhor.",
            "Progressão é a lei. Sempre busque mais peso, mais reps, mais foco.",
            "Dor é temporária. Glória é para sempre.",
            "Seu corpo é uma obra de arte. Trabalhe como um artista.",
            "Treino é simplicidade: levante, aumente, repita.",
            "Quem treina pesado nunca fica para trás.",
            "Músculos crescem quando você os força além do conforto.",
            "Fadiga muscular é o feedback que você está no caminho certo.",
            "Limite é só um número. Sua vontade é infinita.",
            "Volume mais intensidade = massa magra.",
            "Bomba muscular é vida.",
            "Você não precisa ser o melhor. Só precisa ser melhor que ontem.",
            "Treino com foco. Nutrir com disciplina. Descansar com propósito.",
            "Sucesso é 1% inspiração e 99% transpiração.",
            "Seu PR de hoje é seu aquecimento de amanhã.",
            "Musculação não é uma hobbie. É um estilo de vida.",
            "Cale o jogo. Deixe o corpo falar.",
            "Lágrimas de suor evitam lágrimas de arrependimento.",
            "Ganhar é hábito. Começar é tudo.",
            "Força vem da persistência. Glória vem da força."
        ];
        const fraseHoje = frases[new Date().getDate() % frases.length];
        return `
            <div class="dashboard-widget widget-motivacional" data-widget-id="motivacional">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="motivacional-icon">💪</div>
                <p class="motivacional-text">"${fraseHoje}"</p>
            </div>
        `;
    },

    renderRecordes() {
        return `
            <div class="dashboard-widget widget-card card-recordes" data-widget-id="recordes" onclick="App.goToSection('progresso')">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="feature-icon recordes-icon">🎯</div>
                <div class="feature-info">
                    <h3>Recordes</h3>
                    <p>Seus PRs</p>
                </div>
                <div class="recordes-preview" id="widget-recordes">
                    <span class="pr-badge">🏅 3 PRs</span>
                </div>
            </div>
        `;
    },

    renderPlanejamentoSemanal() {
        const diasPlanejados = AppState.profile?.dias_semana || AppState.profile?.dias_disponiveis?.length || 0;
        const historico = JSON.parse(localStorage.getItem('historico_treinos') || '[]');
        const hoje = new Date();
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        const treinosSemana = historico.filter(t => {
            const d = new Date(t.data || t.date || t.dia || hoje);
            return d >= inicioSemana;
        }).length;

        const cumprimento = diasPlanejados > 0 ? Math.min(100, Math.round((treinosSemana / diasPlanejados) * 100)) : 0;
        const diasDisponiveis = AppState.profile?.dias_disponiveis || [];

        return `
            <div class="dashboard-widget widget-card card-planning" data-widget-id="planejamento-semanal">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="planning-header">
                    <div class="planning-title">
                        <span>🗓️ Planejamento</span>
                        <small>${diasPlanejados || '0'} dias/sem</small>
                    </div>
                    <div class="planning-badge">${cumprimento}%</div>
                </div>
                <div class="planning-progress">
                    <div class="planning-bar" style="width:${cumprimento}%"></div>
                </div>
                <div class="planning-days">
                    ${['D','S','T','Q','Q','S','S'].map((d,i)=>{
                        const done = historico.some(h => new Date(h.data || h.date || h.dia || hoje).getDay() === i);
                        const planned = diasDisponiveis.includes(i) || (i>0 && i<=diasPlanejados);
                        return `<span class="planning-day ${done ? 'done' : ''} ${planned ? 'planned' : ''}">${d}</span>`;
                    }).join('')}
                </div>
            </div>
        `;
    },

    renderPRsVolume() {
        const historico = JSON.parse(localStorage.getItem('historico_treinos') || '[]');
        const volumeSemana = historico.slice(-5).reduce((acc, t) => acc + (t.volume_total || t.tonelagem || 0), 0);
        const prRecente = historico.slice(-5).find(t => t.pr_exercicio);
        const prTexto = prRecente ? `${prRecente.pr_exercicio}: ${prRecente.pr_carga || prRecente.pr_reps || ''}` : 'Sem PR recente';

        return `
            <div class="dashboard-widget widget-card card-prs" data-widget-id="prs-volume">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="prs-top">
                    <div>
                        <p class="prs-label">Volume semana</p>
                        <h3 class="prs-value">${volumeSemana ? volumeSemana + ' kg' : '—'}</h3>
                    </div>
                    <div class="prs-chip">🏆 PR</div>
                </div>
                <p class="prs-pr">${prTexto}</p>
            </div>
        `;
    },

    renderAquecimentoInteligente() {
        const grupos = AppState.profile?.objetivo || 'Full body';
        const passos = [
            '5 min cardio leve (bike/esteira)',
            'Mobilidade: ombro e quadril (2 min)',
            '2x10 agachamento peso corporal',
            '2x10 puxada elástica',
            '1x12 face pull leve'
        ];

        return `
            <div class="dashboard-widget widget-card card-aquecimento" data-widget-id="aquecimento-inteligente">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="aquecimento-header">
                    <span>🔥 Aquecimento</span>
                    <small>${grupos}</small>
                </div>
                <ul class="aquecimento-list">
                    ${passos.map(p => `<li>${p}</li>`).join('')}
                </ul>
            </div>
        `;
    },

    renderChecklistTecnico() {
        const dicas = [
            'Respire e faça brace antes da repetição',
            'Cadência controlada: 3-1-1',
            'Escápulas retraídas no supino/remo',
            'Joelhos alinhados com pés no agacho'
        ];

        return `
            <div class="dashboard-widget widget-card card-checklist" data-widget-id="checklist-tecnico">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="checklist-header">
                    <span>✔️ Checklist Técnico</span>
                    <small>Antes do treino</small>
                </div>
                <ul class="checklist-list">
                    ${dicas.map(d => `<li><span class="dot"></span>${d}</li>`).join('')}
                </ul>
            </div>
        `;
    },

    renderMacroTracker() {
        const macros = JSON.parse(localStorage.getItem('macros_hoje') || '{}');
        const alvo = { prot: 140, carb: 220, gord: 60, ...(macros.alvo || {}) };
        const atual = { prot: macros.prot || 0, carb: macros.carb || 0, gord: macros.gord || 0 };

        const pct = (v, t) => Math.min(100, t ? Math.round((v / t) * 100) : 0);

        return `
            <div class="dashboard-widget widget-card card-macros" data-widget-id="macro-tracker">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="macros-header">
                    <span>🥗 Macros de hoje</span>
                    <small>${atual.prot + atual.carb + atual.gord}/${alvo.prot + alvo.carb + alvo.gord}g</small>
                </div>
                <div class="macros-bars">
                    ${[['Proteína','prot','P'],['Carbo','carb','C'],['Gord','gord','G']].map(([label,key,s])=>`
                        <div class="macro-row">
                            <div class="macro-label">${label}</div>
                            <div class="macro-bar"><div style="width:${pct(atual[key], alvo[key])}%"></div></div>
                            <div class="macro-vals">${atual[key]}/${alvo[key]}g</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderSonoRecuperacao() {
        const sleep = JSON.parse(localStorage.getItem('sleep_last_night') || '{}');
        const horas = sleep.horas || 7.0;
        const qualidade = sleep.qualidade || 'OK';
        const nota = sleep.score || 78;
        return `
            <div class="dashboard-widget widget-card card-sono" data-widget-id="sono-recuperacao">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="sono-header">
                    <span>😴 Sono & Recuperação</span>
                    <small>${qualidade}</small>
                </div>
                <div class="sono-body">
                    <div class="sono-hours">${horas.toFixed(1)} h</div>
                    <div class="sono-score">Score ${nota}</div>
                </div>
                <div class="sono-meta">Meta 7-9h • Otimize para rendimento</div>
            </div>
        `;
    },

    renderHabitosSemana() {
        const habito = JSON.parse(localStorage.getItem('habito_semana') || '{}');
        const nome = habito.nome || 'Beber água 8x';
        const streak = habito.streak || 3;
        const meta = habito.meta || 7;
        const pct = Math.min(100, Math.round((streak / meta) * 100));
        return `
            <div class="dashboard-widget widget-card card-habitos" data-widget-id="habitos-semana">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="habitos-header">
                    <span>📅 Hábito da semana</span>
                    <small>${streak}/${meta} dias</small>
                </div>
                <p class="habito-nome">${nome}</p>
                <div class="habito-progress"><div style="width:${pct}%"></div></div>
                <div class="habito-note">Mantenha a sequência!</div>
            </div>
        `;
    },

    renderReadinessScore() {
        const readiness = JSON.parse(localStorage.getItem('readiness') || '{}');
        const score = readiness.score || 82;
        const estado = score >= 80 ? 'Pronto para treinar' : (score >= 60 ? 'Treino moderado' : 'Foque em recuperação');
        return `
            <div class="dashboard-widget widget-card card-readiness" data-widget-id="readiness-score">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="readiness-score">${score}</div>
                <div class="readiness-state">${estado}</div>
                <div class="readiness-note">Sono, descanso e carga influenciam.</div>
            </div>
        `;
    },

    renderTendenciaAgua() {
        const serie = JSON.parse(localStorage.getItem('agua_7d') || '[]');
        const dias = ['S','T','Q','Q','S','S','D'];
        const valores = dias.map((_,i) => serie[i] || 0);
        const max = Math.max(8, ...valores, 1);
        return `
            <div class="dashboard-widget widget-card card-agua-trend" data-widget-id="tendencia-agua">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="agua-trend-header">
                    <span>💧 Hidratação (7d)</span>
                    <small>Meta 8 copos/dia</small>
                </div>
                <div class="agua-trend-bars">
                    ${valores.map((v,i)=>{
                        const h = Math.round((v / max) * 100);
                        return `<div class="agua-bar"><div style="height:${h}%"></div><span>${dias[i]}</span></div>`;
                    }).join('')}
                </div>
            </div>
        `;
    },

    renderResumoSemanal() {
        const historico = JSON.parse(localStorage.getItem('historico_treinos') || '[]');
        const ultimos = historico.slice(-7);
        const treinos = ultimos.length;
        const volume = ultimos.reduce((acc,t)=>acc+(t.volume_total||t.tonelagem||0),0);
        const duracao = ultimos.reduce((acc,t)=>acc+(t.duracao||0),0);
        return `
            <div class="dashboard-widget widget-card card-resumo" data-widget-id="resumo-semanal">
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="resumo-header">
                    <h3>Resumo semanal</h3>
                    <span>${treinos} treinos</span>
                </div>
                <div class="resumo-grid">
                    <div><strong>${(volume||0)} kg</strong><small>Volume</small></div>
                    <div><strong>${Math.round(duracao||0)} min</strong><small>Duração total</small></div>
                    <div><strong>${Math.round((treinos/7)*100)}%</strong><small>Consistência</small></div>
                </div>
                <div class="resumo-note">Use o Coach IA para otimizar a próxima semana.</div>
            </div>
        `;
    }
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
            case 'info': return 'ℹ';
            default: return 'ℹ';
        }
    },
    
    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    warning(msg) { this.show(msg, 'warning'); },
    info(msg) { this.show(msg, 'info'); }
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
        console.log('[Auth] init');
        this.setupTabs();
        this.setupForms();
        this.checkSession();
    },
    
    setupTabs() {
        const tabs = document.querySelectorAll('.auth-tab');
        console.log('[Auth] setupTabs - encontradas:', tabs.length);
        
        tabs.forEach(tab => {
            tab.onclick = (e) => {
                e.preventDefault();
                const target = tab.dataset.tab;
                console.log('[Auth] tab clicada:', target);
                
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                
                tab.classList.add('active');
                const form = document.getElementById(target) || document.getElementById(`${target}-form`);
                if (form) {
                    form.classList.add('active');
                }
                const loginError = document.getElementById('login-error');
                const registerError = document.getElementById('register-error') || document.getElementById('registro-error');
                if (loginError) loginError.textContent = '';
                if (registerError) registerError.textContent = '';
            };
        });
    },
    
    setupForms() {
        const loginForm = document.getElementById('form-login') || document.getElementById('login-form');
        const registerForm = document.getElementById('form-registro') || document.getElementById('register-form');
        
        console.log('[Auth] setupForms - login:', !!loginForm, 'registro:', !!registerForm);
        
        if (loginForm) {
            loginForm.onsubmit = async (e) => {
                e.preventDefault();
                await this.handleLogin();
            };
        }
        
        if (registerForm) {
            registerForm.onsubmit = async (e) => {
                e.preventDefault();
                await this.handleRegister();
            };
        }
    },
    
    async handleLogin() {
        const email = document.getElementById('login-email')?.value?.trim();
        const senha = document.getElementById('login-senha')?.value;
        const errorEl = document.getElementById('login-error');
        
        if (!email || !senha) {
            if (errorEl) errorEl.textContent = 'Preencha todos os campos';
            return;
        }
        
        try {
            Loading.show('Entrando...');
            
            const resp = await fetch(API_BASE + '/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });
            
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || 'Credenciais inválidas');
            
            console.log('[Auth] Login OK:', data.nome);
            this.onLoginSuccess(data);
            
        } catch (err) {
            console.error('[Auth] Erro login:', err);
            if (errorEl) errorEl.textContent = err.message;
        } finally {
            Loading.hide();
        }
    },
    
    async handleRegister() {
        const nome = (document.getElementById('registro-nome') || document.getElementById('register-nome'))?.value?.trim();
        const email = (document.getElementById('registro-email') || document.getElementById('register-email'))?.value?.trim();
        const senha = (document.getElementById('registro-senha') || document.getElementById('register-senha'))?.value;
        const errorEl = document.getElementById('registro-error') || document.getElementById('register-error');
        
        if (!nome || !email || !senha) {
            if (errorEl) errorEl.textContent = 'Preencha todos os campos';
            return;
        }
        if (senha.length < 6) {
            if (errorEl) errorEl.textContent = 'Senha deve ter no mínimo 6 caracteres';
            return;
        }
        
        try {
            Loading.show('Criando conta...');
            
            const resp = await fetch(API_BASE + '/auth/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha })
            });
            
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || 'Erro ao criar conta');
            
            console.log('[Auth] Registro OK:', data.nome);
            this.onLoginSuccess(data);
            
        } catch (err) {
            console.error('[Auth] Erro registro:', err);
            if (errorEl) errorEl.textContent = err.message;
        } finally {
            Loading.hide();
        }
    },
    
    onLoginSuccess(data) {
        // Salvar no estado
        AppState.user = {
            id: data.user_id,
            nome: data.nome,
            email: data.email
        };
        AppState.token = data.token;
        AppState.profile = data.perfil || null;
        
        // Salvar no localStorage
        localStorage.setItem('auth', JSON.stringify({
            user: AppState.user,
            token: AppState.token,
            profile: AppState.profile
        }));
        
        // Mostrar app
        this.showApp();
    },
    
    checkSession() {
        const stored = localStorage.getItem('auth');
        
        if (stored) {
            try {
                const data = JSON.parse(stored);
                if (data.user && data.user.id && data.token) {
                    console.log('[Auth] Sessão encontrada:', data.user.nome);
                    AppState.user = data.user;
                    AppState.token = data.token;
                    AppState.profile = data.profile || null;
                    this.showApp();
                    return;
                }
            } catch (e) {
                console.error('[Auth] Erro ao restaurar sessão:', e);
            }
        }
        
        // Sem sessão válida - mostrar login
        this.showLogin();
    },
    
    showApp() {
        console.log('[Auth] showApp');
        const authScreen = document.getElementById('auth-screen');
        const app = document.getElementById('app');
        
        if (authScreen) authScreen.style.display = 'none';
        if (app) app.style.display = 'flex';
        
        // Verificar se precisa onboarding
        const needsOnboarding = !AppState.profile || !AppState.profile.objetivo;
        
        if (needsOnboarding) {
            console.log('[Auth] Mostrando onboarding');
            Onboarding.show();
        } else {
            console.log('[Auth] Iniciando App');
            App.init();
        }
    },
    
    showLogin() {
        console.log('[Auth] showLogin');
        const authScreen = document.getElementById('auth-screen');
        const app = document.getElementById('app');
        const onboarding = document.getElementById('onboarding');
        
        if (authScreen) authScreen.style.display = 'flex';
        if (app) app.style.display = 'none';
        if (onboarding) onboarding.style.display = 'none';
    },
    
    logout() {
        localStorage.removeItem('auth');
        AppState.user = null;
        AppState.token = null;
        AppState.profile = null;
        this.showLogin();
        Toast.info('Você saiu da sua conta');
    },
    
    // Mantendo compatibilidade com código existente
    handleLoginSuccess(data) {
        this.onLoginSuccess(data);
    }
};

// =====================================================
// ONBOARDING
// =====================================================

const Onboarding = {
    totalSteps: 5,
    listenersInitialized: false,
    
    show() {
        console.log('[Onboarding] show - iniciando...');
        const onboarding = $('#onboarding');
        console.log('[Onboarding] show - element:', onboarding);
        if (onboarding) onboarding.style.display = 'flex';
        
        // Resetar step para o primeiro
        AppState.onboardingStep = 1;
        
        // Limpar campos do Step 1
        const idadeInput = $('#onb-idade');
        const pesoInput = $('#onb-peso');
        const alturaInput = $('#onb-altura');
        if (idadeInput) idadeInput.value = '';
        if (pesoInput) pesoInput.value = '';
        if (alturaInput) alturaInput.value = '';
        
        // Resetar seleção de sexo (remover active de todos)
        $$('#step-1 .pill').forEach(p => p.classList.remove('active'));
        
        // Resetar dados do onboarding
        AppState.onboardingData = {
            idade: null,
            peso: null,
            altura: null,
            sexo: 'M',
            objetivo: null,
            nivel: null,
            dias_disponiveis: [1, 2, 3, 4], // 4 dias padrão
            duracao: 60, // 1h padrão
            local: 'academia'
        };
        
        // Resetar visuais dos outros steps
        $$('.goal-card').forEach(c => c.classList.remove('active'));
        $$('.level-card').forEach(c => c.classList.remove('active'));
        $$('.day-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.value === '4');
        });
        $$('#step-4 .pill').forEach(p => {
            p.classList.toggle('active', p.dataset.value === '60');
        });
        $$('.location-card').forEach(c => {
            c.classList.toggle('active', c.dataset.value === 'academia');
        });
        
        console.log('[Onboarding] show - updateUI...');
        this.updateUI();
        
        // Só adicionar listeners uma vez
        if (!this.listenersInitialized) {
            console.log('[Onboarding] show - setupListeners...');
            this.setupListeners();
            this.listenersInitialized = true;
        }
        console.log('[Onboarding] show - completo');
    },
    
    hide() {
        const onboarding = $('#onboarding');
        if (onboarding) onboarding.style.display = 'none';
        App.init();
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
                ? 'Começar <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'
                : 'Continuar <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
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
        $$('#step-1 .pill').forEach(pill => {
            pill.addEventListener('click', () => {
                $$('#step-1 .pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                AppState.onboardingData.sexo = pill.dataset.value;
            });
        });
        
        // Goal cards
        $$('.goal-card').forEach(card => {
            card.addEventListener('click', () => {
                $$('.goal-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                AppState.onboardingData.objetivo = card.dataset.value;
            });
        });
        
        // Level cards
        $$('.level-card').forEach(card => {
            card.addEventListener('click', () => {
                $$('.level-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                AppState.onboardingData.nivel = card.dataset.value;
            });
        });
        
        // Days buttons - seleção única de quantidade de dias
        $$('.day-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.day-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const numDays = parseInt(btn.dataset.value);
                // Armazena como array com os dias da semana
                AppState.onboardingData.dias_disponiveis = Array.from({length: numDays}, (_, i) => i + 1);
                this.updateDaysLabel();
            });
        });
        
        // Tempo de treino pills
        $$('#step-4 .pill').forEach(pill => {
            pill.addEventListener('click', () => {
                $$('#step-4 .pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                AppState.onboardingData.duracao = parseInt(pill.dataset.value);
                console.log('[Onboarding] Duração selecionada:', AppState.onboardingData.duracao);
            });
        });
        
        // Location cards
        $$('.location-card').forEach(card => {
            card.addEventListener('click', () => {
                $$('.location-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                AppState.onboardingData.local = card.dataset.value;
            });
        });
    },
    
    updateDaysLabel() {
        const count = AppState.onboardingData.dias_disponiveis.length;
        const label = $('#days-label');
        if (label) {
            label.textContent = count === 0 
                ? 'Selecione os dias' 
                : `${count} dia${count > 1 ? 's' : ''} por semana`;
        }
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
                // Altura vem em cm, converter para metros
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
                if (!alturaCm || alturaCm < 100 || alturaCm > 250) {
                    Toast.error('Informe altura válida em cm (ex: 175)');
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
            // Verificar se user existe
            if (!AppState.user || !AppState.user.id) {
                console.error('[Onboarding] Usuário não encontrado:', AppState.user);
                Toast.error('Sessão expirada. Faça login novamente.');
                Auth.showLogin();
                return;
            }
            
            const userId = AppState.user.id;
            const local = AppState.onboardingData.local;
            const diasArray = AppState.onboardingData.dias_disponiveis;
            
            console.log('[Onboarding] complete - userId:', userId);
            console.log('[Onboarding] complete - dados:', AppState.onboardingData);
            
            // Calcular IMC
            const peso = AppState.onboardingData.peso;
            const alturaCm = AppState.onboardingData.altura;
            const alturaM = alturaCm > 3 ? alturaCm / 100 : alturaCm;
            const imc = peso / (alturaM * alturaM);
            
            console.log('[Onboarding] IMC calculado:', imc.toFixed(1));
            
            const profileData = {
                nome: AppState.user.nome,
                email: AppState.user.email,
                idade: AppState.onboardingData.idade,
                peso_kg: peso,
                altura_cm: alturaCm > 3 ? alturaCm : alturaCm * 100,
                sexo: AppState.onboardingData.sexo,
                objetivo: AppState.onboardingData.objetivo,
                nivel: AppState.onboardingData.nivel,
                dias_semana: Array.isArray(diasArray) ? diasArray.length : diasArray,
                duracao_treino_min: AppState.onboardingData.duracao || 60,
                local: local,
                equipamentos: local === 'academia' 
                    ? ['halteres', 'barras', 'maquinas', 'cabos'] 
                    : local === 'casa'
                    ? ['halteres', 'peso_corporal']
                    : ['peso_corporal']
            };
            
            console.log('[Onboarding] Enviando para API:', `/perfil/${userId}/completar`);
            console.log('[Onboarding] Payload:', JSON.stringify(profileData, null, 2));
            
            const result = await Utils.fetch(`/perfil/${userId}/completar`, {
                method: 'POST',
                body: JSON.stringify(profileData)
            });
            
            console.log('[Onboarding] Resposta:', result);
            
            // Guardar dados do perfil completo incluindo IMC
            AppState.profile = { 
                objetivo: AppState.onboardingData.objetivo,
                peso: peso,
                altura: alturaCm,
                idade: AppState.onboardingData.idade,
                imc: imc,
                nivel: AppState.onboardingData.nivel,
                dias_disponiveis: diasArray,
                duracao: AppState.onboardingData.duracao,
                local: local,
                medidas: {
                    peso,
                    braco: null,
                    peito: null,
                    cintura: null
                }
            };

            // Inicializar histórico de medidas para progresso
            const historicoMedidas = JSON.parse(localStorage.getItem('historico_medidas') || '[]');
            historicoMedidas.push({
                data: new Date().toISOString(),
                peso,
                braco: null,
                peito: null,
                cintura: null
            });
            localStorage.setItem('historico_medidas', JSON.stringify(historicoMedidas));
            localStorage.setItem('medidas_corporais', JSON.stringify(AppState.profile.medidas));
            
            // Guardar treino gerado
            if (result.treino) {
                AppState.workouts = [result.treino];
                localStorage.setItem('treino_atual', JSON.stringify(result.treino));
                // Sincronizar seção Sua Divisão e card Minha Ficha
                if (App.updateSplitPreview) App.updateSplitPreview();
                if (App.updateFichaAtualCard) App.updateFichaAtualCard();
            }
            
            // Atualizar localStorage
            const stored = localStorage.getItem('auth');
            if (stored) {
                const authData = JSON.parse(stored);
                authData.perfilCompleto = true;
                localStorage.setItem('auth', JSON.stringify(authData));
            }
            
            // Limpar flags de "pular onboarding" pois agora está completo
            localStorage.removeItem('onboarding_skipped');
            localStorage.removeItem('onboarding_later');
            localStorage.removeItem('onboarding_dismissed_' + userId);
            
            Toast.success('Perfil completo! Seu treino personalizado está pronto!');
            this.hide();
            
        } catch (error) {
            console.error('[Onboarding] Erro ao salvar perfil:', error);
            Toast.error('Erro ao salvar perfil. Tente novamente.');
        } finally {
            Loading.hide();
        }
    }
};

// =====================================================
// APLICATIVO PRINCIPAL
// =====================================================

// =====================================================
// GERADOR DE TREINO (Plano Semanal)
// Inspirado em: Fitbod, Hevy, Strong
// =====================================================

const WorkoutGenerator = {
    version: 1,

    objetivoLabel(objetivo) {
        const map = {
            hipertrofia: 'Hipertrofia',
            ganho_muscular: 'Hipertrofia',
            emagrecimento: 'Emagrecimento',
            perda_gordura: 'Emagrecimento',
            forca: 'Força',
            condicionamento: 'Condicionamento',
            saude: 'Condicionamento'
        };
        return map[String(objetivo || '').toLowerCase()] || 'Hipertrofia';
    },

    normalizeObjetivo(objetivo) {
        const v = String(objetivo || '').toLowerCase();
        if (v === 'ganho_muscular') return 'hipertrofia';
        if (v === 'perda_gordura') return 'emagrecimento';
        if (v === 'saude') return 'condicionamento';
        return v || 'hipertrofia';
    },

    normalizeNivel(nivel) {
        const v = String(nivel || '').toLowerCase();
        if (['iniciante', 'intermediario', 'avancado'].includes(v)) return v;
        return 'iniciante';
    },

    normalizeLocal(local) {
        const v = String(local || '').toLowerCase();
        if (['academia', 'casa', 'ar_livre'].includes(v)) return v;
        return 'academia';
    },

    clampDays(days) {
        const n = parseInt(days, 10);
        if (Number.isFinite(n)) return Math.min(6, Math.max(1, n));
        return 4;
    },

    getRepScheme(objetivo, nivel) {
        const o = this.normalizeObjetivo(objetivo);
        const n = this.normalizeNivel(nivel);

        // Defaults por objetivo (ajustados por nível)
        const schemes = {
            hipertrofia: { reps: '8-12', rest: '60-90s', sets: n === 'iniciante' ? 3 : (n === 'intermediario' ? 3 : 4) },
            emagrecimento: { reps: '12-15', rest: '45-75s', sets: n === 'iniciante' ? 2 : 3 },
            forca: { reps: '4-6', rest: '120-180s', sets: n === 'iniciante' ? 3 : 4 },
            condicionamento: { reps: '10-15', rest: '45-60s', sets: n === 'iniciante' ? 2 : 3 }
        };

        return schemes[o] || schemes.hipertrofia;
    },

    poolsByLocal(local) {
        const l = this.normalizeLocal(local);
        const base = {
            peito: ['Supino Reto', 'Supino Inclinado', 'Crucifixo', 'Crossover', 'Flexão'],
            costas: ['Puxada na Barra/Polia', 'Remada Curvada', 'Remada Baixa', 'Remada Unilateral', 'Barra Fixa'],
            pernas: ['Agachamento', 'Leg Press', 'Cadeira Extensora', 'Mesa Flexora', 'Levantamento Terra Romeno', 'Panturrilha'],
            ombros: ['Desenvolvimento', 'Elevação Lateral', 'Elevação Frontal', 'Crucifixo Inverso', 'Face Pull'],
            biceps: ['Rosca Direta', 'Rosca Alternada', 'Rosca Martelo', 'Rosca Scott'],
            triceps: ['Tríceps Testa', 'Tríceps Corda', 'Tríceps Francês', 'Mergulho'],
            core: ['Prancha', 'Abdominal Crunch', 'Elevação de Pernas', 'Abdominal Infra', 'Prancha Lateral'],
            cardio: ['Bicicleta', 'Esteira', 'Remo', 'Elíptico', 'Corda']
        };

        if (l === 'casa') {
            return {
                peito: ['Flexão', 'Flexão Inclinada', 'Flexão Diamante', 'Supino com Halteres (se houver)'],
                costas: ['Remada com Halteres', 'Remada com Elástico', 'Superman', 'Pull-up (barra)'],
                pernas: ['Agachamento', 'Agachamento Búlgaro', 'Avanço', 'Stiff com Halteres', 'Panturrilha'],
                ombros: ['Desenvolvimento com Halteres', 'Elevação Lateral', 'Pike Push-up'],
                biceps: ['Rosca Alternada', 'Rosca Martelo', 'Rosca Concentrada'],
                triceps: ['Tríceps Banco', 'Tríceps Francês', 'Flexão Fechada'],
                core: base.core,
                cardio: ['Corda', 'Burpee', 'Polichinelo', 'Corrida estacionária']
            };
        }

        return base;
    },

    split(days) {
        const d = this.clampDays(days);
        // Retorna uma lista de “focos” por dia, no estilo apps do mercado.
        if (d === 1) return [{ key: 'full', label: 'Full Body', groups: 'Corpo todo' }];
        if (d === 2) return [
            { key: 'upper', label: 'Upper', groups: 'Peito • Costas • Ombro • Braços' },
            { key: 'lower', label: 'Lower', groups: 'Pernas • Glúteos • Core' }
        ];
        if (d === 3) return [
            { key: 'push', label: 'Push', groups: 'Peito • Ombro • Tríceps' },
            { key: 'pull', label: 'Pull', groups: 'Costas • Bíceps' },
            { key: 'legs', label: 'Legs', groups: 'Pernas • Core' }
        ];
        if (d === 4) return [
            { key: 'upperA', label: 'Upper A', groups: 'Peito • Costas • Ombro' },
            { key: 'lowerA', label: 'Lower A', groups: 'Pernas • Core' },
            { key: 'upperB', label: 'Upper B', groups: 'Peito • Costas • Braços' },
            { key: 'lowerB', label: 'Lower B', groups: 'Pernas • Posterior' }
        ];
        if (d === 5) return [
            { key: 'push', label: 'Push', groups: 'Peito • Ombro • Tríceps' },
            { key: 'pull', label: 'Pull', groups: 'Costas • Bíceps' },
            { key: 'legs', label: 'Legs', groups: 'Pernas • Core' },
            { key: 'upper', label: 'Upper', groups: 'Superior (volume)' },
            { key: 'lower', label: 'Lower', groups: 'Inferior (volume)' }
        ];
        // 6
        return [
            { key: 'push', label: 'Push', groups: 'Peito • Ombro • Tríceps' },
            { key: 'pull', label: 'Pull', groups: 'Costas • Bíceps' },
            { key: 'legs', label: 'Legs', groups: 'Pernas • Core' },
            { key: 'push2', label: 'Push 2', groups: 'Peito • Ombro • Tríceps' },
            { key: 'pull2', label: 'Pull 2', groups: 'Costas • Bíceps' },
            { key: 'legs2', label: 'Legs 2', groups: 'Pernas • Core' }
        ];
    },

    pickUnique(pool, count) {
        const arr = Array.isArray(pool) ? [...pool] : [];
        const picked = [];
        while (arr.length > 0 && picked.length < count) {
            const idx = Math.floor(Math.random() * arr.length);
            picked.push(arr.splice(idx, 1)[0]);
        }
        return picked;
    },

    buildDayExercises(focusKey, prefs) {
        const pools = this.poolsByLocal(prefs.local);
        const scheme = this.getRepScheme(prefs.objetivo, prefs.nivel);

        const add = (names, sets = scheme.sets, reps = scheme.reps, rest = scheme.rest) =>
            names.map(nome => ({ nome, series: sets, repeticoes: reps, descanso: rest }));

        const baseCount = this.normalizeNivel(prefs.nivel) === 'iniciante' ? 5 : 6;
        const coreCount = 1;

        if (focusKey === 'full') {
            const main = [
                ...this.pickUnique(pools.pernas, 2),
                ...this.pickUnique(pools.peito, 1),
                ...this.pickUnique(pools.costas, 1),
                ...this.pickUnique(pools.ombros, 1)
            ].slice(0, baseCount);
            const core = this.pickUnique(pools.core, coreCount);
            return [...add(main), ...add(core, 3, '30-45s', '30-45s')];
        }

        if (focusKey.includes('upper')) {
            const main = [
                ...this.pickUnique(pools.peito, 2),
                ...this.pickUnique(pools.costas, 2),
                ...this.pickUnique(pools.ombros, 1)
            ].slice(0, baseCount);
            const arms = [...this.pickUnique(pools.biceps, 1), ...this.pickUnique(pools.triceps, 1)];
            return [...add(main), ...add(arms, 3, scheme.reps, scheme.rest)];
        }

        if (focusKey.includes('lower')) {
            const main = this.pickUnique(pools.pernas, baseCount);
            const core = this.pickUnique(pools.core, coreCount);
            return [...add(main), ...add(core, 3, '30-45s', '30-45s')];
        }

        if (focusKey.startsWith('push')) {
            const main = [
                ...this.pickUnique(pools.peito, 2),
                ...this.pickUnique(pools.ombros, 2),
                ...this.pickUnique(pools.triceps, 2)
            ].slice(0, baseCount);
            return add(main);
        }

        if (focusKey.startsWith('pull')) {
            const main = [
                ...this.pickUnique(pools.costas, 3),
                ...this.pickUnique(pools.biceps, 2),
                ...this.pickUnique(pools.ombros, 1)
            ].slice(0, baseCount);
            return add(main);
        }

        // legs
        const main = this.pickUnique(pools.pernas, baseCount);
        const core = this.pickUnique(pools.core, coreCount);
        return [...add(main), ...add(core, 3, '30-45s', '30-45s')];
    },

    generatePlan({ userId, objetivo, dias, nivel, local }) {
        const prefs = {
            objetivo: this.normalizeObjetivo(objetivo),
            dias: this.clampDays(dias),
            nivel: this.normalizeNivel(nivel),
            local: this.normalizeLocal(local)
        };

        const split = this.split(prefs.dias);
        const divisao = prefs.dias <= 2 ? 'AB' : (prefs.dias <= 3 ? 'ABC' : (prefs.dias <= 4 ? 'ABCD' : 'PPL'));
        const objetivoLabel = this.objetivoLabel(prefs.objetivo);

        const diasTreino = split.map((s, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const dayName = `Treino ${letter} - ${s.label}`;
            return {
                nome: dayName,
                grupos: s.groups,
                exercicios: this.buildDayExercises(s.key, prefs),
                meta: {
                    focus_key: s.key
                }
            };
        });

        return {
            nome: `Plano ${objetivoLabel} (${prefs.dias}x/semana)`,
            descricao: `Gerado automaticamente • ${objetivoLabel} • ${prefs.nivel}`,
            divisao,
            dias: diasTreino,
            meta: {
                generator_version: this.version,
                objetivo: prefs.objetivo,
                dias_semana: prefs.dias,
                nivel: prefs.nivel,
                local: prefs.local,
                user_id: userId || null,
                generated_at: new Date().toISOString()
            }
        };
    }
};

const App = {
    initialized: false,
    
    init() {
        console.log('[App] init - iniciando...');
        
        // VALIDAÇÃO: Usuário deve estar autenticado
        if (!AppState.user || !AppState.user.id) {
            console.log('[App] init - usuário não autenticado, redirecionando para login');
            Auth.showLogin();
            return;
        }

        // Sempre atualizar header e dashboard
        this.updateHeader();
        this.loadDashboard();

        // Garantir que a Home esteja ativa
        this.switchTab(AppState.currentTab || 'home');

        // SEMPRE configurar navegação para garantir que funcione
        this.setupNavigation();

        // Inicializar outros módulos apenas uma vez
        if (!this.initialized) {
            this.initialized = true;
            this.setupQuickActions();
            Chat.init();
            Profile.init();
        }
        
        console.log('[App] init - concluído');
    },
    
    updateHeader() {
        const greeting = Utils.getGreeting();
        const nome = AppState.user?.nome?.split(' ')[0] || 'Atleta';
        const initials = Utils.getInitials(AppState.user?.nome);
        
        const greetingEl = $('#greeting-time');
        const nameEl = $('#greeting-name');
        const avatarEl = $('#user-avatar');
        
        if (greetingEl) greetingEl.textContent = greeting;
        if (nameEl) nameEl.textContent = nome;
        if (avatarEl) avatarEl.textContent = initials;
        
        // Profile - usar preferências atualizadas
        const prefs = this.getWorkoutPrefsFromProfile();
        const profileAvatar = $('#profile-avatar-letter');
        const profileName = $('#profile-name');
        const profileGoal = $('#profile-goal');
        
        if (profileAvatar) profileAvatar.textContent = initials;
        if (profileName) profileName.textContent = AppState.user?.nome || 'Usuário';
        if (profileGoal) {
            const objetivoFormatado = this.formatObjetivo(prefs.objetivo);
            profileGoal.textContent = `Objetivo: ${objetivoFormatado} • ${prefs.dias}x/sem`;
        }
    },

    formatObjetivo(objetivo) {
        const map = {
            'hipertrofia': 'Hipertrofia',
            'forca': 'Força',
            'emagrecimento': 'Emagrecimento',
            'condicionamento': 'Condicionamento'
        };
        return map[objetivo] || objetivo || 'Hipertrofia';
    },
    
    setupNavigation() {
        console.log('[App] setupNavigation - configurando navegação...');
        const navItems = $$('.nav-item');
        console.log('[App] setupNavigation - encontrados', navItems.length, 'nav-items');
        
        navItems.forEach((item, index) => {
            // Usar onclick para evitar listeners duplicados
            item.onclick = (e) => {
                e.preventDefault();
                const tab = item.dataset.tab;
                console.log('[App] nav-item clicado:', tab);
                if (tab) {
                    this.switchTab(tab);
                }
            };
        });
        
        // Logout
        const logoutBtn = $('#btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Deseja sair da sua conta?')) {
                    Auth.logout();
                }
            });
        }
    },
    
    setupQuickActions() {
        // Botões de ação rápida na Home
        $$('.action-card').forEach(card => {
            card.addEventListener('click', () => {
                const action = card.dataset.action;
                switch(action) {
                    case 'coach':
                        this.switchTab('coach');
                        break;
                    case 'historico':
                    case 'progresso':
                        this.switchTab('progresso');
                        break;
                    case 'medidas':
                        this.switchTab('progresso');
                        Toast.info('Adicione suas medidas para acompanhar evolução');
                        break;
                }
            });
        });
        
        // Botão Iniciar Treino
        const btnStartWorkout = $('.btn-start-workout');
        if (btnStartWorkout) {
            btnStartWorkout.addEventListener('click', () => {
                this.startWorkout();
            });
        }
        
        // Botão Ver Treino
        const btnVerTreino = $('#btn-ver-treino');
        if (btnVerTreino) {
            btnVerTreino.addEventListener('click', () => {
                this.switchTab('treino');
            });
        }
        
        // Botões do Header
        const btnNotifications = $('#btn-notifications');
        if (btnNotifications) {
            btnNotifications.addEventListener('click', () => {
                Toast.info('Nenhuma notificação no momento');
            });
        }
        
        const btnSettings = $('#btn-settings');
        if (btnSettings) {
            btnSettings.addEventListener('click', () => {
                this.switchTab('perfil');
            });
        }
        
        // Botão Editar Perfil
        const btnEditProfile = $('#btn-edit-profile');
        if (btnEditProfile) {
            btnEditProfile.addEventListener('click', () => {
                Toast.info('Edição de perfil em desenvolvimento');
            });
        }
        
        // Botões do banner de onboarding
        const btnCompleteOnboarding = $('#btn-complete-onboarding');
        if (btnCompleteOnboarding) {
            btnCompleteOnboarding.addEventListener('click', () => {
                this.hideOnboardingReminder();
                Onboarding.show();
            });
        }
        
        const btnDismissReminder = $('#btn-dismiss-reminder');
        if (btnDismissReminder) {
            btnDismissReminder.addEventListener('click', () => {
                // Ocultar temporariamente (até próximo login)
                localStorage.setItem('onboarding_skipped', AppState.user.id);
                this.hideOnboardingReminder();
                Toast.info('Você pode completar seu perfil a qualquer momento');
            });
        }
    },
    
    showOnboardingReminder() {
        const reminder = $('#onboarding-reminder');
        if (reminder) {
            // Verificar se não foi dispensado permanentemente
            const dismissed = localStorage.getItem('onboarding_dismissed_' + AppState.user.id);
            if (!dismissed) {
                reminder.style.display = 'flex';
            }
        }
    },
    
    hideOnboardingReminder() {
        const reminder = $('#onboarding-reminder');
        if (reminder) {
            reminder.style.display = 'none';
        }
    },
    
    startWorkout() {
        // Usar o sistema de treino ativo profissional
        ActiveWorkout.start();
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
        if (tab === 'perfil') {
            this.loadProfile();
        } else if (tab === 'progresso') {
            this.loadProgress();
        } else if (tab === 'treino') {
            this.loadTreinoTab();
        }

        // Mostrar botão flutuante só na Home
        const floating = document.getElementById('btn-customize-floating');
        if (floating) {
            floating.style.display = tab === 'home' ? 'flex' : 'none';
        }
    },

    // Navegação da Home para seções específicas
    goToSection(section) {
        switch(section) {
            case 'treino-hoje':
                // Iniciar treino diretamente
                ActiveWorkout.start();
                break;
            
            case 'progresso':
                this.switchTab('progresso');
                break;
            
            case 'coach':
                this.switchTab('coach');
                break;
            
            case 'templates':
                WorkoutTemplates.showTemplateSelector();
                break;
            
            case 'conquistas':
                this.showAchievements();
                break;
            
            case 'divisao':
                this.switchTab('treino');
                break;
            
            default:
                console.log('Seção não encontrada:', section);
        }
    },
    
    loadDashboard() {
        // Inicializar sistema de widgets
        DashboardWidgets.init();
        
        // Carregar perfil completo para atualizar stats
        this.loadUserProfile();
        
        // Treino do dia
        this.loadTodayWorkout();
        
        // Renderizar dashboard com widgets
        this.renderDashboardWidgets();
        
        // Week progress
        this.updateWeekProgress();
        
        // Setup drag and drop
        this.setupDashboardDragDrop();

        // Garantir que o botão de personalização apareça
        this.ensureCustomizeButton();
    },

    ensureCustomizeButton() {
        // Botão existente no header
        const headerBtn = document.getElementById('btn-customize-dashboard');
        if (headerBtn) {
            headerBtn.style.display = 'flex';
            headerBtn.onclick = () => this.openDashboardCustomizer();
        }

        // Botão flutuante de fallback (caso o header não seja renderizado por algum motivo)
        let floating = document.getElementById('btn-customize-floating');
        if (!floating) {
            floating = document.createElement('button');
            floating.id = 'btn-customize-floating';
            floating.className = 'btn-customize-floating';
            floating.innerHTML = '<span>Personalizar</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';
            floating.onclick = () => this.openDashboardCustomizer();
            document.body.appendChild(floating);
        }
    },

    renderDashboardWidgets() {
        const container = document.getElementById('home-dashboard');
        if (!container) return;

        const visibleWidgets = DashboardWidgets.getVisibleWidgets();
        
        // HEADER DE BRANDING
        let html = `
            <div class="dashboard-header-brand">
                <h1>
                    <div class="dashboard-header-brand-icon">💪</div>
                    SHAIPADOS
                </h1>
                <div class="badge-brand">Pronto para treinar</div>
            </div>
        `;
        
        // Agrupar widgets por tamanho para renderização
        let halfWidgets = [];

        visibleWidgets.forEach(widget => {
            if (widget.size === 'half') {
                halfWidgets.push(widget);
                if (halfWidgets.length === 2) {
                    html += `<div class="dashboard-grid">`;
                    halfWidgets.forEach(w => {
                        html += DashboardWidgets.renderWidget(w);
                    });
                    html += `</div>`;
                    halfWidgets = [];
                }
            } else {
                // Fechar widgets half pendentes
                if (halfWidgets.length > 0) {
                    html += `<div class="dashboard-grid">`;
                    halfWidgets.forEach(w => {
                        html += DashboardWidgets.renderWidget(w);
                    });
                    html += `</div>`;
                    halfWidgets = [];
                }
                html += DashboardWidgets.renderWidget(widget);
            }
        });

        // Widgets half restantes
        if (halfWidgets.length > 0) {
            html += `<div class="dashboard-grid">`;
            halfWidgets.forEach(w => {
                html += DashboardWidgets.renderWidget(w);
            });
            html += `</div>`;
        }

        container.innerHTML = html;

        // Atualizar dados dinâmicos após renderização
        this.updateHeroCard();
        this.updateHomeStats();
        this.updateSplitSubtitle();
        this.updateSplitPreview();
        this.updateProximosTreinos();
    },

    setupDashboardDragDrop() {
        const container = document.getElementById('home-dashboard');
        if (!container) return;

        const widgets = container.querySelectorAll('.dashboard-widget');
        
        widgets.forEach((widget, index) => {
            const handle = widget.querySelector('.widget-drag-handle');
            if (!handle) return;

            // Touch events para mobile
            let touchStartY = 0;
            let touchCurrentY = 0;
            let isDragging = false;

            handle.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
                isDragging = true;
                widget.classList.add('dragging');
                e.preventDefault();
            }, { passive: false });

            handle.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                touchCurrentY = e.touches[0].clientY;
                const diff = touchCurrentY - touchStartY;
                widget.style.transform = `translateY(${diff}px)`;
                
                // Encontrar widget sobre o qual está
                const rect = widget.getBoundingClientRect();
                const centerY = rect.top + rect.height / 2;
                
                widgets.forEach((otherWidget, otherIndex) => {
                    if (otherWidget === widget) return;
                    const otherRect = otherWidget.getBoundingClientRect();
                    if (centerY > otherRect.top && centerY < otherRect.bottom) {
                        otherWidget.classList.add('drag-over');
                        DashboardWidgets.draggedOverItem = otherIndex;
                    } else {
                        otherWidget.classList.remove('drag-over');
                    }
                });
                
                e.preventDefault();
            }, { passive: false });

            handle.addEventListener('touchend', (e) => {
                if (!isDragging) return;
                isDragging = false;
                widget.classList.remove('dragging');
                widget.style.transform = '';
                
                widgets.forEach(w => w.classList.remove('drag-over'));

                if (DashboardWidgets.draggedOverItem !== null && DashboardWidgets.draggedOverItem !== index) {
                    DashboardWidgets.reorderWidgets(index, DashboardWidgets.draggedOverItem);
                    DashboardWidgets.saveConfig();
                    this.renderDashboardWidgets();
                    this.setupDashboardDragDrop();
                }
                DashboardWidgets.draggedOverItem = null;
            });

            // Mouse events para desktop
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                widget.setAttribute('draggable', 'true');
            });

            widget.addEventListener('dragstart', (e) => {
                widget.classList.add('dragging');
                DashboardWidgets.draggedItem = index;
                e.dataTransfer.effectAllowed = 'move';
            });

            widget.addEventListener('dragend', (e) => {
                widget.classList.remove('dragging');
                widget.removeAttribute('draggable');
                widgets.forEach(w => w.classList.remove('drag-over'));

                if (DashboardWidgets.draggedOverItem !== null && DashboardWidgets.draggedOverItem !== DashboardWidgets.draggedItem) {
                    DashboardWidgets.reorderWidgets(DashboardWidgets.draggedItem, DashboardWidgets.draggedOverItem);
                    DashboardWidgets.saveConfig();
                    this.renderDashboardWidgets();
                    this.setupDashboardDragDrop();
                }
                DashboardWidgets.draggedItem = null;
                DashboardWidgets.draggedOverItem = null;
            });

            widget.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                widget.classList.add('drag-over');
                DashboardWidgets.draggedOverItem = index;
            });

            widget.addEventListener('dragleave', (e) => {
                widget.classList.remove('drag-over');
            });
        });
    },

    openDashboardCustomizer() {
        const modal = document.getElementById('modal-dashboard-customizer');
        if (!modal) return;

        this.renderCustomizerWidgets();
        modal.classList.add('active');
        
        // Event listeners
        const btnSave = document.getElementById('btn-save-dashboard');
        const btnReset = document.getElementById('btn-reset-dashboard');
        const btnClose = modal.querySelector('[data-close]');

        if (btnSave) {
            btnSave.onclick = () => {
                DashboardWidgets.saveConfig();
                DashboardWidgets.loadConfig();
                this.renderDashboardWidgets();
                this.setupDashboardDragDrop();
                modal.classList.remove('active');
                Toast.success('Dashboard personalizado salvo!');
            };
        }

        if (btnReset) {
            btnReset.onclick = () => {
                DashboardWidgets.resetToDefault();
                this.renderCustomizerWidgets();
                this.renderDashboardWidgets();
                this.setupDashboardDragDrop();
                Toast.info('Dashboard restaurado ao padrão');
            };
        }

        if (btnClose) {
            btnClose.onclick = () => {
                modal.classList.remove('active');
            };
        }
    },

    renderCustomizerWidgets() {
        const activeList = document.getElementById('customizer-widgets-list');
        const availableList = document.getElementById('available-widgets-list');
        if (!activeList || !availableList) return;

        const visibleWidgets = DashboardWidgets.getVisibleWidgets();
        const hiddenWidgets = DashboardWidgets.getHiddenWidgets();

        // Widgets ativos
        activeList.innerHTML = visibleWidgets.map((widget, index) => `
            <div class="customizer-widget-item active" data-widget-id="${widget.id}">
                <div class="widget-item-drag">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="widget-item-icon">${widget.icon}</div>
                <div class="widget-item-info">
                    <strong>${widget.name}</strong>
                    <span>${widget.description}</span>
                </div>
                ${widget.required ? '<span class="widget-required">Obrigatório</span>' : `
                    <button class="widget-item-remove" onclick="App.toggleDashboardWidget('${widget.id}')">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                `}
            </div>
        `).join('');

        // Widgets disponíveis (não ativos)
        availableList.innerHTML = hiddenWidgets.length === 0 ? 
            '<p class="no-widgets-available">Todos os widgets estão no dashboard</p>' :
            hiddenWidgets.map(widget => `
                <div class="customizer-widget-item available" data-widget-id="${widget.id}" onclick="App.toggleDashboardWidget('${widget.id}')">
                    <div class="widget-item-icon">${widget.icon}</div>
                    <div class="widget-item-info">
                        <strong>${widget.name}</strong>
                        <span>${widget.description}</span>
                    </div>
                    <div class="widget-item-add">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                    </div>
                </div>
            `).join('');

        // Setup drag in customizer
        this.setupCustomizerDragDrop();
    },

    setupCustomizerDragDrop() {
        const list = document.getElementById('customizer-widgets-list');
        if (!list) return;

        const items = list.querySelectorAll('.customizer-widget-item');
        
        items.forEach((item, index) => {
            const dragHandle = item.querySelector('.widget-item-drag');
            if (!dragHandle) return;

            dragHandle.addEventListener('mousedown', () => {
                item.setAttribute('draggable', 'true');
            });

            item.addEventListener('dragstart', (e) => {
                item.classList.add('dragging');
                DashboardWidgets.draggedItem = index;
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                item.removeAttribute('draggable');
                items.forEach(i => i.classList.remove('drag-over'));

                if (DashboardWidgets.draggedOverItem !== null && DashboardWidgets.draggedOverItem !== DashboardWidgets.draggedItem) {
                    DashboardWidgets.reorderWidgets(DashboardWidgets.draggedItem, DashboardWidgets.draggedOverItem);
                    this.renderCustomizerWidgets();
                }
                DashboardWidgets.draggedItem = null;
                DashboardWidgets.draggedOverItem = null;
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                item.classList.add('drag-over');
                DashboardWidgets.draggedOverItem = index;
            });

            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });
        });
    },

    toggleDashboardWidget(widgetId) {
        DashboardWidgets.toggleWidget(widgetId);
        this.renderCustomizerWidgets();
    },

    addWater() {
        let agua = parseInt(localStorage.getItem('agua_hoje') || '0');
        agua++;
        localStorage.setItem('agua_hoje', agua.toString());
        
        // Re-render widget
        const widget = document.querySelector('[data-widget-id="agua"]');
        if (widget) {
            const metaAgua = 8;
            const percent = Math.min(100, Math.round((agua / metaAgua) * 100));
            widget.querySelector('.feature-info p').textContent = `${agua}/${metaAgua} copos`;
            widget.querySelector('.agua-fill').style.width = `${percent}%`;
        }
        
        Toast.success(`💧 ${agua} copo${agua > 1 ? 's' : ''} de água!`);
    },

    openRestTimer() {
        // Abrir modal de timer de descanso
        Toast.info('⏱️ Timer de descanso - Em breve!');
    },

    updateProximosTreinos() {
        const container = document.getElementById('proximos-treinos-list');
        if (!container) return;

        const treino = this.getTreinoFromState();
        const dias = treino?.dias || [];
        const todayIdx = this.getTodayTreinoIndex(treino);
        
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        const hoje = new Date();

        let html = '';
        for (let i = 1; i <= 3; i++) {
            const nextIdx = (todayIdx + i) % dias.length;
            const nextDia = dias[nextIdx];
            if (!nextDia) continue;

            const dataProxima = new Date(hoje);
            dataProxima.setDate(dataProxima.getDate() + i);
            const diaSemana = diasSemana[dataProxima.getDay()];

            html += `
                <div class="proximo-treino-item">
                    <div class="proximo-dia">${diaSemana}</div>
                    <div class="proximo-info">
                        <strong>${nextDia.nome || `Treino ${String.fromCharCode(65 + nextIdx)}`}</strong>
                        <span>${nextDia.grupos || ''}</span>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html || '<p class="no-proximos">Nenhum treino programado</p>';
    },

    updateHeroCard() {
        const treino = this.getTreinoFromState();
        const todayIdx = this.getTodayTreinoIndex(treino);
        const treinoHoje = treino?.dias?.[todayIdx];

        if (!treinoHoje) return;

        const heroName = $('#hero-workout-name');
        const heroGroups = $('#hero-workout-groups');
        const heroDuration = $('#hero-workout-duration');
        const heroExercises = $('#hero-workout-exercises');

        // Usar o nome completo do dia se disponível (ex: "Treino A - Push")
        const nomeDia = treinoHoje.nome || '';
        const partes = nomeDia.split(' - ');
        const nomePrincipal = partes[0] || `Treino ${String.fromCharCode(65 + todayIdx)}`;
        const grupos = treinoHoje.grupos || partes[1] || '';
        const exercicios = treinoHoje.exercicios || [];

        if (heroName) heroName.textContent = nomePrincipal;
        if (heroGroups) heroGroups.textContent = grupos;
        if (heroDuration) heroDuration.textContent = `~${Math.round(exercicios.length * 8)} min`;
        if (heroExercises) heroExercises.textContent = `${exercicios.length} exercícios`;
    },

    updateFichaAtualCard() {
        // Atualizar dinamicamente o card "Minha Ficha" na home
        const widget = document.querySelector('[data-widget-id="ficha-atual"]');
        if (!widget) return;

        const treinoAtual = JSON.parse(localStorage.getItem('treino_atual') || 'null');
        const templateName = treinoAtual?.meta?.template_name || null;
        const diasSemana = treinoAtual?.dias?.length || 0;
        const objetivo = treinoAtual?.meta?.objetivo || '';

        // Se não tem treino nenhum, mostrar card para escolher
        if (!treinoAtual || diasSemana === 0) {
            widget.className = 'dashboard-widget widget-card card-ficha-atual no-ficha';
            widget.onclick = () => App.switchTab('treino');
            widget.innerHTML = `
                <div class="widget-drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="ficha-empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                </div>
                <div class="ficha-empty-text">
                    <strong>Escolha sua Ficha</strong>
                    <span>Selecione um programa de treino</span>
                </div>
            `;
            return;
        }

        // Determinar nome da ficha: template ou personalizado
        const fichaNome = templateName || 'Treino Personalizado';
        const fichaIcon = templateName ? '📋' : '✨';
        const fichaBadge = templateName ? 'Minha Ficha' : 'Personalizado';

        // Com treino - mostrar detalhes
        widget.className = `dashboard-widget widget-card card-ficha-atual ${!templateName ? 'personalizado' : ''}`;
        widget.onclick = () => App.switchTab('treino');
        
        const formatObjetivo = (obj) => {
            const map = {
                'hipertrofia': 'Hipertrofia',
                'forca': 'Força',
                'emagrecimento': 'Emagrecimento',
                'resistencia': 'Resistência',
                'condicionamento': 'Condicionamento',
                'funcional': 'Funcional'
            };
            return map[obj] || obj;
        };

        widget.innerHTML = `
            <div class="widget-drag-handle">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                    <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                    <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                </svg>
            </div>
            <div class="ficha-badge">
                <span>${fichaIcon}</span>
                <span>${fichaBadge}</span>
            </div>
            <div class="ficha-content">
                <h3 class="ficha-nome">${fichaNome}</h3>
                <div class="ficha-meta">
                    <span class="ficha-dias">${diasSemana}x/semana</span>
                    ${objetivo ? `<span class="ficha-objetivo">${formatObjetivo(objetivo)}</span>` : ''}
                </div>
            </div>
            <div class="ficha-action">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <path d="M9 18l6-6-6-6"/>
                </svg>
            </div>
        `;
    },

    updateHomeStats() {
        const historico = JSON.parse(localStorage.getItem('historico_treinos') || '[]');
        
        // Total de treinos
        const totalTreinos = historico.length;
        const statTreinos = $('#stat-treinos-mes');
        if (statTreinos) statTreinos.textContent = totalTreinos.toString();

        // Streak (dias consecutivos)
        let streak = 0;
        if (historico.length > 0) {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            
            const treinosOrdenados = [...historico]
                .sort((a, b) => new Date(b.data) - new Date(a.data));
            
            let dataAnterior = hoje;
            for (const treino of treinosOrdenados) {
                const dataTreino = new Date(treino.data);
                dataTreino.setHours(0, 0, 0, 0);
                const diffDias = Math.floor((dataAnterior - dataTreino) / (1000 * 60 * 60 * 24));
                if (diffDias <= 1) {
                    streak++;
                    dataAnterior = dataTreino;
                } else {
                    break;
                }
            }
        }
        const statStreak = $('#stat-streak');
        if (statStreak) statStreak.textContent = streak.toString();

        // Meta semanal (baseada nos dias configurados)
        const prefs = this.getWorkoutPrefsFromProfile();
        const diasSemana = prefs.dias || 4;
        
        // Calcular treinos desta semana
        const inicioSemana = new Date();
        inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
        inicioSemana.setHours(0, 0, 0, 0);
        
        const treinosSemana = historico.filter(t => new Date(t.data) >= inicioSemana).length;
        const metaPercent = Math.min(100, Math.round((treinosSemana / diasSemana) * 100));
        
        const statMeta = $('#stat-meta-percent');
        if (statMeta) statMeta.textContent = `${metaPercent}%`;
    },

    updateSplitSubtitle() {
        const prefs = this.getWorkoutPrefsFromProfile();
        const splitObjetivo = $('#split-objetivo');
        if (splitObjetivo) {
            const objetivoFormatado = this.formatObjetivo(prefs.objetivo);
            splitObjetivo.textContent = `${objetivoFormatado} • ${prefs.dias}x/sem`;
        }
    },

    updateSplitPreview() {
        const container = document.getElementById('split-preview');
        if (!container) return;

        const treino = this.getTreinoFromState();
        const dias = treino?.dias || [];
        const todayIdx = this.getTodayTreinoIndex(treino);

        // Ícones por tipo de treino
        const getIconForGrupo = (grupo) => {
            const g = (grupo || '').toLowerCase();
            if (g.includes('peito') || g.includes('push') || g.includes('superior')) return '💪';
            if (g.includes('costas') || g.includes('pull') || g.includes('dorsal')) return '🎯';
            if (g.includes('perna') || g.includes('leg') || g.includes('inferior')) return '🦵';
            if (g.includes('ombro') || g.includes('shoulder')) return '🔺';
            if (g.includes('braço') || g.includes('arm') || g.includes('bíceps') || g.includes('tríceps')) return '💪';
            if (g.includes('full') || g.includes('corpo todo')) return '🏋️';
            if (g.includes('cardio') || g.includes('hiit')) return '🔥';
            return '🎯';
        };

        // Gerar HTML para cada dia
        if (dias.length === 0) {
            container.innerHTML = `
                <div class="split-day empty" onclick="App.switchTab('treino')">
                    <span class="day-letter">+</span>
                    <span class="day-name">Criar treino</span>
                </div>
            `;
            return;
        }

        container.innerHTML = dias.map((dia, i) => {
            const isToday = i === todayIdx;
            const letra = String.fromCharCode(65 + i); // A, B, C, D...
            const nomeGrupo = dia.grupos || dia.nome?.split(' - ')[1] || `Treino ${letra}`;
            const icon = getIconForGrupo(nomeGrupo);
            const shortName = nomeGrupo.length > 10 ? nomeGrupo.substring(0, 10) + '...' : nomeGrupo;

            return `
                <div class="split-day ${isToday ? 'active' : ''}" onclick="App.openWorkoutDay(${i})">
                    <span class="day-icon">${icon}</span>
                    <span class="day-letter">${letra}</span>
                    <span class="day-name">${shortName}</span>
                    ${isToday ? '<span class="day-today-badge">Hoje</span>' : ''}
                </div>
            `;
        }).join('');
    },

    getWorkoutPrefsFromProfile() {
        // Priorizar preferências salvas (atualizadas pelo template)
        const storedPrefs = this.getStoredWorkoutPrefs();
        
        const objetivo = storedPrefs?.objetivo || AppState.profile?.objetivo || AppState.profile?.objetivo_principal || AppState.onboardingData?.objetivo;
        const nivel = storedPrefs?.nivel || AppState.profile?.nivel || AppState.onboardingData?.nivel;
        const local = storedPrefs?.local || AppState.profile?.local || AppState.onboardingData?.local;

        const diasFromStored = storedPrefs?.dias;
        const diasFromProfile = AppState.profile?.dias_semana;
        const diasFromDisponiveis = Array.isArray(AppState.profile?.dias_disponiveis)
            ? AppState.profile.dias_disponiveis.length
            : null;
        const dias = diasFromStored || diasFromProfile || diasFromDisponiveis || (Array.isArray(AppState.onboardingData?.dias_disponiveis) ? AppState.onboardingData.dias_disponiveis.length : null);

        return {
            userId: AppState.user?.id || null,
            objetivo: WorkoutGenerator.normalizeObjetivo(objetivo),
            nivel: WorkoutGenerator.normalizeNivel(nivel),
            local: WorkoutGenerator.normalizeLocal(local),
            dias: WorkoutGenerator.clampDays(dias)
        };
    },

    workoutPrefsStorageKey() {
        const uid = AppState.user?.id || 'anon';
        return `treino_prefs_${uid}`;
    },

    getStoredWorkoutPrefs() {
        try {
            const raw = localStorage.getItem(this.workoutPrefsStorageKey());
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },

    saveWorkoutPrefs(prefs) {
        try {
            localStorage.setItem(this.workoutPrefsStorageKey(), JSON.stringify({
                ...prefs,
                saved_at: new Date().toISOString()
            }));
        } catch {
            // ignore
        }
    },

    getTreinoFromState() {
        try {
            const treinoLocal = localStorage.getItem('treino_atual');
            let treino = treinoLocal ? JSON.parse(treinoLocal) : null;
            if (!treino && AppState.profile?.treino_atual) treino = AppState.profile.treino_atual;
            if (!treino && AppState.workouts?.[0]) treino = AppState.workouts[0];
            return treino;
        } catch {
            return null;
        }
    },

    getTodayTreinoIndex(treino) {
        const diasTreino = treino?.dias || [];
        if (!Array.isArray(diasTreino) || diasTreino.length === 0) return 0;
        const diaSemana = new Date().getDay(); // 0=Dom, 1=Seg...
        const indiceHoje = diaSemana === 0 ? 6 : diaSemana - 1; // 0=Seg
        return indiceHoje % diasTreino.length;
    },

    buildLoadMapFromTreino(treino) {
        const map = new Map();
        const dias = treino?.dias || [];
        dias.forEach(d => {
            (d.exercicios || []).forEach(ex => {
                const nome = String(ex?.nome || '').trim();
                const carga = ex?.carga_usuario;
                if (nome && carga != null && carga !== '') {
                    map.set(nome.toLowerCase(), carga);
                }
            });
        });
        return map;
    },

    applyLoadMapToTreino(treino, loadMap) {
        if (!treino || !loadMap) return treino;
        const dias = treino.dias || [];
        dias.forEach(d => {
            (d.exercicios || []).forEach(ex => {
                const nome = String(ex?.nome || '').trim();
                if (!nome) return;
                const key = nome.toLowerCase();
                if (loadMap.has(key) && (ex.carga_usuario == null || ex.carga_usuario === '')) {
                    ex.carga_usuario = loadMap.get(key);
                }
            });
        });
        return treino;
    },

    shouldRegenerateTreino(currentPrefs, treino) {
        if (!treino || !Array.isArray(treino.dias) || treino.dias.length === 0) return true;

        // Se treino tem meta, checar aderência
        const meta = treino.meta || null;
        if (meta && meta.objetivo && meta.dias_semana) {
            const metaObjetivo = WorkoutGenerator.normalizeObjetivo(meta.objetivo);
            const metaDias = WorkoutGenerator.clampDays(meta.dias_semana);
            const metaNivel = WorkoutGenerator.normalizeNivel(meta.nivel);
            const metaLocal = WorkoutGenerator.normalizeLocal(meta.local);
            return (
                metaObjetivo !== currentPrefs.objetivo ||
                metaDias !== currentPrefs.dias ||
                metaNivel !== currentPrefs.nivel ||
                metaLocal !== currentPrefs.local
            );
        }

        // Treino vindo do servidor (sem meta) — só regenerar se prefs salvas divergirem
        // (mas ao menos respeitar mudança de quantidade de dias)
        if (Array.isArray(treino.dias) && treino.dias.length !== currentPrefs.dias) {
            return true;
        }

        const stored = this.getStoredWorkoutPrefs();
        if (!stored) return false;
        return (
            WorkoutGenerator.normalizeObjetivo(stored.objetivo) !== currentPrefs.objetivo ||
            WorkoutGenerator.clampDays(stored.dias) !== currentPrefs.dias ||
            WorkoutGenerator.normalizeNivel(stored.nivel) !== currentPrefs.nivel ||
            WorkoutGenerator.normalizeLocal(stored.local) !== currentPrefs.local
        );
    },

    async ensureWorkoutPlan({ silent = false, force = false } = {}) {
        const prefs = this.getWorkoutPrefsFromProfile();
        const existing = this.getTreinoFromState();

        const needs = force || this.shouldRegenerateTreino(prefs, existing);
        if (!needs && existing) {
            AppState.workouts = [existing];
            localStorage.setItem('treino_atual', JSON.stringify(existing));
            this.saveWorkoutPrefs(prefs);
            return existing;
        }

        const loadMap = this.buildLoadMapFromTreino(existing);
        const novo = WorkoutGenerator.generatePlan(prefs);
        this.applyLoadMapToTreino(novo, loadMap);

        // Marcar como treino personalizado (gerado pelo sistema, não por template)
        novo.meta = {
            ...(novo.meta || {}),
            template_id: null,
            template_name: null,
            personalizado: true,
            objetivo: prefs.objetivo,
            nivel: prefs.nivel
        };

        AppState.workouts = [novo];
        localStorage.setItem('treino_atual', JSON.stringify(novo));
        this.saveWorkoutPrefs(prefs);

        if (!silent) {
            Toast.info('Treino atualizado conforme seu objetivo e disponibilidade');
        }

        // Atualizar card Minha Ficha na home
        this.updateFichaAtualCard();

        // Sincronizar com servidor
        if (AppState.user?.id) {
            Utils.fetch(`/perfil/${AppState.user.id}`, {
                method: 'PUT',
                body: JSON.stringify({ treino_atual: novo })
            }).catch(err => console.log('Erro ao salvar treino no servidor:', err));
        }

        return novo;
    },

    async loadTreinoTab() {
        try {
            await this.ensureWorkoutPlan({ silent: true });
            this.renderTreinoTab();
            this.updateWeekProgress();
            this.updateSplitPreview();
            this.loadProgress();
        } catch (e) {
            console.log('Erro ao carregar aba treino:', e);
        }
    },

    renderTreinoTab() {
        const list = document.getElementById('workout-list');
        if (!list) return;

        const prefs = this.getWorkoutPrefsFromProfile();
        const treino = this.getTreinoFromState();
        if (!treino || !Array.isArray(treino.dias) || treino.dias.length === 0) {
            list.innerHTML = `
                <div class="no-workout">
                    <div class="no-workout-icon">🏋️</div>
                    <h3>Nenhum treino disponível</h3>
                    <p>Complete seu perfil ou gere um treino automático.</p>
                    <button class="btn-primary" onclick="App.ensureWorkoutPlan().then(()=>App.renderTreinoTab())">
                        Gerar Treino
                    </button>
                </div>
            `;
            return;
        }

        const todayIdx = this.getTodayTreinoIndex(treino);
        const treinoHoje = treino.dias[todayIdx];
        const exerciciosHoje = treinoHoje?.exercicios || [];
        const previewHoje = exerciciosHoje.slice(0, 3);
        const maisHoje = exerciciosHoje.length > 3 ? exerciciosHoje.length - 3 : 0;

        const todayCard = `
            <div class="section-header">
                <h2>Hoje</h2>
                <span class="badge">Treino ${String.fromCharCode(65 + todayIdx)}</span>
            </div>
            <div class="workout-card">
                <div class="workout-header" onclick="App.openWorkoutDay(${todayIdx})">
                    <div class="workout-info">
                        <h3>${treinoHoje?.nome || 'Treino de Hoje'}</h3>
                        <p>${treinoHoje?.grupos || `${exerciciosHoje.length} exercícios`}</p>
                    </div>
                    <div class="workout-status pending"><span>Hoje</span></div>
                </div>
                <div class="workout-preview" onclick="App.openWorkoutDay(${todayIdx})">
                    ${previewHoje.map(ex => `
                        <div class="exercise-mini">
                            <span class="exercise-name">${ex.nome}</span>
                            <span class="exercise-sets">${ex.series || 3}x${ex.repeticoes || '8-12'}</span>
                        </div>
                    `).join('')}
                    ${maisHoje > 0 ? `<span class="more-exercises">+${maisHoje} exercícios • Toque para ver tudo</span>` : ''}
                </div>
                <div class="workout-actions">
                    <button class="btn-start-workout" onclick="App.startWorkout()">
                        <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        <span>Iniciar</span>
                    </button>
                    <button class="btn-secondary" style="padding: 12px 14px; font-size: 12px;" onclick="App.openWorkoutDay(${todayIdx})">Ver</button>
                    <button class="btn-secondary" style="padding: 12px 14px; font-size: 12px;" onclick="App.redoWorkoutDay(${todayIdx})">Refazer</button>
                </div>
            </div>
            <div class="section-header" style="margin-top: 16px;">
                <h2>Semana</h2>
                <span class="badge">${treino.dias.length} dias</span>
            </div>
        `;

        const dayCards = treino.dias.map((dia, i) => {
            const exs = dia.exercicios || [];
            const prev = exs.slice(0, 2);
            const more = exs.length > 2 ? exs.length - 2 : 0;
            const isToday = i === todayIdx;
            return `
                <div class="workout-card" data-day="${i}" style="${isToday ? 'border: 2px solid rgba(99,102,241,0.35);' : ''}">
                    <div class="workout-header" onclick="App.openWorkoutDay(${i})">
                        <div class="workout-info">
                            <h3>${dia.nome}</h3>
                            <p>${dia.grupos || `${exs.length} exercícios`}</p>
                        </div>
                        <div class="workout-status pending"><span>${isToday ? 'Hoje' : 'Dia'}</span></div>
                    </div>
                    <div class="workout-preview" onclick="App.openWorkoutDay(${i})">
                        ${prev.map(ex => `
                            <div class="exercise-mini">
                                <span class="exercise-name">${ex.nome}</span>
                                <span class="exercise-sets">${ex.series || 3}x${ex.repeticoes || '8-12'}</span>
                            </div>
                        `).join('')}
                        ${more > 0 ? `<span class="more-exercises">+${more} exercícios</span>` : ''}
                    </div>
                    <div class="workout-actions">
                        <button class="btn-secondary" style="padding: 12px 14px; font-size: 12px;" onclick="App.openWorkoutDay(${i})">Ver</button>
                        <button class="btn-secondary" style="padding: 12px 14px; font-size: 12px;" onclick="App.adjustWorkoutDay(${i})">Ajustar</button>
                        <button class="btn-secondary" style="padding: 12px 14px; font-size: 12px;" onclick="App.redoWorkoutDay(${i})">Refazer</button>
                    </div>
                </div>
            `;
        }).join('');

        const controlsCard = `
            <div class="workout-card" style="padding: 16px; margin-bottom: 12px;">
                <div style="display:flex; gap: 12px; align-items: flex-end; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 200px;">
                        <label style="display:block; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;">Objetivo</label>
                        <select id="treino-pref-objetivo" class="form-input">
                            <option value="hipertrofia" ${prefs.objetivo === 'hipertrofia' ? 'selected' : ''}>Hipertrofia</option>
                            <option value="forca" ${prefs.objetivo === 'forca' ? 'selected' : ''}>Força</option>
                            <option value="emagrecimento" ${prefs.objetivo === 'emagrecimento' ? 'selected' : ''}>Emagrecimento</option>
                            <option value="condicionamento" ${prefs.objetivo === 'condicionamento' ? 'selected' : ''}>Condicionamento</option>
                        </select>
                    </div>
                    <div style="width: 140px;">
                        <label style="display:block; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;">Dias/semana</label>
                        <select id="treino-pref-dias" class="form-input">
                            ${[1,2,3,4,5,6].map(n => `<option value="${n}" ${prefs.dias === n ? 'selected' : ''}>${n}x</option>`).join('')}
                        </select>
                    </div>
                    <div style="display:flex; gap: 8px;">
                        <button class="btn-secondary" id="treino-pref-reset" style="padding: 12px 14px; font-size: 12px;">Reset</button>
                        <button class="btn-primary" id="treino-pref-apply" style="padding: 12px 14px; font-size: 12px;">Atualizar</button>
                    </div>
                </div>
                <p style="margin: 10px 0 0; font-size: 12px; color: var(--text-muted);">
                    Mudou objetivo ou dias? Atualize e o plano refaz automaticamente.
                </p>
            </div>
        `;

        list.innerHTML = controlsCard + todayCard + dayCards;

        // Bind controles
        const objetivoEl = document.getElementById('treino-pref-objetivo');
        const diasEl = document.getElementById('treino-pref-dias');
        const resetBtn = document.getElementById('treino-pref-reset');
        const applyBtn = document.getElementById('treino-pref-apply');

        if (resetBtn && objetivoEl && diasEl) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                objetivoEl.value = prefs.objetivo;
                diasEl.value = String(prefs.dias);
                Toast.info('Preferências restauradas');
            });
        }

        if (applyBtn && objetivoEl && diasEl) {
            applyBtn.addEventListener('click', async (e) => {
                e.preventDefault();

                const novoObjetivo = String(objetivoEl.value || 'hipertrofia');
                const novosDias = parseInt(diasEl.value, 10) || 4;
                const nivelAtual = AppState.profile?.nivel || 'intermediario';
                const localAtual = AppState.profile?.local || 'academia';

                // Atualizar AppState.profile global
                AppState.profile = {
                    ...(AppState.profile || {}),
                    objetivo: novoObjetivo,
                    dias_semana: novosDias,
                    nivel: nivelAtual
                };

                // Salvar preferências no localStorage para sincronização global
                this.saveWorkoutPrefs({
                    objetivo: novoObjetivo,
                    dias: novosDias,
                    nivel: nivelAtual,
                    local: localAtual
                });

                // Atualizar Profile.data se existir
                if (Profile.data) {
                    Profile.data.objetivo = novoObjetivo;
                    Profile.data.dias_semana = novosDias;
                    Profile.data.dias_disponiveis = novosDias;
                }

                // Persistir no servidor
                if (AppState.user?.id) {
                    Utils.fetch(`/perfil/${AppState.user.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            objetivo: novoObjetivo,
                            dias_disponiveis: novosDias
                        })
                    }).catch(err => console.log('Erro ao atualizar preferências do perfil:', err));
                }

                // Regenerar treino e sincronizar TODAS as telas
                await this.ensureWorkoutPlan({ silent: false, force: true });
                this.loadTodayWorkout();
                this.renderTreinoTab();
                this.updateSplitPreview();
                this.updateWeekProgress();
                this.loadProgress();
                this.updateHeader();
                
                // Atualizar display do perfil se disponível
                try {
                    Profile.updateDisplay();
                } catch {}
            });
        }

        // Auto-scroll suave para o card de hoje dentro da lista (quando existir)
        const todayCardEl = list.querySelector(`.workout-card[data-day="${todayIdx}"]`);
        if (todayCardEl) {
            setTimeout(() => {
                try {
                    todayCardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } catch {
                    // ignore
                }
            }, 60);
        }
    },

    openWorkoutDay(dayIndex) {
        // Modal dedicado para visualizar APENAS este dia
        const treino = this.getTreinoFromState();
        if (!treino || !Array.isArray(treino.dias) || !treino.dias[dayIndex]) {
            Toast.error('Dia de treino inválido');
            return;
        }

        const dia = treino.dias[dayIndex];
        const exercicios = dia.exercicios || [];

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'view-day-modal';

        const exerciciosHtml = exercicios.map((ex, i) => `
            <div class="view-exercise-card">
                <div class="view-exercise-num">${i + 1}</div>
                <div class="view-exercise-main">
                    <span class="view-exercise-name">${ex.nome}</span>
                    <div class="view-exercise-details">
                        <span class="detail-item">
                            <span class="detail-icon">📊</span>
                            <span>${ex.series || 3} séries</span>
                        </span>
                        <span class="detail-item">
                            <span class="detail-icon">🔄</span>
                            <span>${ex.repeticoes || '8-12'} reps</span>
                        </span>
                        <span class="detail-item">
                            <span class="detail-icon">⏱️</span>
                            <span>${ex.descanso || '60s'}</span>
                        </span>
                        ${ex.carga_usuario ? `
                        <span class="detail-item">
                            <span class="detail-icon">🏋️</span>
                            <span>${ex.carga_usuario} kg</span>
                        </span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        modal.innerHTML = `
            <div class="modal-content modal-view-day">
                <div class="modal-header">
                    <div>
                        <h2>${dia.nome}</h2>
                        <span style="font-size: 12px; color: var(--text-secondary);">${dia.grupos || `${exercicios.length} exercícios`}</span>
                    </div>
                    <button class="modal-close" onclick="App.closeViewDayModal()">✕</button>
                </div>
                <div class="modal-body">
                    ${exercicios.length > 0 ? exerciciosHtml : '<p style="text-align:center; color: var(--text-muted);">Nenhum exercício neste dia.</p>'}
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="App.closeViewDayModal()">Fechar</button>
                    <button class="btn-primary" onclick="App.closeViewDayModal(); App.startWorkoutFromDay(${dayIndex});">Iniciar Treino</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    },

    closeViewDayModal() {
        const modal = document.getElementById('view-day-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    },

    startWorkoutFromDay(dayIndex) {
        // Iniciar treino ativo usando o dia específico
        const treino = this.getTreinoFromState();
        if (treino && treino.dias && treino.dias[dayIndex]) {
            ActiveWorkout.start(treino, dayIndex);
        } else {
            this.startWorkout();
        }
    },

    adjustWorkoutDay(dayIndex) {
        // Tela dedicada estilo Fitbod para editar apenas esse dia
        const treino = this.getTreinoFromState();
        if (!treino || !Array.isArray(treino.dias) || !treino.dias[dayIndex]) {
            Toast.error('Dia de treino inválido');
            return;
        }

        const dia = treino.dias[dayIndex];
        const exercicios = dia.exercicios || [];

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'adjust-day-modal';

        let exerciciosHtml = exercicios.map((ex, i) => `
            <div class="adjust-exercise-card" data-idx="${i}">
                <div class="adjust-exercise-header">
                    <span class="adjust-exercise-num">${i + 1}</span>
                    <input type="text" class="adjust-exercise-name" value="${ex.nome}" placeholder="Nome do exercício">
                    <button class="btn-remove-ex" onclick="App.removeAdjustExercise(${i})">✕</button>
                </div>
                <div class="adjust-exercise-details">
                    <label>Séries <input type="number" class="adjust-series" value="${ex.series || 3}" min="1" max="10"></label>
                    <label>Reps <input type="text" class="adjust-reps" value="${ex.repeticoes || '8-12'}" placeholder="8-12"></label>
                    <label>Descanso <input type="text" class="adjust-descanso" value="${ex.descanso || '60s'}" placeholder="60s"></label>
                    <label>Carga <input type="text" class="adjust-carga" value="${ex.carga_usuario || ''}" placeholder="kg"></label>
                </div>
            </div>
        `).join('');

        modal.innerHTML = `
            <div class="modal-content modal-adjust-day">
                <div class="modal-header">
                    <div>
                        <h2>Ajustar ${dia.nome}</h2>
                        <span style="font-size: 12px; color: var(--text-secondary);">${dia.grupos || ''}</span>
                    </div>
                    <button class="modal-close" onclick="App.closeAdjustDayModal()">✕</button>
                </div>
                <div class="modal-body" id="adjust-exercises-container">
                    ${exerciciosHtml}
                </div>
                <div style="padding: 12px 16px; border-top: 1px solid var(--border-color);">
                    <button class="btn-secondary" style="width: 100%; padding: 12px;" onclick="App.addAdjustExercise()">+ Adicionar Exercício</button>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="App.closeAdjustDayModal()">Cancelar</button>
                    <button class="btn-primary" onclick="App.saveAdjustDay(${dayIndex})">Salvar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    },

    closeAdjustDayModal() {
        const modal = document.getElementById('adjust-day-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    },

    addAdjustExercise() {
        const container = document.getElementById('adjust-exercises-container');
        if (!container) return;

        const count = container.querySelectorAll('.adjust-exercise-card').length;
        const card = document.createElement('div');
        card.className = 'adjust-exercise-card';
        card.dataset.idx = count;

        card.innerHTML = `
            <div class="adjust-exercise-header">
                <span class="adjust-exercise-num">${count + 1}</span>
                <input type="text" class="adjust-exercise-name" value="" placeholder="Nome do exercício">
                <button class="btn-remove-ex" onclick="this.closest('.adjust-exercise-card').remove()">✕</button>
            </div>
            <div class="adjust-exercise-details">
                <label>Séries <input type="number" class="adjust-series" value="3" min="1" max="10"></label>
                <label>Reps <input type="text" class="adjust-reps" value="10-12" placeholder="8-12"></label>
                <label>Descanso <input type="text" class="adjust-descanso" value="60s" placeholder="60s"></label>
                <label>Carga <input type="text" class="adjust-carga" value="" placeholder="kg"></label>
            </div>
        `;

        container.appendChild(card);
        card.querySelector('.adjust-exercise-name')?.focus();
    },

    removeAdjustExercise(idx) {
        const card = document.querySelector(`.adjust-exercise-card[data-idx="${idx}"]`);
        if (card) card.remove();
    },

    saveAdjustDay(dayIndex) {
        const treino = this.getTreinoFromState();
        if (!treino || !treino.dias || !treino.dias[dayIndex]) {
            Toast.error('Treino inválido');
            return;
        }

        const container = document.getElementById('adjust-exercises-container');
        if (!container) return;

        const novosExercicios = [];
        container.querySelectorAll('.adjust-exercise-card').forEach(card => {
            const nome = card.querySelector('.adjust-exercise-name')?.value?.trim();
            if (!nome) return;

            novosExercicios.push({
                nome,
                series: parseInt(card.querySelector('.adjust-series')?.value) || 3,
                repeticoes: card.querySelector('.adjust-reps')?.value || '10-12',
                descanso: card.querySelector('.adjust-descanso')?.value || '60s',
                carga_usuario: card.querySelector('.adjust-carga')?.value || ''
            });
        });

        if (novosExercicios.length === 0) {
            Toast.error('Adicione pelo menos um exercício');
            return;
        }

        treino.dias[dayIndex].exercicios = novosExercicios;
        treino.dias[dayIndex].meta = {
            ...(treino.dias[dayIndex].meta || {}),
            adjusted_at: new Date().toISOString()
        };

        localStorage.setItem('treino_atual', JSON.stringify(treino));
        AppState.workouts = [treino];

        if (AppState.user?.id) {
            Utils.fetch(`/perfil/${AppState.user.id}`, {
                method: 'PUT',
                body: JSON.stringify({ treino_atual: treino })
            }).catch(err => console.log('Erro ao salvar treino no servidor:', err));
        }

        this.closeAdjustDayModal();
        Toast.success('Dia ajustado com sucesso!');
        this.loadTodayWorkout();
        this.renderTreinoTab();
        this.updateSplitPreview();
    },

    async redoWorkoutDay(dayIndex) {
        const treino = this.getTreinoFromState();
        if (!treino || !Array.isArray(treino.dias) || !treino.dias[dayIndex]) {
            Toast.error('Dia de treino inválido');
            return;
        }

        if (!confirm('Refazer este dia vai substituir os exercícios atuais. Continuar?')) {
            return;
        }

        const prefs = this.getWorkoutPrefsFromProfile();
        const split = WorkoutGenerator.split(prefs.dias);
        const focusKey = treino.dias[dayIndex]?.meta?.focus_key || split[dayIndex]?.key || split[0]?.key || 'full';
        const loadMap = this.buildLoadMapFromTreino({ dias: [treino.dias[dayIndex]] });

        // Atualizar dia
        treino.dias[dayIndex].exercicios = WorkoutGenerator.buildDayExercises(focusKey, prefs);
        treino.dias[dayIndex].meta = {
            ...(treino.dias[dayIndex].meta || {}),
            focus_key: focusKey,
            regenerated_at: new Date().toISOString()
        };
        this.applyLoadMapToTreino({ dias: [treino.dias[dayIndex]] }, loadMap);

        localStorage.setItem('treino_atual', JSON.stringify(treino));
        AppState.workouts = [treino];

        if (AppState.user?.id) {
            Utils.fetch(`/perfil/${AppState.user.id}`, {
                method: 'PUT',
                body: JSON.stringify({ treino_atual: treino })
            }).catch(err => console.log('Erro ao salvar treino no servidor:', err));
        }

        Toast.success('Dia de treino refeito!');
        this.loadTodayWorkout();
        this.renderTreinoTab();
        this.updateSplitPreview();
    },
    
    async loadUserProfile() {
        try {
            const response = await Utils.fetch(`/perfil/${AppState.user.id}`);
            if (response) {
                const perfil = response.perfil || response;
                const objetivoPerfil = perfil.objetivo || perfil.objetivo_principal || response.objetivo_principal;
                const nivelPerfil = perfil.nivel || response.nivel;
                const diasSemana = perfil.dias_disponiveis || perfil.dias_semana || response.dias_semana;
                const localTreino = perfil.local || perfil.treina_em || response.local;

                // Normalizar campos vindos da API (peso_kg, altura_cm)
                const pesoValor = perfil.peso ?? perfil.peso_kg ?? response.peso_kg ?? response.peso;
                const alturaValorCm = perfil.altura ?? perfil.altura_cm ?? response.altura_cm ?? response.altura;
                const idadeValor = perfil.idade ?? response.idade;

                // Atualizar AppState com dados do perfil
                AppState.profile = {
                    ...AppState.profile,
                    peso: pesoValor,
                    altura: alturaValorCm,
                    idade: idadeValor,
                    objetivo: objetivoPerfil,
                    nivel: nivelPerfil,
                    dias_semana: diasSemana,
                    local: localTreino,
                    historico_treinos: response.historico_treinos || AppState.profile?.historico_treinos || [],
                    treino_atual: response.treino_atual || perfil.treino_atual,
                    medidas: {
                        peso: pesoValor,
                        braco: perfil.braco,
                        peito: perfil.peito,
                        cintura: perfil.cintura
                    }
                };

                // Sincronizar medidas locais para uso no progresso
                localStorage.setItem('medidas_corporais', JSON.stringify(AppState.profile.medidas));
                
                // Atualizar stats na Home
                const statPeso = $('#stat-peso');
                const statAltura = $('#stat-altura');
                
                const pesoValue = pesoValor;
                const alturaValue = alturaValorCm;
                if (statPeso) statPeso.textContent = pesoValue ? Math.round(pesoValue) : '-';
                if (statAltura) statAltura.textContent = alturaValue ? Math.round(alturaValue) : '-';
                
                console.log('[App] Perfil carregado:', AppState.profile);

                // Manter treino coerente com objetivo/dias/local
                try {
                    await this.ensureWorkoutPlan({ silent: true });
                    // Atualizar seção Sua Divisão após carregar perfil
                    this.updateSplitPreview();
                } catch {
                    // ignore
                }
            }
        } catch (error) {
            console.error('[App] Erro ao carregar perfil:', error);
        }
    },
    
    async loadTodayWorkout() {
        const container = $('#today-workout');
        if (!container) return;
        
        try {
            // Primeiro tenta carregar treino do localStorage
            const treinoLocal = localStorage.getItem('treino_atual');
            let treino = treinoLocal ? JSON.parse(treinoLocal) : null;
            
            // Se não tem treino local, buscar do perfil
            if (!treino && AppState.profile?.treino_atual) {
                treino = AppState.profile.treino_atual;
            }
            
            // Se ainda não tem treino, buscar da API
            if (!treino && AppState.user?.id) {
                try {
                    const response = await Utils.fetch(`/perfil/${AppState.user.id}`);
                    if (response.treino_atual) {
                        treino = response.treino_atual;
                        localStorage.setItem('treino_atual', JSON.stringify(treino));
                        AppState.workouts = [treino];
                    }
                } catch (e) {
                    console.log('[App] Nenhum treino salvo');
                }
            }
            
            if (treino) {
                this.renderWorkoutCard(treino);
                // Sincronizar seção Sua Divisão
                this.updateSplitPreview();
            } else {
                this.renderNoWorkout();
            }
        } catch (error) {
            console.error('[App] Erro ao carregar treino:', error);
        }
    },
    
    renderNoWorkout() {
        const container = $('#today-workout');
        if (!container) return;
        
        container.innerHTML = `
            <div class="no-workout">
                <div class="no-workout-icon">🏋️</div>
                <h3>Nenhum treino disponível</h3>
                <p>Peça ao Coach IA para criar seu treino personalizado!</p>
                <button class="btn-primary" onclick="App.switchTab('coach')">
                    Falar com Coach IA
                </button>
            </div>
        `;
    },
    
    renderWorkoutCard(treino) {
        const container = $('#today-workout');
        if (!container) return;
        
        // Determinar qual treino do dia mostrar (baseado no dia da semana)
        const diaSemana = new Date().getDay(); // 0=Dom, 1=Seg...
        const diasTreino = treino.dias || [];
        const indiceHoje = diaSemana === 0 ? 6 : diaSemana - 1; // Ajusta para 0=Seg
        const treinoHoje = diasTreino[indiceHoje % diasTreino.length] || diasTreino[0] || treino;
        
        const exercicios = treinoHoje.exercicios || treino.exercicios || [];
        const nomeTreino = treinoHoje.nome || treino.nome || 'Treino do Dia';
        const gruposMusculares = treinoHoje.grupos || '';
        const totalExercicios = exercicios.length;
        const tempoEstimado = treino.tempo_estimado || treino.duracao || 60;
        
        const exerciciosPreview = exercicios.slice(0, 3);
        const maisExercicios = totalExercicios > 3 ? totalExercicios - 3 : 0;
        
        container.innerHTML = `
            <div class="workout-header" onclick="App.viewFullWorkout()">
                <div class="workout-info">
                    <h3>${nomeTreino}</h3>
                    <p>${gruposMusculares || `${totalExercicios} exercícios`} • ~${tempoEstimado} min</p>
                </div>
                <div class="workout-status pending">
                    <span>Pendente</span>
                </div>
            </div>
            
            <div class="workout-preview" onclick="App.viewFullWorkout()">
                ${exerciciosPreview.map(ex => `
                    <div class="exercise-mini">
                        <span class="exercise-name">${ex.nome || ex.exercicio}</span>
                        <span class="exercise-sets">${ex.series || 3}x${ex.repeticoes || '8-12'}</span>
                    </div>
                `).join('')}
                ${maisExercicios > 0 ? `<span class="more-exercises">+${maisExercicios} exercícios • Toque para ver tudo</span>` : ''}
            </div>
            
            <div class="workout-actions">
                <button class="btn-start-workout" onclick="App.startWorkout()">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    <span>Iniciar Treino</span>
                </button>
                <button class="btn-view-workout" onclick="App.viewFullWorkout()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                </button>
                <button class="btn-edit-workout" onclick="App.editWorkout()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
            </div>
        `;
    },
    
    viewFullWorkout(startDayIndex = 0) {
        const treino = AppState.workouts[0] || JSON.parse(localStorage.getItem('treino_atual') || 'null');
        
        if (!treino || !treino.dias) {
            Toast.error('Nenhum treino disponível');
            return;
        }
        
        // Criar modal de visualização do treino completo
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'workout-view-modal';
        
        const initialDay = Math.max(0, Math.min(parseInt(startDayIndex, 10) || 0, treino.dias.length - 1));

        // Gerar tabs para cada dia
        let tabsHtml = treino.dias.map((dia, i) => `
            <button class="workout-tab ${i === initialDay ? 'active' : ''}" data-day="${i}">
                ${dia.nome.split(' - ')[0].replace('Treino ', '')}
            </button>
        `).join('');
        
        // Gerar conteúdo de cada dia
        let daysContentHtml = treino.dias.map((dia, i) => `
            <div class="workout-day-content ${i === initialDay ? 'active' : ''}" data-day="${i}">
                <div class="day-header">
                    <h3>${dia.nome}</h3>
                    <span class="day-groups">${dia.grupos || ''}</span>
                </div>
                <div class="exercises-full-list">
                    ${dia.exercicios.map((ex, exIdx) => `
                        <div class="exercise-full-card" data-exercise="${exIdx}">
                            <div class="exercise-number">${exIdx + 1}</div>
                            <div class="exercise-main-info">
                                <span class="exercise-full-name">${ex.nome}</span>
                                <div class="exercise-details">
                                    <span class="detail-item">
                                        <span class="detail-icon">📊</span>
                                        <span>${ex.series} séries</span>
                                    </span>
                                    <span class="detail-item">
                                        <span class="detail-icon">🔄</span>
                                        <span>${ex.repeticoes} reps</span>
                                    </span>
                                    <span class="detail-item">
                                        <span class="detail-icon">⏱️</span>
                                        <span>${ex.descanso}</span>
                                    </span>
                                </div>
                            </div>
                            <div class="exercise-load">
                                <input type="text" class="input-load" placeholder="Carga" 
                                       value="${ex.carga_usuario || ex.carga_sugerida || ''}"
                                       data-dia="${i}" data-ex="${exIdx}">
                                <span class="load-unit">kg</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        modal.innerHTML = `
            <div class="modal-content modal-workout-view">
                <div class="modal-header">
                    <div class="workout-title-info">
                        <h2>📋 ${treino.nome}</h2>
                        <span class="workout-divisao">${treino.divisao} • ${treino.descricao || ''}</span>
                    </div>
                    <button class="modal-close" onclick="App.closeWorkoutViewModal()">✕</button>
                </div>
                <div class="workout-tabs">
                    ${tabsHtml}
                </div>
                <div class="modal-body">
                    ${daysContentHtml}
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="App.closeWorkoutViewModal()">Fechar</button>
                    <button class="btn-primary" onclick="App.saveExerciseLoads(); App.closeWorkoutViewModal()">
                        Salvar Cargas
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adicionar listeners para as tabs
        modal.querySelectorAll('.workout-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const dayIndex = tab.dataset.day;
                modal.querySelectorAll('.workout-tab').forEach(t => t.classList.remove('active'));
                modal.querySelectorAll('.workout-day-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                const dayContent = modal.querySelector(`.workout-day-content[data-day="${dayIndex}"]`);
                if (dayContent) dayContent.classList.add('active');
            });
        });
    },
    
    closeWorkoutViewModal() {
        const modal = document.getElementById('workout-view-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    },
    
    saveExerciseLoads() {
        const treino = AppState.workouts[0] || JSON.parse(localStorage.getItem('treino_atual') || 'null');
        if (!treino) return;
        
        // Coletar todas as cargas dos inputs
        document.querySelectorAll('.input-load').forEach(input => {
            const diaIdx = parseInt(input.dataset.dia);
            const exIdx = parseInt(input.dataset.ex);
            const carga = input.value.trim();
            
            if (treino.dias[diaIdx] && treino.dias[diaIdx].exercicios[exIdx]) {
                treino.dias[diaIdx].exercicios[exIdx].carga_usuario = carga;
            }
        });
        
        // Salvar
        localStorage.setItem('treino_atual', JSON.stringify(treino));
        AppState.workouts = [treino];
        
        // Sincronizar com servidor
        if (AppState.user?.id) {
            Utils.fetch(`/perfil/${AppState.user.id}`, {
                method: 'PUT',
                body: JSON.stringify({ treino_atual: treino })
            }).catch(err => console.log('Erro ao salvar cargas:', err));
        }
        
        Toast.success('Cargas salvas com sucesso!');
    },
    
    editWorkout(focusDayIndex = null) {
        // Obter treino atual
        const treino = AppState.workouts[0] || JSON.parse(localStorage.getItem('treino_atual') || 'null');
        
        if (!treino || !treino.dias) {
            Toast.error('Nenhum treino para editar');
            return;
        }
        
        // Criar modal de edição
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'workout-edit-modal';
        
        let diasHtml = '';
        treino.dias.forEach((dia, diaIndex) => {
            let exerciciosHtml = '';
            dia.exercicios.forEach((ex, exIndex) => {
                exerciciosHtml += `
                    <div class="edit-exercise" data-dia="${diaIndex}" data-ex="${exIndex}">
                        <div class="exercise-row">
                            <input type="text" class="input-exercise-name" value="${ex.nome}" placeholder="Nome do exercício">
                            <button class="btn-remove-exercise" onclick="App.removeExercise(${diaIndex}, ${exIndex})">✕</button>
                        </div>
                        <div class="exercise-details-row">
                            <label>Séries: <input type="number" class="input-series" value="${ex.series}" min="1" max="10"></label>
                            <label>Reps: <input type="text" class="input-reps" value="${ex.repeticoes}" placeholder="8-12"></label>
                            <label>Descanso: <input type="text" class="input-descanso" value="${ex.descanso || '60s'}" placeholder="60s"></label>
                        </div>
                    </div>
                `;
            });
            
            diasHtml += `
                <div class="edit-day-section" data-dia="${diaIndex}">
                    <div class="edit-day-header">
                        <input type="text" class="input-day-name" value="${dia.nome}" placeholder="Nome do dia">
                    </div>
                    <div class="edit-exercises-list">
                        ${exerciciosHtml}
                    </div>
                    <button class="btn-add-exercise" onclick="App.addExercise(${diaIndex})">+ Adicionar Exercício</button>
                </div>
            `;
        });
        
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>✏️ Editar Treino</h2>
                    <button class="modal-close" onclick="App.closeWorkoutEditModal()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="edit-workout-form">
                        <div class="form-group">
                            <label>Nome do Treino</label>
                            <input type="text" id="edit-workout-name" value="${treino.nome || 'Meu Treino'}" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Descrição</label>
                            <input type="text" id="edit-workout-desc" value="${treino.descricao || ''}" class="form-input">
                        </div>
                        <div class="edit-days-container">
                            ${diasHtml}
                        </div>
                        <button class="btn-add-day" onclick="App.addWorkoutDay()">+ Adicionar Dia de Treino</button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="App.closeWorkoutEditModal()">Cancelar</button>
                    <button class="btn-primary" onclick="App.saveWorkoutEdit()">Salvar Alterações</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);

        // Se foi chamado para ajustar um dia específico, focar nele
        if (focusDayIndex !== null && focusDayIndex !== undefined) {
            const idx = parseInt(focusDayIndex, 10);
            setTimeout(() => {
                const target = modal.querySelector(`.edit-day-section[data-dia="${idx}"]`);
                if (target) {
                    try {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } catch {
                        // ignore
                    }
                }
            }, 80);
        }
    },
    
    addExercise(diaIndex) {
        const diaSection = document.querySelector(`.edit-day-section[data-dia="${diaIndex}"] .edit-exercises-list`);
        if (!diaSection) return;
        
        const exCount = diaSection.querySelectorAll('.edit-exercise').length;
        const newEx = document.createElement('div');
        newEx.className = 'edit-exercise';
        newEx.dataset.dia = diaIndex;
        newEx.dataset.ex = exCount;
        
        newEx.innerHTML = `
            <div class="exercise-row">
                <input type="text" class="input-exercise-name" value="" placeholder="Nome do exercício">
                <button class="btn-remove-exercise" onclick="App.removeExercise(${diaIndex}, ${exCount})">✕</button>
            </div>
            <div class="exercise-details-row">
                <label>Séries: <input type="number" class="input-series" value="3" min="1" max="10"></label>
                <label>Reps: <input type="text" class="input-reps" value="10-12" placeholder="8-12"></label>
                <label>Descanso: <input type="text" class="input-descanso" value="60s" placeholder="60s"></label>
            </div>
        `;
        
        diaSection.appendChild(newEx);
    },
    
    removeExercise(diaIndex, exIndex) {
        const exercise = document.querySelector(`.edit-exercise[data-dia="${diaIndex}"][data-ex="${exIndex}"]`);
        if (exercise) {
            exercise.remove();
        }
    },
    
    addWorkoutDay() {
        const container = document.querySelector('.edit-days-container');
        if (!container) return;
        
        const dayCount = container.querySelectorAll('.edit-day-section').length;
        const newDay = document.createElement('div');
        newDay.className = 'edit-day-section';
        newDay.dataset.dia = dayCount;
        
        newDay.innerHTML = `
            <div class="edit-day-header">
                <input type="text" class="input-day-name" value="Treino ${String.fromCharCode(65 + dayCount)}" placeholder="Nome do dia">
                <button class="btn-remove-day" onclick="this.closest('.edit-day-section').remove()">🗑️</button>
            </div>
            <div class="edit-exercises-list"></div>
            <button class="btn-add-exercise" onclick="App.addExercise(${dayCount})">+ Adicionar Exercício</button>
        `;
        
        container.appendChild(newDay);
    },
    
    closeWorkoutEditModal() {
        const modal = document.getElementById('workout-edit-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    },
    
    saveWorkoutEdit() {
        const nome = document.getElementById('edit-workout-name')?.value || 'Meu Treino';
        const descricao = document.getElementById('edit-workout-desc')?.value || '';
        
        const dias = [];
        document.querySelectorAll('.edit-day-section').forEach(diaEl => {
            const diaNome = diaEl.querySelector('.input-day-name')?.value || 'Treino';
            const exercicios = [];
            
            diaEl.querySelectorAll('.edit-exercise').forEach(exEl => {
                const exNome = exEl.querySelector('.input-exercise-name')?.value;
                if (exNome && exNome.trim()) {
                    exercicios.push({
                        nome: exNome.trim(),
                        series: parseInt(exEl.querySelector('.input-series')?.value) || 3,
                        repeticoes: exEl.querySelector('.input-reps')?.value || '10-12',
                        descanso: exEl.querySelector('.input-descanso')?.value || '60s'
                    });
                }
            });
            
            if (exercicios.length > 0) {
                dias.push({
                    nome: diaNome,
                    exercicios: exercicios
                });
            }
        });
        
        if (dias.length === 0) {
            Toast.error('Adicione pelo menos um dia com exercícios');
            return;
        }
        
        const novoTreino = {
            nome: nome,
            descricao: descricao,
            divisao: dias.length <= 2 ? 'AB' : (dias.length <= 3 ? 'ABC' : 'ABCD'),
            dias: dias
        };
        
        // Salvar
        localStorage.setItem('treino_atual', JSON.stringify(novoTreino));
        AppState.workouts = [novoTreino];
        
        // Atualizar no servidor
        if (AppState.user?.id) {
            Utils.fetch(`/perfil/${AppState.user.id}`, {
                method: 'PUT',
                body: JSON.stringify({ treino_atual: novoTreino })
            }).catch(err => console.log('Erro ao salvar treino no servidor:', err));
        }
        
        this.closeWorkoutEditModal();
        Toast.success('Treino atualizado com sucesso!');
        
        // Recarregar dashboard e sincronizar
        this.loadTodayWorkout();
        this.renderTreinoTab();
        this.updateSplitPreview();
    },
    
    updateWeekProgress() {
        const today = new Date().getDay(); // 0 = Domingo
        
        // Buscar treinos realizados do localStorage (consistente com loadProgress)
        const treinosRealizados = JSON.parse(localStorage.getItem('historico_treinos') || '[]');
        
        // Calcular quais dias da semana atual foram completados
        const inicioSemana = new Date();
        inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
        inicioSemana.setHours(0, 0, 0, 0);
        
        const diasCompletados = new Set();
        treinosRealizados.forEach(treino => {
            const dataTreino = new Date(treino.data);
            if (dataTreino >= inicioSemana) {
                diasCompletados.add(dataTreino.getDay());
            }
        });
        
        $$('.week-day').forEach((day, i) => {
            day.classList.remove('today', 'completed');
            day.classList.toggle('today', i === today);
            
            // Marcar dias completados com base nos treinos reais
            if (diasCompletados.has(i)) {
                day.classList.add('completed');
            }
        });
    },
    
    loadProfile() {
        // Atualizar stats do perfil
        if (AppState.profile) {
            const peso = $('#stat-peso');
            const altura = $('#stat-altura');
            const idade = $('#stat-idade');
            
            if (peso) peso.textContent = AppState.profile.peso || '-';
            if (altura) altura.textContent = AppState.profile.altura || '-';
            if (idade) idade.textContent = AppState.profile.idade || '-';
        }
    },
    
    showAchievements() {
        const badges = Achievements.getAllBadges();
        const unlockedCount = badges.filter(b => b.unlocked).length;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'achievements-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🏆 Conquistas</h2>
                    <button class="modal-close" onclick="document.getElementById('achievements-modal').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="achievements-summary">
                        <span class="achievements-count">${unlockedCount}/${badges.length}</span>
                        <span class="achievements-label">conquistadas</span>
                    </div>
                    <div class="badges-grid">
                        ${badges.map(b => `
                            <div class="badge-card ${b.unlocked ? '' : 'locked'}" title="${b.description}">
                                <span class="badge-icon">${b.icon}</span>
                                <span class="badge-name">${b.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    loadProgress() {
        // Carregar medidas do perfil ou do localStorage
        const medidas = AppState.profile?.medidas || JSON.parse(localStorage.getItem('medidas_corporais') || '{}');
        
        // Atualizar cards de medidas
        const medidaPeso = $('#medida-peso');
        const medidaBraco = $('#medida-braco');
        const medidaPeito = $('#medida-peito');
        const medidaCintura = $('#medida-cintura');
        
        // Peso pode vir do perfil ou das medidas
        const pesoAtual = medidas.peso || AppState.profile?.peso;
        if (medidaPeso && pesoAtual) {
            medidaPeso.textContent = `${pesoAtual} kg`;
        }
        
        if (medidaBraco && medidas.braco) {
            medidaBraco.textContent = `${medidas.braco} cm`;
        }
        
        if (medidaPeito && medidas.peito) {
            medidaPeito.textContent = `${medidas.peito} cm`;
        }
        
        if (medidaCintura && medidas.cintura) {
            medidaCintura.textContent = `${medidas.cintura} cm`;
        }
        
        // Calcular variação (se houver histórico)
        const historicoMedidas = JSON.parse(localStorage.getItem('historico_medidas') || '[]');
        if (historicoMedidas.length >= 2) {
            const ultimaMedida = historicoMedidas[historicoMedidas.length - 1];
            const penultimaMedida = historicoMedidas[historicoMedidas.length - 2];
            
            this.updateMeasurementChange('peso', ultimaMedida.peso, penultimaMedida.peso, true);
            this.updateMeasurementChange('braco', ultimaMedida.braco, penultimaMedida.braco, false);
            this.updateMeasurementChange('peito', ultimaMedida.peito, penultimaMedida.peito, false);
            this.updateMeasurementChange('cintura', ultimaMedida.cintura, penultimaMedida.cintura, true);
        }
        
        // Calcular estatísticas reais do perfil
        const treinosRealizados = JSON.parse(localStorage.getItem('historico_treinos') || '[]');
        const totalTreinosCount = treinosRealizados.length;
        
        // Calcular total de horas
        let totalMinutos = 0;
        treinosRealizados.forEach(treino => {
            totalMinutos += treino.duracao_minutos || 0;
        });
        const totalHorasNum = Math.round(totalMinutos / 60);
        
        // Calcular streak (dias consecutivos)
        let streak = 0;
        if (treinosRealizados.length > 0) {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            
            // Ordenar treinos por data (mais recente primeiro)
            const treinosOrdenados = [...treinosRealizados]
                .sort((a, b) => new Date(b.data) - new Date(a.data));
            
            let dataAnterior = hoje;
            for (const treino of treinosOrdenados) {
                const dataTreino = new Date(treino.data);
                dataTreino.setHours(0, 0, 0, 0);
                
                const diffDias = Math.floor((dataAnterior - dataTreino) / (1000 * 60 * 60 * 24));
                
                if (diffDias <= 1) {
                    streak++;
                    dataAnterior = dataTreino;
                } else {
                    break;
                }
            }
        }
        
        const totalTreinos = $('#total-treinos');
        const totalHoras = $('#total-horas');
        const streakDias = $('#streak-dias');
        
        if (totalTreinos) totalTreinos.textContent = totalTreinosCount.toString();
        if (totalHoras) totalHoras.textContent = `${totalHorasNum}h`;
        if (streakDias) streakDias.textContent = streak.toString();
        
        // Atualizar gráfico de frequência semanal com dados reais
        this.updateFrequencyChart(treinosRealizados);
        
        // Atualizar lista de histórico recente
        this.updateHistoryList(treinosRealizados);
        
        // Configurar botão de adicionar medida
        this.setupMeasurementsButton();
    },

    updateFrequencyChart(treinosRealizados) {
        const chartContainer = $('#frequency-chart');
        if (!chartContainer) return;

        // Calcular frequência por dia da semana
        const frequencia = [0, 0, 0, 0, 0, 0, 0]; // Dom, Seg, Ter, Qua, Qui, Sex, Sab
        const diasLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        
        treinosRealizados.forEach(treino => {
            if (treino.data) {
                const data = new Date(treino.data);
                const diaSemana = data.getDay();
                frequencia[diaSemana]++;
            }
        });

        // Encontrar máximo para normalização
        const maxFreq = Math.max(...frequencia, 1);

        // Gerar HTML do gráfico
        const barsHtml = frequencia.map((freq, i) => {
            const percent = Math.round((freq / maxFreq) * 100);
            const isToday = new Date().getDay() === i;
            return `
                <div class="chart-bar ${isToday ? 'today' : ''}">
                    <div class="bar-fill" style="height: ${percent}%">
                        ${freq > 0 ? `<span class="bar-count">${freq}</span>` : ''}
                    </div>
                    <span class="bar-label">${diasLabels[i]}</span>
                </div>
            `;
        }).join('');

        // Reorganizar para começar em Segunda
        const reordered = [1, 2, 3, 4, 5, 6, 0].map(i => {
            const freq = frequencia[i];
            const percent = Math.round((freq / maxFreq) * 100);
            const isToday = new Date().getDay() === i;
            return `
                <div class="chart-bar ${isToday ? 'today' : ''}">
                    <div class="bar-fill" style="height: ${Math.max(percent, 5)}%">
                        ${freq > 0 ? `<span class="bar-count">${freq}</span>` : ''}
                    </div>
                    <span class="bar-label">${diasLabels[i]}</span>
                </div>
            `;
        }).join('');

        chartContainer.innerHTML = reordered;
    },

    updateHistoryList(treinosRealizados) {
        const historyContainer = $('#history-list');
        if (!historyContainer) return;

        if (treinosRealizados.length === 0) {
            historyContainer.innerHTML = `
                <div class="history-empty">
                    <span>📊</span>
                    <p>Nenhum treino registrado ainda</p>
                    <p class="hint">Complete seu primeiro treino para ver aqui!</p>
                </div>
            `;
            return;
        }

        // Mostrar últimos 10 treinos (mais recentes primeiro)
        const ultimosTreinos = [...treinosRealizados]
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .slice(0, 10);

        historyContainer.innerHTML = ultimosTreinos.map(treino => {
            const data = new Date(treino.data);
            const dataFormatada = data.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'short'
            });
            const horaFormatada = data.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            const completionRate = treino.series_total > 0 
                ? Math.round((treino.series_completadas / treino.series_total) * 100) 
                : 100;
            const statusClass = completionRate >= 80 ? 'excellent' : (completionRate >= 50 ? 'good' : 'partial');

            return `
                <div class="history-item">
                    <div class="history-date">
                        <span class="date-day">${dataFormatada}</span>
                        <span class="date-time">${horaFormatada}</span>
                    </div>
                    <div class="history-info">
                        <span class="history-name">${treino.treino || 'Treino'}</span>
                        <div class="history-stats">
                            <span>⏱️ ${treino.duracao_minutos || 0}min</span>
                            <span>📊 ${treino.series_completadas || 0}/${treino.series_total || 0} séries</span>
                        </div>
                    </div>
                    <div class="history-completion ${statusClass}">
                        <span class="completion-percent">${completionRate}%</span>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    updateMeasurementChange(tipo, atual, anterior, menorMelhor = false) {
        const card = $(`#medida-${tipo}`)?.closest('.measurement-card');
        if (!card || !atual || !anterior) return;
        
        const changeEl = card.querySelector('.measurement-change');
        if (!changeEl) return;
        
        const diff = atual - anterior;
        const isPositive = menorMelhor ? diff < 0 : diff > 0;
        
        changeEl.className = `measurement-change ${isPositive ? 'positive' : 'negative'}`;
        changeEl.textContent = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}`;
    },
    
    setupMeasurementsButton() {
        const btnAddMedida = $('#btn-add-medida');
        if (btnAddMedida && !btnAddMedida.hasListener) {
            btnAddMedida.hasListener = true;
            btnAddMedida.addEventListener('click', () => {
                this.openMeasurementsModal();
            });
        }
    },
    
    openMeasurementsModal() {
        const modal = $('#modal-medidas');
        if (!modal) return;
        
        // Preencher com valores atuais
        const medidas = AppState.profile?.medidas || JSON.parse(localStorage.getItem('medidas_corporais') || '{}');
        
        const inputPeso = $('#medida-input-peso');
        const inputBraco = $('#medida-input-braco');
        const inputPeito = $('#medida-input-peito');
        const inputCintura = $('#medida-input-cintura');
        
        if (inputPeso) inputPeso.value = medidas.peso || AppState.profile?.peso || '';
        if (inputBraco) inputBraco.value = medidas.braco || '';
        if (inputPeito) inputPeito.value = medidas.peito || '';
        if (inputCintura) inputCintura.value = medidas.cintura || '';
        
        modal.style.display = 'flex';
        
        // Configurar botão salvar
        const btnSalvar = $('#btn-salvar-medidas');
        if (btnSalvar && !btnSalvar.hasListener) {
            btnSalvar.hasListener = true;
            btnSalvar.addEventListener('click', () => {
                this.saveMeasurements();
            });
        }
    },
    
    saveMeasurements() {
        const peso = parseFloat($('#medida-input-peso')?.value) || null;
        const braco = parseFloat($('#medida-input-braco')?.value) || null;
        const peito = parseFloat($('#medida-input-peito')?.value) || null;
        const cintura = parseFloat($('#medida-input-cintura')?.value) || null;
        
        const novasMedidas = {
            peso,
            braco,
            peito,
            cintura,
            data: new Date().toISOString()
        };
        
        // Salvar localmente
        localStorage.setItem('medidas_corporais', JSON.stringify(novasMedidas));
        
        // Adicionar ao histórico
        const historico = JSON.parse(localStorage.getItem('historico_medidas') || '[]');
        historico.push(novasMedidas);
        localStorage.setItem('historico_medidas', JSON.stringify(historico));
        
        // Atualizar no perfil
        if (AppState.profile) {
            AppState.profile.medidas = novasMedidas;
            if (peso) AppState.profile.peso = peso;
        }
        
        // Sincronizar com servidor
        if (AppState.user?.id) {
            Utils.fetch(`/perfil/${AppState.user.id}`, {
                method: 'PUT',
                body: JSON.stringify({ 
                    peso: peso,
                    medidas: novasMedidas
                })
            }).catch(err => console.log('Erro ao salvar medidas:', err));
        }
        
        // Fechar modal e atualizar UI
        const modal = $('#modal-medidas');
        if (modal) modal.style.display = 'none';
        
        Toast.success('Medidas salvas com sucesso!');
        this.loadProgress();
    }
};

// =====================================================
// CHAT
// =====================================================

const Chat = {
    init() {
        this.setupInput();
        this.setupQuickQuestions();
    },
    
    setupInput() {
        const input = $('#chat-input');
        const sendBtn = $('.btn-send');
        const form = $('#chat-form');
        
        if (!input) {
            console.log('Chat input not found');
            return;
        }
        
        const sendMessage = () => {
            const text = input.value.trim();
            if (text) {
                this.send(text);
                input.value = '';
            }
        };
        
        // Se tem form, usa submit
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                sendMessage();
            });
        }
        
        // Se tem botão, adiciona click
        if (sendBtn) {
            sendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                sendMessage();
            });
        }
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    },
    
    setupQuickQuestions() {
        $$('.quick-q').forEach(btn => {
            btn.addEventListener('click', () => {
                this.send(btn.textContent);
            });
        });
    },
    
    async send(message) {
        this.addMessage(message, 'user');
        
        // Mostrar typing indicator
        this.showTyping();
        
        try {
            const response = await Utils.fetch('/chat/perguntar', {
                method: 'POST',
                body: JSON.stringify({
                    usuario_id: AppState.user.id,
                    mensagem: message
                })
            });
            
            this.hideTyping();
            this.addMessage(response.resposta, 'bot');
            
            // Verificar se a resposta contém um novo treino
            if (response.treino_atualizado || response.novo_treino) {
                const novoTreino = response.treino_atualizado || response.novo_treino;
                localStorage.setItem('treino_atual', JSON.stringify(novoTreino));
                AppState.workouts = [novoTreino];
                
                // Sincronizar todas as telas
                if (App.updateSplitPreview) App.updateSplitPreview();
                if (App.loadTodayWorkout) App.loadTodayWorkout();
                
                // Perguntar se quer aplicar
                this.addMessage('✅ Treino atualizado! Vá para a Home para ver as mudanças.', 'bot');
            }
            
            // Verificar se resposta sugere ações
            if (response.acao === 'gerar_treino') {
                this.addMessage('Gerando novo treino personalizado...', 'bot');
                await this.gerarNovoTreino();
            }
            
        } catch (error) {
            this.hideTyping();
            this.addMessage('Desculpe, não consegui processar sua mensagem. Tente novamente.', 'bot');
        }
    },
    
    async gerarNovoTreino() {
        try {
            const response = await Utils.fetch(`/perfil/${AppState.user.id}/completar`, {
                method: 'POST',
                body: JSON.stringify({
                    objetivo: AppState.profile?.objetivo || 'hipertrofia',
                    nivel: AppState.profile?.nivel || 'iniciante',
                    idade: AppState.profile?.idade || 25,
                    peso_kg: AppState.profile?.peso || 70,
                    altura_cm: AppState.profile?.altura || 170,
                    dias_semana: AppState.profile?.dias_disponiveis?.length || 4,
                    duracao_treino_min: AppState.profile?.duracao || 60,
                    local: AppState.profile?.local || 'academia',
                    equipamentos: ['halteres', 'barras', 'maquinas', 'cabos']
                })
            });
            
            if (response.treino) {
                localStorage.setItem('treino_atual', JSON.stringify(response.treino));
                AppState.workouts = [response.treino];
                
                // Sincronizar todas as telas
                if (App.updateSplitPreview) App.updateSplitPreview();
                if (App.loadTodayWorkout) App.loadTodayWorkout();
                
                this.addMessage('✅ Seu novo treino foi criado! Vá para a Home para vê-lo.', 'bot');
            }
        } catch (error) {
            this.addMessage('Não consegui gerar o treino. Tente novamente.', 'bot');
        }
    },
    
    addMessage(text, type) {
        const container = $('#chat-messages');
        if (!container) return;
        
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
        if (!container) return;
        
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
// GERENCIAMENTO DE PERFIL
// =====================================================

const Profile = {
    data: null,
    
    async init() {
        await this.loadProfile();
        this.setupMenuListeners();
        this.setupModalListeners();
    },
    
    async loadProfile() {
        if (!AppState.user?.id) return;
        
        try {
            const response = await Utils.fetch(`/perfil/${AppState.user.id}`);
            const perfil = response.perfil || response;

            // Normalizar campos
            const pesoValor = perfil.peso ?? perfil.peso_kg ?? response.peso_kg ?? response.peso;
            const alturaValor = perfil.altura ?? perfil.altura_cm ?? response.altura_cm ?? response.altura;
            const idadeValor = perfil.idade ?? response.idade;

            this.data = {
                ...perfil,
                peso: pesoValor,
                altura: alturaValor,
                idade: idadeValor
            };
            this.updateDisplay();
        } catch (error) {
            console.error('[Profile] Erro ao carregar perfil:', error);
        }
    },
    
    updateDisplay() {
        if (!this.data) return;
        
        // Avatar e nome
        const avatarLetter = $('#profile-avatar-letter');
        const profileName = $('#profile-name');
        const profileGoal = $('#profile-goal');
        
        if (avatarLetter) avatarLetter.textContent = Utils.getInitials(this.data.nome);
        if (profileName) profileName.textContent = this.data.nome || 'Usuário';
        if (profileGoal) {
            const objetivoMap = {
                'hipertrofia': 'Hipertrofia',
                'forca': 'Força',
                'emagrecimento': 'Emagrecimento',
                'resistencia': 'Resistência',
                'condicionamento': 'Condicionamento'
            };
            const objetivoFormatado = objetivoMap[this.data.objetivo] || this.data.objetivo || 'Hipertrofia';
            const dias = this.data.dias_semana || this.data.dias_disponiveis || 4;
            profileGoal.textContent = `Objetivo: ${objetivoFormatado} • ${dias}x/sem`;
        }
        
        // Stats - Peso, Altura, Idade, IMC
        const statPeso = $('#stat-peso');
        const statAltura = $('#stat-altura');
        const statIdade = $('#stat-idade');
        const statIMC = $('#stat-imc');
        const statIMCName = statIMC?.closest('.profile-stat')?.querySelector('.stat-name');
        
        if (statPeso) statPeso.textContent = this.data.peso ? Math.round(this.data.peso) : '-';
        if (statAltura) statAltura.textContent = this.data.altura ? Math.round(this.data.altura) : '-';
        if (statIdade) statIdade.textContent = this.data.idade || '-';
        
        if (statIMC && this.data.peso && this.data.altura) {
            const alturaM = this.data.altura / 100;
            const imc = this.data.peso / (alturaM * alturaM);
            statIMC.textContent = imc.toFixed(1);
            
            // Classificação do IMC
            let classificacao = 'Normal';
            if (imc < 18.5) classificacao = 'Baixo peso';
            else if (imc < 25) classificacao = 'Normal';
            else if (imc < 30) classificacao = 'Sobrepeso';
            else classificacao = 'Obesidade';
            
            if (statIMCName) statIMCName.textContent = classificacao;
        }
    },
    
    setupMenuListeners() {
        $$('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.openModal(section);
            });
        });
        
        // Botão de excluir conta
        const btnExcluir = $('#btn-excluir-conta');
        if (btnExcluir) {
            btnExcluir.addEventListener('click', () => {
                this.openModal('excluir');
            });
        }
        
        // Botão de reiniciar onboarding
        const btnRestartOnboarding = $('#btn-restart-onboarding');
        if (btnRestartOnboarding) {
            btnRestartOnboarding.addEventListener('click', () => {
                if (confirm('Deseja refazer a configuração inicial? Seus dados atuais serão atualizados.')) {
                    Onboarding.show();
                }
            });
        }

        // Logout direto pelo perfil
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.onclick = () => {
                if (confirm('Deseja sair da aplicação?')) {
                    Auth.logout();
                }
            };
        }
    },
    
    setupModalListeners() {
        // Fechar modais
        $$('[data-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.dataset.close;
                this.closeModal(modalId);
            });
        });
        
        // Fechar ao clicar fora
        $$('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Salvar Dados Pessoais
        const btnSalvarDados = $('#btn-salvar-dados');
        if (btnSalvarDados) {
            btnSalvarDados.addEventListener('click', () => this.saveDados());
        }
        
        // Salvar Objetivos
        const btnSalvarObjetivos = $('#btn-salvar-objetivos');
        if (btnSalvarObjetivos) {
            btnSalvarObjetivos.addEventListener('click', () => this.saveObjetivos());
        }
        
        // Salvar Restrições
        const btnSalvarRestricoes = $('#btn-salvar-restricoes');
        if (btnSalvarRestricoes) {
            btnSalvarRestricoes.addEventListener('click', () => this.saveRestricoes());
        }
        
        // Limpar Restrições
        const btnLimparRestricoes = $('#btn-limpar-restricoes');
        if (btnLimparRestricoes) {
            btnLimparRestricoes.addEventListener('click', () => {
                $$('#restricoes-grid input[type="checkbox"]').forEach(cb => cb.checked = false);
                const outrasRestricoes = $('#edit-outras-restricoes');
                if (outrasRestricoes) outrasRestricoes.value = '';
            });
        }
        
        // Salvar Equipamentos
        const btnSalvarEquipamentos = $('#btn-salvar-equipamentos');
        if (btnSalvarEquipamentos) {
            btnSalvarEquipamentos.addEventListener('click', () => this.saveEquipamentos());
        }
        
        // Confirmar exclusão
        const confirmInput = $('#confirm-delete');
        const btnConfirmarExcluir = $('#btn-confirmar-excluir');
        
        if (confirmInput && btnConfirmarExcluir) {
            confirmInput.addEventListener('input', () => {
                btnConfirmarExcluir.disabled = confirmInput.value !== 'EXCLUIR';
            });
            
            btnConfirmarExcluir.addEventListener('click', () => this.deleteAccount());
        }
    },
    
    openModal(section) {
        const modalMap = {
            'dados': 'modal-dados',
            'objetivos': 'modal-objetivos',
            'restricoes': 'modal-restricoes',
            'equipamentos': 'modal-equipamentos',
            'excluir': 'modal-excluir'
        };
        
        const modalId = modalMap[section];
        if (!modalId) return;
        
        // Popular modal com dados atuais
        this.populateModal(section);
        
        // Mostrar modal
        const modal = $(`#${modalId}`);
        if (modal) modal.style.display = 'flex';
    },
    
    closeModal(modalId) {
        const modal = $(`#${modalId}`);
        if (modal) modal.style.display = 'none';
        
        // Limpar campo de confirmação de exclusão
        if (modalId === 'modal-excluir') {
            const confirmInput = $('#confirm-delete');
            const btnConfirmar = $('#btn-confirmar-excluir');
            if (confirmInput) confirmInput.value = '';
            if (btnConfirmar) btnConfirmar.disabled = true;
        }
    },
    
    populateModal(section) {
        if (!this.data) return;
        
        switch(section) {
            case 'dados':
                const editNome = $('#edit-nome');
                const editEmail = $('#edit-email');
                const editIdade = $('#edit-idade');
                const editSexo = $('#edit-sexo');
                const editPeso = $('#edit-peso');
                const editAltura = $('#edit-altura');
                
                if (editNome) editNome.value = this.data.nome || '';
                if (editEmail) editEmail.value = AppState.user?.email || '';
                if (editIdade) editIdade.value = this.data.idade || '';
                if (editSexo) editSexo.value = this.data.sexo || 'M';
                if (editPeso) editPeso.value = this.data.peso || '';
                if (editAltura) editAltura.value = this.data.altura || '';
                break;
                
            case 'objetivos':
                const editObjetivo = $('#edit-objetivo');
                const editNivel = $('#edit-nivel');
                const editDias = $('#edit-dias');
                const editDuracao = $('#edit-duracao');
                
                if (editObjetivo) editObjetivo.value = this.data.objetivo || 'hipertrofia';
                if (editNivel) editNivel.value = this.data.nivel || 'iniciante';
                if (editDias) editDias.value = this.data.dias_disponiveis || 4;
                if (editDuracao) editDuracao.value = this.data.tempo_por_treino || 60;
                break;
                
            case 'restricoes':
                // Limpar checkboxes
                $$('#restricoes-grid input[type="checkbox"]').forEach(cb => {
                    const limitacoes = this.data.limitacoes || [];
                    cb.checked = limitacoes.includes(cb.value);
                });
                const outrasRestricoes2 = $('#edit-outras-restricoes');
                if (outrasRestricoes2) outrasRestricoes2.value = '';
                break;
                
            case 'equipamentos':
                const editLocal = $('#edit-local');
                if (editLocal) editLocal.value = this.data.local || 'academia';
                $$('#equipamentos-grid input[type="checkbox"]').forEach(cb => {
                    const equipamentos = this.data.equipamentos || [];
                    cb.checked = equipamentos.includes(cb.value);
                });
                break;
        }
    },
    
    async saveDados() {
        Loading.show('Salvando...');
        
        try {
            const atualizacoes = {
                nome: $('#edit-nome')?.value || '',
                idade: parseInt($('#edit-idade')?.value) || 0,
                sexo: $('#edit-sexo')?.value || 'M',
                peso: parseFloat($('#edit-peso')?.value) || 0,
                altura: parseInt($('#edit-altura')?.value) || 0
            };
            
            await Utils.fetch(`/perfil/${AppState.user.id}`, {
                method: 'PUT',
                body: JSON.stringify(atualizacoes)
            });
            
            // Atualizar dados locais
            Object.assign(this.data, atualizacoes);
            this.updateDisplay();
            
            Toast.success('Dados atualizados com sucesso!');
            this.closeModal('modal-dados');
        } catch (error) {
            Toast.error('Erro ao salvar dados');
        } finally {
            Loading.hide();
        }
    },
    
    async saveObjetivos() {
        Loading.show('Salvando...');
        
        try {
            const objetivo = $('#edit-objetivo')?.value || 'hipertrofia';
            const nivel = $('#edit-nivel')?.value || 'iniciante';
            const dias = parseInt($('#edit-dias')?.value) || 4;
            const duracao = parseInt($('#edit-duracao')?.value) || 60;
            
            const atualizacoes = {
                objetivo: objetivo,
                nivel: nivel,
                dias_disponiveis: dias,
                tempo_por_treino: duracao
            };
            
            await Utils.fetch(`/perfil/${AppState.user.id}`, {
                method: 'PUT',
                body: JSON.stringify(atualizacoes)
            });
            
            // Atualizar dados locais do Profile
            this.data.objetivo = objetivo;
            this.data.nivel = nivel;
            this.data.dias_disponiveis = dias;
            this.data.dias_semana = dias;
            this.data.tempo_por_treino = duracao;
            
            // Sincronizar AppState.profile global
            AppState.profile = {
                ...(AppState.profile || {}),
                objetivo: objetivo,
                nivel: nivel,
                dias_semana: dias,
                dias_disponiveis: dias
            };
            
            // Salvar preferências no localStorage para sincronização
            App.saveWorkoutPrefs({
                objetivo: objetivo,
                nivel: nivel,
                dias: dias,
                local: AppState.profile?.local || 'academia'
            });
            
            // Atualizar display do perfil
            this.updateDisplay();
            
            // Regenerar treino se objetivo/dias mudaram
            await App.ensureWorkoutPlan({ force: true, silent: true });
            
            // Marcar treino como personalizado (não veio de template)
            const treinoAtual = JSON.parse(localStorage.getItem('treino_atual') || 'null');
            if (treinoAtual) {
                treinoAtual.meta = {
                    ...(treinoAtual.meta || {}),
                    template_id: null,
                    template_name: null,
                    personalizado: true,
                    objetivo: objetivo,
                    nivel: nivel
                };
                localStorage.setItem('treino_atual', JSON.stringify(treinoAtual));
                AppState.workouts = [treinoAtual];
            }
            
            // Sincronizar TODAS as telas de forma dinâmica
            App.renderTreinoTab();
            App.updateSplitPreview();
            App.updateWeekProgress();
            App.loadProgress();
            App.updateHeader();
            App.loadTodayWorkout();
            App.updateHeroCard();
            App.updateFichaAtualCard();
            App.updateHomeStats();
            App.updateSplitSubtitle();
            
            Toast.success('Objetivos atualizados! Treino regenerado.');
            this.closeModal('modal-objetivos');
        } catch (error) {
            console.error('Erro ao salvar objetivos:', error);
            Toast.error('Erro ao salvar objetivos');
        } finally {
            Loading.hide();
        }
    },
    
    async saveRestricoes() {
        Loading.show('Salvando...');
        
        try {
            const limitacoes = [];
            $$('#restricoes-grid input[type="checkbox"]:checked').forEach(cb => {
                limitacoes.push(cb.value);
            });
            
            const outrasEl = $('#edit-outras-restricoes');
            const outras = outrasEl ? outrasEl.value.trim() : '';
            if (outras) {
                limitacoes.push(outras);
            }
            
            await Utils.fetch(`/perfil/${AppState.user.id}`, {
                method: 'PUT',
                body: JSON.stringify({ limitacoes })
            });
            
            this.data.limitacoes = limitacoes;
            
            Toast.success('Restrições atualizadas!');
            this.closeModal('modal-restricoes');
        } catch (error) {
            Toast.error('Erro ao salvar restrições');
        } finally {
            Loading.hide();
        }
    },
    
    async saveEquipamentos() {
        Loading.show('Salvando...');
        
        try {
            const equipamentos = [];
            $$('#equipamentos-grid input[type="checkbox"]:checked').forEach(cb => {
                equipamentos.push(cb.value);
            });
            
            const localEl = $('#edit-local');
            const local = localEl ? localEl.value : 'academia';
            
            await Utils.fetch(`/perfil/${AppState.user.id}`, {
                method: 'PUT',
                body: JSON.stringify({ equipamentos, local })
            });
            
            this.data.equipamentos = equipamentos;
            this.data.local = local;
            
            Toast.success('Equipamentos atualizados!');
            this.closeModal('modal-equipamentos');
        } catch (error) {
            Toast.error('Erro ao salvar equipamentos');
        } finally {
            Loading.hide();
        }
    },
    
    async deleteAccount() {
        console.log('[Profile] deleteAccount - AppState.user:', AppState.user);
        
        if (!AppState.user || !AppState.user.id) {
            Toast.error('Sessão inválida. Faça login novamente.');
            return;
        }
        
        Loading.show('Excluindo conta e todos os dados...');
        
        try {
            console.log('[Profile] deleteAccount - Chamando DELETE /perfil/' + AppState.user.id);
            const result = await Utils.fetch(`/perfil/${AppState.user.id}`, {
                method: 'DELETE'
            });
            
            console.log('[Profile] deleteAccount - Resultado:', result);
            
            // Limpar TODOS os dados locais
            localStorage.clear();
            sessionStorage.clear();
            
            // Limpar estado da aplicação
            AppState.user = null;
            AppState.token = null;
            AppState.profile = null;
            AppState.workouts = [];
            AppState.messages = [];
            
            Toast.success('Conta e todos os dados excluídos com sucesso');
            this.closeModal('modal-excluir');
            
            // Redirecionar para login
            setTimeout(() => {
                Auth.showLogin();
            }, 1500);
        } catch (error) {
            console.error('[Profile] deleteAccount error:', error);
            Toast.error('Erro ao excluir conta: ' + error.message);
        } finally {
            Loading.hide();
        }
    }
};

// =====================================================
// TREINO ATIVO - SISTEMA PROFISSIONAL
// Inspirado em: Hevy, Strong, JEFIT
// =====================================================

const ActiveWorkout = {
    isActive: false,
    startTime: null,
    timerInterval: null,
    restInterval: null,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    workout: null,
    setsCompleted: [],
    restTime: 0,
    
    start(workout = null) {
        // Obter treino
        this.workout = workout || AppState.workouts[0] || JSON.parse(localStorage.getItem('treino_atual') || 'null');
        
        if (!this.workout || !this.workout.dias) {
            Toast.error('Nenhum treino disponível para iniciar');
            return;
        }
        
        // Determinar dia atual
        const diaSemana = new Date().getDay();
        const indiceHoje = diaSemana === 0 ? 6 : diaSemana - 1;
        const treinoHoje = this.workout.dias[indiceHoje % this.workout.dias.length] || this.workout.dias[0];
        
        this.currentWorkout = treinoHoje;
        this.currentExerciseIndex = 0;
        this.currentSetIndex = 0;
        this.setsCompleted = treinoHoje.exercicios.map(ex => 
            Array(ex.series || 3).fill(null).map(() => ({ reps: null, weight: null, completed: false }))
        );
        
        this.isActive = true;
        this.startTime = Date.now();
        
        // Criar UI do treino ativo
        this.renderActiveWorkout();
        this.startTimer();
        
        Toast.success('Treino iniciado! 💪');
    },
    
    renderActiveWorkout() {
        const container = document.createElement('div');
        container.className = 'active-workout-overlay';
        container.id = 'active-workout';
        
        const exercicios = this.currentWorkout.exercicios;
        
        container.innerHTML = `
            <div class="active-workout-container">
                <!-- Header do Treino Ativo -->
                <div class="aw-header">
                    <div class="aw-header-left">
                        <button class="btn-aw-close" onclick="ActiveWorkout.confirmEnd()">✕</button>
                        <div class="aw-timer" id="aw-timer">00:00</div>
                    </div>
                    <h2 class="aw-title">${this.currentWorkout.nome}</h2>
                    <button class="btn-aw-finish" onclick="ActiveWorkout.finish()">Finalizar</button>
                </div>
                
                <!-- Progress Bar -->
                <div class="aw-progress-container">
                    <div class="aw-progress-bar" id="aw-progress-bar" style="width: 0%"></div>
                </div>
                
                <!-- Lista de Exercícios -->
                <div class="aw-exercises" id="aw-exercises">
                    ${exercicios.map((ex, exIdx) => this.renderExerciseCard(ex, exIdx)).join('')}
                </div>
                
                <!-- Rest Timer Modal (hidden) -->
                <div class="rest-timer-modal" id="rest-timer-modal" style="display: none;">
                    <div class="rest-timer-content">
                        <h3>⏱️ Descanso</h3>
                        <div class="rest-timer-display" id="rest-timer-display">60</div>
                        <div class="rest-timer-actions">
                            <button class="btn-rest-skip" onclick="ActiveWorkout.skipRest()">Pular</button>
                            <button class="btn-rest-add" onclick="ActiveWorkout.addRestTime(15)">+15s</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        
        // Scroll para o primeiro exercício
        this.scrollToExercise(0);
    },
    
    renderExerciseCard(exercise, exIdx) {
        const sets = this.setsCompleted[exIdx] || [];
        const isActive = exIdx === this.currentExerciseIndex;
        
        return `
            <div class="aw-exercise-card ${isActive ? 'active' : ''}" id="aw-exercise-${exIdx}" data-exercise="${exIdx}">
                <div class="aw-exercise-header" onclick="ActiveWorkout.toggleExercise(${exIdx})">
                    <div class="aw-exercise-number">${exIdx + 1}</div>
                    <div class="aw-exercise-info">
                        <span class="aw-exercise-name">${exercise.nome}</span>
                        <span class="aw-exercise-meta">${exercise.series} séries • ${exercise.repeticoes} reps • ${exercise.descanso}</span>
                    </div>
                    <div class="aw-exercise-status">
                        <span class="aw-exercise-completed" id="aw-ex-completed-${exIdx}">0/${exercise.series || 3}</span>
                    </div>
                </div>
                
                <div class="aw-sets-container" id="aw-sets-${exIdx}" style="${isActive ? '' : 'display: none;'}">
                    ${sets.map((set, setIdx) => `
                        <div class="aw-set-row ${set.completed ? 'completed' : ''}" id="aw-set-${exIdx}-${setIdx}">
                            <span class="aw-set-number">Série ${setIdx + 1}</span>
                            <div class="aw-set-inputs">
                                <div class="aw-input-group">
                                    <input type="number" class="aw-input" id="aw-weight-${exIdx}-${setIdx}" 
                                           placeholder="${exercise.carga_usuario || exercise.carga_sugerida || '--'}" 
                                           value="${set.weight || ''}"
                                           onchange="ActiveWorkout.updateSet(${exIdx}, ${setIdx})">
                                    <span class="aw-input-unit">kg</span>
                                </div>
                                <div class="aw-input-group">
                                    <input type="number" class="aw-input" id="aw-reps-${exIdx}-${setIdx}" 
                                           placeholder="${exercise.repeticoes?.split('-')[0] || '10'}" 
                                           value="${set.reps || ''}"
                                           onchange="ActiveWorkout.updateSet(${exIdx}, ${setIdx})">
                                    <span class="aw-input-unit">reps</span>
                                </div>
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
        if (container) {
            const isVisible = container.style.display !== 'none';
            container.style.display = isVisible ? 'none' : 'block';
        }
    },
    
    scrollToExercise(exIdx) {
        const card = document.getElementById(`aw-exercise-${exIdx}`);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },
    
    updateSet(exIdx, setIdx) {
        const weightInput = document.getElementById(`aw-weight-${exIdx}-${setIdx}`);
        const repsInput = document.getElementById(`aw-reps-${exIdx}-${setIdx}`);
        
        if (this.setsCompleted[exIdx] && this.setsCompleted[exIdx][setIdx]) {
            this.setsCompleted[exIdx][setIdx].weight = parseFloat(weightInput?.value) || null;
            this.setsCompleted[exIdx][setIdx].reps = parseInt(repsInput?.value) || null;
        }
    },
    
    completeSet(exIdx, setIdx) {
        this.updateSet(exIdx, setIdx);
        
        if (this.setsCompleted[exIdx] && this.setsCompleted[exIdx][setIdx]) {
            this.setsCompleted[exIdx][setIdx].completed = true;
            
            // Atualizar UI
            const setRow = document.getElementById(`aw-set-${exIdx}-${setIdx}`);
            const btn = document.getElementById(`btn-set-${exIdx}-${setIdx}`);
            
            if (setRow) setRow.classList.add('completed');
            if (btn) {
                btn.classList.add('completed');
                btn.innerHTML = '✓';
            }
            
            // Atualizar contador
            this.updateExerciseCounter(exIdx);
            this.updateProgress();
            
            // Iniciar timer de descanso
            const exercise = this.currentWorkout.exercicios[exIdx];
            const restSeconds = this.parseRestTime(exercise.descanso);
            this.startRestTimer(restSeconds);
            
            // Verificar se passou para próximo exercício
            const allSetsComplete = this.setsCompleted[exIdx].every(s => s.completed);
            if (allSetsComplete && exIdx < this.currentWorkout.exercicios.length - 1) {
                this.currentExerciseIndex = exIdx + 1;
                // Abrir próximo exercício
                setTimeout(() => {
                    const nextContainer = document.getElementById(`aw-sets-${exIdx + 1}`);
                    if (nextContainer) nextContainer.style.display = 'block';
                    this.scrollToExercise(exIdx + 1);
                }, 500);
            }
        }
    },
    
    parseRestTime(restStr) {
        if (!restStr) return 60;
        const match = restStr.match(/(\d+)/);
        return match ? parseInt(match[1]) : 60;
    },
    
    updateExerciseCounter(exIdx) {
        const counter = document.getElementById(`aw-ex-completed-${exIdx}`);
        if (counter && this.setsCompleted[exIdx]) {
            const completed = this.setsCompleted[exIdx].filter(s => s.completed).length;
            const total = this.setsCompleted[exIdx].length;
            counter.textContent = `${completed}/${total}`;
        }
    },
    
    updateProgress() {
        const totalSets = this.setsCompleted.reduce((sum, sets) => sum + sets.length, 0);
        const completedSets = this.setsCompleted.reduce((sum, sets) => sum + sets.filter(s => s.completed).length, 0);
        const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
        
        const progressBar = document.getElementById('aw-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    },
    
    addSet(exIdx) {
        if (this.setsCompleted[exIdx]) {
            this.setsCompleted[exIdx].push({ reps: null, weight: null, completed: false });
            
            // Re-render exercise
            const card = document.getElementById(`aw-exercise-${exIdx}`);
            if (card) {
                card.outerHTML = this.renderExerciseCard(this.currentWorkout.exercicios[exIdx], exIdx);
                // Abrir novamente
                const newContainer = document.getElementById(`aw-sets-${exIdx}`);
                if (newContainer) newContainer.style.display = 'block';
            }
        }
    },
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            
            const timerEl = document.getElementById('aw-timer');
            if (timerEl) {
                timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        }, 1000);
    },
    
    startRestTimer(seconds) {
        this.restTime = seconds;
        const modal = document.getElementById('rest-timer-modal');
        const display = document.getElementById('rest-timer-display');
        
        if (modal) modal.style.display = 'flex';
        if (display) display.textContent = this.restTime;
        
        // Vibrar se disponível
        if (navigator.vibrate) navigator.vibrate(200);
        
        this.restInterval = setInterval(() => {
            this.restTime--;
            if (display) display.textContent = this.restTime;
            
            if (this.restTime <= 0) {
                this.skipRest();
                // Vibrar duas vezes para indicar fim
                if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            }
        }, 1000);
    },
    
    skipRest() {
        if (this.restInterval) {
            clearInterval(this.restInterval);
            this.restInterval = null;
        }
        const modal = document.getElementById('rest-timer-modal');
        if (modal) modal.style.display = 'none';
    },
    
    addRestTime(seconds) {
        this.restTime += seconds;
        const display = document.getElementById('rest-timer-display');
        if (display) display.textContent = this.restTime;
    },
    
    confirmEnd() {
        if (confirm('Tem certeza que deseja cancelar o treino? O progresso não será salvo.')) {
            this.cancel();
        }
    },
    
    cancel() {
        this.cleanup();
        const overlay = document.getElementById('active-workout');
        if (overlay) overlay.remove();
        Toast.warning('Treino cancelado');
    },
    
    finish() {
        // Calcular estatísticas
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
        
        // Salvar treino realizado
        const treinoRealizado = {
            data: new Date().toISOString(),
            treino: this.currentWorkout.nome,
            duracao_minutos: minutes,
            series_completadas: completedSets,
            series_total: totalSets,
            volume_total: totalVolume,
            exercicios: this.setsCompleted.map((sets, idx) => ({
                nome: this.currentWorkout.exercicios[idx]?.nome,
                series: sets
            }))
        };
        
        // Adicionar ao histórico
        const historico = JSON.parse(localStorage.getItem('historico_treinos') || '[]');
        historico.push(treinoRealizado);
        localStorage.setItem('historico_treinos', JSON.stringify(historico));
        
        // Sincronizar com servidor
        if (AppState.user?.id) {
            Utils.fetch(`/treino/registrar`, {
                method: 'POST',
                body: JSON.stringify({
                    user_id: AppState.user.id,
                    dia_treino: this.currentWorkout.nome,
                    exercicios: treinoRealizado.exercicios,
                    duracao_minutos: minutes,
                    feedback: completedSets / totalSets,
                    observacoes: `Volume: ${totalVolume}kg`
                })
            }).catch(err => console.log('Erro ao sincronizar treino:', err));
        }
        
        // Limpar e fechar
        this.cleanup();
        const overlay = document.getElementById('active-workout');
        if (overlay) overlay.remove();
        
        // Mostrar resumo
        this.showSummary(treinoRealizado);
        
        // Verificar conquistas
        Achievements.check('workout_complete', { count: historico.length });
        
        // Sincronizar todas as telas dinamicamente
        App.loadProgress();
        App.updateWeekProgress();
        App.loadTodayWorkout();
        App.updateSplitPreview();
    },
    
    showSummary(treino) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'workout-summary-modal';
        
        modal.innerHTML = `
            <div class="modal-content workout-summary">
                <div class="summary-header">
                    <div class="summary-icon">🎉</div>
                    <h2>Treino Finalizado!</h2>
                </div>
                <div class="summary-stats">
                    <div class="summary-stat">
                        <span class="stat-value">${treino.duracao_minutos}</span>
                        <span class="stat-label">minutos</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-value">${treino.series_completadas}/${treino.series_total}</span>
                        <span class="stat-label">séries</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-value">${Math.round(treino.volume_total)}</span>
                        <span class="stat-label">kg volume</span>
                    </div>
                </div>
                <div class="summary-message">
                    ${this.getMotivationalMessage(treino)}
                </div>
                <button class="btn-primary btn-full" onclick="document.getElementById('workout-summary-modal').remove()">
                    Fechar
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Recarregar dashboard
        App.loadDashboard();
    },
    
    getMotivationalMessage(treino) {
        const percent = Math.round((treino.series_completadas / treino.series_total) * 100);
        
        if (percent === 100) return "💪 Treino perfeito! Você é uma máquina!";
        if (percent >= 80) return "🔥 Excelente treino! Continue assim!";
        if (percent >= 60) return "👍 Bom trabalho! A consistência é a chave!";
        return "✊ Cada treino conta! Volte mais forte na próxima!";
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
// SISTEMA DE CONQUISTAS
// Inspirado em: Nike Run Club, Strava
// =====================================================

const Achievements = {
    badges: [
        { id: 'first_workout', name: 'Primeira Vitória', icon: '🏆', description: 'Complete seu primeiro treino', condition: (data) => data.count >= 1 },
        { id: 'streak_3', name: 'Consistente', icon: '🔥', description: '3 dias consecutivos de treino', condition: (data) => data.streak >= 3 },
        { id: 'streak_7', name: 'Semana Perfeita', icon: '⭐', description: '7 dias consecutivos de treino', condition: (data) => data.streak >= 7 },
        { id: 'streak_30', name: 'Mestre da Consistência', icon: '👑', description: '30 dias consecutivos de treino', condition: (data) => data.streak >= 30 },
        { id: 'workouts_10', name: 'Dedicado', icon: '💪', description: 'Complete 10 treinos', condition: (data) => data.count >= 10 },
        { id: 'workouts_50', name: 'Guerreiro', icon: '⚔️', description: 'Complete 50 treinos', condition: (data) => data.count >= 50 },
        { id: 'workouts_100', name: 'Lenda', icon: '🏅', description: 'Complete 100 treinos', condition: (data) => data.count >= 100 },
        { id: 'early_bird', name: 'Madrugador', icon: '🌅', description: 'Treino antes das 7h', condition: (data) => data.hour < 7 },
        { id: 'night_owl', name: 'Coruja', icon: '🦉', description: 'Treino depois das 22h', condition: (data) => data.hour >= 22 },
        { id: 'volume_1000', name: 'Força Bruta', icon: '🏋️', description: 'Levante 1000kg em um treino', condition: (data) => data.volume >= 1000 },
    ],
    
    unlocked: [],
    
    init() {
        this.unlocked = JSON.parse(localStorage.getItem('achievements') || '[]');
    },
    
    check(event, data) {
        const hour = new Date().getHours();
        const streak = this.calculateStreak();
        const count = (JSON.parse(localStorage.getItem('historico_treinos') || '[]')).length;
        
        const checkData = { ...data, hour, streak, count };
        
        this.badges.forEach(badge => {
            if (!this.unlocked.includes(badge.id) && badge.condition(checkData)) {
                this.unlock(badge);
            }
        });
    },
    
    calculateStreak() {
        const historico = JSON.parse(localStorage.getItem('historico_treinos') || '[]');
        if (historico.length === 0) return 0;
        
        let streak = 0;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const treinosOrdenados = [...historico]
            .sort((a, b) => new Date(b.data) - new Date(a.data));
        
        let dataAnterior = hoje;
        for (const treino of treinosOrdenados) {
            const dataTreino = new Date(treino.data);
            dataTreino.setHours(0, 0, 0, 0);
            
            const diffDias = Math.floor((dataAnterior - dataTreino) / (1000 * 60 * 60 * 24));
            
            if (diffDias <= 1) {
                streak++;
                dataAnterior = dataTreino;
            } else {
                break;
            }
        }
        
        return streak;
    },
    
    unlock(badge) {
        this.unlocked.push(badge.id);
        localStorage.setItem('achievements', JSON.stringify(this.unlocked));
        
        // Mostrar notificação
        this.showUnlockNotification(badge);
    },
    
    showUnlockNotification(badge) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${badge.icon}</div>
            <div class="achievement-info">
                <span class="achievement-title">Conquista Desbloqueada!</span>
                <span class="achievement-name">${badge.name}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    },
    
    getUnlockedBadges() {
        return this.badges.filter(b => this.unlocked.includes(b.id));
    },
    
    getAllBadges() {
        return this.badges.map(b => ({
            ...b,
            unlocked: this.unlocked.includes(b.id)
        }));
    }
};

// =====================================================
// TEMPLATES DE TREINO PRONTOS
// =====================================================

const WorkoutTemplates = {
    templates: [
        {
            id: 'beginner_full',
            name: 'Full Body',
            subtitle: 'Iniciante • 3x/semana',
            description: 'Treino completo para quem está começando. Trabalha todos os grupos em cada sessão.',
            level: 'iniciante',
            days: 3,
            duration: '45-60',
            icon: '🏃',
            category: 'full_body',
            objetivos: ['hipertrofia', 'condicionamento', 'emagrecimento'],
            benefits: ['Base sólida', 'Técnica', 'Adaptação'],
            preview: ['A - Full Body', 'B - Full Body', 'C - Full Body']
        },
        {
            id: 'intermediate_push_pull',
            name: 'Push/Pull/Legs',
            subtitle: 'Intermediário • 6x/semana',
            description: 'Divisão clássica PPL. Empurrar, puxar e pernas em dias alternados.',
            level: 'intermediario',
            days: 6,
            duration: '60-75',
            icon: '💪',
            category: 'ppl',
            objetivos: ['hipertrofia', 'forca'],
            benefits: ['Alto volume', 'Frequência 2x', 'Equilíbrio'],
            preview: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs']
        },
        {
            id: 'upper_lower',
            name: 'Upper/Lower',
            subtitle: 'Intermediário • 4x/semana',
            description: 'Alterna superior e inferior. Ótimo para quem tem 4 dias disponíveis.',
            level: 'intermediario',
            days: 4,
            duration: '50-65',
            icon: '⚡',
            category: 'upper_lower',
            objetivos: ['hipertrofia', 'forca', 'condicionamento'],
            benefits: ['Recuperação', 'Flexível', 'Progressão'],
            preview: ['Upper A', 'Lower A', 'Upper B', 'Lower B']
        },
        {
            id: 'advanced_bro_split',
            name: 'Bro Split',
            subtitle: 'Avançado • 5x/semana',
            description: 'Um grupo muscular por dia. Máximo volume e foco em cada parte.',
            level: 'avancado',
            days: 5,
            duration: '60-75',
            icon: '🔥',
            category: 'bro_split',
            objetivos: ['hipertrofia'],
            benefits: ['Volume máximo', 'Foco muscular', 'Pump intenso'],
            preview: ['Peito', 'Costas', 'Ombros', 'Pernas', 'Braços']
        },
        {
            id: 'strength_5x5',
            name: 'Força 5x5',
            subtitle: 'Intermediário • 3x/semana',
            description: 'Programa clássico de força com os principais levantamentos compostos.',
            level: 'intermediario',
            days: 3,
            duration: '45-60',
            icon: '🏋️',
            category: 'strength',
            objetivos: ['forca'],
            benefits: ['Força máxima', 'Compostos', 'Progressão linear'],
            preview: ['Push (Peito/Ombro)', 'Pull (Costas/Bi)', 'Legs (Pernas)']
        },
        {
            id: 'hypertrophy_high_volume',
            name: 'Hipertrofia Max',
            subtitle: 'Avançado • 5x/semana',
            description: 'Alto volume focado em ganho de massa muscular máximo.',
            level: 'avancado',
            days: 5,
            duration: '70-90',
            icon: '💎',
            category: 'hypertrophy',
            objetivos: ['hipertrofia'],
            benefits: ['Volume alto', 'TUT', 'Pump máximo'],
            preview: ['Peito/Tri', 'Costas/Bi', 'Pernas', 'Ombros', 'Arms Day']
        },
        {
            id: 'fat_loss_circuit',
            name: 'Fat Burn Circuit',
            subtitle: 'Todos os níveis • 4x/semana',
            description: 'Circuito metabólico para queima de gordura e condicionamento.',
            level: 'intermediario',
            days: 4,
            duration: '40-50',
            icon: '🔥',
            category: 'circuit',
            objetivos: ['emagrecimento', 'condicionamento'],
            benefits: ['Queima calórica', 'HIIT', 'Resistência'],
            preview: ['Full Circuit A', 'Full Circuit B', 'HIIT', 'Full Circuit C']
        },
        {
            id: 'athletic_performance',
            name: 'Performance',
            subtitle: 'Intermediário • 4x/semana',
            description: 'Foco em performance atlética, explosão e agilidade.',
            level: 'intermediario',
            days: 4,
            duration: '50-60',
            icon: '⚡',
            category: 'athletic',
            objetivos: ['condicionamento', 'forca'],
            benefits: ['Explosão', 'Agilidade', 'Força funcional'],
            preview: ['Lower Power', 'Upper Power', 'Plyo/Core', 'Full Athletic']
        }
    ],
    
    selectedTemplate: null,
    
    getTemplateById(templateId) {
        return this.templates.find(t => t.id === templateId) || null;
    },

    mapTemplateToObjetivo(template) {
        // Mapear categoria do template para objetivo do gerador
        const map = {
            'full_body': 'hipertrofia',
            'ppl': 'hipertrofia',
            'upper_lower': 'hipertrofia',
            'bro_split': 'hipertrofia',
            'strength': 'forca',
            'hypertrophy': 'hipertrofia',
            'circuit': 'emagrecimento',
            'athletic': 'condicionamento'
        };
        return map[template.category] || (template.objetivos && template.objetivos[0]) || 'hipertrofia';
    },

    async loadTemplate(templateId) {
        Loading.show('Gerando treino do template...');
        
        try {
            const template = this.getTemplateById(templateId);
            if (!template) {
                Toast.error('Template não encontrado');
                return;
            }

            // Gerar treino localmente usando WorkoutGenerator baseado no template
            const objetivo = this.mapTemplateToObjetivo(template);
            const nivel = template.level || 'intermediario';
            const dias = template.days || 4;
            const local = AppState.profile?.local || 'academia';

            const treino = WorkoutGenerator.generatePlan({
                userId: AppState.user?.id,
                objetivo,
                dias,
                nivel,
                local
            });

            // Personalizar nome e descrição com base no template
            treino.nome = `${template.name} (${dias}x/semana)`;
            treino.descricao = template.description;
            treino.meta = {
                ...treino.meta,
                template_id: templateId,
                template_name: template.name,
                objetivo: objetivo,
                nivel: nivel
            };

            // Aplicar nomes dos dias do template (preview) aos dias gerados
            if (template.preview && Array.isArray(template.preview)) {
                treino.dias.forEach((dia, i) => {
                    if (template.preview[i]) {
                        const letra = String.fromCharCode(65 + i); // A, B, C...
                        dia.nome = `Treino ${letra} - ${template.preview[i]}`;
                        dia.grupos = template.preview[i];
                    }
                });
            }

            // Salvar treino
            localStorage.setItem('treino_atual', JSON.stringify(treino));
            AppState.workouts = [treino];

            // Atualizar objetivo no perfil para sincronizar com todo sistema
            AppState.profile = {
                ...(AppState.profile || {}),
                objetivo: objetivo,
                dias_semana: dias,
                nivel: nivel
            };

            // Atualizar preferências salvas
            App.saveWorkoutPrefs({
                objetivo,
                dias,
                nivel,
                local
            });

            // Sincronizar objetivo e treino com servidor
            if (AppState.user?.id) {
                Utils.fetch(`/perfil/${AppState.user.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ 
                        treino_atual: treino,
                        objetivo: objetivo,
                        nivel: nivel,
                        dias_disponiveis: dias
                    })
                }).catch(err => console.log('Erro ao salvar treino no servidor:', err));
            }

            Toast.success(`Template "${template.name}" aplicado!`);

            // Atualizar TODAS as telas de forma dinâmica
            App.loadTodayWorkout();
            App.updateHeroCard();
            App.updateFichaAtualCard();
            App.updateHomeStats();
            App.updateSplitSubtitle();
            App.renderTreinoTab();
            App.updateSplitPreview();
            App.updateWeekProgress();
            App.loadProgress();
            App.updateHeader();

            // Navegar para aba treino
            App.switchTab('treino');

        } catch (error) {
            console.error('Erro ao carregar template:', error);
            Toast.error('Erro ao aplicar template');
        } finally {
            Loading.hide();
        }
    },

    getFilteredTemplates(objetivo = null) {
        if (!objetivo) return this.templates;
        return this.templates.filter(t => 
            t.objetivos && t.objetivos.includes(objetivo)
        );
    },
    
    showTemplateSelector() {
        const prefs = App.getWorkoutPrefsFromProfile();
        const currentObjetivo = prefs.objetivo || 'hipertrofia';
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'template-modal';
        
        modal.innerHTML = `
            <div class="modal-content modal-templates-v2">
                <button class="modal-close-fab" onclick="document.getElementById('template-modal').remove()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
                
                <div class="templates-hero">
                    <div class="hero-icon">📋</div>
                    <h2>Escolha seu Programa</h2>
                    <p>Selecione uma categoria para ver os treinos disponíveis</p>
                </div>
                
                <div class="templates-categories">
                    <div class="category-item" data-filter="all">
                        <div class="category-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="7" height="7" rx="1"/>
                                <rect x="14" y="3" width="7" height="7" rx="1"/>
                                <rect x="3" y="14" width="7" height="7" rx="1"/>
                                <rect x="14" y="14" width="7" height="7" rx="1"/>
                            </svg>
                        </div>
                        <span class="category-label">Todos</span>
                        <span class="category-count">${this.templates.length}</span>
                    </div>
                    <div class="category-item" data-filter="hipertrofia">
                        <div class="category-icon muscle">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                            </svg>
                        </div>
                        <span class="category-label">Hipertrofia</span>
                        <span class="category-count">${this.templates.filter(t => t.objetivos?.includes('hipertrofia')).length}</span>
                    </div>
                    <div class="category-item" data-filter="forca">
                        <div class="category-icon strength">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                            </svg>
                        </div>
                        <span class="category-label">Força</span>
                        <span class="category-count">${this.templates.filter(t => t.objetivos?.includes('forca')).length}</span>
                    </div>
                    <div class="category-item" data-filter="emagrecimento">
                        <div class="category-icon burn">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
                            </svg>
                        </div>
                        <span class="category-label">Emagrecer</span>
                        <span class="category-count">${this.templates.filter(t => t.objetivos?.includes('emagrecimento')).length}</span>
                    </div>
                    <div class="category-item" data-filter="condicionamento">
                        <div class="category-icon cardio">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                            </svg>
                        </div>
                        <span class="category-label">Condição</span>
                        <span class="category-count">${this.templates.filter(t => t.objetivos?.includes('condicionamento')).length}</span>
                    </div>
                </div>
                
                <div class="templates-list" id="templates-catalog">
                    ${this.renderTemplateCatalog('all')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Bind categorias
        modal.querySelectorAll('.category-item').forEach(cat => {
            cat.addEventListener('click', (e) => {
                modal.querySelectorAll('.category-item').forEach(c => c.classList.remove('active'));
                cat.classList.add('active');
                const filter = cat.dataset.filter;
                document.getElementById('templates-catalog').innerHTML = this.renderTemplateCatalog(filter);
            });
        });
        
        // Ativar a primeira categoria
        modal.querySelector('.category-item').classList.add('active');
    },

    renderTemplateCatalog(filter = 'all') {
        const templates = filter === 'all' 
            ? this.templates 
            : this.templates.filter(t => t.objetivos && t.objetivos.includes(filter));
        
        if (templates.length === 0) {
            return `
                <div class="templates-empty">
                    <span class="empty-icon">🔍</span>
                    <p>Nenhum programa encontrado</p>
                </div>
            `;
        }

        return `
            <div class="templates-grid-v2">
                ${templates.map(t => `
                    <div class="template-card-v2" onclick="WorkoutTemplates.previewTemplate('${t.id}')">
                        <div class="tpl-card-icon">${t.icon}</div>
                        <div class="tpl-card-body">
                            <h4>${t.name}</h4>
                            <p>${t.subtitle}</p>
                        </div>
                        <div class="tpl-card-footer">
                            <span class="tpl-days">${t.days}x/sem</span>
                            <span class="tpl-level ${t.level}">${t.level}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    previewTemplate(templateId) {
        const template = this.getTemplateById(templateId);
        if (!template) return;

        this.selectedTemplate = templateId;

        // Preview treino que seria gerado
        const objetivo = this.mapTemplateToObjetivo(template);
        const nivel = template.level || 'intermediario';
        const dias = template.days || 4;
        const local = AppState.profile?.local || 'academia';

        const preview = WorkoutGenerator.generatePlan({
            userId: null,
            objetivo,
            dias,
            nivel,
            local
        });

        const previewDias = preview.dias || [];

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'template-preview-modal';

        modal.innerHTML = `
            <div class="modal-content modal-template-preview">
                <div class="preview-header">
                    <button class="preview-back-btn" onclick="WorkoutTemplates.closePreview()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 18l-6-6 6-6"/>
                        </svg>
                    </button>
                    <div class="preview-header-info">
                        <span class="preview-icon">${template.icon}</span>
                        <div>
                            <h2>${template.name}</h2>
                            <p>${template.subtitle}</p>
                        </div>
                    </div>
                </div>

                <div class="preview-body">
                    <div class="preview-description">
                        <p>${template.description}</p>
                    </div>

                    <div class="preview-stats-row">
                        <div class="preview-stat">
                            <span class="stat-value">${template.days}</span>
                            <span class="stat-label">dias/sem</span>
                        </div>
                        <div class="preview-stat">
                            <span class="stat-value">${template.duration}</span>
                            <span class="stat-label">minutos</span>
                        </div>
                        <div class="preview-stat">
                            <span class="stat-value level-${template.level}">${template.level}</span>
                            <span class="stat-label">nível</span>
                        </div>
                    </div>

                    <div class="preview-benefits">
                        ${(template.benefits || []).map(b => `<span class="preview-benefit">${b}</span>`).join('')}
                    </div>

                    <div class="preview-objectives">
                        <span class="preview-obj-label">Ideal para:</span>
                        ${(template.objetivos || []).map(o => {
                            const icons = { hipertrofia: '💪', forca: '🏋️', emagrecimento: '🔥', condicionamento: '⚡' };
                            const names = { hipertrofia: 'Hipertrofia', forca: 'Força', emagrecimento: 'Emagrecer', condicionamento: 'Condição' };
                            return `<span class="preview-obj-tag">${icons[o] || '🎯'} ${names[o] || o}</span>`;
                        }).join('')}
                    </div>

                    <div class="preview-split-section">
                        <h3>Divisão do Treino</h3>
                        <div class="preview-split-days">
                            ${previewDias.map((dia, i) => `
                                <div class="preview-day">
                                    <span class="preview-day-letter">${String.fromCharCode(65 + i)}</span>
                                    <div class="preview-day-info">
                                        <span class="preview-day-name">${dia.grupos || dia.nome}</span>
                                        <span class="preview-day-count">${dia.exercicios?.length || 0} exercícios</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="preview-exercises-section">
                        <h3>Prévia dos Exercícios</h3>
                        <div class="preview-exercises-accordion">
                            ${previewDias.map((dia, i) => `
                                <details class="preview-day-detail">
                                    <summary>
                                        <span class="day-indicator">${String.fromCharCode(65 + i)}</span>
                                        <span class="day-title">${dia.nome}</span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M6 9l6 6 6-6"/>
                                        </svg>
                                    </summary>
                                    <div class="day-exercises-list">
                                        ${(dia.exercicios || []).slice(0, 6).map(ex => `
                                            <div class="preview-exercise-item">
                                                <span class="ex-name">${ex.nome}</span>
                                                <span class="ex-sets">${ex.series}x${ex.repeticoes}</span>
                                            </div>
                                        `).join('')}
                                        ${(dia.exercicios?.length || 0) > 6 ? `<span class="more-hint">+${dia.exercicios.length - 6} exercícios</span>` : ''}
                                    </div>
                                </details>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="preview-footer">
                    <button class="btn-secondary-large" onclick="WorkoutTemplates.closePreview()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 18l-6-6 6-6"/>
                        </svg>
                        Ver outros
                    </button>
                    <button class="btn-primary-large" onclick="WorkoutTemplates.confirmTemplate('${template.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 13l4 4L19 7"/>
                        </svg>
                        Usar este treino
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    closePreview() {
        const previewModal = document.getElementById('template-preview-modal');
        if (previewModal) previewModal.remove();
    },

    async confirmTemplate(templateId) {
        // Fechar modais
        document.getElementById('template-preview-modal')?.remove();
        document.getElementById('template-modal')?.remove();

        // Carregar o template
        await this.loadTemplate(templateId);

        // Atualizar seção Sua Divisão
        App.updateSplitPreview();
    }
};

// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] Iniciando...');

    try {
        Toast.init();
        console.log('[App] Toast inicializado');
    } catch (error) {
        console.error('[App] Erro ao iniciar Toast:', error);
    }

    try {
        Achievements.init();
        console.log('[App] Achievements inicializado');
    } catch (error) {
        console.error('[App] Erro ao iniciar Achievements:', error);
    }

    try {
        Auth.init();
        console.log('[App] Auth inicializado');
    } catch (error) {
        console.error('[App] Erro ao iniciar Auth:', error);
        console.error('[App] Stack:', error.stack);
    }
});

// Export para debug
window.AppState = AppState;
window.Auth = Auth;
window.App = App;
window.Profile = Profile;
window.ActiveWorkout = ActiveWorkout;
window.Achievements = Achievements;
window.WorkoutTemplates = WorkoutTemplates;
