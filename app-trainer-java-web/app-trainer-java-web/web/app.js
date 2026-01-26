// ========== CUSTOMIZAÇÃO DE DASHBOARD ==========
function openDashboardCustomizer() {
    const modal = document.getElementById('modal-dashboard-customizer');
    if (!modal) return;
    renderDashboardCustomizerList();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeDashboardCustomizer() {
    const modal = document.getElementById('modal-dashboard-customizer');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function renderDashboardCustomizerList() {
    const list = document.getElementById('customizer-widgets-list');
    if (!list) return;
    const config = DashboardWidgets.currentConfig.slice().sort((a, b) => a.order - b.order);
    list.innerHTML = '';
    config.forEach((w, idx) => {
        const def = DashboardWidgets.definitions[w.id];
        if (!def) return;
        const item = document.createElement('div');
        item.className = 'customizer-widget-item' + (w.visible ? ' active' : ' available');
        item.setAttribute('data-widget-id', w.id);
        item.setAttribute('draggable', def.required ? 'false' : 'true');
        item.innerHTML = `
            <span class="widget-item-icon">${def.icon}</span>
            <div class="widget-item-info">
                <strong>${def.name}</strong>
                ${def.required ? '<span class="widget-required">(fixo)</span>' : ''}
            </div>
            ${!def.required ? `<button class="widget-item-remove" title="${w.visible ? 'Ocultar' : 'Ativar'}">${w.visible ? '❌' : '➕'}</button>` : ''}
        `;
        // Drag events
        if (!def.required) {
            item.addEventListener('dragstart', e => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', idx);
                item.classList.add('dragging');
            });
            item.addEventListener('dragend', () => item.classList.remove('dragging'));
            item.addEventListener('dragover', e => { e.preventDefault(); item.classList.add('drag-over'); });
            item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
            item.addEventListener('drop', e => {
                e.preventDefault();
                item.classList.remove('drag-over');
                const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
                DashboardWidgets.reorderWidgets(fromIdx, idx);
                renderDashboardCustomizerList();
            });
        }
        // Toggle
        const btn = item.querySelector('.widget-item-remove');
        if (btn) {
            btn.onclick = (ev) => {
                DashboardWidgets.toggleWidget(w.id);
                renderDashboardCustomizerList();
            };
        }
        list.appendChild(item);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const btnFloating = document.getElementById('btn-customize-floating');
    if (btnFloating) btnFloating.addEventListener('click', openDashboardCustomizer);
    const btnSave = document.getElementById('btn-save-dashboard');
    if (btnSave) btnSave.addEventListener('click', () => {
        DashboardWidgets.saveConfig();
        closeDashboardCustomizer();
        if (typeof App?.loadDashboard === 'function') App.loadDashboard();
        Toast.success('Dashboard atualizado!');
    });
    const btnReset = document.getElementById('btn-reset-dashboard');
    if (btnReset) btnReset.addEventListener('click', () => {
        DashboardWidgets.resetToDefault();
        renderDashboardCustomizerList();
        Toast.info('Configuração restaurada ao padrão.');
    });
    // Fechar modal ao clicar fora do conteúdo
    const modal = document.getElementById('modal-dashboard-customizer');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeDashboardCustomizer();
        });
    }
});
// Excluir treino
function deleteTreino() {
    if (confirm('Deseja realmente excluir o treino atual?')) {
        localStorage.removeItem('treino_atual');
        Toast.success('Treino excluído!');
        closeEditTreinoModal();
        if (typeof App?.loadDashboard === 'function') App.loadDashboard();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btnDelete = document.getElementById('btn-delete-treino');
    if (btnDelete) btnDelete.addEventListener('click', deleteTreino);
});
// ========== EDITOR DE TREINO ==========
function openEditTreinoModal(treino = null) {
    const modal = document.getElementById('modal-edit-treino');
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // Preenche campos se for edição
    document.getElementById('edit-treino-nome').value = treino?.nome || '';
    document.getElementById('edit-treino-dias').value = treino?.dias || 4;
    document.getElementById('edit-treino-exercicios').value = treino?.exercicios?.join('\n') || '';
}

function closeEditTreinoModal() {
    const modal = document.getElementById('modal-edit-treino');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
    const btnCancel = document.getElementById('btn-cancel-edit-treino');
    if (btnCancel) btnCancel.addEventListener('click', closeEditTreinoModal);
    const form = document.getElementById('form-edit-treino');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const nome = document.getElementById('edit-treino-nome').value.trim();
            const dias = parseInt(document.getElementById('edit-treino-dias').value);
            const exercicios = document.getElementById('edit-treino-exercicios').value.split('\n').map(x => x.trim()).filter(Boolean);
            if (!nome || !dias || exercicios.length === 0) {
                Toast.warning('Preencha todos os campos!');
                return;
            }
            // Salva treino no localStorage
            const treino = { nome, dias, exercicios };
            localStorage.setItem('treino_atual', JSON.stringify(treino));
            Toast.success('Treino salvo!');
            closeEditTreinoModal();
            // Atualiza dashboard se necessário
            if (typeof App?.loadDashboard === 'function') App.loadDashboard();
        });
    }
});

// Expor função para abrir modal pelo App
if (typeof window.App === 'object') {
    window.App.openEditTreinoModal = openEditTreinoModal;
}
// Ou garantir que estará disponível
window.openEditTreinoModal = openEditTreinoModal;
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
// Altere para a URL do backend Java em produção
// Gateway Java sempre como base
const BASE_URL = 'https://app-1-0-java.onrender.com';
const ML_SERVICE = 'https://app-1-0-python.onrender.com';

const AppState = {
    user: null,
    token: null,
    refreshToken: null,
    tokenExpiry: null,
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
        'fadiga': { id: 'fadiga', name: 'Fadiga', icon: '🧭', size: 'half', category: 'recuperacao', order: 6.5 },
        'sua-divisao': { id: 'sua-divisao', name: 'Sua Divisão', icon: '📅', size: 'full', category: 'treino', order: 7 },
        'timer-descanso': { id: 'timer-descanso', name: 'Timer', icon: '⏱️', size: 'half', category: 'ferramentas', order: 8 },
        'agua': { id: 'agua', name: 'Hidratação', icon: '💧', size: 'half', category: 'saude', order: 9 },
        'nutricao': { id: 'nutricao', name: 'Nutrição', icon: '🍽️', size: 'half', category: 'saude', order: 9.2 },
        'motivacional': { id: 'motivacional', name: 'Motivacional', icon: '💪', size: 'full', category: 'motivacao', order: 10 },
        'planejamento-semanal': { id: 'planejamento-semanal', name: 'Planejamento', icon: '🗓️', size: 'full', category: 'treino', order: 11 },
        'prs-volume': { id: 'prs-volume', name: 'PRs e Volume', icon: '🏆', size: 'half', category: 'stats', order: 12 },
        'sono-recuperacao': { id: 'sono-recuperacao', name: 'Sono', icon: '😴', size: 'half', category: 'recuperacao', order: 13 }
    },

    defaultConfig: [
        { id: 'motivacional', visible: true, order: 0 },
        { id: 'hero-treino', visible: true, order: 1 },
        { id: 'ficha-atual', visible: true, order: 2 },
        { id: 'templates', visible: true, order: 3 },
        { id: 'quick-stats', visible: true, order: 4 },
        { id: 'coach-ia', visible: true, order: 5 },
        { id: 'nutricao', visible: true, order: 6 },
        { id: 'progresso', visible: true, order: 7 },
        { id: 'conquistas', visible: true, order: 8 },
        { id: 'sua-divisao', visible: true, order: 9 }
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
            'fadiga': this.renderFadiga,
            'sua-divisao': this.renderSuaDivisao,
            'timer-descanso': this.renderTimer,
            'agua': this.renderAgua,
            'nutricao': this.renderNutricao,
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
        const icon = treino?.icon || '🏋️';

        return `
            <div class="dashboard-widget dashboard-hero" data-widget-id="hero-treino" onclick="App.startWorkout()">
                ${this.renderDragHandle()}
                <div class="hero-gradient"></div>
                <div class="hero-content">
                    <div class="hero-badge"><span class="pulse-dot"></span><span>Hoje</span></div>
                    ${icon?.includes('<svg') ? `<div class="hero-icon">${icon}</div>` : `<div class="hero-icon-emoji">${icon}</div>`}
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
                    <div class="ficha-title">
                        <div class="ficha-icon-container" id="ficha-icon-wrapper">${treino.icon?.includes('<svg') ? treino.icon : `<span class="ficha-icon-text">${treino.icon || '📋'}</span>`}</div>
                        <div class="ficha-text">
                            <h3>${treino.nome || 'Treino Personalizado'}</h3>
                            <span class="ficha-subtitle">${treino.subtitle || `${treino.dias?.length || treino.dias || 0}x/semana`}</span>
                            <div class="ficha-level">
                                ${(() => {
                                    const nivel = treino.level || treino.nivel || 'personalizado';
                                    const labels = { iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado', avançado: 'Avançado', personalizado: 'Personalizado' };
                                    const label = labels[nivel] || 'Personalizado';
                                    return `<span class="template-level ${nivel}">${label}</span>`;
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="ficha-action">
                  <button class="btn-secondary" type="button" aria-label="Editar treino" onclick="openEditTreinoModal(App.getTreinoAtual()); event.stopPropagation();">✏️ Editar</button>
                </div>
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

    renderFadiga() {
        const status = FatigueSystem.getDashboardStatus();
        const bars = FatigueSystem.getRecentSessions(7);
        return `
            <div class="dashboard-widget widget-card card-fatigue" data-widget-id="fadiga" onclick="FatigueSystem.showFullChart()">
                ${this.renderDragHandle()}
                <div class="feature-row">
                    <div class="feature-icon">🧭</div>
                    <div class="feature-info">
                        <h3>Fadiga</h3>
                        <p>${status.label}</p>
                    </div>
                    <div class="fatigue-chip ${status.level}">${status.text}</div>
                </div>
                <div class="fatigue-mini-bars">
                    ${bars.map(b => `
                        <div class="mini-bar" title="${b.label}" style="height:${b.height}%; background:${b.color}"></div>
                    `).join('')}
                </div>
                <div class="fatigue-footer">${status.suggestion}</div>
            </div>
        `;
    },

    renderNutricao() {
        const sum = NutritionSystem.getTodaySummary();
        const pctProt = Math.min(100, Math.round((sum.totalProteina / sum.meta.proteina) * 100) || 0);
        const pctCarb = Math.min(100, Math.round((sum.totalCarbs / sum.meta.carboidrato) * 100) || 0);
        const pctFat = Math.min(100, Math.round((sum.totalGordura / sum.meta.gordura) * 100) || 0);
        const pctCal = Math.min(100, Math.round((sum.totalCals / sum.meta.calorias) * 100) || 0);
        return `
            <div class="dashboard-widget widget-card card-nutrition" data-widget-id="nutricao">
                ${this.renderDragHandle()}
                <div class="feature-row nutrition-header-row">
                    <div class="feature-icon">🍽️</div>
                    <div class="feature-info">
                        <h3>Nutrição</h3>
                        <p>Calorias: ${sum.totalCals} / ${sum.meta.calorias} kcal</p>
                    </div>
                </div>
                <div class="nutrition-actions">
                    <button class="btn-mini" onclick="NutritionSystem.promptAddMeal()">+ Registrar</button>
                    <button class="btn-mini-secondary" onclick="NutritionSystem.showDashboard()">Detalhes</button>
                    <button class="btn-mini-secondary" onclick="NutritionSystem.showMacroCalculator()">Calcular</button>
                </div>
                <div class="macro-bars">
                    <div class="macro-row"><span>Proteína</span><div class="bar"><div class="fill prot" style="width:${pctProt}%"></div></div><span>${sum.totalProteina}/${sum.meta.proteina}g</span></div>
                    <div class="macro-row"><span>Carbo</span><div class="bar"><div class="fill carb" style="width:${pctCarb}%"></div></div><span>${sum.totalCarbs}/${sum.meta.carboidrato}g</span></div>
                    <div class="macro-row"><span>Gordura</span><div class="bar"><div class="fill fat" style="width:${pctFat}%"></div></div><span>${sum.totalGordura}/${sum.meta.gordura}g</span></div>
                </div>
                <div class="cal-progress">
                    <div class="bar"><div class="fill cal" style="width:${pctCal}%"></div></div>
                    <span>${pctCal}% da meta diária</span>
                </div>
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
            "A dor que você sente hoje será a força que você sentirá amanhã.",
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
        const today = SleepSystem.getTodayRecord();
        const score = today ? SleepSystem.getScore(today) : 0;
        const status = SleepSystem.getStatus(score);
        const trend = SleepSystem.getTrendStatus(7);
        const duration = today ? today.durationHours : '--';

        return `
            <div class="dashboard-widget widget-card card-sono" data-widget-id="sono-recuperacao" onclick="SleepSystem.showDashboard()">
                ${this.renderDragHandle()}
                <div class="sono-header">
                    <div class="sono-title-section">
                        <span>😴 Sono</span>
                        <small class="sono-status-badge ${status.level}">${status.text}</small>
                    </div>
                    <div class="sono-trend">${trend.trend} ${trend.pct}%</div>
                </div>
                <div class="sono-body">
                    <div class="sono-score-display">
                        <div class="sono-score">${score}</div>
                        <div class="sono-score-label">/100</div>
                    </div>
                    <div class="sono-details">
                        <div class="sono-detail-row">
                            <span class="sono-icon">⏰</span>
                            <span class="sono-text">${duration !== '--' ? duration + 'h' : '--'}</span>
                        </div>
                        ${today ? `
                        <div class="sono-detail-row">
                            <span class="sono-icon">⭐</span>
                            <span class="sono-text">${today.quality}/10</span>
                        </div>
                        <div class="sono-detail-row">
                            <span class="sono-icon">📅</span>
                            <span class="sono-text">${today.date.slice(5)}</span>
                        </div>
                        ` : `
                        <div class="sono-detail-row">
                            <span class="sono-text">Clique para registrar</span>
                        </div>
                        `}
                    </div>
                </div>
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
    // Verifica se token está próximo de expirar (1 minuto de margem)
    if (AppState.tokenExpiry && (AppState.tokenExpiry - Date.now()) < 60000) {
        console.log('⚠️ Token próximo de expirar, fazendo refresh preventivo...');
        await Auth.refreshAccessToken();
    }
    
    try {
        // Se endpoint não for absoluto, prefixa com BASE_URL
        let url = endpoint;
        if (!/^https?:\/\//.test(endpoint)) {
            url = BASE_URL + (endpoint.startsWith('/') ? endpoint : '/' + endpoint);
        }
        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        });
        const text = await response.text();
        // Se receber 401, tenta refresh e retry uma vez
        if (response.status === 401 && AppState.refreshToken && !options._retried) {
            console.log('🔄 Token inválido (401), tentando refresh...');
            const refreshed = await Auth.refreshAccessToken();
            if (refreshed) {
                console.log('✅ Retry após refresh');
                options._retried = true;
                return api(endpoint, options); // Retry com novo token
            }
        }
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
        if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(senha)) {
            if (errorEl) errorEl.textContent = 'A senha deve conter pelo menos 1 símbolo especial (!@#$%^&* etc)';
            return;
        }
        
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
            if (errorEl) {
                if (error.message?.includes('409')) {
                    errorEl.textContent = 'Email já cadastrado';
                } else if (error.message?.includes('símbolo')) {
                    errorEl.textContent = 'A senha deve conter pelo menos 1 símbolo especial (!@#$%^&* etc)';
                } else {
                    errorEl.textContent = error.message || 'Erro';
                }
            }
        } finally { showLoading(false); }
    },

    saveSession(data) {
        AppState.user = { id: data.user_id, nome: data.nome, email: data.email };
        // Suporta tanto formato antigo (token) quanto novo (access_token)
        AppState.token = data.access_token || data.token;
        AppState.refreshToken = data.refresh_token || null;
        // Calcula tempo de expiração (expires_in em segundos, convertido para timestamp)
        AppState.tokenExpiry = data.expires_in ? Date.now() + (data.expires_in * 1000) : null;
        AppState.profile = data.perfil || null;
        localStorage.setItem('shaipados_auth', JSON.stringify({ 
            user: AppState.user, 
            token: AppState.token, 
            refreshToken: AppState.refreshToken,
            tokenExpiry: AppState.tokenExpiry,
            profile: AppState.profile 
        }));
    },

    async checkSession() {
        const stored = localStorage.getItem('shaipados_auth');
        if (!stored) { this.showLogin(); return; }
        try {
            const data = JSON.parse(stored);
            if (!data.user?.id || !data.token) { this.showLogin(); return; }
            AppState.user = data.user;
            AppState.token = data.token;
            AppState.refreshToken = data.refreshToken || null;
            AppState.tokenExpiry = data.tokenExpiry || null;
            AppState.profile = data.profile;
            
            // Verifica se token expirou
            if (AppState.tokenExpiry && Date.now() > AppState.tokenExpiry) {
                console.log('⏰ Token expirado, tentando refresh...');
                const refreshed = await this.refreshAccessToken();
                if (!refreshed) {
                    console.log('❌ Refresh falhou, fazendo logout');
                    this.logout();
                    return;
                }
            }
            
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

    _refreshAttempts: 0,
    async refreshAccessToken() {
        const MAX_REFRESH_ATTEMPTS = 5;
        if (!AppState.refreshToken) {
            console.log('❌ Sem refresh token disponível');
            return false;
        }
        if (this._refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
            console.error('❌ Limite de tentativas de refresh atingido. Faça login novamente.');
            this._refreshAttempts = 0;
            this.showLogin();
            return false;
        }
        this._refreshAttempts++;
        try {
            console.log('🔄 Tentando refresh do access token...');
            const response = await fetch(BASE_URL + '/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: AppState.refreshToken })
            });
            const data = await response.json();
            if (data.access_token && data.refresh_token) {
                console.log('✅ Token refreshed com sucesso (access + refresh)');
                AppState.token = data.access_token;
                AppState.refreshToken = data.refresh_token;
                AppState.tokenExpiry = Date.now() + (data.expires_in * 1000);
                const stored = JSON.parse(localStorage.getItem('shaipados_auth') || '{}');
                stored.token = AppState.token;
                stored.refreshToken = AppState.refreshToken;
                stored.tokenExpiry = AppState.tokenExpiry;
                localStorage.setItem('shaipados_auth', JSON.stringify(stored));
                this._refreshAttempts = 0;
                return true;
            } else if (data.access_token) {
                AppState.token = data.access_token;
                AppState.tokenExpiry = Date.now() + (data.expires_in * 1000);
                const stored = JSON.parse(localStorage.getItem('shaipados_auth') || '{}');
                stored.token = AppState.token;
                stored.tokenExpiry = AppState.tokenExpiry;
                localStorage.setItem('shaipados_auth', JSON.stringify(stored));
                this._refreshAttempts = 0;
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Erro ao fazer refresh:', error);
            return false;
        }
    },

    showLogin() {
        if ($('#auth-screen')) $('#auth-screen').classList.remove('hidden');
        if ($('#app')) $('#app').classList.add('hidden');
        if ($('#onboarding')) $('#onboarding').classList.add('hidden');
        if ($('#modal-welcome')) $('#modal-welcome').classList.add('hidden');
        localStorage.removeItem('shaipados_auth');
        AppState.user = null; AppState.token = null; AppState.refreshToken = null; AppState.tokenExpiry = null; AppState.profile = null;
    },

    enterApp(temPerfil, isNewUser) {
        if ($('#auth-screen')) $('#auth-screen').classList.add('hidden');
        if ($('#app')) $('#app').classList.remove('hidden');
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
            // Personaliza o nome do usuário
            const nome = AppState.user?.nome?.split(' ')[0] || 'Campeão';
            const welcomeName = $('#welcome-username');
            if (welcomeName) welcomeName.textContent = nome;
            // Reinicia animação
            const content = modal.querySelector('.modal-welcome-content');
            if (content) {
                content.classList.remove('animate-welcome');
                void content.offsetWidth; // força reflow
                content.classList.add('animate-welcome');
            }
            modal.style.display = 'flex';
            // Remove listeners antigos para evitar múltiplos
            const btnStart = $('#btn-welcome-start');
            const btnSkip = $('#btn-welcome-skip');
            if (btnStart) {
                btnStart.replaceWith(btnStart.cloneNode(true));
                modal.querySelector('#btn-welcome-start').addEventListener('pointerup', () => { modal.style.display = 'none'; Onboarding.show(); });
            }
            if (btnSkip) {
                btnSkip.replaceWith(btnSkip.cloneNode(true));
                modal.querySelector('#btn-welcome-skip').addEventListener('pointerup', () => { modal.style.display = 'none'; this.showOnboardingReminder(); Toast.info('Configure seu perfil quando quiser'); });
            }
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
        $('#btn-onboarding-back')?.addEventListener('pointerup', () => this.prevStep());
        $('#btn-onboarding-next')?.addEventListener('pointerup', () => this.nextStep());
        $('#btn-onboarding-skip')?.addEventListener('pointerup', () => this.skip());
        
        $$('#step-1 .pill').forEach(p => p.addEventListener('pointerup', () => { $$('#step-1 .pill').forEach(x => x.classList.remove('active')); p.classList.add('active'); AppState.onboardingData.sexo = p.dataset.value; }));
        $$('.goal-card').forEach(c => c.addEventListener('pointerup', () => { $$('.goal-card').forEach(x => x.classList.remove('active')); c.classList.add('active'); AppState.onboardingData.objetivo = c.dataset.value; }));
        $$('.level-card').forEach(c => c.addEventListener('pointerup', () => { $$('.level-card').forEach(x => x.classList.remove('active')); c.classList.add('active'); AppState.onboardingData.nivel = c.dataset.value; }));
        $$('.day-btn').forEach(b => b.addEventListener('pointerup', () => { $$('.day-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); AppState.onboardingData.dias = parseInt(b.dataset.value); }));
        $$('#step-4 .pill').forEach(p => p.addEventListener('pointerup', () => { $$('#step-4 .pill').forEach(x => x.classList.remove('active')); p.classList.add('active'); AppState.onboardingData.duracao = parseInt(p.dataset.value); }));
        $$('.location-card').forEach(c => c.addEventListener('pointerup', () => { $$('.location-card').forEach(x => x.classList.remove('active')); c.classList.add('active'); AppState.onboardingData.local = c.dataset.value; }));
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
            if (error?.message?.includes('404') || /usu[aá]rio n[ãa]o encontrado/i.test(error?.message)) {
                Toast.warning('Seu perfil ainda não está disponível no módulo de IA. Aguarde alguns minutos e tente novamente.');
            } else {
                Toast.warning('Perfil salvo localmente');
            }
            AppState.profile = AppState.onboardingData;
            this.hide();
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

        // Ativa avatar glow animado
        setTimeout(() => {
            const avatar = document.querySelector('.user-avatar');
            if (avatar) avatar.classList.add('glow');
        }, 400);

        // Frases motivacionais rotativas
        const frases = [
            'A consistência vence o talento! 💪',
            'Cada treino é um passo a mais para o seu objetivo.',
            'Você é mais forte do que imagina!',
            'Disciplina é a ponte entre metas e conquistas.',
            'Treine hoje, supere-se amanhã.',
            'O impossível é só questão de opinião.',
            'Seu esforço de hoje é o resultado de amanhã.',
            'Foco, força e fé!'
        ];
        let fraseIdx = Math.floor(Math.random() * frases.length);
        function exibeFrase() {
            const banner = document.getElementById('motivational-banner');
            if (banner) {
                banner.textContent = frases[fraseIdx];
                banner.style.display = 'block';
            }
        }
        exibeFrase();
        setInterval(() => {
            fraseIdx = (fraseIdx + 1) % frases.length;
            exibeFrase();
        }, 9000);

        DashboardWidgets.init();
        this.setupNavigation();
        this.setupHeader();
        this.setupModals();
        this.setupOnboardingReminder();
        this.loadDashboard();
        this.loadTreinoTab();
        this.setupProfileTab();
        
        $('#btn-logout')?.addEventListener('pointerup', () => Auth.logout());
        $('#btn-restart-onboarding')?.addEventListener('pointerup', () => Onboarding.show());
        
        this.switchTab('home');
    },

    setupOnboardingReminder() {
        // Setup listeners do reminder uma única vez
        const reminder = $('#onboarding-reminder');
        if (reminder && !reminder.dataset.listenersAdded) {
            reminder.dataset.listenersAdded = 'true';
            $('#btn-complete-onboarding')?.addEventListener('pointerup', () => { 
                reminder.style.display = 'none'; 
                Onboarding.show(); 
            });
            $('#btn-dismiss-reminder')?.addEventListener('pointerup', () => { 
                reminder.style.display = 'none'; 
                sessionStorage.setItem('reminder_dismissed', 'true');
            });
        }
    },

    setupNavigation() {
        $$('.nav-item').forEach(item => {
            item.addEventListener('pointerup', () => {
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
        $('#btn-settings')?.addEventListener('pointerup', () => this.switchTab('perfil'));
        $('#btn-notifications')?.addEventListener('pointerup', () => Toast.info('Sem notificações'));
        $('#btn-customize-dashboard')?.addEventListener('pointerup', () => this.openDashboardCustomizer());
    },

    setupModals() {
        $$('.modal-close, [data-close]').forEach(btn => {
            btn.addEventListener('pointerup', (e) => { 
                e.preventDefault(); 
                const modal = btn.closest('.modal-overlay'); 
                if (modal) {
                    modal.classList.remove('active');
                    modal.style.display = 'none'; 
                }
            });
        });
        $$('.modal-overlay').forEach(modal => {
            modal.addEventListener('pointerup', (e) => { 
                if (e.target === modal) {
                    modal.classList.remove('active');
                    modal.style.display = 'none'; 
                }
            });
        });

        // Dashboard Customizer buttons
        $('#btn-save-dashboard')?.addEventListener('pointerup', () => {
            DashboardWidgets.saveConfig();
            this.loadDashboard();
            this.closeDashboardCustomizer();
            Toast.success('Dashboard atualizado!');
        });

        $('#btn-reset-dashboard')?.addEventListener('pointerup', () => {
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
        let html = '<div class="dashboard-header-brand"><div class="brand-mark"><img src="assets/Designer01.png" alt="SHAIPADOS" loading="lazy" /></div><div class="badge-brand">Pronto para treinar</div></div>';
        
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
        Achievements.showModal();
    },

    addWater() {
        let agua = parseInt(localStorage.getItem('agua_hoje') || '0');
        agua++;
        localStorage.setItem('agua_hoje', agua.toString());
        Toast.success(`💧 ${agua} copo${agua > 1 ? 's' : ''} de água!`);
        this.loadDashboard();
    },

    openTimer() {
        RestTimer.open();
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

        // Configurações do Timer
        this.setupTimerSettings();
    },

    setupTimerSettings() {
        // Carregar valores das configurações
        const settings = RestTimer.settings;
        
        const autoTimer = $('#setting-auto-timer');
        const sound = $('#setting-sound');
        const vibration = $('#setting-vibration');
        const defaultTime = $('#setting-default-time');

        // Aplicar valores atuais
        if (autoTimer) autoTimer.checked = settings.autoTimer;
        if (sound) sound.checked = settings.soundEnabled;
        if (vibration) vibration.checked = settings.vibrationEnabled;
        if (defaultTime) defaultTime.value = settings.defaultTime;

        // Event listeners
        autoTimer?.addEventListener('change', (e) => {
            RestTimer.updateSetting('autoTimer', e.target.checked);
        });

        sound?.addEventListener('change', (e) => {
            RestTimer.updateSetting('soundEnabled', e.target.checked);
            // Tocar som de teste
            if (e.target.checked) {
                RestTimer.playSound();
            }
        });

        vibration?.addEventListener('change', (e) => {
            RestTimer.updateSetting('vibrationEnabled', e.target.checked);
            // Vibrar como teste
            if (e.target.checked && navigator.vibrate) {
                navigator.vibrate(100);
            }
        });

        defaultTime?.addEventListener('change', (e) => {
            RestTimer.updateSetting('defaultTime', parseInt(e.target.value));
        });
    }
};

// =====================================================
// REST TIMER - Timer de Descanso Profissional
// Features: Timer circular, presets, som, vibração
// =====================================================
const RestTimer = {
    isRunning: false,
    isPaused: false,
    totalSeconds: 90,
    remainingSeconds: 90,
    interval: null,
    audioContext: null,

    // Configurações do Timer (persistidas no localStorage)
    settings: {
        autoTimer: true,      // Timer automático após completar série
        soundEnabled: true,   // Som ao finalizar
        vibrationEnabled: true, // Vibração ao finalizar
        defaultTime: 90       // Tempo padrão em segundos
    },

    // Carregar configurações do localStorage
    loadSettings() {
        const saved = localStorage.getItem('timerSettings');
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            } catch (e) {
                console.log('Erro ao carregar configurações do timer');
            }
        }
    },

    // Salvar configurações no localStorage
    saveSettings() {
        localStorage.setItem('timerSettings', JSON.stringify(this.settings));
    },

    // Atualizar uma configuração específica
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        Toast.info(`Configuração atualizada`);
    },

    // Presets de tempo em segundos
    presets: [
        { label: '30s', seconds: 30, icon: '⚡' },
        { label: '60s', seconds: 60, icon: '🔥' },
        { label: '90s', seconds: 90, icon: '💪' },
        { label: '2min', seconds: 120, icon: '🏋️' },
        { label: '3min', seconds: 180, icon: '⏰' },
        { label: '5min', seconds: 300, icon: '🧘' }
    ],

    open(defaultSeconds = null) {
        if (defaultSeconds) {
            this.totalSeconds = defaultSeconds;
            this.remainingSeconds = defaultSeconds;
        }

        // Remove modal anterior se existir
        document.getElementById('rest-timer-modal')?.remove();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'rest-timer-modal';

        modal.innerHTML = `
            <div class="timer-modal">
                <div class="timer-header">
                    <h2>⏱️ Timer de Descanso</h2>
                    <button class="modal-close" onclick="RestTimer.close()">✕</button>
                </div>

                <div class="timer-circle-container">
                    <svg class="timer-circle" viewBox="0 0 120 120">
                        <circle class="timer-bg" cx="60" cy="60" r="54" />
                        <circle class="timer-progress" cx="60" cy="60" r="54" 
                            stroke-dasharray="339.292" 
                            stroke-dashoffset="0" />
                    </svg>
                    <div class="timer-display-large">
                        <span id="timer-minutes">${this.formatTime(this.remainingSeconds).split(':')[0]}</span>
                        <span class="timer-colon">:</span>
                        <span id="timer-seconds">${this.formatTime(this.remainingSeconds).split(':')[1]}</span>
                    </div>
                </div>

                <div class="timer-presets">
                    ${this.presets.map(p => `
                        <button class="timer-preset ${p.seconds === this.totalSeconds ? 'active' : ''}" 
                                onclick="RestTimer.setTime(${p.seconds})">
                            <span class="preset-icon">${p.icon}</span>
                            <span class="preset-label">${p.label}</span>
                        </button>
                    `).join('')}
                </div>

                <div class="timer-controls">
                    <button class="timer-btn timer-reset" onclick="RestTimer.reset()">
                        <span>↺</span>
                    </button>
                    <button class="timer-btn timer-play" id="timer-play-btn" onclick="RestTimer.togglePlay()">
                        <span id="timer-play-icon">▶</span>
                    </button>
                    <button class="timer-btn timer-add" onclick="RestTimer.addTime(15)">
                        <span>+15s</span>
                    </button>
                </div>

                <div class="timer-quick-actions">
                    <button class="quick-action" onclick="RestTimer.startPreset(30)">⚡ Rápido</button>
                    <button class="quick-action" onclick="RestTimer.startPreset(90)">💪 Normal</button>
                    <button class="quick-action" onclick="RestTimer.startPreset(180)">🏋️ Pesado</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Clique fora fecha
        modal.addEventListener('click', (e) => {
            if (e.target === modal) RestTimer.close();
        });
    },

    close() {
        this.stop();
        document.getElementById('rest-timer-modal')?.remove();
    },

    setTime(seconds) {
        this.stop();
        this.totalSeconds = seconds;
        this.remainingSeconds = seconds;
        this.updateDisplay();
        
        // Atualiza presets ativos
        document.querySelectorAll('.timer-preset').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.querySelector('.preset-label').textContent) === seconds ||
                btn.querySelector('.preset-label').textContent === this.formatPresetLabel(seconds)) {
                btn.classList.add('active');
            }
        });

        // Marca o preset correto
        this.presets.forEach((p, i) => {
            const btn = document.querySelectorAll('.timer-preset')[i];
            if (btn) {
                btn.classList.toggle('active', p.seconds === seconds);
            }
        });
    },

    formatPresetLabel(seconds) {
        if (seconds < 60) return `${seconds}s`;
        return `${Math.floor(seconds / 60)}min`;
    },

    startPreset(seconds) {
        this.setTime(seconds);
        this.start();
    },

    togglePlay() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    },

    start() {
        if (this.remainingSeconds <= 0) {
            this.remainingSeconds = this.totalSeconds;
        }

        this.isRunning = true;
        this.isPaused = false;
        this.updatePlayButton();

        this.interval = setInterval(() => {
            this.remainingSeconds--;
            this.updateDisplay();

            if (this.remainingSeconds <= 0) {
                this.finish();
            }
        }, 1000);
    },

    pause() {
        this.isRunning = false;
        this.isPaused = true;
        clearInterval(this.interval);
        this.updatePlayButton();
    },

    stop() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.interval);
        this.updatePlayButton();
    },

    reset() {
        this.stop();
        this.remainingSeconds = this.totalSeconds;
        this.updateDisplay();
    },

    addTime(seconds) {
        this.remainingSeconds += seconds;
        this.totalSeconds = Math.max(this.totalSeconds, this.remainingSeconds);
        this.updateDisplay();
        Toast.info(`+${seconds}s adicionados`);
    },

    finish() {
        this.stop();
        this.remainingSeconds = 0;
        this.updateDisplay();
        
        // Vibração (se habilitado)
        if (this.settings.vibrationEnabled && 'vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }

        // Som (se habilitado)
        if (this.settings.soundEnabled) {
            this.playSound();
        }

        // Notificação visual
        Toast.success('⏱️ Tempo de descanso finalizado! Bora próxima série! 💪');

        // Pisca o timer
        const circle = document.querySelector('.timer-circle-container');
        if (circle) {
            circle.classList.add('timer-finished');
            setTimeout(() => circle.classList.remove('timer-finished'), 2000);
        }
    },

    playSound() {
        try {
            // Cria contexto de áudio se não existir
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const ctx = this.audioContext;
            
            // Toca 3 beeps
            [0, 0.2, 0.4].forEach(delay => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                oscillator.frequency.value = 880; // Nota A5
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime + delay);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.15);
                
                oscillator.start(ctx.currentTime + delay);
                oscillator.stop(ctx.currentTime + delay + 0.15);
            });
        } catch (e) {
            console.log('Audio not supported');
        }
    },

    updateDisplay() {
        const minutes = document.getElementById('timer-minutes');
        const seconds = document.getElementById('timer-seconds');
        const progress = document.querySelector('.timer-progress');

        if (minutes && seconds) {
            const time = this.formatTime(this.remainingSeconds);
            const [m, s] = time.split(':');
            minutes.textContent = m;
            seconds.textContent = s;
        }

        if (progress) {
            const circumference = 2 * Math.PI * 54; // 339.292
            const offset = circumference * (1 - this.remainingSeconds / this.totalSeconds);
            progress.style.strokeDashoffset = offset;

            // Muda cor quando está acabando
            if (this.remainingSeconds <= 10 && this.remainingSeconds > 0) {
                progress.style.stroke = '#ff4444';
            } else if (this.remainingSeconds <= 30) {
                progress.style.stroke = '#ffaa00';
            } else {
                progress.style.stroke = 'var(--primary)';
            }
        }
    },

    updatePlayButton() {
        const icon = document.getElementById('timer-play-icon');
        const btn = document.getElementById('timer-play-btn');
        
        if (icon) {
            icon.textContent = this.isRunning ? '⏸' : '▶';
        }
        if (btn) {
            btn.classList.toggle('playing', this.isRunning);
        }
    },

    formatTime(totalSeconds) {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // Método para ser chamado pelo ActiveWorkout após completar série
    startFromWorkout(seconds = 90) {
        // Verifica se auto-timer está habilitado
        if (!this.settings.autoTimer) {
            return;
        }
        
        const time = seconds || this.settings.defaultTime;
        this.open(time);
        setTimeout(() => this.start(), 300);
    },

    // Inicialização - carrega configurações
    init() {
        this.loadSettings();
    }
};

// Inicializar RestTimer ao carregar
RestTimer.init();

// =====================================================
// PROGRESSÃO DE CARGA - Sistema Inteligente
// Features: Histórico, Sugestão automática, Evolução
// =====================================================
const LoadProgression = {
    // Chave do localStorage
    storageKey: 'carga_historico',

    // Configurações de progressão
    config: {
        incremento_percentual: 5,    // Aumentar 5% quando completar todas as reps
        incremento_minimo: 2.5,      // Mínimo 2.5kg de aumento
        rep_threshold: 2,            // Fez +2 reps do alvo = sugere aumento
        deload_semanas: 4            // A cada 4 semanas sugere deload
    },

    // Obter histórico de cargas de um exercício
    getHistory(exerciseId) {
        const historico = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        return historico[exerciseId] || [];
    },

    // Salvar entrada no histórico
    saveEntry(exerciseId, entry) {
        const historico = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        if (!historico[exerciseId]) {
            historico[exerciseId] = [];
        }
        
        // Adicionar com data
        entry.data = new Date().toISOString().split('T')[0];
        historico[exerciseId].push(entry);
        
        // Manter apenas últimos 50 registros por exercício
        if (historico[exerciseId].length > 50) {
            historico[exerciseId] = historico[exerciseId].slice(-50);
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(historico));
    },

    // Gerar ID único para exercício (baseado no nome)
    generateExerciseId(exerciseName) {
        return exerciseName.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '_');
    },

    // Calcular sugestão de carga baseado no histórico
    suggestLoad(exerciseId, targetReps) {
        const history = this.getHistory(exerciseId);
        
        if (history.length === 0) {
            return { carga: null, tipo: 'nova', mensagem: 'Primeiro treino!' };
        }

        // Pegar última sessão
        const ultimo = history[history.length - 1];
        const cargaAnterior = ultimo.carga;
        const repsFeitas = ultimo.reps;
        const targetRepsNum = parseInt(targetReps) || 10;

        // Calcular sugestão
        let novaCarga = cargaAnterior;
        let tipo = 'manter';
        let mensagem = '';

        // Se fez mais reps que o alvo, sugere aumentar
        if (repsFeitas >= targetRepsNum + this.config.rep_threshold) {
            const aumento = Math.max(
                cargaAnterior * (this.config.incremento_percentual / 100),
                this.config.incremento_minimo
            );
            novaCarga = Math.ceil((cargaAnterior + aumento) / 2.5) * 2.5; // Arredondar para 2.5
            tipo = 'aumentar';
            mensagem = `+${(novaCarga - cargaAnterior).toFixed(1)}kg 💪`;
        }
        // Se não completou as reps, manter ou reduzir
        else if (repsFeitas < targetRepsNum - 2) {
            novaCarga = Math.max(cargaAnterior - this.config.incremento_minimo, 0);
            tipo = 'reduzir';
            mensagem = 'Ajuste a carga';
        }
        // Manteve no alvo
        else {
            mensagem = 'Boa! Continue assim';
        }

        // Verificar se precisa de deload
        const semanas = this.contarSemanasConsecutivas(history);
        if (semanas >= this.config.deload_semanas) {
            tipo = 'deload';
            novaCarga = cargaAnterior * 0.9; // -10%
            mensagem = '💆 Semana de recuperação sugerida';
        }

        return {
            carga: novaCarga,
            cargaAnterior: cargaAnterior,
            tipo: tipo,
            mensagem: mensagem,
            ultimaData: ultimo.data,
            ultimasReps: repsFeitas
        };
    },

    // Contar semanas consecutivas de treino
    contarSemanasConsecutivas(history) {
        if (history.length < 2) return 0;
        
        let semanas = 1;
        const hoje = new Date();
        
        for (let i = history.length - 1; i > 0; i--) {
            const dataAtual = new Date(history[i].data);
            const dataAnterior = new Date(history[i - 1].data);
            const diffDias = (dataAtual - dataAnterior) / (1000 * 60 * 60 * 24);
            
            if (diffDias <= 10) { // Menos de 10 dias = mesma "rotina"
                semanas++;
            } else {
                break;
            }
        }
        
        return Math.floor(semanas / 4); // Converter para semanas aproximadas
    },

    // Obter estatísticas de evolução
    getStats(exerciseId) {
        const history = this.getHistory(exerciseId);
        
        if (history.length === 0) {
            return null;
        }

        const cargas = history.map(h => h.carga).filter(c => c > 0);
        const primeiro = cargas[0];
        const ultimo = cargas[cargas.length - 1];
        const maximo = Math.max(...cargas);
        const evolucao = ((ultimo - primeiro) / primeiro * 100) || 0;

        return {
            total_sessoes: history.length,
            carga_inicial: primeiro,
            carga_atual: ultimo,
            carga_maxima: maximo,
            evolucao_percentual: evolucao.toFixed(1),
            historico: history.slice(-10) // Últimas 10 sessões
        };
    },

    // Renderizar badge de progressão
    renderBadge(tipo, mensagem) {
        const badges = {
            'aumentar': { icon: '📈', class: 'progress-up' },
            'manter': { icon: '➡️', class: 'progress-same' },
            'reduzir': { icon: '📉', class: 'progress-down' },
            'deload': { icon: '💆', class: 'progress-deload' },
            'nova': { icon: '🆕', class: 'progress-new' }
        };

        const badge = badges[tipo] || badges['nova'];
        return `<span class="load-progress-badge ${badge.class}" title="${mensagem}">${badge.icon}</span>`;
    },

    // Modal de evolução do exercício
    showEvolutionModal(exerciseId, exerciseName) {
        const stats = this.getStats(exerciseId);
        
        if (!stats) {
            Toast.info('Ainda não há histórico para este exercício');
            return;
        }

        // Remover modal anterior
        document.getElementById('evolution-modal')?.remove();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'evolution-modal';

        // Preparar dados do gráfico
        const historico = stats.historico;
        const maxCarga = Math.max(...historico.map(h => h.carga));

        modal.innerHTML = `
            <div class="evolution-modal">
                <div class="evolution-header">
                    <h2>📊 Evolução de Carga</h2>
                    <button class="modal-close" onclick="document.getElementById('evolution-modal').remove()">✕</button>
                </div>
                
                <div class="evolution-exercise-name">${exerciseName}</div>
                
                <div class="evolution-stats-grid">
                    <div class="evolution-stat">
                        <span class="evolution-stat-value">${stats.carga_inicial}kg</span>
                        <span class="evolution-stat-label">Inicial</span>
                    </div>
                    <div class="evolution-stat highlight">
                        <span class="evolution-stat-value">${stats.carga_atual}kg</span>
                        <span class="evolution-stat-label">Atual</span>
                    </div>
                    <div class="evolution-stat">
                        <span class="evolution-stat-value">${stats.carga_maxima}kg</span>
                        <span class="evolution-stat-label">Máximo</span>
                    </div>
                    <div class="evolution-stat ${stats.evolucao_percentual >= 0 ? 'positive' : 'negative'}">
                        <span class="evolution-stat-value">${stats.evolucao_percentual >= 0 ? '+' : ''}${stats.evolucao_percentual}%</span>
                        <span class="evolution-stat-label">Evolução</span>
                    </div>
                </div>
                
                <div class="evolution-chart">
                    <div class="chart-title">Últimas ${historico.length} sessões</div>
                    <div class="chart-bars">
                        ${historico.map((h, i) => `
                            <div class="chart-bar-container">
                                <div class="chart-bar" style="height: ${(h.carga / maxCarga) * 100}%">
                                    <span class="chart-bar-value">${h.carga}</span>
                                </div>
                                <span class="chart-bar-label">${this.formatDate(h.data)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="evolution-history">
                    <h3>Histórico Detalhado</h3>
                    <div class="history-list">
                        ${historico.reverse().map(h => `
                            <div class="history-item">
                                <span class="history-date">${this.formatDateFull(h.data)}</span>
                                <span class="history-load">${h.carga}kg × ${h.reps} reps</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },

    formatDate(dateStr) {
        const d = new Date(dateStr);
        return `${d.getDate()}/${d.getMonth() + 1}`;
    },

    formatDateFull(dateStr) {
        const d = new Date(dateStr);
        const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return `${dias[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
    }
};

// =====================================================
// ACHIEVEMENTS - Sistema de Gamificação Inteligente
// Inspirado em: Duolingo, Strava, Strong, Apple Fitness+
// Features: Badges, Streak, XP, Níveis, Desafios
// =====================================================
const Achievements = {
    storageKey: 'achievements_data',
    
    // Todas as conquistas disponíveis
    badges: {
        // INICIANTE
        'first_workout': {
            id: 'first_workout',
            nome: 'Primeiro Passo',
            icon: '🚀',
            desc: 'Complete seu primeiro treino',
            rarity: 'comum',
            xp: 50
        },
        'first_week': {
            id: 'first_week',
            nome: 'Semana 1',
            icon: '📅',
            desc: 'Treine 3x em uma semana',
            rarity: 'comum',
            xp: 100
        },
        'five_workouts': {
            id: 'five_workouts',
            nome: 'Quinto Treino',
            icon: '5️⃣',
            desc: 'Complete 5 treinos',
            rarity: 'comum',
            xp: 150
        },
        
        // CONSISTÊNCIA
        'seven_day_streak': {
            id: 'seven_day_streak',
            nome: 'Uma Semana Seguida',
            icon: '🔥',
            desc: '7 dias seguidos treinando',
            rarity: 'rara',
            xp: 500
        },
        'thirty_day_streak': {
            id: 'thirty_day_streak',
            nome: 'Guerreiro do Mês',
            icon: '⚔️',
            desc: '30 dias consecutivos',
            rarity: 'epica',
            xp: 1500
        },
        
        // VOLUME
        'perfect_workout': {
            id: 'perfect_workout',
            nome: 'Treino Perfeito',
            icon: '💯',
            desc: 'Complete 100% de uma série',
            rarity: 'comum',
            xp: 100
        },
        'high_volume_day': {
            id: 'high_volume_day',
            nome: 'Volume Alto',
            icon: '📊',
            desc: 'Acumule 5000kg em um treino',
            rarity: 'rara',
            xp: 300
        },
        
        // PROGRESSÃO
        'first_pr': {
            id: 'first_pr',
            nome: 'Recorde Pessoal',
            icon: '🏅',
            desc: 'Bata seu peso máximo',
            rarity: 'rara',
            xp: 400
        },
        'progression_streak': {
            id: 'progression_streak',
            nome: 'Sempre Crescendo',
            icon: '📈',
            desc: 'Aumente carga 5 vezes seguidas',
            rarity: 'epica',
            xp: 1000
        },
        
        // DISCIPLINA
        'morning_person': {
            id: 'morning_person',
            nome: 'Madrugador',
            icon: '🌅',
            desc: 'Treine antes das 7AM',
            rarity: 'comum',
            xp: 75
        },
        'night_owl': {
            id: 'night_owl',
            nome: 'Coruja Noturna',
            icon: '🌙',
            desc: 'Treine após 8PM',
            rarity: 'comum',
            xp: 75
        },
        
        // MILESTONES
        'twenty_workouts': {
            id: 'twenty_workouts',
            nome: 'Duas Dezenas',
            icon: '2️⃣0️⃣',
            desc: 'Complete 20 treinos',
            rarity: 'rara',
            xp: 500
        },
        'hundred_workouts': {
            id: 'hundred_workouts',
            nome: 'Centésimo Treino',
            icon: '💯',
            desc: 'Complete 100 treinos',
            rarity: 'lendaria',
            xp: 3000
        },
        
        // ESPECIAIS
        'hydration_expert': {
            id: 'hydration_expert',
            nome: 'Hidratação',
            icon: '💧',
            desc: 'Beba 8 copos de água',
            rarity: 'comum',
            xp: 50
        },
        'comeback_kid': {
            id: 'comeback_kid',
            nome: 'De Volta ao Jogo',
            icon: '🔄',
            desc: 'Retorne após 7 dias parado',
            rarity: 'rara',
            xp: 250
        }
    },

    // Rarity colors
    rarityColors: {
        'comum': '#4B5563',
        'rara': '#0891B2',
        'epica': '#7C3AED',
        'lendaria': '#F59E0B'
    },

    // Carrega dados do usuário
    loadData() {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        return {
            unlocked: data.unlocked || [],
            totalXP: data.totalXP || 0,
            notificationQueue: data.notificationQueue || []
        };
    },

    // Salva dados do usuário
    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    },

    // Desbloquear conquista
    unlock(badgeId) {
        const data = this.loadData();
        
        if (data.unlocked.includes(badgeId)) {
            return false; // Já desbloqueada
        }

        const badge = this.badges[badgeId];
        if (!badge) return false;

        data.unlocked.push(badgeId);
        data.totalXP += badge.xp;
        
        this.saveData(data);
        this.showNotification(badge);
        
        return true;
    },

    // Mostrar notificação de conquista
    showNotification(badge) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <span class="achievement-icon">${badge.icon}</span>
            <div class="achievement-info">
                <span class="achievement-title">CONQUISTA DESBLOQUEADA</span>
                <span class="achievement-name">${badge.nome}</span>
            </div>
            <span class="achievement-xp">+${badge.xp} XP</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    },

    // Verificar conquistas após treino
    checkAfterWorkout(completedSets, totalSets, volume, startTime) {
        const historico = JSON.parse(localStorage.getItem('historico_treinos') || '[]');
        const data = this.loadData();
        
        // Primeiro treino
        if (historico.length === 1) {
            this.unlock('first_workout');
        }
        
        // 5 treinos
        if (historico.length === 5) {
            this.unlock('five_workouts');
        }
        
        // 20 treinos
        if (historico.length === 20) {
            this.unlock('twenty_workouts');
        }
        
        // 100 treinos
        if (historico.length === 100) {
            this.unlock('hundred_workouts');
        }
        
        // Treino perfeito (100%)
        if (completedSets === totalSets) {
            this.unlock('perfect_workout');
        }
        
        // Volume alto (5000kg)
        if (volume >= 5000) {
            this.unlock('high_volume_day');
        }
        
        // Horários
        const hora = new Date().getHours();
        if (hora < 7) {
            this.unlock('morning_person');
        } else if (hora >= 20) {
            this.unlock('night_owl');
        }
        
        // Verificar semana
        this.checkWeeklyAchievements(historico);
        this.checkStreakAchievements(historico);
    },

    // Verificar conquistas de semana
    checkWeeklyAchievements(historico) {
        const hoje = new Date();
        const seteDisMil = 7 * 24 * 60 * 60 * 1000;
        const inicio = new Date(hoje.getTime() - seteDisMil);
        
        const treinos_semana = historico.filter(h => 
            new Date(h.data) >= inicio
        ).length;
        
        if (treinos_semana >= 3) {
            this.unlock('first_week');
        }
    },

    // Verificar streaks
    checkStreakAchievements(historico) {
        if (historico.length === 0) return;

        let streak = 1;
        const datas = historico.map(h => new Date(h.data).toISOString().split('T')[0]).reverse();
        
        for (let i = 1; i < datas.length; i++) {
            const data1 = new Date(datas[i - 1]);
            const data2 = new Date(datas[i]);
            const diff = (data1 - data2) / (1000 * 60 * 60 * 24);
            
            if (diff === 1) {
                streak++;
            } else {
                break;
            }
        }
        
        if (streak === 7) {
            this.unlock('seven_day_streak');
        }
        if (streak === 30) {
            this.unlock('thirty_day_streak');
        }
    },

    // Verificar conquistas de progressão
    checkProgressionAchievements() {
        const historico_cargas = JSON.parse(localStorage.getItem('carga_historico') || '{}');
        
        Object.values(historico_cargas).forEach(exercise_history => {
            if (!Array.isArray(exercise_history) || exercise_history.length < 2) return;
            
            // Primeiro PR (qualquer aumento)
            let aumentos = 0;
            for (let i = 1; i < exercise_history.length; i++) {
                if (exercise_history[i].carga > exercise_history[i - 1].carga) {
                    aumentos++;
                    this.unlock('first_pr');
                    
                    // 5 aumentos seguidos
                    if (aumentos === 5) {
                        this.unlock('progression_streak');
                    }
                }
            }
        });
    },

    // Calcular nível baseado no XP
    getLevel(totalXP) {
        return Math.floor(Math.sqrt(totalXP / 100)) + 1;
    },

    // Calcular progresso para próximo nível
    getLevelProgress(totalXP) {
        const levelAtual = this.getLevel(totalXP);
        const xpRequerido = (levelAtual - 1) ** 2 * 100;
        const xpProximo = levelAtual ** 2 * 100;
        const progresso = totalXP - xpRequerido;
        const total = xpProximo - xpRequerido;
        
        return {
            nivel: levelAtual,
            xpAtual: progresso,
            xpTotal: total,
            percentual: Math.round((progresso / total) * 100)
        };
    },

    // Modal de conquistas
    showModal() {
        const data = this.loadData();
        const levelInfo = this.getLevelProgress(data.totalXP);
        
        document.getElementById('achievements-modal')?.remove();
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'achievements-modal';
        
        // Dividir badges em desbloqueadas e bloqueadas
        const desbloqueadas = Object.entries(this.badges).filter(([id]) => data.unlocked.includes(id));
        const bloqueadas = Object.entries(this.badges).filter(([id]) => !data.unlocked.includes(id));
        
        modal.innerHTML = `
            <div class="achievements-container">
                <div class="achievements-header">
                    <h2>🏆 Suas Conquistas</h2>
                    <button class="modal-close" onclick="document.getElementById('achievements-modal').remove()">✕</button>
                </div>
                
                <!-- Level Progress -->
                <div class="level-progress-card">
                    <div class="level-header">
                        <div class="level-badge">NÍVEL ${levelInfo.nivel}</div>
                        <span class="level-xp">${data.totalXP.toLocaleString()} XP</span>
                    </div>
                    <div class="level-bar">
                        <div class="level-fill" style="width: ${levelInfo.percentual}%"></div>
                    </div>
                    <div class="level-info">${levelInfo.xpAtual} / ${levelInfo.xpTotal} XP</div>
                </div>
                
                <!-- Stats -->
                <div class="achievements-stats">
                    <div class="stat-card">
                        <span class="stat-value">${desbloqueadas.length}</span>
                        <span class="stat-label">Desbloqueadas</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${bloqueadas.length}</span>
                        <span class="stat-label">Por desbloquear</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${Math.round((desbloqueadas.length / Object.keys(this.badges).length) * 100)}%</span>
                        <span class="stat-label">Completo</span>
                    </div>
                </div>
                
                <!-- Badges Desbloqueadas -->
                ${desbloqueadas.length > 0 ? `
                <div class="badges-section">
                    <h3>✨ Desbloqueadas (${desbloqueadas.length})</h3>
                    <div class="badges-grid">
                        ${desbloqueadas.map(([id, badge]) => `
                            <div class="badge-card unlocked" style="border-color: ${this.rarityColors[badge.rarity]}">
                                <div class="badge-icon">${badge.icon}</div>
                                <div class="badge-name">${badge.nome}</div>
                                <div class="badge-desc">${badge.desc}</div>
                                <div class="badge-xp">+${badge.xp} XP</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <!-- Badges Bloqueadas -->
                ${bloqueadas.length > 0 ? `
                <div class="badges-section">
                    <h3>🔒 Ainda por desbloquear (${bloqueadas.length})</h3>
                    <div class="badges-grid">
                        ${bloqueadas.map(([id, badge]) => `
                            <div class="badge-card locked">
                                <div class="badge-icon" style="opacity: 0.3">${badge.icon}</div>
                                <div class="badge-name" style="opacity: 0.5">${badge.nome}</div>
                                <div class="badge-desc" style="opacity: 0.4; font-size: 0.7rem">${badge.desc}</div>
                                <div class="badge-rarity" style="color: ${this.rarityColors[badge.rarity]}">${badge.rarity.toUpperCase()}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
};

// =====================================================
// SLEEP SYSTEM - Sono, Qualidade, Correlações com Fadiga
// Fases: 1=Log+Modal | 2=Gráficos 7/30d | 3=Integração Fadiga
// UX: Automático (device) + Manual (fallback reflexivo)
// =====================================================
const SleepSystem = {
    storageKey: 'sleep_data',
    autoSyncAttempts: 3,
    lastDeviceSync: null,

    load() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '{"records":[]}');
        } catch (e) {
            return { records: [] };
        }
    },

    save(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    },

    // ============= LOG: Registra noite de sono
    recordSleep({ sleepStart, sleepEnd, quality, awakenings = 0, factors = [], manual = true }) {
        const data = this.load();
        data.records = data.records || [];

        const durationMs = new Date(sleepEnd) - new Date(sleepStart);
        const durationMinutes = Math.max(0, Math.round(durationMs / 60000));
        const durationHours = (durationMinutes / 60).toFixed(2);

        const record = {
            date: new Date(sleepStart).toISOString().split('T')[0],
            sleepStart,
            sleepEnd,
            durationMinutes,
            durationHours: parseFloat(durationHours),
            quality: Math.min(10, Math.max(1, quality || 5)),
            awakenings: Math.max(0, awakenings || 0),
            factors: factors || [],
            manual,
            syncedAt: manual ? null : Date.now()
        };

        // Remove registro anterior do mesmo dia (evita duplicatas)
        data.records = data.records.filter(r => r.date !== record.date);
        data.records.push(record);

        // Manter últimos 90 registros
        if (data.records.length > 90) {
            data.records = data.records.slice(-90);
        }

        this.save(data);
        return record;
    },

    // ============= SCORE: Calcula score 0-100
    getScore(record) {
        if (!record) return 0;

        // Duração ideal: 7-8h (420-480 min)
        const durationScore = record.durationMinutes >= 420 && record.durationMinutes <= 480 
            ? 100 
            : Math.max(0, 100 - Math.abs(record.durationMinutes - 450) / 4.5);

        // Qualidade: peso igual
        const qualityScore = (record.quality / 10) * 100;

        // Penalidade por despertares: -10 pts por despertar
        const awakeningsScore = Math.max(0, 100 - (record.awakenings * 10));

        // Média ponderada
        return Math.round((durationScore * 0.4 + qualityScore * 0.4 + awakeningsScore * 0.2));
    },

    // ============= STATUS: Categoria visual
    getStatus(score) {
        if (score >= 85) return { text: 'Excelente ✅', level: 'excelente', emoji: '😴🟢', color: '#10b981' };
        if (score >= 70) return { text: 'Bom 👍', level: 'bom', emoji: '😴', color: '#22d3ee' };
        if (score >= 50) return { text: 'Alerta ⚠️', level: 'alerta', emoji: '😴🟡', color: '#f59e0b' };
        return { text: 'Crítico 🚨', level: 'critico', emoji: '😴🔴', color: '#ef4444' };
    },

    // ============= TREND: Tendência 7 dias
    getTrendStatus(days = 7) {
        const data = this.load();
        const records = data.records || [];
        if (records.length < 2) return { trend: '→', pct: 0 };

        const recent = records.slice(-days);
        if (recent.length < 2) return { trend: '→', pct: 0 };

        const avgRecent = recent.reduce((s, r) => s + this.getScore(r), 0) / recent.length;
        const avgBefore = recent.slice(0, Math.floor(recent.length / 2))
            .reduce((s, r) => s + this.getScore(r), 0) / Math.ceil(recent.length / 2);

        const pct = Math.round(((avgRecent - avgBefore) / avgBefore) * 100);
        const trend = pct > 5 ? '↑' : pct < -5 ? '↓' : '→';

        return { trend, pct: Math.abs(pct) };
    },

    // ============= TODAY: Noite anterior (hoje de manhã)
    getTodayRecord() {
        const data = this.load();
        if (!data.records || !data.records.length) return null;

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Procura registro de ontem ou hoje (se ainda não dormiu)
        return data.records.find(r => r.date === today || r.date === yesterday) || null;
    },

    // ============= HISTORY: Últimos N dias
    getHistory(days = 7) {
        const data = this.load();
        const records = (data.records || []).slice(-days);
        return records.map(r => ({
            date: r.date,
            duration: r.durationHours,
            quality: r.quality,
            score: this.getScore(r),
            manual: r.manual,
            awakenings: r.awakenings
        }));
    },

    // ============= DEVICE SYNC: Simula sincronização com wearable
    async tryDeviceSync() {
        // Placeholder para integração futura (Apple Health, Wear OS)
        // Por enquanto, retorna null para ativar modal manual
        try {
            // Aqui futuramente: const data = await AppleHealthAPI.getSleepData();
            // ou: const data = await WearOSAPI.getSleepData();
            return null;
        } catch (e) {
            return null;
        }
    },

    // ============= MODAL: Log da noite (reflexivo + automático)
    promptSleep() {
        const existing = document.querySelector('.sleep-overlay');
        if (existing) existing.remove();

        const today = new SleepSystem.getTodayRecord();
        const defaultStart = today?.sleepStart || new Date(Date.now() - 28800000).toISOString().slice(11, 16); // 8h atrás
        const defaultEnd = today?.sleepEnd || new Date().toISOString().slice(11, 16); // agora
        const defaultQuality = today?.quality || 7;
        const defaultAwakenings = today?.awakenings || 0;

        const el = document.createElement('div');
        el.className = 'sleep-overlay';
        el.innerHTML = `
            <div class="sleep-card">
                <div class="sleep-header">
                    <div>
                        <h3>😴 Registrar Sono</h3>
                        <p>Noite anterior</p>
                    </div>
                    <button class="sleep-close" onclick="SleepSystem.removePrompt()">✕</button>
                </div>

                <div class="sleep-body">
                    <!-- Duração -->
                    <div class="sleep-section">
                        <label class="sleep-label">⏰ Que horas dormiu?</label>
                        <div class="time-inputs">
                            <div class="time-group">
                                <label>Deitou</label>
                                <input type="time" id="sleep-start" value="${defaultStart}">
                            </div>
                            <div class="time-group">
                                <label>Acordou</label>
                                <input type="time" id="sleep-end" value="${defaultEnd}">
                            </div>
                        </div>
                        <div class="sleep-duration" id="sleep-duration-display">
                            Duração: <strong>--</strong>
                        </div>
                    </div>

                    <!-- Qualidade -->
                    <div class="sleep-section">
                        <label class="sleep-label">⭐ Qualidade do sono (1-10)</label>
                        <div class="quality-slider-container">
                            <input type="range" min="1" max="10" step="0.5" value="${defaultQuality}" 
                                   class="sleep-slider" id="sleep-quality" 
                                   oninput="SleepSystem.updateQualityLabel(this.value)">
                            <div class="quality-labels">
                                <span>Péssimo</span>
                                <span id="quality-value" class="quality-value">${defaultQuality}</span>
                                <span>Perfeito</span>
                            </div>
                        </div>
                    </div>

                    <!-- Despertares -->
                    <div class="sleep-section">
                        <label class="sleep-label">😑 Quantas vezes acordou?</label>
                        <div class="awakening-control">
                            <button class="btn-count" onclick="SleepSystem.decrementAwakenings()">−</button>
                            <input type="number" id="sleep-awakenings" min="0" max="10" value="${defaultAwakenings}" 
                                   class="awakening-input" readonly>
                            <button class="btn-count" onclick="SleepSystem.incrementAwakenings()">+</button>
                        </div>
                    </div>

                    <!-- Fatores -->
                    <div class="sleep-section">
                        <label class="sleep-label">🔍 Fatores que afetaram (marque):</label>
                        <div class="factors-grid">
                            <label class="factor-checkbox">
                                <input type="checkbox" name="factor" value="estresse"> Estresse
                            </label>
                            <label class="factor-checkbox">
                                <input type="checkbox" name="factor" value="cafeina"> Cafeína
                            </label>
                            <label class="factor-checkbox">
                                <input type="checkbox" name="factor" value="treino-tarde"> Treino tard
                            </label>
                            <label class="factor-checkbox">
                                <input type="checkbox" name="factor" value="barulho"> Barulho
                            </label>
                            <label class="factor-checkbox">
                                <input type="checkbox" name="factor" value="tela"> Tela antes dormir
                            </label>
                            <label class="factor-checkbox">
                                <input type="checkbox" name="factor" value="temperatura"> Temperatura
                            </label>
                            <label class="factor-checkbox">
                                <input type="checkbox" name="factor" value="alcool"> Álcool
                            </label>
                            <label class="factor-checkbox">
                                <input type="checkbox" name="factor" value="medicamento"> Medicamento
                            </label>
                        </div>
                    </div>

                    <!-- Info -->
                    <div class="sleep-info">
                        <p>💡 Dica: Sono consistente (7-8h) melhora recuperação, força e performance em +15%</p>
                    </div>
                </div>

                <div class="sleep-actions">
                    <button class="btn-primary" onclick="SleepSystem.handleSaveSleep()">Salvar 😴</button>
                    <button class="btn-secondary" onclick="SleepSystem.removePrompt()">Cancelar</button>
                </div>
            </div>
        `;

        document.body.appendChild(el);
        SleepSystem.updateDurationDisplay();

        // Event listeners para duração
        document.getElementById('sleep-start')?.addEventListener('change', () => SleepSystem.updateDurationDisplay());
        document.getElementById('sleep-end')?.addEventListener('change', () => SleepSystem.updateDurationDisplay());
    },

    updateDurationDisplay() {
        const start = document.getElementById('sleep-start')?.value;
        const end = document.getElementById('sleep-end')?.value;

        if (!start || !end) {
            document.getElementById('sleep-duration-display').innerHTML = 'Duração: <strong>--</strong>';
            return;
        }

        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);

        let durationMin = (eh * 60 + em) - (sh * 60 + sm);
        if (durationMin < 0) durationMin += 24 * 60; // próximo dia

        const hours = Math.floor(durationMin / 60);
        const mins = durationMin % 60;

        document.getElementById('sleep-duration-display').innerHTML = 
            `Duração: <strong>${hours}h ${mins}m</strong>`;
    },

    updateQualityLabel(value) {
        document.getElementById('quality-value').textContent = value;
    },

    incrementAwakenings() {
        const input = document.getElementById('sleep-awakenings');
        input.value = Math.min(10, parseInt(input.value) + 1);
    },

    decrementAwakenings() {
        const input = document.getElementById('sleep-awakenings');
        input.value = Math.max(0, parseInt(input.value) - 1);
    },

    handleSaveSleep() {
        const startTime = document.getElementById('sleep-start')?.value;
        const endTime = document.getElementById('sleep-end')?.value;
        const quality = parseFloat(document.getElementById('sleep-quality')?.value || 5);
        const awakenings = parseInt(document.getElementById('sleep-awakenings')?.value || 0);

        if (!startTime || !endTime) {
            Toast.error('Preencha horários de sono');
            return;
        }

        // Monta horários completos
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const sleepStart = `${today}T${startTime}:00`;
        const sleepEnd = `${today}T${endTime}:00`;

        // Coleta fatores
        const factors = Array.from(document.querySelectorAll('input[name="factor"]:checked'))
            .map(el => el.value);

        // Salva
        this.recordSleep({
            sleepStart,
            sleepEnd,
            quality,
            awakenings,
            factors,
            manual: true // Reflexivo
        });

        this.removePrompt();
        DashboardWidgets.render();
        Toast.show('Sono registrado ✅');
    },

    removePrompt() {
        document.querySelector('.sleep-overlay')?.remove();
    },

    // ============= DASHBOARD: Detalhado com gráficos
    showDashboard() {
        const today = this.getTodayRecord();
        const score = today ? this.getScore(today) : 0;
        const status = this.getStatus(score);
        const trend = this.getTrendStatus(7);
        const hist7 = this.getHistory(7);
        const hist30 = this.getHistory(30);
        const avg7 = hist7.length ? (hist7.reduce((s, h) => s + h.duration, 0) / hist7.length).toFixed(1) : '--';
        const avg30 = hist30.length ? (hist30.reduce((s, h) => s + h.duration, 0) / hist30.length).toFixed(1) : '--';
        const avgQual7 = hist7.length ? (hist7.reduce((s, h) => s + h.quality, 0) / hist7.length).toFixed(1) : '--';

        const existing = document.querySelector('.sleep-overlay');
        if (existing) existing.remove();

        const el = document.createElement('div');
        el.className = 'sleep-overlay';
        el.innerHTML = `
            <div class="sleep-card sleep-card-large">
                <div class="sleep-header">
                    <div>
                        <h3>😴 Sono - Dashboard</h3>
                        <p>Análise da qualidade de recuperação</p>
                    </div>
                    <button class="sleep-close" onclick="SleepSystem.removePrompt()">✕</button>
                </div>

                <div class="sleep-body">
                    <!-- Score Card -->
                    <div class="score-card ${status.level}">
                        <div class="score-left">
                            <div class="score-emoji">${status.emoji}</div>
                            <div class="score-text">
                                <div class="score-label">Score Sono</div>
                                <div class="score-value">${score}/100</div>
                            </div>
                        </div>
                        <div class="score-right">
                            <div class="status-badge ${status.level}">${status.text}</div>
                            <div class="trend-badge">
                                ${trend.trend} ${trend.pct > 0 ? '+' : ''}${trend.pct}%
                            </div>
                        </div>
                    </div>

                    <!-- Ontem -->
                    ${today ? `
                    <div class="sleep-section">
                        <label class="sleep-label">📊 Noite Anterior</label>
                        <div class="yesterday-stats">
                            <div class="stat-box">
                                <div class="stat-icon">⏰</div>
                                <div class="stat-content">
                                    <div class="stat-title">Duração</div>
                                    <div class="stat-value">${today.durationHours}h (${today.durationMinutes} min)</div>
                                    <div class="stat-hint">${today.durationMinutes >= 420 && today.durationMinutes <= 480 ? '✅ Ideal' : '⚠️ Fora do ideal (7-8h)'}</div>
                                </div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-icon">⭐</div>
                                <div class="stat-content">
                                    <div class="stat-title">Qualidade</div>
                                    <div class="stat-value">${today.quality}/10</div>
                                    <div class="stat-hint">${today.manual ? 'Manual' : 'Automático (device)'}</div>
                                </div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-icon">😑</div>
                                <div class="stat-content">
                                    <div class="stat-title">Despertares</div>
                                    <div class="stat-value">${today.awakenings}x</div>
                                    <div class="stat-hint">${today.awakenings <= 1 ? '✅ Ótimo' : today.awakenings <= 3 ? '👍 Normal' : '⚠️ Muitos'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    ` : '<p style="color:#6b7280; font-size:0.9rem;">Nenhum registro para ontem</p>'}

                    <!-- Gráfico 7 dias -->
                    <div class="sleep-section">
                        <label class="sleep-label">📈 Duração (7 dias)</label>
                        <div class="sleep-chart">
                            <div class="chart-bars">
                                ${hist7.map((h, i) => `
                                    <div class="chart-bar-container" title="${h.date}: ${h.duration}h">
                                        <div class="chart-bar" style="height: ${Math.max(20, Math.min(100, (h.duration / 10) * 100))}%; background: ${h.quality >= 7 ? '#10b981' : h.quality >= 5 ? '#f59e0b' : '#ef4444'}"></div>
                                        <div class="chart-label">${new Date(h.date).toLocaleDateString('pt-BR', {weekday: 'short'}).slice(0,1)}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="chart-stats">Média 7d: ${avg7}h | Qual média: ${avgQual7}/10</div>
                    </div>

                    <!-- Heatmap 30 dias (como nutrição) -->
                    <div class="sleep-section">
                        <label class="sleep-label">🔥 Heatmap Qualidade (30 dias)</label>
                        <div class="sleep-heatmap">
                            ${hist30.map(h => `
                                <div class="heat-cell-sleep" 
                                     title="${h.date}: ${h.duration}h, Qual ${h.quality}/10"
                                     style="background: rgba(16,185,129,${Math.min(1, h.quality / 10)})"></div>
                            `).join('')}
                        </div>
                        <div class="chart-stats">Média 30d: ${avg30}h</div>
                    </div>

                    <!-- Correlação Fadiga (Fase 3) -->
                    <div class="sleep-section">
                        <label class="sleep-label">🔗 Correlação com Fadiga</label>
                        <div class="correlation-box">
                            ${SleepSystem.renderCorrelationWithFatigue()}
                        </div>
                    </div>

                    <!-- Sugestões -->
                    <div class="sleep-section">
                        <label class="sleep-label">💡 Recomendações</label>
                        <div class="recommendations-list">
                            ${SleepSystem.getRecommendations().map(r => `<li>${r}</li>`).join('')}
                        </div>
                    </div>
                </div>

                <div class="sleep-actions">
                    <button class="btn-primary" onclick="SleepSystem.promptSleep()">Editar noite anterior</button>
                    <button class="btn-secondary" onclick="SleepSystem.removePrompt()">Fechar</button>
                </div>
            </div>
        `;

        document.body.appendChild(el);
    },

    // ============= FASE 3: Integração com Fadiga
    renderCorrelationWithFatigue() {
        const fatigueData = FatigueSystem.loadData();
        const sleepData = this.load();
        const todayRecord = this.getTodayRecord();
        const lastFatigue = fatigueData.sessions?.[fatigueData.sessions.length - 1];

        if (!todayRecord || !lastFatigue) {
            return '<p style="color:#6b7280;">Dados insuficientes para correlação. Continue registrando.</p>';
        }

        const sleepScore = this.getScore(todayRecord);
        const fatigueStatus = FatigueSystem.statusFromAvg(lastFatigue.avgRPE);
        const recoveryScore = this.getRecoveryScore();

        return `
            <div class="correlation-stats">
                <div class="corr-row">
                    <span>Sono</span>
                    <span class="corr-value">${sleepScore}/100</span>
                </div>
                <div class="corr-row">
                    <span>RPE Treino</span>
                    <span class="corr-value">${lastFatigue.avgRPE.toFixed(1)}</span>
                </div>
                <div class="corr-row">
                    <span>🔄 Recovery Score</span>
                    <span class="corr-value corr-highlight">${recoveryScore}/100</span>
                </div>
                <div class="corr-insight" style="border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
                    ${SleepSystem.getCorrelationInsight()}
                </div>
            </div>
        `;
    },

    getRecoveryScore() {
        const sleepData = this.load();
        const fatigueData = FatigueSystem?.loadData?.();

        const todayRecord = this.getTodayRecord();
        const lastFatigue = fatigueData?.sessions?.[fatigueData.sessions.length - 1];

        if (!todayRecord || !lastFatigue) return 0;

        const sleepScore = this.getScore(todayRecord);
        const fatigueLevel = lastFatigue.avgRPE; // 1-10
        const fatigueScore = ((10 - fatigueLevel) / 10) * 100; // inverte (menor RPE = melhor)

        // Recovery = 50% sono + 50% fadiga controlada
        return Math.round(sleepScore * 0.5 + fatigueScore * 0.5);
    },

    getCorrelationInsight() {
        const todayRecord = this.getTodayRecord();
        const fatigueData = FatigueSystem?.loadData?.();
        const lastFatigue = fatigueData?.sessions?.[fatigueData.sessions.length - 1];

        if (!todayRecord || !lastFatigue) return 'Registre treino com RPE para ver insights';

        const duration = todayRecord.durationHours;
        const rpe = lastFatigue.avgRPE;
        const sleepScore = this.getScore(todayRecord);

        let insight = '';

        if (duration < 6) {
            insight = `⚠️ Dormiu pouco (${duration}h). RPE ${rpe.toFixed(1)} tende a ser ${rpe > 7 ? 'ALTO demais' : 'normal'}. Considere descanso extra.`;
        } else if (duration > 8) {
            insight = `✅ Dormiram bem (${duration}h). Se RPE foi alto, recuperação está sendo priorizada. Continuar assim.`;
        } else {
            insight = `👍 Duração ótima (${duration}h). ${rpe > 7 ? 'RPE ainda alto → acompanhar próximos dias' : 'Recuperação equilibrada.'} `;
        }

        return insight;
    },

    getRecommendations() {
        const today = this.getTodayRecord();
        const hist7 = this.getHistory(7);
        const recs = [];

        if (!today) {
            recs.push('📝 Registre a noite anterior para receber recomendações personalizadas');
            return recs;
        }

        // Recomendações baseadas em duração
        if (today.durationHours < 6) {
            recs.push('⏰ Dormiu pouco. Aumente proteína +15% e considere reduzir volume do treino em 20%');
        } else if (today.durationHours > 9) {
            recs.push('😴 Excessivo. Se continuando, pode indicar overtraining. Monitore RPE.');
        } else {
            recs.push('✅ Duração dentro do ideal. Mantenha consistência.');
        }

        // Recomendações baseadas em qualidade
        if (today.quality < 5) {
            recs.push('🌙 Qualidade baixa. Evite telas 1h antes, reduza cafeína e estresse.');
            if (today.factors.includes('tela')) recs.push('📱 Foco: Desligue dispositivos 60min antes de dormir');
            if (today.factors.includes('estresse')) recs.push('🧘 Tente meditação ou respiração antes de dormir');
        }

        // Padrão da semana
        if (hist7.length >= 3) {
            const avgQual = hist7.reduce((s, h) => s + h.quality, 0) / hist7.length;
            if (avgQual < 6) {
                recs.push('📊 Semana com qualidade ruim. Priorize sleep hygiene: temperatura (18-20°C), escuridão, silêncio');
            }
        }

        if (today.awakenings > 3) {
            recs.push('😑 Muitos despertares. Verifique ambiente (luz, barulho) e hidratação noturna');
        }

        return recs.length ? recs : ['🎯 Tudo ótimo! Mantenha a consistência de sono.'];
    }
};

// =====================================================
// FATIGUE SYSTEM - RPE + Fadiga (Widget Expandido)
// Versão séria (Strong/Hevy): Widget B + Slider B + Gráfico Completo
// =====================================================
const FatigueSystem = {
    storageKey: 'fatigue_data',
    currentSession: null,

    loadData() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '{"sessions":[]}');
        } catch (e) {
            return { sessions: [] };
        }
    },

    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    },

    startSession(workoutName) {
        this.currentSession = {
            workoutName,
            start: Date.now(),
            entries: []
        };
    },

    cancelSession() {
        this.currentSession = null;
        this.removePrompt();
        this.updateDuringWidget();
    },

    recordSet(entry) {
        if (!this.currentSession) return;
        this.currentSession.entries.push(entry);
        this.updateDuringWidget();
    },

    getCurrentStatus() {
        if (!this.currentSession || this.currentSession.entries.length === 0) {
            return {
                avg: null,
                label: 'Sem RPE ainda',
                text: 'Registrar após a série',
                level: 'neutral',
                suggestion: 'Use o slider no descanso',
                color: 'var(--text-secondary)'
            };
        }

        const avg = this.currentSession.entries.reduce((s, e) => s + e.rpe, 0) / this.currentSession.entries.length;
        return this.statusFromAvg(avg);
    },

    statusFromAvg(avg) {
        if (avg === null || avg === undefined) {
            return {
                avg: null,
                label: 'Sem dados',
                text: '—',
                level: 'neutral',
                suggestion: 'Registre RPE para análise',
                color: 'var(--text-secondary)'
            };
        }

        if (avg > 8.5) return { avg, label: `RPE ${avg.toFixed(1)}`, text: 'CRÍTICO', level: 'alta', suggestion: '⚠️ DELOAD OBRIGATÓRIA -10% min. Risco overtraining', color: '#ef4444' };
        if (avg >= 7) return { avg, label: `RPE ${avg.toFixed(1)}`, text: 'Alto', level: 'moderada', suggestion: 'Monitorar próximas 48h. +20% descanso entre séries', color: '#f59e0b' };
        if (avg >= 5) return { avg, label: `RPE ${avg.toFixed(1)}`, text: 'Alvo', level: 'ok', suggestion: 'Zona ótima hipertrofia. Manter estratégia', color: '#10b981' };
        return { avg, label: `RPE ${avg.toFixed(1)}`, text: 'Subutilizado', level: 'baixa', suggestion: 'AUMENTAR +5–10% na próxima. Margem segura', color: '#22d3ee' };
    },

    renderInWorkoutWidget() {
        const status = this.getCurrentStatus();
        const avgText = status.avg ? status.label : 'RPE —';
        return `
            <div class="aw-fatigue-card ${status.level}">
                <div class="fatigue-left">
                    <div class="fatigue-title">Fadiga</div>
                    <div class="fatigue-value">${avgText}</div>
                    <div class="fatigue-suggestion">${status.suggestion}</div>
                </div>
                <div class="fatigue-status ${status.level}">${status.text}</div>
            </div>
        `;
    },

    updateDuringWidget() {
        const container = document.getElementById('aw-fatigue-strip');
        if (container) {
            container.innerHTML = this.renderInWorkoutWidget();
        }
    },

    promptRPE({ exerciseName, exIdx, setIdx, defaultValue = 6 }) {
        this.removePrompt();

        const overlay = document.createElement('div');
        overlay.className = 'rpe-overlay';
        overlay.id = 'rpe-overlay';
        overlay.innerHTML = `
            <div class="rpe-card">
                <div class="rpe-header">
                    <div>
                        <div class="rpe-title">RPE da série</div>
                        <div class="rpe-sub">${exerciseName} • Série ${setIdx + 1}</div>
                    </div>
                    <button class="rpe-close" onclick="FatigueSystem.removePrompt()">✕</button>
                </div>
                <div class="rpe-value" id="rpe-value-display">${defaultValue}</div>
                <input type="range" min="1" max="10" step="0.5" value="${defaultValue}" class="rpe-slider" id="rpe-slider">
                <div class="rpe-scale">
                    <span>1</span><span>3</span><span>6</span><span>8</span><span>10</span>
                </div>
                <div class="rpe-actions">
                    <button class="btn-rpe-secondary" onclick="FatigueSystem.removePrompt()">Pular</button>
                    <button class="btn-rpe-primary" id="rpe-save-btn">Salvar e continuar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const slider = document.getElementById('rpe-slider');
        const display = document.getElementById('rpe-value-display');
        const saveBtn = document.getElementById('rpe-save-btn');

        slider?.addEventListener('input', (e) => {
            display.textContent = parseFloat(e.target.value).toFixed(1).replace('.0', '');
        });

        saveBtn?.addEventListener('click', () => {
            const value = parseFloat(slider?.value || defaultValue);
            this.handleRPE(exIdx, setIdx, exerciseName, value);
        });
    },

    handleRPE(exIdx, setIdx, exerciseName, value) {
        const set = ActiveWorkout.setsCompleted?.[exIdx]?.[setIdx];
        if (set) {
            set.rpe = value;
            this.recordSet({
                exerciseName,
                rpe: value,
                weight: set.weight || null,
                reps: set.reps || null
            });
        }
        this.removePrompt();
        this.updateDuringWidget();
    },

    removePrompt() {
        document.getElementById('rpe-overlay')?.remove();
    },

    finalizeSession({ volume = 0, duration = 0, workoutName = '' }) {
        if (!this.currentSession) return;
        const entries = this.currentSession.entries;
        if (!entries.length) {
            this.currentSession = null;
            return;
        }

        const avg = entries.reduce((s, e) => s + e.rpe, 0) / entries.length;
        const data = this.loadData();
        data.sessions = data.sessions || [];

        data.sessions.push({
            date: new Date().toISOString().split('T')[0],
            workoutName,
            avgRPE: avg,
            volume,
            duration,
            entries: entries.length
        });

        // manter últimos 60 registros
        if (data.sessions.length > 60) {
            data.sessions = data.sessions.slice(-60);
        }

        this.saveData(data);
        this.currentSession = null;
        this.updateDuringWidget();
    },

    getRecentSessions(limit = 7) {
        const data = this.loadData();
        const sessions = data.sessions || [];
        const recent = sessions.slice(-limit);
        const maxRpe = Math.max(...recent.map(r => r.avgRPE || 0), 10);
        return recent.map(s => {
            const pct = Math.max(10, Math.min(100, (s.avgRPE || 0) / maxRpe * 100));
            const level = this.statusFromAvg(s.avgRPE).level;
            const colorMap = { alta: '#ef4444', moderada: '#f59e0b', ok: '#10b981', baixa: '#22d3ee', neutral: 'var(--text-muted)' };
            return {
                height: pct,
                color: colorMap[level] || 'var(--primary)',
                label: `${s.date} • RPE ${s.avgRPE?.toFixed(1) || '--'}`
            };
        });
    },

    getDashboardStatus() {
        const data = this.loadData();
        const sessions = data.sessions || [];
        if (!sessions.length) {
            return {
                label: 'Sem dados',
                text: 'Registrar',
                level: 'neutral',
                suggestion: 'Registre RPE para ver tendências'
            };
        }
        const last = sessions[sessions.length - 1];
        const status = this.statusFromAvg(last.avgRPE);
        return {
            label: `Último RPE ${last.avgRPE.toFixed(1)}`,
            text: status.text,
            level: status.level,
            suggestion: status.suggestion
        };
    },

    showFullChart() {
        const data = this.loadData();
        const sessions = data.sessions || [];
        if (!sessions.length) {
            Toast.info('Sem registros de RPE ainda');
            return;
        }

        document.getElementById('fatigue-chart-modal')?.remove();
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'fatigue-chart-modal';

        const last14 = sessions.slice(-14);
        const maxRpe = Math.max(...last14.map(s => s.avgRPE || 0), 10);
        const maxVol = Math.max(...last14.map(s => s.volume || 0), 1);

        modal.innerHTML = `
            <div class="fatigue-modal">
                <div class="fatigue-modal-header">
                    <h2>📉 Fadiga vs Volume</h2>
                    <button class="modal-close" onclick="document.getElementById('fatigue-chart-modal').remove()">✕</button>
                </div>
                <div class="fatigue-chart-legend">
                    <span class="legend-rpe">RPE</span>
                    <span class="legend-vol">Volume</span>
                </div>
                <div class="fatigue-chart-area">
                    ${last14.map(s => {
                        const rpeHeight = Math.max(10, (s.avgRPE || 0) / maxRpe * 100);
                        const volHeight = Math.max(5, (s.volume || 0) / maxVol * 100);
                        const status = this.statusFromAvg(s.avgRPE);
                        return `
                            <div class="fatigue-bar-group" title="${s.date} | RPE ${s.avgRPE?.toFixed(1) || '--'} | Vol ${Math.round(s.volume || 0)}kg">
                                <div class="bar bar-rpe ${status.level}" style="height:${rpeHeight}%"></div>
                                <div class="bar bar-vol" style="height:${volHeight}%"></div>
                                <div class="bar-label">${s.date.slice(5)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="fatigue-modal-footer">
                    <p>Regras: RPE>8 duas vezes seguidas sugere deload. RPE 6–8 manter. RPE<4 permite subir 2–3%.</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
};

// =====================================================
// NUTRITION SYSTEM (MVP)
// =====================================================
const NutritionSystem = {
    key: 'nutrition_data',
    data: null,
    foods: {
        'frango-peito-100g': { label: 'Peito de frango (100g)', cals: 165, proteina: 31, carbs: 0, gordura: 3.6 },
        'ovo-1un': { label: 'Ovo (1 unidade)', cals: 155, proteina: 13, carbs: 1.1, gordura: 11 },
        'arroz-integral-100g': { label: 'Arroz integral (100g cozido)', cals: 111, proteina: 2.6, carbs: 23, gordura: 0.9 },
        'batata-doce-100g': { label: 'Batata doce (100g)', cals: 86, proteina: 1.6, carbs: 20, gordura: 0.1 },
        'brocolis-100g': { label: 'Brócolis (100g)', cals: 34, proteina: 2.8, carbs: 7, gordura: 0.4 },
        'aveia-50g': { label: 'Aveia (50g)', cals: 195, proteina: 8, carbs: 33, gordura: 3.5 },
        'banana-1un': { label: 'Banana (1 unidade)', cals: 89, proteina: 1.1, carbs: 23, gordura: 0.3 },
        'pasta-amendoim-1cs': { label: 'Pasta de amendoim (1 colher sopa)', cals: 95, proteina: 4, carbs: 3.5, gordura: 8 },
        'iogurte-natural-170g': { label: 'Iogurte natural (170g)', cals: 100, proteina: 10, carbs: 7, gordura: 3 },
        'tilapia-100g': { label: 'Tilápia (100g)', cals: 129, proteina: 26, carbs: 0, gordura: 2.7 },
        'patinho-100g': { label: 'Carne patinho (100g)', cals: 250, proteina: 26, carbs: 0, gordura: 16 },
        'whey-1scoop': { label: 'Whey (1 scoop)', cals: 120, proteina: 24, carbs: 3, gordura: 2 }
    },

    recipes: {
        'cafe-ganho': { label: 'Café do Ganho', itens: ['ovo-1un','aveia-50g','banana-1un'], note: 'Desjejum proteico' },
        'pre-rapido': { label: 'Pré-treino Rápido', itens: ['banana-1un','pasta-amendoim-1cs'], note: 'Carbo rápido + gordura' },
        'pos-massa': { label: 'Pós-treino Massa', itens: ['frango-peito-100g','arroz-integral-100g','brocolis-100g'], note: 'Clássico recuperação' },
        'lanche-magro': { label: 'Lanche Magro', itens: ['iogurte-natural-170g','aveia-50g'], note: 'Proteico e saciedade' },
        'janta-lean': { label: 'Janta Lean', itens: ['tilapia-100g','batata-doce-100g','brocolis-100g'], note: 'Leve e proteína alta' }
    },

    getAllRecipes() {
        this.load();
        const base = Object.entries(this.recipes || {});
        const user = (this.data?.receitas || []).map((r,i) => [
            `user-${i}`,
            {
                label: r.label || r.nome || `Receita ${i+1}`,
                itens: r.itens || [],
                macros: r.macros,
                note: r.note || 'Salvo',
                user: true
            }
        ]);
        return [...base, ...user];
    },

    load() {
        try {
            const saved = localStorage.getItem(this.key);
            this.data = saved ? JSON.parse(saved) : {
                profile: {},
                macros: {},
                diario: [],
                receitas: []
            };
        } catch (e) {
            this.data = { profile: {}, macros: {}, diario: [], receitas: [] };
        }
        // ensure macros
        if (!this.data.macros || !this.data.macros.calorias) {
            this.data.macros = this.calculateMacros();
            this.save();
        }
    },

    save() {
        localStorage.setItem(this.key, JSON.stringify(this.data));
    },

    calculateMacros() { // Advanced (Mifflin-St Jeor)
        const p = AppState.profile || {};
        const peso = Number(p.peso) || 75; // kg
        const altura = Number(p.altura) || 175; // cm
        const idade = Number(p.idade) || 30; // anos
        const genero = (p.genero || 'M').toUpperCase();
        const atividade = p.atividade || 'moderado';
        const objetivo = p.objetivo || 'Manutenção';
        const bmr = (genero === 'M') ? (10*peso + 6.25*altura - 5*idade + 5) : (10*peso + 6.25*altura - 5*idade - 161);
        const atvFactor = { sedentario: 1.2, leve: 1.375, moderado: 1.55, intenso: 1.725, extremo: 1.9 }[atividade] || 1.55;
        let tdee = bmr * atvFactor;
        if (/perda/i.test(objetivo)) tdee *= 0.85; // -15%
        else if (/ganho|hipertrofia/i.test(objetivo)) tdee *= 1.10; // +10%
        const proteina = Math.round(peso * (p.proteinaPorKg || 1.8)); // custom g/kg
        const gordura = Math.round(peso * 0.9);  // 0.9 g/kg
        const kcalProteina = proteina * 4;
        const kcalGordura = gordura * 9;
        const kcalRestante = Math.max(0, Math.round(tdee) - (kcalProteina + kcalGordura));
        const carboidrato = Math.max(0, Math.round(kcalRestante / 4));
        return { proteina, carboidrato, gordura, calorias: Math.round(tdee), sincronizadoEm: Date.now() };
    },

    getTodayEntry() {
        const today = new Date().toISOString().slice(0,10);
        let entry = this.data.diario.find(d => d.data === today);
        if (!entry) {
            entry = { data: today, refeicoes: [], totalCals: 0, totalProteina: 0, totalCarbs: 0, totalGordura: 0, meta: this.data.macros, porcentagemMeta: {} };
            this.data.diario.unshift(entry);
        }
        return entry;
    },

    getTodaySummary() {
        this.load();
        const entry = this.getTodayEntry();
        // recompute totals from refeicoes
        const totals = entry.refeicoes.flatMap(r => r.alimentos || []).reduce((acc, a) => {
            acc.cals += Number(a.cals)||0; acc.p += Number(a.proteina)||0; acc.c += Number(a.carbs)||0; acc.g += Number(a.gordura)||0; return acc;
        }, { cals:0, p:0, c:0, g:0 });
        entry.totalCals = Math.round(totals.cals);
        entry.totalProteina = Math.round(totals.p);
        entry.totalCarbs = Math.round(totals.c);
        entry.totalGordura = Math.round(totals.g);
        entry.meta = this.data.macros;
        entry.porcentagemMeta = {
            cals: Math.round((entry.totalCals / entry.meta.calorias) * 100),
            proteina: Math.round((entry.totalProteina / entry.meta.proteina) * 100)
        };
        this.save();
        return {
            totalCals: entry.totalCals, totalProteina: entry.totalProteina, totalCarbs: entry.totalCarbs, totalGordura: entry.totalGordura, meta: entry.meta
        };
    },

    recordMeal({ nome, cals, proteina=0, carbs=0, gordura=0, hora, porcao }) {
        this.load();
        const entry = this.getTodayEntry();
        const refeicao = { nome: nome||'Refeição', hora: hora||new Date().toTimeString().slice(0,5), alimentos: [{ item: nome||'Item', porcao: porcao||'', cals, proteina, carbs, gordura }] };
        entry.refeicoes.push(refeicao);
        this.save();
        Toast.show('Refeição registrada ✅');
    },

    promptAddMeal() {
        const existing = document.querySelector('.nutrition-overlay');
        if (existing) existing.remove();
        const el = document.createElement('div');
        el.className = 'nutrition-overlay';
        el.innerHTML = `
            <div class="nutrition-card">
                <div class="nutrition-header"><h3>Registrar refeição</h3><button class="nutrition-close" onclick="NutritionSystem.removePrompt()">✕</button></div>
                <div class="nutrition-body">
                    <div class="food-search">
                        <label>Buscar alimento</label>
                        <input id="food-search" type="text" placeholder="Ex: frango, arroz" oninput="NutritionSystem.onSearchFoodInput(this.value)">
                        <div id="food-results" class="food-results"></div>
                    </div>
                    <div class="food-search">
                        <label>Receitas rápidas</label>
                        <div class="recipe-quick">
                            <select id="recipe-select">
                                <option value="">Selecionar receita</option>
                                ${this.getAllRecipes().map(([k,v]) => `<option value="${k}">${v.label}${v.user ? ' (sua)' : ''}</option>`).join('')}
                            </select>
                            <button class="btn-mini" onclick="NutritionSystem.applyRecipe()">Aplicar</button>
                        </div>
                    </div>
                    <label>Nome</label>
                    <input id="nm-refeicao" type="text" placeholder="Ex: Frango com arroz">
                    <label>Horário</label>
                    <input id="hora-refeicao" type="time" value="${new Date().toTimeString().slice(0,5)}">
                    <div class="grid-2">
                        <div><label>Calorias</label><input id="cal-refeicao" type="number" placeholder="kcal"></div>
                        <div><label>Proteína</label><input id="prot-refeicao" type="number" placeholder="g"></div>
                        <div><label>Carbo</label><input id="carb-refeicao" type="number" placeholder="g"></div>
                        <div><label>Gordura</label><input id="fat-refeicao" type="number" placeholder="g"></div>
                        <div><label>Porção</label><input id="porcao-refeicao" type="text" placeholder="Ex: 150g"></div>
                    </div>
                </div>
                <div class="nutrition-actions-bottom">
                    <button class="btn-primary" onclick="NutritionSystem.handleAddMeal()">Adicionar</button>
                    <button class="btn-secondary" onclick="NutritionSystem.removePrompt()">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(el);
    },

    onSearchFoodInput(q) {
        const list = Object.entries(this.foods).filter(([key, v]) => v.label.toLowerCase().includes((q||'').toLowerCase())).slice(0,8);
        const el = document.getElementById('food-results');
        if (!el) return;
        el.innerHTML = list.length ? list.map(([key, v]) => `
            <div class="food-item" onclick="NutritionSystem.selectFood('${key}')">${v.label}<span>${v.cals} kcal • P ${v.proteina}g • C ${v.carbs}g • G ${v.gordura}g</span></div>
        `).join('') : '<div class="food-empty">Nenhum item encontrado</div>';
    },

    selectFood(key) {
        const v = this.foods[key];
        if (!v) return;
        const nm = document.getElementById('nm-refeicao');
        const c = document.getElementById('cal-refeicao');
        const p = document.getElementById('prot-refeicao');
        const cb = document.getElementById('carb-refeicao');
        const g = document.getElementById('fat-refeicao');
        if (nm) nm.value = v.label;
        if (c) c.value = v.cals;
        if (p) p.value = v.proteina;
        if (cb) cb.value = v.carbs;
        if (g) g.value = v.gordura;
        Toast.show('Alimento selecionado ✅');
    },

    showMacroCalculator() {
        const p = AppState.profile || {};
        const macros = this.calculateMacros();
        const existing = document.querySelector('.nutrition-overlay');
        if (existing) existing.remove();
        const el = document.createElement('div');
        el.className = 'nutrition-overlay';
        el.innerHTML = `
            <div class="nutrition-card">
                <div class="nutrition-header"><h3>Calcular Macros (Pro)</h3><button class="nutrition-close" onclick="NutritionSystem.removePrompt()">✕</button></div>
                <div class="nutrition-body">
                    <div class="grid-2">
                        <div><label>Peso (kg)</label><input id="calc-peso" type="number" value="${p.peso||75}"></div>
                        <div><label>Altura (cm)</label><input id="calc-altura" type="number" value="${p.altura||175}"></div>
                        <div><label>Idade</label><input id="calc-idade" type="number" value="${p.idade||30}"></div>
                        <div><label>Gênero</label><input id="calc-genero" type="text" value="${p.genero||'M'}"></div>
                        <div><label>Atividade</label><input id="calc-atv" type="text" value="${p.atividade||'moderado'}"></div>
                        <div><label>Objetivo</label><input id="calc-obj" type="text" value="${p.objetivo||'Manutenção'}"></div>
                    </div>
                    <div class="macro-bars big" style="margin-top:12px;">
                        <div class="macro-row"><span>Proteína</span><div class="bar"><div class="fill prot" style="width:100%"></div></div><span>${macros.proteina} g</span></div>
                        <div class="macro-row"><span>Carbo</span><div class="bar"><div class="fill carb" style="width:100%"></div></div><span>${macros.carboidrato} g</span></div>
                        <div class="macro-row"><span>Gordura</span><div class="bar"><div class="fill fat" style="width:100%"></div></div><span>${macros.gordura} g</span></div>
                    </div>
                    <div class="cal-progress"><div class="bar"><div class="fill cal" style="width:100%"></div></div><span>${macros.calorias} kcal/dia</span></div>
                </div>
                <div class="nutrition-actions-bottom">
                    <button class="btn-primary" onclick="NutritionSystem.applyCalculatedMacros()">Adotar</button>
                    <button class="btn-secondary" onclick="NutritionSystem.removePrompt()">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(el);
    },

    applyCalculatedMacros() {
        // Read possible edits
        const peso = Number(document.getElementById('calc-peso')?.value)||NaN;
        const altura = Number(document.getElementById('calc-altura')?.value)||NaN;
        const idade = Number(document.getElementById('calc-idade')?.value)||NaN;
        const genero = (document.getElementById('calc-genero')?.value||'').toUpperCase();
        const atv = document.getElementById('calc-atv')?.value||'';
        const obj = document.getElementById('calc-obj')?.value||'';
        // Update profile minimal
        AppState.profile = {
            ...(AppState.profile||{}),
            ...(isNaN(peso)?{}:{peso}),
            ...(isNaN(altura)?{}:{altura}),
            ...(isNaN(idade)?{}:{idade}),
            ...(genero?{genero}:{ }),
            ...(atv?{atividade: atv}:{ }),
            ...(obj?{objetivo: obj}:{ })
        };
        // Recalculate and save
        this.data.macros = this.calculateMacros();
        this.save();
        this.removePrompt();
        DashboardWidgets.render();
        Toast.show('Macros atualizadas ✅');
    },

    applyRecipe() {
        const key = document.getElementById('recipe-select')?.value;
        if (!key) return;
        const r = this.getAllRecipes().find(([k]) => k === key)?.[1];
        if (!r) return;
        const agg = r.macros ?
            { cals: r.macros.cals||0, p: r.macros.proteina||0, c: r.macros.carbs||0, g: r.macros.gordura||0 } :
            (r.itens||[]).reduce((acc, id) => {
                const f = this.foods[id];
                if (!f) return acc;
                acc.cals += f.cals; acc.p += f.proteina; acc.c += f.carbs; acc.g += f.gordura; return acc;
            }, {cals:0,p:0,c:0,g:0});
        const nm = document.getElementById('nm-refeicao');
        const c = document.getElementById('cal-refeicao');
        const p = document.getElementById('prot-refeicao');
        const cb = document.getElementById('carb-refeicao');
        const g = document.getElementById('fat-refeicao');
        if (nm) nm.value = r.label;
        if (c) c.value = Math.round(agg.cals);
        if (p) p.value = Math.round(agg.p);
        if (cb) cb.value = Math.round(agg.c);
        if (g) g.value = Math.round(agg.g);
        Toast.show('Receita aplicada ✅');
    },

    handleAddMeal() {
        const nome = document.getElementById('nm-refeicao')?.value || 'Refeição';
        const cals = Number(document.getElementById('cal-refeicao')?.value)||0;
        const proteina = Number(document.getElementById('prot-refeicao')?.value)||0;
        const carbs = Number(document.getElementById('carb-refeicao')?.value)||0;
        const gordura = Number(document.getElementById('fat-refeicao')?.value)||0;
        const porcao = document.getElementById('porcao-refeicao')?.value || '';
        const hora = document.getElementById('hora-refeicao')?.value || new Date().toTimeString().slice(0,5);
        this.recordMeal({ nome, cals, proteina, carbs, gordura, porcao, hora });
        this.removePrompt();
        // Refresh widget
        DashboardWidgets.render();
    },

    promptEditMeal(idx) {
        this.load();
        const entry = this.getTodayEntry();
        const r = entry.refeicoes[idx];
        if (!r) return;
        const a = r.alimentos?.[0] || {};
        const existing = document.querySelector('.nutrition-overlay');
        if (existing) existing.remove();
        const el = document.createElement('div');
        el.className = 'nutrition-overlay';
        el.innerHTML = `
            <div class="nutrition-card">
                <div class="nutrition-header"><h3>Editar refeição</h3><button class="nutrition-close" onclick="NutritionSystem.removePrompt()">✕</button></div>
                <div class="nutrition-body">
                    <label>Nome</label>
                    <input id="nm-refeicao" type="text" value="${r.nome}">
                    <label>Horário</label>
                    <input id="hora-refeicao" type="time" value="${r.hora}">
                    <div class="grid-2">
                        <div><label>Calorias</label><input id="cal-refeicao" type="number" value="${a.cals||0}"></div>
                        <div><label>Proteína</label><input id="prot-refeicao" type="number" value="${a.proteina||0}"></div>
                        <div><label>Carbo</label><input id="carb-refeicao" type="number" value="${a.carbs||0}"></div>
                        <div><label>Gordura</label><input id="fat-refeicao" type="number" value="${a.gordura||0}"></div>
                        <div><label>Porção</label><input id="porcao-refeicao" type="text" value="${a.porcao||''}"></div>
                    </div>
                </div>
                <div class="nutrition-actions-bottom">
                    <button class="btn-primary" onclick="NutritionSystem.handleSaveMeal(${idx})">Salvar</button>
                    <button class="btn-secondary" onclick="NutritionSystem.removePrompt()">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(el);
    },

    handleSaveMeal(idx) {
        this.load();
        const entry = this.getTodayEntry();
        const r = entry.refeicoes[idx];
        if (!r) return;
        const nome = document.getElementById('nm-refeicao')?.value || r.nome;
        const hora = document.getElementById('hora-refeicao')?.value || r.hora;
        const cals = Number(document.getElementById('cal-refeicao')?.value)||0;
        const proteina = Number(document.getElementById('prot-refeicao')?.value)||0;
        const carbs = Number(document.getElementById('carb-refeicao')?.value)||0;
        const gordura = Number(document.getElementById('fat-refeicao')?.value)||0;
        const porcao = document.getElementById('porcao-refeicao')?.value || '';
        r.nome = nome;
        r.hora = hora;
        r.alimentos = [{ item:nome, porcao, cals, proteina, carbs, gordura }];
        this.save();
        this.removePrompt();
        DashboardWidgets.render();
        Toast.show('Refeição atualizada ✅');
    },

    deleteMeal(idx) {
        this.load();
        const entry = this.getTodayEntry();
        entry.refeicoes.splice(idx,1);
        this.save();
        DashboardWidgets.render();
        Toast.show('Refeição removida ✅');
    },

    saveRecipeFromMeal(idx) {
        this.load();
        const entry = this.getTodayEntry();
        const r = entry.refeicoes[idx];
        if (!r) return;
        const a = r.alimentos?.[0] || {};
        const recipe = { label: r.nome, itens: [], note: 'Salvo do diário', macros: { cals:a.cals||0, proteina:a.proteina||0, carbs:a.carbs||0, gordura:a.gordura||0 } };
        this.data.receitas = this.data.receitas || [];
        this.data.receitas.push(recipe);
        this.save();
        Toast.show('Receita salva ✅');
    },

    promptEditSavedRecipe(idx) {
        this.load();
        const r = this.data.receitas?.[idx];
        if (!r) return;
        const name = (r.label || `Receita ${idx+1}`).replace(/"/g, '&quot;');
        const note = (r.note || '').replace(/"/g, '&quot;');
        const macros = r.macros || {};
        document.querySelector('.nutrition-overlay')?.remove();
        const el = document.createElement('div');
        el.className = 'nutrition-overlay';
        el.innerHTML = `
            <div class="nutrition-card">
                <div class="nutrition-header"><h3>Editar receita</h3><button class="nutrition-close" onclick="NutritionSystem.showDashboard()">✕</button></div>
                <div class="nutrition-body">
                    <label>Nome</label>
                    <input id="rec-label" type="text" value="${name}">
                    <label>Nota</label>
                    <input id="rec-note" type="text" value="${note}" placeholder="Opcional">
                    <div class="grid-2">
                        <div><label>Calorias</label><input id="rec-cals" type="number" value="${macros.cals||0}"></div>
                        <div><label>Proteína</label><input id="rec-prot" type="number" value="${macros.proteina||0}"></div>
                        <div><label>Carbo</label><input id="rec-carb" type="number" value="${macros.carbs||0}"></div>
                        <div><label>Gordura</label><input id="rec-fat" type="number" value="${macros.gordura||0}"></div>
                    </div>
                </div>
                <div class="nutrition-actions-bottom">
                    <button class="btn-primary" onclick="NutritionSystem.handleSaveRecipe(${idx})">Salvar</button>
                    <button class="btn-secondary" onclick="NutritionSystem.showDashboard()">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(el);
    },

    handleSaveRecipe(idx) {
        this.load();
        const r = this.data.receitas?.[idx];
        if (!r) return;
        const label = document.getElementById('rec-label')?.value || r.label || `Receita ${idx+1}`;
        const note = document.getElementById('rec-note')?.value || '';
        const cals = Number(document.getElementById('rec-cals')?.value)||0;
        const proteina = Number(document.getElementById('rec-prot')?.value)||0;
        const carbs = Number(document.getElementById('rec-carb')?.value)||0;
        const gordura = Number(document.getElementById('rec-fat')?.value)||0;
        r.label = label;
        r.note = note;
        r.macros = { cals, proteina, carbs, gordura };
        this.save();
        this.showDashboard();
        Toast.show('Receita atualizada ✅');
    },

    deleteSavedRecipe(idx) {
        this.load();
        if (!this.data.receitas || !this.data.receitas[idx]) return;
        if (!confirm('Remover esta receita salva?')) return;
        this.data.receitas.splice(idx,1);
        this.save();
        this.showDashboard();
        Toast.show('Receita removida ✅');
    },

    getHistory(days = 7) {
        this.load();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - (days - 1));
        return (this.data.diario||[])
            .filter(d => new Date(d.data) >= cutoff)
            .map(d => ({
                date: d.data,
                cals: d.totalCals || 0,
                protein: d.totalProteina || 0,
                proteinPct: d.meta?.proteina ? Math.round((d.totalProteina / d.meta.proteina) * 100) : 0
            }))
            .sort((a,b)=> new Date(a.date) - new Date(b.date));
    },

    getRecommendations(sum) {
        const recs = [];
        if (sum.totalProteina < sum.meta.proteina) recs.push(`Faltam ${Math.max(0, sum.meta.proteina - sum.totalProteina)}g de proteína hoje.`);
        if (sum.totalCals < sum.meta.calorias * 0.9) recs.push('Calorias abaixo de 90% — adicione um lanche proteico.');
        const fadiga = (window.FatigueSystem && FatigueSystem.getDashboardStatus) ? FatigueSystem.getDashboardStatus() : { level: 'neutral' };
        if (fadiga.level === 'alta') recs.push('Fadiga alta: considere -200 a -300 kcal e priorize proteína.');
        if (fadiga.level === 'baixa') recs.push('Fadiga baixa: pode subir carbo em +10% hoje.');
        return recs.length ? recs : ['Tudo alinhado, mantenha a consistência.'];
    },

    getHeatmapProtein(days = 7) {
        const hist = this.getHistory(days);
        return hist.map(h => ({ date: h.date, pct: Math.min(150, h.proteinPct || 0) }));
    },

    showPreferences() {
        const p = AppState.profile || {};
        const existing = document.querySelector('.nutrition-overlay');
        if (existing) existing.remove();
        const el = document.createElement('div');
        el.className = 'nutrition-overlay';
        el.innerHTML = `
            <div class="nutrition-card">
                <div class="nutrition-header"><h3>Preferências de Metas</h3><button class="nutrition-close" onclick="NutritionSystem.removePrompt()">✕</button></div>
                <div class="nutrition-body">
                    <label>Objetivo</label>
                    <select id="pref-obj">
                        ${['Manutenção','Hipertrofia','Perda de gordura'].map(opt => `<option value="${opt}" ${opt=== (p.objetivo||'Manutenção')?'selected':''}>${opt}</option>`).join('')}
                    </select>
                    <label>Nível de atividade</label>
                    <select id="pref-atv">
                        ${['sedentario','leve','moderado','intenso','extremo'].map(opt => `<option value="${opt}" ${opt===(p.atividade||'moderado')?'selected':''}>${opt}</option>`).join('')}
                    </select>
                    <label>Proteína alvo (g/kg)</label>
                    <input id="pref-prot-kg" type="number" step="0.1" value="${p.proteinaPorKg||1.8}">
                </div>
                <div class="nutrition-actions-bottom">
                    <button class="btn-primary" onclick="NutritionSystem.applyPreferences()">Salvar</button>
                    <button class="btn-secondary" onclick="NutritionSystem.removePrompt()">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(el);
    },

    applyPreferences() {
        const obj = document.getElementById('pref-obj')?.value || 'Manutenção';
        const atv = document.getElementById('pref-atv')?.value || 'moderado';
        const protKg = Number(document.getElementById('pref-prot-kg')?.value)||1.8;
        AppState.profile = { ...(AppState.profile||{}), objetivo: obj, atividade: atv, proteinaPorKg: protKg };
        // Recalculate macros with custom protein
        const p = AppState.profile;
        const peso = Number(p.peso)||75;
        const base = this.calculateMacros();
        base.proteina = Math.round(peso * protKg);
        base.calorias = base.proteina*4 + base.gordura*9 + base.carboidrato*4;
        this.data.macros = base;
        this.save();
        this.removePrompt();
        DashboardWidgets.render();
        Toast.show('Preferências salvas ✅');
    },

    removePrompt() {
        document.querySelector('.nutrition-overlay')?.remove();
    },

    showDashboard() {
        const sum = this.getTodaySummary();
        const hist7 = this.getHistory(7);
        const hist30 = this.getHistory(30);
        const heat = this.getHeatmapProtein(7);
        const recs = this.getRecommendations(sum);
        const existing = document.querySelector('.nutrition-overlay');
        if (existing) existing.remove();
        const el = document.createElement('div');
        el.className = 'nutrition-overlay';
        el.innerHTML = `
            <div class="nutrition-card">
                <div class="nutrition-header"><h3>Nutrição de hoje</h3><div class="header-actions"><button class="btn-mini-secondary" onclick="NutritionSystem.showPreferences()">Preferências</button><button class="nutrition-close" onclick="NutritionSystem.removePrompt()">✕</button></div></div>
                <div class="nutrition-body">
                    <div class="macro-bars big">
                        <div class="macro-row"><span>Proteína</span><div class="bar"><div class="fill prot" style="width:${Math.min(100, Math.round((sum.totalProteina/sum.meta.proteina)*100))}%"></div></div><span>${sum.totalProteina}/${sum.meta.proteina}g</span></div>
                        <div class="macro-row"><span>Carbo</span><div class="bar"><div class="fill carb" style="width:${Math.min(100, Math.round((sum.totalCarbs/sum.meta.carboidrato)*100))}%"></div></div><span>${sum.totalCarbs}/${sum.meta.carboidrato}g</span></div>
                        <div class="macro-row"><span>Gordura</span><div class="bar"><div class="fill fat" style="width:${Math.min(100, Math.round((sum.totalGordura/sum.meta.gordura)*100))}%"></div></div><span>${sum.totalGordura}/${sum.meta.gordura}g</span></div>
                    </div>
                    <div class="cal-progress">
                        <div class="bar"><div class="fill cal" style="width:${Math.min(100, Math.round((sum.totalCals/sum.meta.calorias)*100))}%"></div></div>
                        <span>${sum.totalCals}/${sum.meta.calorias} kcal</span>
                    </div>

                    <div class="charts-wrap">
                        <div class="chart-block">
                            <div class="chart-title">Calorias (7d)</div>
                            <div class="bar-chart">
                                ${hist7.map(h => `<div class="bar-col" title="${h.date}" style="height:${Math.min(100, Math.round((h.cals/(sum.meta.calorias||1))*100))}%"></div>`).join('')}
                            </div>
                        </div>
                        <div class="chart-block">
                            <div class="chart-title">Protein Heatmap (7d)</div>
                            <div class="heatmap">
                                ${heat.map(h => `<div class="heat-cell" title="${h.date} - ${h.pct}%" style="background: rgba(16,185,129,${Math.min(1, h.pct/120)})"></div>`).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="chart-block">
                        <div class="chart-title">Calorias (30d)</div>
                        <div class="bar-chart long">
                            ${hist30.map(h => `<div class="bar-col" title="${h.date}" style="height:${Math.min(100, Math.round((h.cals/(sum.meta.calorias||1))*100))}%"></div>`).join('')}
                        </div>
                    </div>

                    <div class="recommendations">
                        <div class="chart-title">Recomendações</div>
                        <ul>
                            ${recs.map(r => `<li>${r}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="saved-recipes">
                        <div class="chart-title">Suas receitas</div>
                        ${(this.data?.receitas?.length) ? this.data.receitas.map((r,i) => `
                            <div class="recipe-card">
                                <div class="recipe-info">
                                    <div class="recipe-name">${r.label || `Receita ${i+1}`}</div>
                                    <div class="recipe-note">${r.note || 'Personalizada'}</div>
                                    ${r.macros ? `<div class="recipe-macros"><span>${Math.round(r.macros.cals||0)} kcal</span><span>P ${Math.round(r.macros.proteina||0)}g</span><span>C ${Math.round(r.macros.carbs||0)}g</span><span>G ${Math.round(r.macros.gordura||0)}g</span></div>` : ''}
                                </div>
                                <div class="recipe-actions">
                                    <button class="btn-mini" onclick="NutritionSystem.promptEditSavedRecipe(${i})">Editar</button>
                                    <button class="btn-mini-secondary" onclick="NutritionSystem.deleteSavedRecipe(${i})">Excluir</button>
                                </div>
                            </div>
                        `).join('') : '<p class="empty">Nenhuma receita salva ainda.</p>'}
                    </div>

                    <div class="nutrition-list">
                        ${this.data.diario[0]?.refeicoes?.length ? this.data.diario[0].refeicoes.map((r,i) => `
                            <div class="meal-item">
                                <div class="mi-title">${r.nome} <span class="mi-time">${r.hora}</span></div>
                                ${(r.alimentos||[]).map(a => `<div class="mi-line">${a.item} — ${a.cals} kcal, P ${a.proteina}g, C ${a.carbs}g, G ${a.gordura}g ${a.porcao ? '• '+a.porcao : ''}</div>`).join('')}
                                <div class="meal-actions">
                                    <button class="btn-mini-secondary" onclick="NutritionSystem.promptEditMeal(${i})">Editar</button>
                                    <button class="btn-mini-secondary" onclick="NutritionSystem.deleteMeal(${i})">Excluir</button>
                                    <button class="btn-mini" onclick="NutritionSystem.saveRecipeFromMeal(${i})">Salvar receita</button>
                                </div>
                            </div>
                        `).join('') : '<p>Sem refeições registradas hoje.</p>'}
                    </div>
                </div>
                <div class="nutrition-actions-bottom">
                    <button class="btn-primary" onclick="NutritionSystem.promptAddMeal()">+ Adicionar refeição</button>
                    <button class="btn-secondary" onclick="NutritionSystem.removePrompt()">Fechar</button>
                </div>
            </div>
        `;
        document.body.appendChild(el);
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
                completed: false,
                rpe: null
            }))
        );
        
        this.currentExerciseIndex = 0;
        this.isActive = true;
        this.startTime = Date.now();
        FatigueSystem.startSession(this.currentWorkout.nome);
        
        this.renderActiveWorkout();
        this.startTimer();
        
        Toast.success(`💪 Iniciando ${this.currentWorkout.nome}!`);
    },
    
    renderActiveWorkout() {
        const exercicios = this.currentWorkout.exercicios;
        
            // Descobrir índice da ficha atual (A, B, C, D...)
            const treino = App.getTreinoAtual();
            const dayIndex = treino?.dias?.findIndex(d => d.nome === this.currentWorkout.nome) ?? 0;
            const dayLetter = String.fromCharCode(65 + dayIndex); // 0=A, 1=B, 2=C...
        
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
                        <div class="aw-title-wrapper">
                            <div class="workout-day-badge">${dayLetter}</div>
                            <h2 class="aw-title">${this.currentWorkout.nome}</h2>
                        </div>
                    <button class="btn-aw-finish" onclick="ActiveWorkout.finish()">Finalizar</button>
                </div>
                
                <!-- Progress -->
                <div class="aw-progress-container">
                    <div class="aw-progress-bar" id="aw-progress-bar" style="width: 0%"></div>
                </div>

                <!-- Fatigue Widget (expandido) -->
                <div class="aw-fatigue-strip" id="aw-fatigue-strip">
                    ${FatigueSystem.renderInWorkoutWidget()}
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
        const defaultReps = exercise.repeticoes?.toString().split('-')[0] || '10';
        
        // Sistema de progressão de carga
        const exerciseId = LoadProgression.generateExerciseId(exercise.nome);
        const sugestao = LoadProgression.suggestLoad(exerciseId, defaultReps);
        
        // Determinar carga a usar: sugestão > usuário > template
        let defaultWeight = '';
        let progressBadge = '';
        let progressHint = '';
        
        if (sugestao.carga !== null) {
            defaultWeight = sugestao.carga;
            progressBadge = LoadProgression.renderBadge(sugestao.tipo, sugestao.mensagem);
            if (sugestao.tipo === 'aumentar') {
                progressHint = `<span class="progress-hint up">↑ ${sugestao.mensagem}</span>`;
            } else if (sugestao.tipo === 'reduzir') {
                progressHint = `<span class="progress-hint down">↓ Reduzir carga</span>`;
            } else if (sugestao.cargaAnterior) {
                progressHint = `<span class="progress-hint same">Última: ${sugestao.cargaAnterior}kg</span>`;
            }
        } else {
            defaultWeight = exercise.carga_usuario || exercise.carga_sugerida || '';
            progressBadge = LoadProgression.renderBadge('nova', 'Primeiro treino');
        }
        
        return `
            <div class="aw-exercise-card ${isActive ? 'active' : ''}" id="aw-exercise-${exIdx}">
                <div class="aw-exercise-header" onclick="ActiveWorkout.toggleExercise(${exIdx})">
                    <div class="aw-exercise-number">${exIdx + 1}</div>
                    <div class="aw-exercise-info">
                        <span class="aw-exercise-name">${exercise.nome} ${progressBadge}</span>
                        <span class="aw-exercise-meta">${exercise.series}×${exercise.repeticoes} • ${exercise.descanso}</span>
                        ${progressHint}
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
                    
                    <div class="aw-exercise-actions">
                        <button class="btn-add-set" onclick="ActiveWorkout.addSet(${exIdx})">
                            + Série
                        </button>
                        <button class="btn-view-evolution" onclick="LoadProgression.showEvolutionModal('${exerciseId}', '${exercise.nome.replace(/'/g, "\\'")}')">
                            📊 Evolução
                        </button>
                    </div>
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

        // Limpa RPE se desmarcou
        if (!set.completed) {
            set.rpe = null;
            FatigueSystem.updateDuringWidget();
            return;
        }

        // Prompt RPE para a série
        FatigueSystem.promptRPE({
            exerciseName: this.currentWorkout.exercicios[exIdx]?.nome || 'Série',
            exIdx,
            setIdx,
            defaultValue: set.rpe || 7
        });
        
        // Se completou, iniciar timer de descanso automático
        if (set.completed) {
            const restSec = this.parseRestTime(this.currentWorkout.exercicios[exIdx]?.descanso);
            
            // Usar o RestTimer integrado
            RestTimer.startFromWorkout(restSec);
            
            // Vibração haptica leve
            if (RestTimer.settings.vibrationEnabled && navigator.vibrate) {
                navigator.vibrate(50);
            }
            
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
        FatigueSystem.cancelSession();
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
        
        // Verificar conquistas
        Achievements.checkAfterWorkout(completedSets, totalSets, totalVolume, this.startTime);
        Achievements.checkProgressionAchievements();

        // Salvar fadiga/RPE da sessão
        FatigueSystem.finalizeSession({
            volume: totalVolume,
            duration: minutes,
            workoutName: this.currentWorkout?.nome
        });
        
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
            const exercise = this.currentWorkout.exercicios[exIdx];
            if (!exercise) return;
            
            // Pegar a maior carga e reps usados nas séries completas
            const completedSets = sets.filter(s => s.completed && s.weight > 0);
            if (completedSets.length === 0) return;
            
            const maxWeight = Math.max(...completedSets.map(s => s.weight));
            const avgReps = Math.round(completedSets.reduce((sum, s) => sum + (s.reps || 0), 0) / completedSets.length);
            
            // Salvar no treino local
            if (treino.dias[idx].exercicios[exIdx]) {
                treino.dias[idx].exercicios[exIdx].carga_usuario = maxWeight;
            }
            
            // Salvar no histórico de progressão
            const exerciseId = LoadProgression.generateExerciseId(exercise.nome);
            LoadProgression.saveEntry(exerciseId, {
                carga: maxWeight,
                reps: avgReps,
                series: completedSets.length
            });
        });
        
        localStorage.setItem('treino_atual', JSON.stringify(treino));
    },
    
    showSummary(registro, completedSets, totalSets, volume) {
        const pct = Math.round((completedSets / totalSets) * 100);
        let msg = '✊ Cada treino conta!';
        if (pct === 100) msg = '💪 TREINO PERFEITO!';
        else if (pct >= 80) msg = '🔥 Excelente treino!';
        else if (pct >= 60) msg = '👍 Bom trabalho!';
        
        // Gerar sugestões de progressão para próximo treino
        const progressionSuggestions = this.getProgressionSuggestions();
        
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
                
                ${progressionSuggestions.length > 0 ? `
                <div class="progression-suggestions">
                    <h3>📈 Sugestões para Próximo Treino</h3>
                    <div class="suggestion-list">
                        ${progressionSuggestions.map(s => `
                            <div class="suggestion-item ${s.tipo}">
                                <span class="suggestion-icon">${s.icon}</span>
                                <div class="suggestion-info">
                                    <span class="suggestion-exercise">${s.exercicio}</span>
                                    <span class="suggestion-text">${s.texto}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <button class="btn-primary btn-lg" onclick="document.getElementById('workout-summary').remove(); App.loadDashboard();">
                    Fechar
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    getProgressionSuggestions() {
        const suggestions = [];
        
        if (!this.currentWorkout || !this.setsCompleted) return suggestions;
        
        this.currentWorkout.exercicios.forEach((exercise, exIdx) => {
            const sets = this.setsCompleted[exIdx] || [];
            const completedSets = sets.filter(s => s.completed && s.weight > 0);
            
            if (completedSets.length === 0) return;
            
            const exerciseId = LoadProgression.generateExerciseId(exercise.nome);
            const targetReps = parseInt(exercise.repeticoes?.toString().split('-')[0]) || 10;
            const avgReps = Math.round(completedSets.reduce((sum, s) => sum + (s.reps || 0), 0) / completedSets.length);
            const maxWeight = Math.max(...completedSets.map(s => s.weight));
            
            // Determinar sugestão baseado no desempenho
            if (avgReps >= targetReps + 2) {
                // Fez mais reps que o alvo - sugerir aumento
                const aumento = Math.max(maxWeight * 0.05, 2.5);
                const novaCarga = Math.ceil((maxWeight + aumento) / 2.5) * 2.5;
                suggestions.push({
                    exercicio: exercise.nome,
                    tipo: 'up',
                    icon: '📈',
                    texto: `Aumentar para ${novaCarga}kg (+${(novaCarga - maxWeight).toFixed(1)}kg)`
                });
            } else if (avgReps < targetReps - 2) {
                // Não completou as reps - sugerir manter ou reduzir
                suggestions.push({
                    exercicio: exercise.nome,
                    tipo: 'down',
                    icon: '💪',
                    texto: `Manter ${maxWeight}kg e focar na técnica`
                });
            }
        });
        
        // Limitar a 3 sugestões mais relevantes (priorizar aumentos)
        return suggestions
            .sort((a, b) => (a.tipo === 'up' ? -1 : 1))
            .slice(0, 3);
    },
    
    cleanup() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.restInterval) clearInterval(this.restInterval);
        this.isActive = false;
        this.timerInterval = null;
        this.restInterval = null;
        FatigueSystem.removePrompt();
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
            icon: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="55" width="20" height="35" fill="white" rx="2"/><circle cx="50" cy="35" r="18" fill="white" opacity="0.9"/><circle cx="32" cy="28" r="11" fill="white" opacity="0.7"/><circle cx="68" cy="28" r="11" fill="white" opacity="0.7"/></svg>',
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
            icon: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="15" width="70" height="30" fill="white" rx="3"/><rect x="15" y="55" width="70" height="30" fill="white" rx="3" opacity="0.7"/></svg>',
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
            icon: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="12" width="70" height="22" fill="white" rx="2" opacity="0.95"/><rect x="15" y="39" width="70" height="22" fill="white" rx="2" opacity="0.85"/><rect x="15" y="66" width="70" height="22" fill="white" rx="2" opacity="0.75"/></svg>',
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
            icon: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="15" cy="50" r="10" fill="white"/><rect x="25" y="45" width="50" height="10" fill="white" rx="2"/><circle cx="85" cy="50" r="10" fill="white"/><rect x="10" y="65" width="12" height="10" fill="white" rx="1"/><rect x="78" y="65" width="12" height="10" fill="white" rx="1"/></svg>',
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
            icon: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="30" r="8" fill="none" stroke="white" stroke-width="2.5"/><circle cx="50" cy="30" r="8" fill="none" stroke="white" stroke-width="2.5"/><circle cx="75" cy="30" r="8" fill="none" stroke="white" stroke-width="2.5"/><circle cx="25" cy="70" r="8" fill="none" stroke="white" stroke-width="2.5"/><circle cx="50" cy="70" r="8" fill="none" stroke="white" stroke-width="2.5"/><circle cx="75" cy="70" r="8" fill="none" stroke="white" stroke-width="2.5"/><line x1="32" y1="30" x2="43" y2="30" stroke="white" stroke-width="2"/><line x1="57" y1="30" x2="68" y2="30" stroke="white" stroke-width="2"/><line x1="25" y1="38" x2="25" y2="62" stroke="white" stroke-width="2"/><line x1="75" y1="38" x2="75" y2="62" stroke="white" stroke-width="2"/></svg>',
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
        },
        // === CATEGORIA FEMININA - GLÚTEOS, PERNAS & DEFINIÇÃO ===
        {
            id: 'glute_goddess_4x',
            name: 'Glute Goddess',
            subtitle: 'Iniciante/Intermediário • 4x/semana',
            description: 'O treino perfeito para construir glúteos arredondados e firmes! Foco em ativação glútea, hipthrust progressivo e exercícios unilaterais. Resultados visíveis em 8 semanas.',
            level: 'iniciante',
            days: 4,
            duration: '45-60',
            icon: '🍑',
            category: 'feminino',
            objetivos: ['feminino', 'gluteo', 'definicao'],
            benefits: ['Glúteos definidos', 'Pernas torneadas', 'Empoderamento'],
            featured: true,
            workout: {
                dias: [
                    { nome: 'Dia 1 - Glúteos (Foco Principal)', grupos: 'Glúteos, Posterior', exercicios: [
                        { nome: 'Ativação Glútea (Clam Shell)', series: 3, repeticoes: '15 cada lado', descanso: '30s', nota: 'Aquecimento com elástico' },
                        { nome: 'Hip Thrust com Barra', series: 4, repeticoes: '12-15', descanso: '90s', nota: 'Aperte no topo por 2s!' },
                        { nome: 'Elevação Pélvica Unilateral', series: 3, repeticoes: '12 cada', descanso: '60s' },
                        { nome: 'Stiff Romeno', series: 4, repeticoes: '12', descanso: '60s' },
                        { nome: 'Abdução na Máquina', series: 3, repeticoes: '15-20', descanso: '45s' },
                        { nome: 'Kickback no Cabo', series: 3, repeticoes: '12 cada', descanso: '45s' },
                        { nome: 'Frog Pump', series: 2, repeticoes: '20-30', descanso: '45s', nota: 'Finalizador!' }
                    ]},
                    { nome: 'Dia 2 - Quadríceps & Core', grupos: 'Quadríceps, Abdômen', exercicios: [
                        { nome: 'Agachamento Sumô', series: 4, repeticoes: '12-15', descanso: '90s' },
                        { nome: 'Leg Press (pés juntos)', series: 4, repeticoes: '15', descanso: '60s' },
                        { nome: 'Cadeira Extensora', series: 3, repeticoes: '15', descanso: '45s' },
                        { nome: 'Passada Búlgara', series: 3, repeticoes: '10 cada', descanso: '60s' },
                        { nome: 'Agachamento Goblet', series: 3, repeticoes: '15', descanso: '60s' },
                        { nome: 'Prancha', series: 3, repeticoes: '45s', descanso: '30s' },
                        { nome: 'Crunch Bicicleta', series: 3, repeticoes: '20 cada lado', descanso: '30s' },
                        { nome: 'Elevação de Pernas', series: 3, repeticoes: '15', descanso: '30s' }
                    ]},
                    { nome: 'Dia 3 - Posterior & Panturrilha', grupos: 'Posterior, Panturrilha', exercicios: [
                        { nome: 'Mesa Flexora', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Cadeira Flexora', series: 3, repeticoes: '15', descanso: '45s' },
                        { nome: 'Stiff Unilateral', series: 3, repeticoes: '10 cada', descanso: '60s' },
                        { nome: 'Good Morning', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Hiperextensão', series: 3, repeticoes: '15', descanso: '45s' },
                        { nome: 'Panturrilha em Pé', series: 4, repeticoes: '20', descanso: '30s' },
                        { nome: 'Panturrilha Sentada', series: 3, repeticoes: '20', descanso: '30s' }
                    ]},
                    { nome: 'Dia 4 - Glúteos + Full Lower', grupos: 'Glúteos, Pernas Completo', exercicios: [
                        { nome: 'Hip Thrust na Máquina', series: 4, repeticoes: '15', descanso: '90s' },
                        { nome: 'Agachamento com Elástico', series: 3, repeticoes: '15', descanso: '60s' },
                        { nome: 'Afundo Lateral', series: 3, repeticoes: '12 cada', descanso: '60s' },
                        { nome: 'Step Up', series: 3, repeticoes: '12 cada', descanso: '60s' },
                        { nome: 'Abdução em Pé (Cabo)', series: 3, repeticoes: '15 cada', descanso: '45s' },
                        { nome: 'Sumo Squat Pulse', series: 2, repeticoes: '20', descanso: '45s' },
                        { nome: 'Fire Hydrant', series: 2, repeticoes: '15 cada', descanso: '30s' }
                    ]}
                ]
            }
        },
        {
            id: 'bikini_prep_5x',
            name: 'Bikini Competition Prep',
            subtitle: 'Avançado • 5x/semana',
            description: 'Treino usado por atletas de Bikini Fitness! Foco em proporção, cintura fina e glúteos redondos. Combinação de treino pesado com alto volume e exercícios de definição.',
            level: 'avancado',
            days: 5,
            duration: '60-75',
            icon: '👙',
            category: 'feminino',
            objetivos: ['feminino', 'gluteo', 'definicao'],
            benefits: ['Físico de atleta', 'Proporção perfeita', 'Definição'],
            featured: true,
            workout: {
                dias: [
                    { nome: 'Dia 1 - Glúteos Heavy', grupos: 'Glúteos (Foco Força)', exercicios: [
                        { nome: 'Hip Thrust com Barra', series: 5, repeticoes: '8-10', descanso: '120s', nota: 'Pesado! RPE 9' },
                        { nome: 'Agachamento Profundo', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Stiff Romeno', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Cable Pull Through', series: 3, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Abdução Sentada (Máquina)', series: 4, repeticoes: '15-20', descanso: '45s' },
                        { nome: 'Kickback na Máquina', series: 3, repeticoes: '12 cada', descanso: '45s' }
                    ]},
                    { nome: 'Dia 2 - Superior (Manutenção)', grupos: 'Costas, Ombros, Braços', exercicios: [
                        { nome: 'Puxada Frontal', series: 4, repeticoes: '12', descanso: '60s' },
                        { nome: 'Remada Baixa', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Elevação Lateral', series: 4, repeticoes: '15', descanso: '45s' },
                        { nome: 'Desenvolvimento com Halteres', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Rosca Direta', series: 3, repeticoes: '12', descanso: '45s' },
                        { nome: 'Tríceps Pulley', series: 3, repeticoes: '15', descanso: '45s' }
                    ]},
                    { nome: 'Dia 3 - Quadríceps & Panturrilha', grupos: 'Quadríceps, Panturrilha', exercicios: [
                        { nome: 'Agachamento Hack', series: 4, repeticoes: '12-15', descanso: '90s' },
                        { nome: 'Leg Press (pés baixos)', series: 4, repeticoes: '15', descanso: '60s' },
                        { nome: 'Cadeira Extensora', series: 4, repeticoes: '15-20', descanso: '45s', nota: 'Dropset na última' },
                        { nome: 'Passada Caminhando', series: 3, repeticoes: '20 passos', descanso: '60s' },
                        { nome: 'Sissy Squat', series: 2, repeticoes: '15', descanso: '45s' },
                        { nome: 'Panturrilha em Pé', series: 5, repeticoes: '20', descanso: '30s' },
                        { nome: 'Panturrilha Sentada', series: 4, repeticoes: '20', descanso: '30s' }
                    ]},
                    { nome: 'Dia 4 - Posterior & Glúteos', grupos: 'Posterior, Glúteos', exercicios: [
                        { nome: 'Stiff com Barra', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Mesa Flexora', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Cadeira Flexora Unilateral', series: 3, repeticoes: '12 cada', descanso: '45s' },
                        { nome: 'Hip Thrust Unilateral', series: 3, repeticoes: '12 cada', descanso: '60s' },
                        { nome: 'Glute Bridge com Elástico', series: 3, repeticoes: '20', descanso: '45s' },
                        { nome: 'Hiperextensão (foco glúteo)', series: 3, repeticoes: '15', descanso: '45s' },
                        { nome: 'Abdução no Cabo', series: 3, repeticoes: '15 cada', descanso: '30s' }
                    ]},
                    { nome: 'Dia 5 - Abs & Glúteo Volume', grupos: 'Abdômen, Glúteos (Alto Volume)', exercicios: [
                        { nome: 'Crunch na Máquina', series: 4, repeticoes: '20', descanso: '30s' },
                        { nome: 'Prancha', series: 3, repeticoes: '60s', descanso: '30s' },
                        { nome: 'Russian Twist', series: 3, repeticoes: '20 cada lado', descanso: '30s' },
                        { nome: 'Elevação de Pernas Suspenso', series: 3, repeticoes: '15', descanso: '30s' },
                        { nome: 'Vacuum', series: 5, repeticoes: '30s', descanso: '30s', nota: 'Cintura fina!' },
                        { nome: 'Hip Thrust Leve (Pump)', series: 3, repeticoes: '20-25', descanso: '45s' },
                        { nome: 'Banda Walk', series: 3, repeticoes: '20 passos', descanso: '30s' },
                        { nome: 'Frog Pump', series: 2, repeticoes: '30', descanso: '30s' }
                    ]}
                ]
            }
        },
        {
            id: 'strong_curves_4x',
            name: 'Strong Curves (Bret Contreras)',
            subtitle: 'Iniciante/Intermediário • 4x/semana',
            description: 'O programa científico mais famoso para glúteos! Criado por Bret Contreras, o "Glute Guy". Baseado em anos de pesquisa sobre ativação e crescimento glúteo máximo.',
            level: 'iniciante',
            days: 4,
            duration: '45-60',
            icon: '📐',
            category: 'feminino',
            objetivos: ['feminino', 'gluteo', 'hipertrofia'],
            benefits: ['Científico', 'Progressão estruturada', 'Resultados comprovados'],
            workout: {
                dias: [
                    { nome: 'Dia A - Lower A', grupos: 'Glúteos, Quadríceps', exercicios: [
                        { nome: 'Glute Bridge', series: 3, repeticoes: '20', descanso: '60s', nota: 'Ativação' },
                        { nome: 'Box Squat', series: 3, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Hip Thrust', series: 3, repeticoes: '12-15', descanso: '90s' },
                        { nome: 'Walking Lunge', series: 2, repeticoes: '12 cada', descanso: '60s' },
                        { nome: 'Reverse Hyper', series: 2, repeticoes: '15', descanso: '60s' },
                        { nome: 'Side Lying Clam', series: 2, repeticoes: '15 cada', descanso: '30s' }
                    ]},
                    { nome: 'Dia B - Upper', grupos: 'Costas, Peito, Ombros', exercicios: [
                        { nome: 'Push Up (ou Joelhos)', series: 3, repeticoes: '10-15', descanso: '60s' },
                        { nome: 'Puxada Frontal', series: 3, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Remada com Halteres', series: 3, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Elevação Lateral', series: 2, repeticoes: '12-15', descanso: '45s' },
                        { nome: 'Rosca Direta', series: 2, repeticoes: '12', descanso: '45s' },
                        { nome: 'Tríceps na Máquina', series: 2, repeticoes: '12', descanso: '45s' }
                    ]},
                    { nome: 'Dia C - Lower B', grupos: 'Posterior, Glúteos', exercicios: [
                        { nome: 'Single Leg Glute Bridge', series: 3, repeticoes: '10 cada', descanso: '60s' },
                        { nome: 'Romanian Deadlift', series: 3, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Hip Thrust Banda', series: 3, repeticoes: '15-20', descanso: '60s' },
                        { nome: 'Cable Pull Through', series: 3, repeticoes: '15', descanso: '60s' },
                        { nome: 'Back Extension', series: 2, repeticoes: '15', descanso: '45s' },
                        { nome: 'Lateral Band Walk', series: 2, repeticoes: '20 passos', descanso: '30s' }
                    ]},
                    { nome: 'Dia D - Full Body', grupos: 'Corpo Completo', exercicios: [
                        { nome: 'Hip Thrust', series: 3, repeticoes: '15', descanso: '90s' },
                        { nome: 'Goblet Squat', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Deadlift', series: 3, repeticoes: '10', descanso: '90s' },
                        { nome: 'Push Up', series: 2, repeticoes: 'max', descanso: '60s' },
                        { nome: 'Inverted Row', series: 2, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Plank', series: 2, repeticoes: '45s', descanso: '30s' }
                    ]}
                ]
            }
        },
        {
            id: 'booty_burn_3x',
            name: 'Booty Burn Express',
            subtitle: 'Iniciante • 3x/semana',
            description: 'Treinos curtos e intensos focados 100% em glúteos! Perfeito para quem tem pouco tempo mas quer resultados. Cada sessão menos de 40 minutos.',
            level: 'iniciante',
            days: 3,
            duration: '30-40',
            icon: '🔥',
            category: 'feminino',
            objetivos: ['feminino', 'gluteo', 'emagrecimento'],
            benefits: ['Treino rápido', 'Alta intensidade', 'Queima localizada'],
            workout: {
                dias: [
                    { nome: 'Dia 1 - Pump & Burn', grupos: 'Glúteos (Alto Volume)', exercicios: [
                        { nome: 'Banda Walk Aquecimento', series: 2, repeticoes: '20 passos', descanso: '30s' },
                        { nome: 'Hip Thrust', series: 4, repeticoes: '15-20', descanso: '60s' },
                        { nome: 'Sumo Squat', series: 3, repeticoes: '15', descanso: '60s' },
                        { nome: 'Kickback', series: 3, repeticoes: '15 cada', descanso: '45s' },
                        { nome: 'Fire Hydrant', series: 2, repeticoes: '20 cada', descanso: '30s' },
                        { nome: 'Glute Bridge Burnout', series: 1, repeticoes: '50', descanso: 'N/A', nota: 'Finalizador!' }
                    ]},
                    { nome: 'Dia 2 - Força & Crescimento', grupos: 'Glúteos (Foco Força)', exercicios: [
                        { nome: 'Clam Shell c/ Elástico', series: 2, repeticoes: '15 cada', descanso: '30s' },
                        { nome: 'Hip Thrust Pesado', series: 4, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Romanian Deadlift', series: 3, repeticoes: '10', descanso: '90s' },
                        { nome: 'Step Up Alto', series: 3, repeticoes: '10 cada', descanso: '60s' },
                        { nome: 'Cable Kickback', series: 3, repeticoes: '12 cada', descanso: '45s' }
                    ]},
                    { nome: 'Dia 3 - Unilateral & Definição', grupos: 'Glúteos (Unilateral)', exercicios: [
                        { nome: 'Single Leg Hip Thrust', series: 3, repeticoes: '12 cada', descanso: '60s' },
                        { nome: 'Bulgarian Split Squat', series: 3, repeticoes: '10 cada', descanso: '60s' },
                        { nome: 'Single Leg Deadlift', series: 3, repeticoes: '10 cada', descanso: '60s' },
                        { nome: 'Curtsy Lunge', series: 2, repeticoes: '12 cada', descanso: '45s' },
                        { nome: 'Frog Pump Final', series: 2, repeticoes: '30', descanso: '30s' }
                    ]}
                ]
            }
        },
        {
            id: 'legs_core_sculpt_4x',
            name: 'Legs & Core Sculptor',
            subtitle: 'Intermediário • 4x/semana',
            description: 'Treino completo de pernas com ênfase em abdômen! Construa pernas definidas e um core forte. Perfeito para quem quer equilíbrio entre força e estética.',
            level: 'intermediario',
            days: 4,
            duration: '50-60',
            icon: '💎',
            category: 'feminino',
            objetivos: ['feminino', 'quadriceps', 'core'],
            benefits: ['Pernas esculpidas', 'Core forte', 'Definição'],
            workout: {
                dias: [
                    { nome: 'Dia 1 - Quadríceps Focus', grupos: 'Quadríceps, Core', exercicios: [
                        { nome: 'Agachamento Livre', series: 4, repeticoes: '12', descanso: '90s' },
                        { nome: 'Leg Press', series: 4, repeticoes: '15', descanso: '60s' },
                        { nome: 'Cadeira Extensora', series: 3, repeticoes: '15-20', descanso: '45s' },
                        { nome: 'Passada Frontal', series: 3, repeticoes: '12 cada', descanso: '60s' },
                        { nome: 'Agachamento Sissy', series: 2, repeticoes: '15', descanso: '45s' },
                        { nome: 'Prancha', series: 3, repeticoes: '60s', descanso: '30s' },
                        { nome: 'Dead Bug', series: 3, repeticoes: '10 cada', descanso: '30s' }
                    ]},
                    { nome: 'Dia 2 - Glúteos & Abs', grupos: 'Glúteos, Abdômen', exercicios: [
                        { nome: 'Hip Thrust', series: 4, repeticoes: '12-15', descanso: '90s' },
                        { nome: 'Sumo Squat', series: 3, repeticoes: '15', descanso: '60s' },
                        { nome: 'Abdução Máquina', series: 3, repeticoes: '20', descanso: '45s' },
                        { nome: 'Kickback', series: 3, repeticoes: '12 cada', descanso: '45s' },
                        { nome: 'Crunch na Máquina', series: 4, repeticoes: '20', descanso: '30s' },
                        { nome: 'Russian Twist', series: 3, repeticoes: '20 cada', descanso: '30s' },
                        { nome: 'Leg Raise', series: 3, repeticoes: '15', descanso: '30s' }
                    ]},
                    { nome: 'Dia 3 - Posterior & Panturrilha', grupos: 'Posterior, Panturrilha', exercicios: [
                        { nome: 'Stiff', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Mesa Flexora', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Cadeira Flexora', series: 3, repeticoes: '15', descanso: '45s' },
                        { nome: 'Good Morning', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Panturrilha em Pé', series: 5, repeticoes: '20', descanso: '30s' },
                        { nome: 'Panturrilha Sentada', series: 4, repeticoes: '20', descanso: '30s' },
                        { nome: 'Panturrilha Unilateral', series: 2, repeticoes: '15 cada', descanso: '30s' }
                    ]},
                    { nome: 'Dia 4 - Full Legs + Core Intenso', grupos: 'Pernas Completo, Core', exercicios: [
                        { nome: 'Agachamento Sumô', series: 3, repeticoes: '15', descanso: '60s' },
                        { nome: 'Walking Lunge', series: 3, repeticoes: '20 passos', descanso: '60s' },
                        { nome: 'Hip Thrust Banda', series: 3, repeticoes: '20', descanso: '60s' },
                        { nome: 'Step Up', series: 2, repeticoes: '12 cada', descanso: '45s' },
                        { nome: 'Ab Wheel Rollout', series: 3, repeticoes: '10-12', descanso: '45s' },
                        { nome: 'Mountain Climber', series: 3, repeticoes: '30s', descanso: '30s' },
                        { nome: 'Vacuum', series: 5, repeticoes: '30s', descanso: '15s' }
                    ]}
                ]
            }
        },
        {
            id: 'stephanie_sanzo_lower',
            name: 'Stephanie Sanzo Lower Body',
            subtitle: 'Avançado • 4x/semana',
            description: 'Inspirado no treino da atleta Stephanie Sanzo! Combinação de powerlifting feminino com estética. Força + Volume para pernas e glúteos impressionantes.',
            level: 'avancado',
            days: 4,
            duration: '60-75',
            icon: '🦁',
            category: 'feminino',
            objetivos: ['feminino', 'gluteo', 'forca'],
            benefits: ['Força feminina', 'Estética', 'Powerbuilding'],
            workout: {
                dias: [
                    { nome: 'Dia 1 - Glúteos Força', grupos: 'Glúteos (Força Máxima)', exercicios: [
                        { nome: 'Hip Thrust com Barra', series: 5, repeticoes: '5-8', descanso: '180s', nota: 'Força! RPE 9' },
                        { nome: 'Sumo Deadlift', series: 4, repeticoes: '6-8', descanso: '120s' },
                        { nome: 'Bulgarian Split Squat', series: 4, repeticoes: '8-10 cada', descanso: '90s' },
                        { nome: 'Cable Pull Through', series: 3, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Abdução Sentada', series: 3, repeticoes: '20', descanso: '45s' }
                    ]},
                    { nome: 'Dia 2 - Quadríceps Força', grupos: 'Quadríceps (Força)', exercicios: [
                        { nome: 'Back Squat', series: 5, repeticoes: '5-8', descanso: '180s', nota: 'Força! RPE 9' },
                        { nome: 'Front Squat', series: 3, repeticoes: '8-10', descanso: '120s' },
                        { nome: 'Leg Press Unilateral', series: 3, repeticoes: '10 cada', descanso: '60s' },
                        { nome: 'Hack Squat', series: 3, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Cadeira Extensora', series: 3, repeticoes: '15-20', descanso: '45s' }
                    ]},
                    { nome: 'Dia 3 - Glúteos Volume', grupos: 'Glúteos (Alto Volume)', exercicios: [
                        { nome: 'Hip Thrust', series: 4, repeticoes: '12-15', descanso: '90s' },
                        { nome: 'Romanian Deadlift', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Walking Lunge', series: 3, repeticoes: '24 passos', descanso: '60s' },
                        { nome: 'Kickback Máquina', series: 4, repeticoes: '12-15 cada', descanso: '45s' },
                        { nome: 'Frog Pump c/ Banda', series: 3, repeticoes: '25-30', descanso: '45s' },
                        { nome: 'Side Lying Hip Abduction', series: 3, repeticoes: '20 cada', descanso: '30s' }
                    ]},
                    { nome: 'Dia 4 - Posterior & Panturrilha', grupos: 'Posterior, Panturrilha', exercicios: [
                        { nome: 'Deficit Romanian Deadlift', series: 4, repeticoes: '10', descanso: '90s' },
                        { nome: 'Nordic Hamstring Curl', series: 3, repeticoes: '6-8', descanso: '90s' },
                        { nome: 'Lying Leg Curl', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Seated Leg Curl', series: 3, repeticoes: '15', descanso: '45s' },
                        { nome: 'Standing Calf Raise', series: 5, repeticoes: '15-20', descanso: '30s' },
                        { nome: 'Seated Calf Raise', series: 4, repeticoes: '20-25', descanso: '30s' }
                    ]}
                ]
            }
        },
        {
            id: 'peach_program_5x',
            name: 'Peach Program 🍑',
            subtitle: 'Intermediário • 5x/semana',
            description: 'Programa de 12 semanas para glúteos perfeitos! Periodização específica: 4 semanas força, 4 semanas hipertrofia, 4 semanas metabólico. O mais completo!',
            level: 'intermediario',
            days: 5,
            duration: '50-65',
            icon: '🍑',
            category: 'feminino',
            objetivos: ['feminino', 'gluteo', 'hipertrofia'],
            benefits: ['Periodizado', '12 semanas', 'Progressão científica'],
            featured: true,
            workout: {
                dias: [
                    { nome: 'Dia 1 - Glúteos A (Força)', grupos: 'Glúteos (Força)', exercicios: [
                        { nome: 'Barbell Hip Thrust', series: 5, repeticoes: '6-8', descanso: '120s', nota: 'Progressão de carga semanal' },
                        { nome: 'Sumo Squat', series: 4, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Romanian Deadlift', series: 4, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Bulgarian Split Squat', series: 3, repeticoes: '10 cada', descanso: '60s' },
                        { nome: 'Cable Kickback', series: 3, repeticoes: '12 cada', descanso: '45s' }
                    ]},
                    { nome: 'Dia 2 - Quadríceps', grupos: 'Quadríceps, Panturrilha', exercicios: [
                        { nome: 'Leg Press', series: 4, repeticoes: '12-15', descanso: '90s' },
                        { nome: 'Hack Squat', series: 4, repeticoes: '12', descanso: '60s' },
                        { nome: 'Leg Extension', series: 4, repeticoes: '15-20', descanso: '45s' },
                        { nome: 'Walking Lunge', series: 3, repeticoes: '20 passos', descanso: '60s' },
                        { nome: 'Calf Raise em Pé', series: 4, repeticoes: '20', descanso: '30s' },
                        { nome: 'Calf Raise Sentada', series: 3, repeticoes: '20', descanso: '30s' }
                    ]},
                    { nome: 'Dia 3 - Glúteos B (Volume)', grupos: 'Glúteos (Hipertrofia)', exercicios: [
                        { nome: 'Hip Thrust', series: 4, repeticoes: '12-15', descanso: '90s' },
                        { nome: 'Frog Pump', series: 3, repeticoes: '30', descanso: '45s' },
                        { nome: 'Sumo Squat Pulse', series: 3, repeticoes: '20', descanso: '45s' },
                        { nome: 'Step Up', series: 3, repeticoes: '12 cada', descanso: '60s' },
                        { nome: 'Cable Pull Through', series: 3, repeticoes: '15', descanso: '60s' },
                        { nome: 'Banded Side Walk', series: 3, repeticoes: '20 passos', descanso: '45s' },
                        { nome: 'Fire Hydrant', series: 2, repeticoes: '20 cada', descanso: '30s' }
                    ]},
                    { nome: 'Dia 4 - Posterior', grupos: 'Posterior de Coxa', exercicios: [
                        { nome: 'Stiff', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Lying Leg Curl', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Seated Leg Curl', series: 3, repeticoes: '15', descanso: '45s' },
                        { nome: 'Single Leg RDL', series: 3, repeticoes: '10 cada', descanso: '60s' },
                        { nome: 'Back Extension (glute focus)', series: 3, repeticoes: '15', descanso: '45s' }
                    ]},
                    { nome: 'Dia 5 - Glúteos C (Metabólico)', grupos: 'Glúteos (Pump)', exercicios: [
                        { nome: 'Banded Hip Thrust', series: 4, repeticoes: '20-25', descanso: '60s', nota: 'Alto volume, baixo descanso' },
                        { nome: 'Glute Bridge March', series: 3, repeticoes: '30 total', descanso: '45s' },
                        { nome: 'Curtsy Lunge', series: 3, repeticoes: '15 cada', descanso: '45s' },
                        { nome: 'Sumo Squat Hold', series: 3, repeticoes: '45s', descanso: '30s' },
                        { nome: 'Clamshell', series: 3, repeticoes: '20 cada', descanso: '30s' },
                        { nome: 'Hip Circle Walk', series: 2, repeticoes: '30 passos', descanso: '30s' },
                        { nome: 'Glute Bridge Burnout', series: 1, repeticoes: '100', descanso: 'N/A', nota: '100 reps finais!' }
                    ]}
                ]
            }
        },
        {
            id: 'hourglass_figure_4x',
            name: 'Hourglass Figure',
            subtitle: 'Intermediário • 4x/semana',
            description: 'Treino para criar a silhueta ampulheta! Ênfase em glúteos + ombros, mantendo cintura fina. O segredo: vacuum diário + treino estratégico.',
            level: 'intermediario',
            days: 4,
            duration: '55-65',
            icon: '⏳',
            category: 'feminino',
            objetivos: ['feminino', 'definicao', 'gluteo'],
            benefits: ['Silhueta perfeita', 'Cintura fina', 'Proporção'],
            workout: {
                dias: [
                    { nome: 'Dia 1 - Glúteos & Posterior', grupos: 'Glúteos, Posterior', exercicios: [
                        { nome: 'Hip Thrust', series: 4, repeticoes: '12-15', descanso: '90s' },
                        { nome: 'Romanian Deadlift', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Sumo Squat', series: 3, repeticoes: '15', descanso: '60s' },
                        { nome: 'Lying Leg Curl', series: 3, repeticoes: '12-15', descanso: '45s' },
                        { nome: 'Cable Kickback', series: 3, repeticoes: '12 cada', descanso: '45s' },
                        { nome: 'Vacuum', series: 5, repeticoes: '30s', descanso: '15s', nota: 'Cintura!' }
                    ]},
                    { nome: 'Dia 2 - Ombros & Costas (V-Taper)', grupos: 'Ombros, Costas', exercicios: [
                        { nome: 'Elevação Lateral', series: 5, repeticoes: '15-20', descanso: '45s', nota: 'Ombros largos!' },
                        { nome: 'Desenvolvimento com Halteres', series: 4, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Puxada Frontal Aberta', series: 4, repeticoes: '12', descanso: '60s' },
                        { nome: 'Remada Baixa', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Face Pull', series: 3, repeticoes: '15', descanso: '45s' },
                        { nome: 'Vacuum', series: 3, repeticoes: '30s', descanso: '15s' }
                    ]},
                    { nome: 'Dia 3 - Quadríceps & Core', grupos: 'Quadríceps, Abdômen', exercicios: [
                        { nome: 'Leg Press', series: 4, repeticoes: '12-15', descanso: '90s' },
                        { nome: 'Hack Squat', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Leg Extension', series: 3, repeticoes: '15-20', descanso: '45s' },
                        { nome: 'Walking Lunge', series: 3, repeticoes: '20 passos', descanso: '60s' },
                        { nome: 'Prancha', series: 3, repeticoes: '60s', descanso: '30s' },
                        { nome: 'Dead Bug', series: 3, repeticoes: '10 cada', descanso: '30s' },
                        { nome: 'Vacuum', series: 5, repeticoes: '45s', descanso: '15s' }
                    ]},
                    { nome: 'Dia 4 - Full Glute + Ombros', grupos: 'Glúteos, Ombros (Pump)', exercicios: [
                        { nome: 'Hip Thrust Banda', series: 3, repeticoes: '20', descanso: '60s' },
                        { nome: 'Frog Pump', series: 3, repeticoes: '25', descanso: '45s' },
                        { nome: 'Fire Hydrant', series: 2, repeticoes: '20 cada', descanso: '30s' },
                        { nome: 'Elevação Lateral', series: 4, repeticoes: '20', descanso: '45s' },
                        { nome: 'Elevação Frontal', series: 3, repeticoes: '12', descanso: '45s' },
                        { nome: 'Rear Delt Fly', series: 3, repeticoes: '15', descanso: '45s' },
                        { nome: 'Vacuum Final', series: 5, repeticoes: '60s', descanso: '15s' }
                    ]}
                ]
            }
        },
        {
            id: 'abs_blast_3x',
            name: 'Abs Blast 6-Pack',
            subtitle: 'Intermediário • 3x/semana',
            description: 'Treino intensivo de abdômen! Foco em definição, cintura fina e core forte. Combina exercícios de resistência com vacuum para resultados rápidos.',
            level: 'intermediario',
            days: 3,
            duration: '25-35',
            icon: '🎯',
            category: 'feminino',
            objetivos: ['feminino', 'core', 'definicao'],
            benefits: ['Abdômen definido', 'Core forte', 'Cintura fina'],
            workout: {
                dias: [
                    { nome: 'Dia 1 - Abs Superior & Oblíquos', grupos: 'Reto Abdominal, Oblíquos', exercicios: [
                        { nome: 'Crunch na Máquina', series: 4, repeticoes: '15-20', descanso: '30s' },
                        { nome: 'Cable Crunch', series: 3, repeticoes: '15-20', descanso: '30s' },
                        { nome: 'Russian Twist c/ Peso', series: 3, repeticoes: '20 cada lado', descanso: '30s' },
                        { nome: 'Side Plank', series: 3, repeticoes: '30s cada', descanso: '30s' },
                        { nome: 'Bicycle Crunch', series: 3, repeticoes: '20 cada', descanso: '30s' },
                        { nome: 'Vacuum', series: 5, repeticoes: '30s', descanso: '15s' }
                    ]},
                    { nome: 'Dia 2 - Abs Inferior & TVA', grupos: 'Abs Inferior, Transverso', exercicios: [
                        { nome: 'Leg Raise Suspenso', series: 4, repeticoes: '12-15', descanso: '45s' },
                        { nome: 'Reverse Crunch', series: 3, repeticoes: '15-20', descanso: '30s' },
                        { nome: 'Lying Leg Raise', series: 3, repeticoes: '15', descanso: '30s' },
                        { nome: 'Dead Bug', series: 3, repeticoes: '10 cada', descanso: '30s' },
                        { nome: 'Hollow Body Hold', series: 3, repeticoes: '30s', descanso: '30s' },
                        { nome: 'Vacuum Intenso', series: 5, repeticoes: '45s', descanso: '15s' }
                    ]},
                    { nome: 'Dia 3 - Full Core & Estabilidade', grupos: 'Core Completo', exercicios: [
                        { nome: 'Prancha', series: 3, repeticoes: '60s', descanso: '30s' },
                        { nome: 'Prancha Lateral', series: 2, repeticoes: '45s cada', descanso: '30s' },
                        { nome: 'Ab Wheel Rollout', series: 3, repeticoes: '10-12', descanso: '45s' },
                        { nome: 'Mountain Climber', series: 3, repeticoes: '30s', descanso: '30s' },
                        { nome: 'Pallof Press', series: 3, repeticoes: '12 cada lado', descanso: '30s' },
                        { nome: 'Bird Dog', series: 3, repeticoes: '10 cada', descanso: '30s' },
                        { nome: 'Vacuum Máximo', series: 5, repeticoes: '60s', descanso: '15s' }
                    ]}
                ]
            }
        },
        {
            id: 'krissy_cela_legs',
            name: 'Krissy Cela Tone & Sculpt',
            subtitle: 'Iniciante/Intermediário • 4x/semana',
            description: 'Inspirado no método da influencer fitness Krissy Cela! Treino equilibrado focado em tonificar e esculpir o corpo feminino. Perfeito para iniciantes.',
            level: 'iniciante',
            days: 4,
            duration: '45-55',
            icon: '✨',
            category: 'feminino',
            objetivos: ['feminino', 'definicao', 'gluteo'],
            benefits: ['Tonificação', 'Para iniciantes', 'Esculpir'],
            workout: {
                dias: [
                    { nome: 'Dia 1 - Lower Body A', grupos: 'Glúteos, Quadríceps', exercicios: [
                        { nome: 'Goblet Squat', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Hip Thrust', series: 4, repeticoes: '15', descanso: '60s' },
                        { nome: 'Leg Press', series: 3, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Walking Lunge', series: 3, repeticoes: '12 cada', descanso: '60s' },
                        { nome: 'Leg Extension', series: 3, repeticoes: '15', descanso: '45s' },
                        { nome: 'Glute Bridge', series: 3, repeticoes: '20', descanso: '45s' }
                    ]},
                    { nome: 'Dia 2 - Upper Body', grupos: 'Costas, Ombros, Braços', exercicios: [
                        { nome: 'Lat Pulldown', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Seated Row', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Shoulder Press', series: 3, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Lateral Raise', series: 3, repeticoes: '15', descanso: '45s' },
                        { nome: 'Bicep Curl', series: 3, repeticoes: '12', descanso: '45s' },
                        { nome: 'Tricep Pushdown', series: 3, repeticoes: '12', descanso: '45s' }
                    ]},
                    { nome: 'Dia 3 - Lower Body B', grupos: 'Posterior, Glúteos', exercicios: [
                        { nome: 'Romanian Deadlift', series: 4, repeticoes: '12', descanso: '60s' },
                        { nome: 'Single Leg Hip Thrust', series: 3, repeticoes: '10 cada', descanso: '60s' },
                        { nome: 'Lying Leg Curl', series: 3, repeticoes: '12-15', descanso: '45s' },
                        { nome: 'Bulgarian Split Squat', series: 3, repeticoes: '10 cada', descanso: '60s' },
                        { nome: 'Cable Kickback', series: 3, repeticoes: '12 cada', descanso: '45s' },
                        { nome: 'Calf Raise', series: 3, repeticoes: '20', descanso: '30s' }
                    ]},
                    { nome: 'Dia 4 - Full Body & Core', grupos: 'Corpo Completo', exercicios: [
                        { nome: 'Sumo Squat', series: 3, repeticoes: '15', descanso: '60s' },
                        { nome: 'Push Up (ou Joelhos)', series: 3, repeticoes: '10-15', descanso: '60s' },
                        { nome: 'Step Up', series: 3, repeticoes: '10 cada', descanso: '60s' },
                        { nome: 'Face Pull', series: 3, repeticoes: '15', descanso: '45s' },
                        { nome: 'Plank', series: 3, repeticoes: '45s', descanso: '30s' },
                        { nome: 'Dead Bug', series: 3, repeticoes: '10 cada', descanso: '30s' },
                        { nome: 'Glute Bridge March', series: 2, repeticoes: '20', descanso: '30s' }
                    ]}
                ]
            }
        },
        {
            id: 'brazilian_booty_4x',
            name: 'Brazilian Booty',
            subtitle: 'Intermediário • 4x/semana',
            description: 'O segredo das brasileiras! Treino inspirado nas técnicas usadas no Brasil para construir glúteos redondos e empinados. Alto volume + técnicas especiais.',
            level: 'intermediario',
            days: 4,
            duration: '50-60',
            icon: '🇧🇷',
            category: 'feminino',
            objetivos: ['feminino', 'gluteo', 'hipertrofia'],
            benefits: ['Estilo brasileiro', 'Glúteos empinados', 'Alto volume'],
            workout: {
                dias: [
                    { nome: 'Dia 1 - Glúteos Heavy', grupos: 'Glúteos (Força)', exercicios: [
                        { nome: 'Agachamento Sumô', series: 4, repeticoes: '12', descanso: '90s', nota: 'Bem fundo!' },
                        { nome: 'Hip Thrust', series: 5, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Stiff', series: 4, repeticoes: '10', descanso: '90s' },
                        { nome: 'Passada Búlgara', series: 3, repeticoes: '10 cada', descanso: '60s' },
                        { nome: 'Abdução Máquina', series: 4, repeticoes: '20', descanso: '45s' }
                    ]},
                    { nome: 'Dia 2 - Quadríceps', grupos: 'Quadríceps, Panturrilha', exercicios: [
                        { nome: 'Leg Press', series: 4, repeticoes: '15', descanso: '90s' },
                        { nome: 'Hack Squat', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Cadeira Extensora', series: 4, repeticoes: '15-20', descanso: '45s' },
                        { nome: 'Passada Caminhando', series: 3, repeticoes: '20 passos', descanso: '60s' },
                        { nome: 'Panturrilha em Pé', series: 5, repeticoes: '25', descanso: '30s' },
                        { nome: 'Panturrilha Sentada', series: 4, repeticoes: '25', descanso: '30s' }
                    ]},
                    { nome: 'Dia 3 - Glúteos Pump', grupos: 'Glúteos (Volume)', exercicios: [
                        { nome: 'Hip Thrust c/ Banda', series: 4, repeticoes: '20', descanso: '60s' },
                        { nome: 'Frog Pump', series: 4, repeticoes: '30', descanso: '45s' },
                        { nome: 'Kickback no Cabo', series: 4, repeticoes: '15 cada', descanso: '45s' },
                        { nome: 'Abdução em Pé (Cabo)', series: 3, repeticoes: '15 cada', descanso: '45s' },
                        { nome: 'Step Up', series: 3, repeticoes: '12 cada', descanso: '45s' },
                        { nome: 'Fire Hydrant c/ Banda', series: 3, repeticoes: '20 cada', descanso: '30s' },
                        { nome: 'Glute Bridge Hold', series: 3, repeticoes: '45s', descanso: '30s', nota: 'Segure no topo!' }
                    ]},
                    { nome: 'Dia 4 - Posterior & Finalização', grupos: 'Posterior, Glúteos', exercicios: [
                        { nome: 'Stiff Romeno', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Mesa Flexora', series: 4, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Cadeira Flexora', series: 3, repeticoes: '15', descanso: '45s' },
                        { nome: 'Good Morning', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Hip Thrust Final', series: 3, repeticoes: '15-20', descanso: '60s' },
                        { nome: 'Sumo Squat Pulse', series: 2, repeticoes: '30', descanso: '45s' },
                        { nome: 'Banda Walk Final', series: 2, repeticoes: '30 passos', descanso: '30s' }
                    ]}
                ]
            }
        },
        {
            id: 'calf_specialization',
            name: 'Panturrilhas de Aço',
            subtitle: 'Todos Níveis • 3x/semana',
            description: 'Especialização em panturrilhas! O grupo mais teimoso finalmente vai crescer. Treino baseado em ciência: frequência alta + variedade de estímulos.',
            level: 'intermediario',
            days: 3,
            duration: '20-30',
            icon: '🦵',
            category: 'feminino',
            objetivos: ['feminino', 'panturrilha', 'hipertrofia'],
            benefits: ['Panturrilhas definidas', 'Alta frequência', 'Especializado'],
            workout: {
                dias: [
                    { nome: 'Dia 1 - Força & Carga', grupos: 'Panturrilha (Força)', exercicios: [
                        { nome: 'Panturrilha em Pé (Pesado)', series: 5, repeticoes: '8-10', descanso: '90s', nota: 'Carga máxima!' },
                        { nome: 'Leg Press (panturrilha)', series: 4, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Panturrilha Unilateral', series: 3, repeticoes: '10 cada', descanso: '60s' },
                        { nome: 'Panturrilha Sentada', series: 3, repeticoes: '12-15', descanso: '45s' }
                    ]},
                    { nome: 'Dia 2 - Volume & Pump', grupos: 'Panturrilha (Volume)', exercicios: [
                        { nome: 'Panturrilha em Pé', series: 4, repeticoes: '20', descanso: '45s' },
                        { nome: 'Panturrilha Sentada', series: 4, repeticoes: '20', descanso: '45s' },
                        { nome: 'Panturrilha no Leg Press', series: 3, repeticoes: '25', descanso: '45s' },
                        { nome: 'Panturrilha em Pé (leve)', series: 2, repeticoes: '30-40', descanso: '30s' },
                        { nome: 'Farmer Walk na Ponta dos Pés', series: 2, repeticoes: '30s', descanso: '30s' }
                    ]},
                    { nome: 'Dia 3 - Técnicas Especiais', grupos: 'Panturrilha (Intensidade)', exercicios: [
                        { nome: 'Panturrilha em Pé (Pausa)', series: 4, repeticoes: '12', descanso: '60s', nota: '2s no topo e embaixo' },
                        { nome: 'Panturrilha Sentada (Drop)', series: 3, repeticoes: '12+12+12', descanso: '90s', nota: 'Dropset triplo!' },
                        { nome: 'Salto na Ponta dos Pés', series: 3, repeticoes: '20', descanso: '45s' },
                        { nome: 'Panturrilha Tibial (Inversa)', series: 3, repeticoes: '20', descanso: '45s' },
                        { nome: 'Panturrilha Burnout', series: 1, repeticoes: '100', descanso: 'N/A', nota: '100 reps finais!' }
                    ]}
                ]
            }
        },

        // ================================================
        // === CATEGORIA CABULOSO - TREINOS HARDCORE ===
        // ================================================
        {
            id: 'cabuloso_20_rep_squats',
            name: '20 Rep Squats (Super Squats)',
            subtitle: 'Avançado • 3x/semana',
            description: 'O programa mais brutal da história! Uma série de 20 repetições de agachamento com a carga de 10RM. Método usado por Tom Platz para construir as maiores pernas do fisiculturismo. Não é para fracos!',
            level: 'avancado',
            days: 3,
            duration: '45-60',
            icon: '🦵',
            category: 'cabuloso',
            objetivos: ['cabuloso', 'forca', 'hipertrofia'],
            benefits: ['Pernas monstruosas', 'Força mental', 'Crescimento extremo'],
            featured: true,
            workout: {
                dias: [
                    { nome: 'Dia A - Super Squats', grupos: 'Pernas, Corpo Todo', exercicios: [
                        { nome: 'Agachamento Livre 20 REPS', series: 1, repeticoes: '20', descanso: '5min', nota: 'CARGA DO SEU 10RM! Respira entre reps!' },
                        { nome: 'Pullover Deitado', series: 1, repeticoes: '20', descanso: '2min', nota: 'Expande a caixa torácica' },
                        { nome: 'Supino Reto', series: 3, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Remada Curvada', series: 3, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Desenvolvimento Militar', series: 2, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Rosca Direta', series: 2, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Tríceps Testa', series: 2, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Panturrilha em Pé', series: 2, repeticoes: '20', descanso: '60s' }
                    ]},
                    { nome: 'Dia B - Super Squats', grupos: 'Pernas, Corpo Todo', exercicios: [
                        { nome: 'Agachamento Livre 20 REPS', series: 1, repeticoes: '20', descanso: '5min', nota: '+2.5kg que o último treino!' },
                        { nome: 'Pullover Deitado', series: 1, repeticoes: '20', descanso: '2min' },
                        { nome: 'Supino Inclinado', series: 3, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Barra Fixa', series: 3, repeticoes: 'Máximo', descanso: '90s' },
                        { nome: 'Elevação Lateral', series: 2, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Rosca Martelo', series: 2, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Tríceps Corda', series: 2, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Panturrilha Sentada', series: 2, repeticoes: '20', descanso: '60s' }
                    ]},
                    { nome: 'Dia C - Super Squats', grupos: 'Pernas, Corpo Todo', exercicios: [
                        { nome: 'Agachamento Livre 20 REPS', series: 1, repeticoes: '20', descanso: '5min', nota: 'Adicione peso TODA semana!' },
                        { nome: 'Pullover Deitado', series: 1, repeticoes: '20', descanso: '2min' },
                        { nome: 'Supino Reto', series: 3, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Remada Cavalinho', series: 3, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Desenvolvimento Arnold', series: 2, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Rosca Concentrada', series: 2, repeticoes: '10 cada', descanso: '45s' },
                        { nome: 'Tríceps Francês', series: 2, repeticoes: '12', descanso: '60s' },
                        { nome: 'Panturrilha Donkey', series: 2, repeticoes: '25', descanso: '60s' }
                    ]}
                ]
            }
        },
        {
            id: 'cabuloso_german_volume',
            name: 'German Volume Training 10x10',
            subtitle: 'Avançado • 4x/semana',
            description: 'O infame 10x10! Método alemão de volume brutal: 10 séries de 10 repetições com 60% do 1RM. Desenvolvido para atletas de levantamento de peso olímpico. Crescimento garantido!',
            level: 'avancado',
            days: 4,
            duration: '60-75',
            icon: '🇩🇪',
            category: 'cabuloso',
            objetivos: ['cabuloso', 'hipertrofia'],
            benefits: ['Volume insano', 'Pump extremo', 'Hipertrofia máxima'],
            workout: {
                dias: [
                    { nome: 'Dia 1 - Peito & Costas', grupos: 'Peito, Costas', exercicios: [
                        { nome: 'Supino Reto c/ Barra', series: 10, repeticoes: '10', descanso: '90s', nota: '60% do 1RM - SEM FALHA!' },
                        { nome: 'Remada Curvada', series: 10, repeticoes: '10', descanso: '90s', nota: '60% do 1RM - controle total' },
                        { nome: 'Crucifixo Inclinado', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Pulldown Pegada Fechada', series: 3, repeticoes: '12', descanso: '60s' }
                    ]},
                    { nome: 'Dia 2 - Pernas & Abdômen', grupos: 'Pernas, Core', exercicios: [
                        { nome: 'Agachamento Livre', series: 10, repeticoes: '10', descanso: '90s', nota: '60% do 1RM - RESPIRAÇÃO!' },
                        { nome: 'Leg Curl Deitado', series: 10, repeticoes: '10', descanso: '90s', nota: 'Controle negativa' },
                        { nome: 'Panturrilha em Pé', series: 3, repeticoes: '15-20', descanso: '60s' },
                        { nome: 'Abdominal Crunch', series: 3, repeticoes: '20', descanso: '45s' }
                    ]},
                    { nome: 'Dia 3 - Ombros & Braços', grupos: 'Ombros, Braços', exercicios: [
                        { nome: 'Desenvolvimento Militar', series: 10, repeticoes: '10', descanso: '90s', nota: '60% do 1RM' },
                        { nome: 'Paralelas (lastro ou livre)', series: 10, repeticoes: '10', descanso: '90s' },
                        { nome: 'Elevação Lateral', series: 3, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Rosca Alternada', series: 3, repeticoes: '10-12', descanso: '60s' }
                    ]},
                    { nome: 'Dia 4 - Repetição Semana', grupos: 'Peito, Costas, Pernas', exercicios: [
                        { nome: 'Supino Inclinado Halteres', series: 10, repeticoes: '10', descanso: '90s' },
                        { nome: 'Barra Fixa (lastro ou livre)', series: 10, repeticoes: '10', descanso: '90s' },
                        { nome: 'Stiff Romeno', series: 3, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Abdômen Prancha', series: 3, repeticoes: '45s', descanso: '30s' }
                    ]}
                ]
            }
        },
        {
            id: 'cabuloso_blood_and_guts',
            name: 'Blood and Guts - Dorian Yates',
            subtitle: 'Avançado • 4x/semana',
            description: 'O treino de Dorian Yates, 6x Mr. Olympia! UMA série all-out até a falha absoluta + forçadas após aquecimentos. Intensidade máxima, volume mínimo. Só os fortes sobrevivem!',
            level: 'avancado',
            days: 4,
            duration: '45-55',
            icon: '🩸',
            category: 'cabuloso',
            objetivos: ['cabuloso', 'hipertrofia', 'forca'],
            benefits: ['Intensidade máxima', 'Treino curto', 'Resultados rápidos'],
            featured: true,
            workout: {
                dias: [
                    { nome: 'Dia 1 - Peito & Bíceps', grupos: 'Peito, Bíceps', exercicios: [
                        { nome: 'Supino Inclinado Smith (aquec)', series: 2, repeticoes: '12, 10', descanso: '60s' },
                        { nome: 'Supino Inclinado Smith', series: 1, repeticoes: '8-10 + FORÇADAS', descanso: 'N/A', nota: 'ATÉ A FALHA ABSOLUTA!' },
                        { nome: 'Supino Reto Halteres (aquec)', series: 1, repeticoes: '10', descanso: '60s' },
                        { nome: 'Supino Reto Halteres', series: 1, repeticoes: '8-10 + DROP', descanso: 'N/A', nota: 'Dropset após falha!' },
                        { nome: 'Crossover Baixo', series: 1, repeticoes: '10-12', descanso: 'N/A', nota: 'Até a falha!' },
                        { nome: 'Rosca Scott (aquec)', series: 1, repeticoes: '10', descanso: '60s' },
                        { nome: 'Rosca Scott Barra EZ', series: 1, repeticoes: '8-10 + FORÇADAS', descanso: 'N/A' },
                        { nome: 'Rosca Inclinado Halteres', series: 1, repeticoes: '8-10 + DROP', descanso: 'N/A' }
                    ]},
                    { nome: 'Dia 2 - Pernas', grupos: 'Pernas Completo', exercicios: [
                        { nome: 'Leg Extension (aquec)', series: 2, repeticoes: '15, 12', descanso: '60s' },
                        { nome: 'Leg Extension', series: 1, repeticoes: '12-15 + DROP', descanso: 'N/A', nota: 'Dropset duplo!' },
                        { nome: 'Leg Press (aquec)', series: 2, repeticoes: '12, 10', descanso: '90s' },
                        { nome: 'Leg Press', series: 1, repeticoes: '12-15 + FORÇADAS', descanso: 'N/A', nota: 'Peso máximo!' },
                        { nome: 'Hack Squat', series: 1, repeticoes: '10-12', descanso: 'N/A', nota: 'Até a falha!' },
                        { nome: 'Leg Curl Deitado (aquec)', series: 1, repeticoes: '10', descanso: '60s' },
                        { nome: 'Leg Curl Deitado', series: 1, repeticoes: '10-12 + FORÇADAS', descanso: 'N/A' },
                        { nome: 'Stiff Romeno', series: 1, repeticoes: '10-12', descanso: 'N/A' },
                        { nome: 'Panturrilha em Pé', series: 1, repeticoes: '10-12 + DROP', descanso: 'N/A' },
                        { nome: 'Panturrilha Sentada', series: 1, repeticoes: '10-12 + DROP', descanso: 'N/A' }
                    ]},
                    { nome: 'Dia 3 - Ombros & Tríceps', grupos: 'Ombros, Tríceps', exercicios: [
                        { nome: 'Desenvolvimento Smith (aquec)', series: 2, repeticoes: '12, 10', descanso: '60s' },
                        { nome: 'Desenvolvimento Smith', series: 1, repeticoes: '8-10 + FORÇADAS', descanso: 'N/A' },
                        { nome: 'Elevação Lateral Halteres', series: 1, repeticoes: '10-12 + DROP', descanso: 'N/A' },
                        { nome: 'Elevação Lateral Máquina', series: 1, repeticoes: '10-12', descanso: 'N/A' },
                        { nome: 'Crucifixo Inverso', series: 1, repeticoes: '10-12 + DROP', descanso: 'N/A' },
                        { nome: 'Tríceps Pushdown (aquec)', series: 1, repeticoes: '12', descanso: '60s' },
                        { nome: 'Tríceps Pushdown', series: 1, repeticoes: '10-12 + DROP', descanso: 'N/A' },
                        { nome: 'Tríceps Francês EZ', series: 1, repeticoes: '8-10 + FORÇADAS', descanso: 'N/A' },
                        { nome: 'Tríceps Mergulho Máquina', series: 1, repeticoes: '8-10', descanso: 'N/A' }
                    ]},
                    { nome: 'Dia 4 - Costas', grupos: 'Costas', exercicios: [
                        { nome: 'Pulldown (aquec)', series: 2, repeticoes: '12, 10', descanso: '60s' },
                        { nome: 'Pulldown Pegada Pronada', series: 1, repeticoes: '8-10 + FORÇADAS', descanso: 'N/A' },
                        { nome: 'Remada Máquina (Hammer)', series: 1, repeticoes: '8-10 + DROP', descanso: 'N/A' },
                        { nome: 'Remada Curvada Barra', series: 1, repeticoes: '8-10', descanso: 'N/A' },
                        { nome: 'Pulldown Braços Retos', series: 1, repeticoes: '10-12', descanso: 'N/A' },
                        { nome: 'Levantamento Terra (aquec)', series: 2, repeticoes: '10, 8', descanso: '90s' },
                        { nome: 'Levantamento Terra', series: 1, repeticoes: '8 + FORÇADAS', descanso: 'N/A', nota: 'PESO MÁXIMO!' }
                    ]}
                ]
            }
        },
        {
            id: 'cabuloso_dc_training',
            name: 'DC Training - Rest Pause',
            subtitle: 'Avançado • 3x/semana',
            description: 'DoggCrapp Training de Dante Trudel! Rest-pause em cada série: faz até falha, descansa 15s, repete 2x. Extreming stretching no final. Método que criou monstros!',
            level: 'avancado',
            days: 3,
            duration: '50-60',
            icon: '💀',
            category: 'cabuloso',
            objetivos: ['cabuloso', 'hipertrofia', 'forca'],
            benefits: ['Rest-pause brutal', 'Crescimento rápido', 'Treino eficiente'],
            workout: {
                dias: [
                    { nome: 'Dia A - Peito/Ombro/Tríceps/Costas', grupos: 'Push, Pull', exercicios: [
                        { nome: 'Supino Inclinado Smith', series: 1, repeticoes: 'RP: 10+4+3', descanso: '15s entre', nota: 'REST-PAUSE: Falha-15s-Falha-15s-Falha' },
                        { nome: 'Desenvolvimento Halteres', series: 1, repeticoes: 'RP: 10+4+3', descanso: '15s entre' },
                        { nome: 'Tríceps Mergulho', series: 1, repeticoes: 'RP: 10+4+3', descanso: '15s entre' },
                        { nome: 'Remada Máquina', series: 1, repeticoes: 'RP: 10+4+3', descanso: '15s entre' },
                        { nome: 'Pulldown Supinado', series: 1, repeticoes: 'RP: 10+4+3', descanso: '15s entre' },
                        { nome: 'EXTREME STRETCH - Peito', series: 1, repeticoes: '60-90s', descanso: 'N/A', nota: 'Crucifixo posição esticada!' },
                        { nome: 'EXTREME STRETCH - Ombro', series: 1, repeticoes: '60-90s', descanso: 'N/A' },
                        { nome: 'EXTREME STRETCH - Tríceps', series: 1, repeticoes: '60-90s', descanso: 'N/A' }
                    ]},
                    { nome: 'Dia B - Bíceps/Antebraço/Panturrilha/Posterior', grupos: 'Pull, Pernas', exercicios: [
                        { nome: 'Rosca Scott Barra', series: 1, repeticoes: 'RP: 10+4+3', descanso: '15s entre' },
                        { nome: 'Rosca Punho', series: 1, repeticoes: '15-20', descanso: '60s' },
                        { nome: 'Panturrilha em Pé', series: 1, repeticoes: '12 + 10s hold', descanso: 'N/A', nota: 'Segura 10s no topo última rep!' },
                        { nome: 'Stiff Romeno', series: 1, repeticoes: 'RP: 10+4+3', descanso: '15s entre' },
                        { nome: 'Leg Curl Deitado', series: 1, repeticoes: 'RP: 10+4+3', descanso: '15s entre' },
                        { nome: 'EXTREME STRETCH - Bíceps', series: 1, repeticoes: '60-90s', descanso: 'N/A' },
                        { nome: 'EXTREME STRETCH - Posterior', series: 1, repeticoes: '60-90s', descanso: 'N/A' }
                    ]},
                    { nome: 'Dia C - Quadríceps/Peito/Ombro/Tríceps/Costas', grupos: 'Pernas, Push, Pull', exercicios: [
                        { nome: 'Leg Press ou Hack', series: 1, repeticoes: 'WIDOWMAKER: 20', descanso: '5min', nota: '20 reps com peso de 10RM!' },
                        { nome: 'Supino Reto Halteres', series: 1, repeticoes: 'RP: 10+4+3', descanso: '15s entre' },
                        { nome: 'Desenvolvimento Arnold', series: 1, repeticoes: 'RP: 10+4+3', descanso: '15s entre' },
                        { nome: 'Tríceps Testa EZ', series: 1, repeticoes: 'RP: 10+4+3', descanso: '15s entre' },
                        { nome: 'Remada Curvada', series: 1, repeticoes: 'RP: 10+4+3', descanso: '15s entre' },
                        { nome: 'EXTREME STRETCH - Quadríceps', series: 1, repeticoes: '60-90s', descanso: 'N/A', nota: 'Sissy squat posição esticada!' },
                        { nome: 'EXTREME STRETCH - Costas', series: 1, repeticoes: '60-90s', descanso: 'N/A' }
                    ]}
                ]
            }
        },
        {
            id: 'cabuloso_5x5_raiz',
            name: '5x5 Treino Raiz',
            subtitle: 'Intermediário+ • 3x/semana',
            description: 'O programa de força mais testado da história! Reg Park usava nos anos 50, Bill Starr popularizou, StrongLifts modernizou. 5 séries de 5 repetições pesadas. Simples e brutal!',
            level: 'intermediario',
            days: 3,
            duration: '45-60',
            icon: '🏋️',
            category: 'cabuloso',
            objetivos: ['cabuloso', 'forca', 'hipertrofia'],
            benefits: ['Força pura', 'Base sólida', 'Progressão linear'],
            workout: {
                dias: [
                    { nome: 'Dia A - Agachamento', grupos: 'Pernas, Peito, Costas', exercicios: [
                        { nome: 'Agachamento Livre', series: 5, repeticoes: '5', descanso: '3-5min', nota: 'Adicione 2.5kg toda vez que completar!' },
                        { nome: 'Supino Reto', series: 5, repeticoes: '5', descanso: '3-5min' },
                        { nome: 'Remada Curvada', series: 5, repeticoes: '5', descanso: '3-5min' }
                    ]},
                    { nome: 'Dia B - Levantamento Terra', grupos: 'Posterior, Ombros, Core', exercicios: [
                        { nome: 'Agachamento Livre', series: 5, repeticoes: '5', descanso: '3-5min' },
                        { nome: 'Desenvolvimento Militar', series: 5, repeticoes: '5', descanso: '3-5min' },
                        { nome: 'Levantamento Terra', series: 1, repeticoes: '5', descanso: '5min', nota: 'Uma série pesada após aquecimentos!' }
                    ]},
                    { nome: 'Dia C - Volume', grupos: 'Pernas, Peito, Costas', exercicios: [
                        { nome: 'Agachamento Livre', series: 5, repeticoes: '5', descanso: '3-5min' },
                        { nome: 'Supino Reto', series: 5, repeticoes: '5', descanso: '3-5min' },
                        { nome: 'Remada Curvada', series: 5, repeticoes: '5', descanso: '3-5min' }
                    ]}
                ]
            }
        },
        {
            id: 'cabuloso_8x8_gironda',
            name: '8x8 Vince Gironda',
            subtitle: 'Avançado • 4x/semana',
            description: 'O "Treino Honesto" de Vince Gironda, o Iron Guru! 8 séries de 8 reps com apenas 30s de descanso. Pump violento e definição extrema. Usado por Larry Scott para ganhar o primeiro Mr. Olympia!',
            level: 'avancado',
            days: 4,
            duration: '45-50',
            icon: '💎',
            category: 'cabuloso',
            objetivos: ['cabuloso', 'hipertrofia', 'definicao'],
            benefits: ['Pump insano', 'Definição extrema', 'Densidade muscular'],
            workout: {
                dias: [
                    { nome: 'Dia 1 - Peito & Costas', grupos: 'Peito, Costas', exercicios: [
                        { nome: 'Supino Inclinado Halteres', series: 8, repeticoes: '8', descanso: '30s', nota: 'Apenas 30s de descanso!' },
                        { nome: 'Remada Curvada Pegada Larga', series: 8, repeticoes: '8', descanso: '30s' },
                        { nome: 'Crucifixo Reto', series: 8, repeticoes: '8', descanso: '30s' },
                        { nome: 'Pullover com Barra', series: 8, repeticoes: '8', descanso: '30s' }
                    ]},
                    { nome: 'Dia 2 - Pernas', grupos: 'Pernas Completo', exercicios: [
                        { nome: 'Sissy Squat', series: 8, repeticoes: '8', descanso: '30s', nota: 'Exercício favorito do Gironda!' },
                        { nome: 'Leg Curl Deitado', series: 8, repeticoes: '8', descanso: '30s' },
                        { nome: 'Hack Squat Invertido', series: 8, repeticoes: '8', descanso: '30s' },
                        { nome: 'Panturrilha no Leg Press', series: 8, repeticoes: '8', descanso: '30s' }
                    ]},
                    { nome: 'Dia 3 - Ombros & Braços', grupos: 'Ombros, Bíceps, Tríceps', exercicios: [
                        { nome: 'Desenvolvimento Arnold', series: 8, repeticoes: '8', descanso: '30s' },
                        { nome: 'Rosca Gironda (drag curl)', series: 8, repeticoes: '8', descanso: '30s', nota: 'Cotovelos para trás!' },
                        { nome: 'Elevação Lateral Inclinado', series: 8, repeticoes: '8', descanso: '30s' },
                        { nome: 'Tríceps Testa c/ Barra', series: 8, repeticoes: '8', descanso: '30s' }
                    ]},
                    { nome: 'Dia 4 - Corpo Inteiro', grupos: 'Full Body', exercicios: [
                        { nome: 'Dips no Gironda (peito)', series: 8, repeticoes: '8', descanso: '30s', nota: 'Inclina pra frente!' },
                        { nome: 'Barra Fixa Pegada Larga', series: 8, repeticoes: '8', descanso: '30s' },
                        { nome: 'Agachamento Frontal', series: 8, repeticoes: '8', descanso: '30s' },
                        { nome: 'Abdômen Frog Crunch', series: 8, repeticoes: '8', descanso: '30s' }
                    ]}
                ]
            }
        },
        {
            id: 'cabuloso_cluster_sets',
            name: 'Cluster Sets - Ferro Puro',
            subtitle: 'Avançado • 4x/semana',
            description: 'Método usado por powerlifters e atletas de força! Quebra séries pesadas em mini-séries com micro-pausas. Mais peso, mais força, mais brutalidade. Treine como um animal!',
            level: 'avancado',
            days: 4,
            duration: '60-75',
            icon: '⛓️',
            category: 'cabuloso',
            objetivos: ['cabuloso', 'forca'],
            benefits: ['Força máxima', 'Mais carga', 'Potência explosiva'],
            workout: {
                dias: [
                    { nome: 'Dia 1 - Peito Pesado', grupos: 'Peito, Tríceps', exercicios: [
                        { nome: 'Supino Reto c/ Barra', series: 5, repeticoes: '2+2+2 (cluster)', descanso: '15s/2min', nota: 'CLUSTER: 2 reps, 15s, 2 reps, 15s, 2 reps. Depois 2min.' },
                        { nome: 'Supino Inclinado Halteres', series: 4, repeticoes: '6-8', descanso: '2min' },
                        { nome: 'Paralelas Lastradas', series: 4, repeticoes: '6-8', descanso: '2min' },
                        { nome: 'Tríceps Testa', series: 3, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Tríceps Corda', series: 3, repeticoes: '12-15', descanso: '60s' }
                    ]},
                    { nome: 'Dia 2 - Costas Pesada', grupos: 'Costas, Bíceps', exercicios: [
                        { nome: 'Levantamento Terra', series: 5, repeticoes: '2+2+2 (cluster)', descanso: '20s/3min', nota: 'CLUSTER: Descanse 20s entre mini-séries' },
                        { nome: 'Barra Fixa Lastrada', series: 4, repeticoes: '5-6', descanso: '2min' },
                        { nome: 'Remada Cavalinho', series: 4, repeticoes: '6-8', descanso: '2min' },
                        { nome: 'Remada Unilateral', series: 3, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Rosca Martelo Pesada', series: 3, repeticoes: '8-10', descanso: '90s' }
                    ]},
                    { nome: 'Dia 3 - Pernas Brutal', grupos: 'Pernas', exercicios: [
                        { nome: 'Agachamento Livre', series: 5, repeticoes: '2+2+2 (cluster)', descanso: '20s/3min', nota: 'CLUSTER com 85-90% do 1RM!' },
                        { nome: 'Agachamento Frontal', series: 4, repeticoes: '5-6', descanso: '2min' },
                        { nome: 'Stiff Romeno Pesado', series: 4, repeticoes: '6-8', descanso: '2min' },
                        { nome: 'Leg Press (pés altos)', series: 3, repeticoes: '10-12', descanso: '2min' },
                        { nome: 'Panturrilha em Pé Pesada', series: 4, repeticoes: '8-10', descanso: '90s' }
                    ]},
                    { nome: 'Dia 4 - Ombros & Força', grupos: 'Ombros, Trapézio', exercicios: [
                        { nome: 'Desenvolvimento Militar em Pé', series: 5, repeticoes: '2+2+2 (cluster)', descanso: '15s/2min', nota: 'BARRA! Nada de Smith.' },
                        { nome: 'Push Press', series: 4, repeticoes: '5-6', descanso: '2min', nota: 'Use as pernas!' },
                        { nome: 'Elevação Frontal c/ Barra', series: 3, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Encolhimento c/ Barra (trap)', series: 4, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Face Pull Pesado', series: 3, repeticoes: '12-15', descanso: '60s' }
                    ]}
                ]
            }
        },
        {
            id: 'cabuloso_drop_set_inferno',
            name: 'Drop Set Inferno',
            subtitle: 'Avançado • 4x/semana',
            description: 'O método mais brutal para pump e queimação! Cada exercício termina com drop sets triplos ou quádruplos. Prepare-se para sentir os músculos pegando fogo! NO PAIN NO GAIN!',
            level: 'avancado',
            days: 4,
            duration: '45-55',
            icon: '🔥',
            category: 'cabuloso',
            objetivos: ['cabuloso', 'hipertrofia', 'definicao'],
            benefits: ['Pump extremo', 'Queimação máxima', 'Definição'],
            workout: {
                dias: [
                    { nome: 'Dia 1 - Peito Inferno', grupos: 'Peito, Tríceps', exercicios: [
                        { nome: 'Supino Inclinado Halteres', series: 3, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Supino Inclinado DROP FINAL', series: 1, repeticoes: '8+8+8+8', descanso: 'N/A', nota: 'DROP QUÁDRUPLO: Tira 20% em cada drop!' },
                        { nome: 'Crossover Alto', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Crossover DROP FINAL', series: 1, repeticoes: '12+12+12', descanso: 'N/A', nota: 'DROP TRIPLO!' },
                        { nome: 'Tríceps Pushdown', series: 3, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Tríceps DROP FINAL', series: 1, repeticoes: '12+10+8+6', descanso: 'N/A', nota: 'DROP até o pino!' }
                    ]},
                    { nome: 'Dia 2 - Costas Inferno', grupos: 'Costas, Bíceps', exercicios: [
                        { nome: 'Pulldown Frente', series: 3, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Pulldown DROP FINAL', series: 1, repeticoes: '10+10+10+10', descanso: 'N/A', nota: 'DROP QUÁDRUPLO!' },
                        { nome: 'Remada Baixa Triângulo', series: 3, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Remada DROP FINAL', series: 1, repeticoes: '12+12+12', descanso: 'N/A' },
                        { nome: 'Rosca Direta Barra', series: 3, repeticoes: '10', descanso: '60s' },
                        { nome: 'Rosca DROP FINAL', series: 1, repeticoes: '10+8+6+4', descanso: 'N/A', nota: 'Até não aguentar!' }
                    ]},
                    { nome: 'Dia 3 - Pernas Inferno', grupos: 'Pernas', exercicios: [
                        { nome: 'Leg Press', series: 4, repeticoes: '12-15', descanso: '2min' },
                        { nome: 'Leg Press DROP FINAL', series: 1, repeticoes: '15+15+15+15', descanso: 'N/A', nota: 'DROP QUÁDRUPLO MASSACRE!' },
                        { nome: 'Leg Extension', series: 3, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Extensora DROP FINAL', series: 1, repeticoes: '15+12+10+8', descanso: 'N/A' },
                        { nome: 'Mesa Flexora', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Flexora DROP FINAL', series: 1, repeticoes: '12+10+8+6', descanso: 'N/A' },
                        { nome: 'Panturrilha DROP', series: 1, repeticoes: '20+20+20+20', descanso: 'N/A', nota: '80 reps de pura agonia!' }
                    ]},
                    { nome: 'Dia 4 - Ombros Inferno', grupos: 'Ombros', exercicios: [
                        { nome: 'Desenvolvimento Máquina', series: 3, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Desenvolvimento DROP FINAL', series: 1, repeticoes: '10+10+10+10', descanso: 'N/A' },
                        { nome: 'Elevação Lateral Máquina', series: 3, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Lateral DROP FINAL', series: 1, repeticoes: '15+12+10+8+6', descanso: 'N/A', nota: 'DROP QUÍNTUPLO!' },
                        { nome: 'Crucifixo Inverso', series: 3, repeticoes: '12-15', descanso: '60s' },
                        { nome: 'Posterior DROP FINAL', series: 1, repeticoes: '15+15+15', descanso: 'N/A' }
                    ]}
                ]
            }
        },
        {
            id: 'cabuloso_giant_sets',
            name: 'Giant Sets - Maromba Pura',
            subtitle: 'Avançado • 4x/semana',
            description: '4-5 exercícios em sequência SEM DESCANSO! O pump mais insano que você já vai sentir. Treino de maromba raiz das antigas. Não é pra qualquer um!',
            level: 'avancado',
            days: 4,
            duration: '50-60',
            icon: '🦍',
            category: 'cabuloso',
            objetivos: ['cabuloso', 'hipertrofia', 'condicionamento'],
            benefits: ['Pump absurdo', 'Condicionamento', 'Economia de tempo'],
            featured: true,
            workout: {
                dias: [
                    { nome: 'Dia 1 - Peito Giant', grupos: 'Peito', exercicios: [
                        { nome: 'GIANT SET PEITO (4 rounds):', series: 4, repeticoes: 'N/A', descanso: '2min após', nota: 'Faz os 4 exercícios SEGUIDOS, depois descansa!' },
                        { nome: '→ Supino Inclinado Halteres', series: '-', repeticoes: '12', descanso: '0s' },
                        { nome: '→ Supino Reto Barra', series: '-', repeticoes: '10', descanso: '0s' },
                        { nome: '→ Crossover Médio', series: '-', repeticoes: '12', descanso: '0s' },
                        { nome: '→ Flexão de Braços (até falha)', series: '-', repeticoes: 'Max', descanso: '2min', nota: 'DEPOIS descansa 2min e repete tudo!' },
                        { nome: 'Tríceps Corda', series: 3, repeticoes: '15', descanso: '60s' },
                        { nome: 'Tríceps Francês', series: 3, repeticoes: '12', descanso: '60s' }
                    ]},
                    { nome: 'Dia 2 - Costas Giant', grupos: 'Costas', exercicios: [
                        { nome: 'GIANT SET COSTAS (4 rounds):', series: 4, repeticoes: 'N/A', descanso: '2min após' },
                        { nome: '→ Barra Fixa (ou graviton)', series: '-', repeticoes: 'Max', descanso: '0s' },
                        { nome: '→ Remada Curvada', series: '-', repeticoes: '10', descanso: '0s' },
                        { nome: '→ Pulldown Pegada Neutra', series: '-', repeticoes: '12', descanso: '0s' },
                        { nome: '→ Pullover Máquina', series: '-', repeticoes: '15', descanso: '2min' },
                        { nome: 'Rosca Direta EZ', series: 3, repeticoes: '12', descanso: '60s' },
                        { nome: 'Rosca Concentrada', series: 3, repeticoes: '10', descanso: '45s' }
                    ]},
                    { nome: 'Dia 3 - Pernas Giant', grupos: 'Pernas', exercicios: [
                        { nome: 'GIANT SET QUAD (3 rounds):', series: 3, repeticoes: 'N/A', descanso: '3min após', nota: '3 rounds é suficiente - vai ser brutal!' },
                        { nome: '→ Agachamento Livre', series: '-', repeticoes: '10', descanso: '0s' },
                        { nome: '→ Leg Press', series: '-', repeticoes: '15', descanso: '0s' },
                        { nome: '→ Leg Extension', series: '-', repeticoes: '20', descanso: '0s' },
                        { nome: '→ Agachamento Sumô (leve)', series: '-', repeticoes: 'Max', descanso: '3min' },
                        { nome: 'GIANT SET POST (3 rounds):', series: 3, repeticoes: 'N/A', descanso: '2min após' },
                        { nome: '→ Stiff', series: '-', repeticoes: '12', descanso: '0s' },
                        { nome: '→ Mesa Flexora', series: '-', repeticoes: '12', descanso: '0s' },
                        { nome: '→ Leg Curl em Pé', series: '-', repeticoes: '12 cada', descanso: '2min' }
                    ]},
                    { nome: 'Dia 4 - Ombros Giant', grupos: 'Ombros, Trapézio', exercicios: [
                        { nome: 'GIANT SET OMBRO (4 rounds):', series: 4, repeticoes: 'N/A', descanso: '2min após' },
                        { nome: '→ Desenvolvimento Halteres', series: '-', repeticoes: '10', descanso: '0s' },
                        { nome: '→ Elevação Lateral', series: '-', repeticoes: '12', descanso: '0s' },
                        { nome: '→ Elevação Frontal Alternada', series: '-', repeticoes: '10 cada', descanso: '0s' },
                        { nome: '→ Crucifixo Inverso', series: '-', repeticoes: '15', descanso: '0s' },
                        { nome: '→ Encolhimento', series: '-', repeticoes: '15', descanso: '2min' },
                        { nome: 'Abdômen Prancha', series: 3, repeticoes: '45s', descanso: '30s' },
                        { nome: 'Abdominal Crunch', series: 3, repeticoes: '20', descanso: '30s' }
                    ]}
                ]
            }
        },
        {
            id: 'cabuloso_breathing_squats',
            name: 'Breathing Squats - Old School',
            subtitle: 'Avançado • 2x/semana',
            description: 'Método das antigas! Agachamento com respirações entre reps. Usado por John McCallum e Peary Rader nos anos 60. Construa pernas massivas e expanda sua caixa torácica!',
            level: 'avancado',
            days: 2,
            duration: '40-50',
            icon: '🫁',
            category: 'cabuloso',
            objetivos: ['cabuloso', 'forca', 'hipertrofia'],
            benefits: ['Pernas enormes', 'Capacidade pulmonar', 'Força mental'],
            workout: {
                dias: [
                    { nome: 'Dia A - Breathing Squats', grupos: 'Pernas, Tórax', exercicios: [
                        { nome: 'Breathing Squats', series: 1, repeticoes: '20', descanso: '5min', nota: 'Peso de 10RM! 3 respirações entre cada rep após a 10ª!' },
                        { nome: 'Pullover Reto (expansão)', series: 1, repeticoes: '20', descanso: '2min', nota: 'Imediatamente após o squat!' },
                        { nome: 'Supino Reto', series: 3, repeticoes: '8-10', descanso: '2min' },
                        { nome: 'Remada Curvada', series: 3, repeticoes: '8-10', descanso: '2min' },
                        { nome: 'Desenvolvimento em Pé', series: 2, repeticoes: '8-10', descanso: '90s' },
                        { nome: 'Rosca Direta', series: 2, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Tríceps Paralelas', series: 2, repeticoes: 'Max', descanso: '60s' }
                    ]},
                    { nome: 'Dia B - Breathing Squats', grupos: 'Pernas, Tórax', exercicios: [
                        { nome: 'Breathing Squats', series: 1, repeticoes: '20', descanso: '5min', nota: '+2.5kg que Dia A! Respira fundo!' },
                        { nome: 'Pullover Halteres (expansão)', series: 1, repeticoes: '20', descanso: '2min' },
                        { nome: 'Supino Inclinado', series: 3, repeticoes: '8-10', descanso: '2min' },
                        { nome: 'Barra Fixa', series: 3, repeticoes: 'Max', descanso: '2min' },
                        { nome: 'Desenvolvimento Arnold', series: 2, repeticoes: '10-12', descanso: '90s' },
                        { nome: 'Rosca Martelo', series: 2, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Tríceps Testa', series: 2, repeticoes: '10-12', descanso: '60s' },
                        { nome: 'Panturrilha em Pé', series: 3, repeticoes: '20', descanso: '60s' }
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
                icon: template.icon || '📋',
                subtitle: template.subtitle || `${template.days}x/semana`,
                level: template.level || 'personalizado',
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
        treino.icon = template.icon || '📋';
        treino.subtitle = template.subtitle || `${template.days}x/semana`;
        treino.level = template.level || 'personalizado';
        treino.template_id = template.id;
        treino.duracao = template.duration || treino.duracao;
        
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
            
            // Todas as categorias usam o layout padrão de grid
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
                    <button class="filter-btn" data-filter="feminino">👩 Feminino</button>
                    <button class="filter-btn" data-filter="hipertrofia">💪 Massa</button>
                    <button class="filter-btn" data-filter="forca">🏋️ Força</button>
                    <button class="filter-btn" data-filter="emagrecimento">🔥 Queima</button>
                    <button class="filter-btn" data-filter="condicionamento">⚡ Cardio</button>
                    <button class="filter-btn" data-filter="cabuloso">💀 Cabuloso</button>
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
    fetch(BASE_URL + '/api/health')
        .then(r => r.json())
        .then(() => console.log('✅ API Java OK'))
        .catch(() => console.warn('⚠️ API Java offline'));
    Auth.init();
    NutritionSystem.load();
    PWAInstaller.init();
});

// =====================================================
// PWA INSTALLER
// =====================================================
const PWAInstaller = {
    deferredPrompt: null,
    isIOS: false,
    isStandalone: false,

    init() {
        // Detectar plataforma
        this.isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        
        // Registrar Service Worker
        this.registerServiceWorker();
        
        // Configurar prompt de instalação (apenas se não estiver instalado)
        if (!this.isStandalone) {
            this.setupInstallPrompt();
        } else {
            console.log('[PWA] App já instalado');
        }
    },

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('[PWA] Service Worker registrado:', registration.scope);
                
                // Detectar atualizações
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.error('[PWA] Erro ao registrar Service Worker:', error);
            }
        }
    },

    setupInstallPrompt() {
        // Android: Capturar evento beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            console.log('[PWA] Prompt de instalação disponível');
            
            // Mostrar banner após 3 segundos
            setTimeout(() => this.showInstallBanner(), 3000);
        });

        // iOS: Mostrar instruções manuais
        if (this.isIOS && !this.isStandalone) {
            setTimeout(() => this.showIOSInstructions(), 5000);
        }

        // Detectar quando app foi instalado
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App instalado com sucesso');
            this.hideInstallBanner();
            Toast.success('App instalado! 🎉');
            localStorage.setItem('pwa_installed', 'true');
        });
    },

    showInstallBanner() {
        // Não mostrar se usuário já recusou recentemente
        const dismissed = localStorage.getItem('pwa_banner_dismissed');
        if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
            return; // Esperar 7 dias
        }

        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.className = 'pwa-install-banner';
        banner.innerHTML = `
            <div class="pwa-banner-content">
                <div class="pwa-banner-icon">📱</div>
                <div class="pwa-banner-text">
                    <strong>Instalar Shaipados</strong>
                    <p>Acesso rápido e offline</p>
                </div>
            </div>
            <button class="pwa-banner-install" id="pwa-install-btn">Instalar</button>
            <button class="pwa-banner-close" id="pwa-close-btn">✕</button>
        `;
        
        document.body.appendChild(banner);
        
        // Eventos
        document.getElementById('pwa-install-btn')?.addEventListener('click', () => this.installApp());
        document.getElementById('pwa-close-btn')?.addEventListener('click', () => {
            this.hideInstallBanner();
            localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
        });
        
        // Animação de entrada
        setTimeout(() => banner.classList.add('show'), 100);
    },

    showIOSInstructions() {
        const dismissed = localStorage.getItem('pwa_ios_dismissed');
        if (dismissed) return;

        const banner = document.createElement('div');
        banner.id = 'pwa-ios-banner';
        banner.className = 'pwa-install-banner';
        banner.innerHTML = `
            <div class="pwa-banner-content">
                <div class="pwa-banner-icon">📲</div>
                <div class="pwa-banner-text">
                    <strong>Adicionar à Tela Inicial</strong>
                    <p>Toque em <span style="color: #007AFF;">⎙</span> e depois "Adicionar à Tela Inicial"</p>
                </div>
            </div>
            <button class="pwa-banner-close" id="pwa-ios-close">✕</button>
        `;
        
        document.body.appendChild(banner);
        
        document.getElementById('pwa-ios-close')?.addEventListener('click', () => {
            banner.remove();
            localStorage.setItem('pwa_ios_dismissed', 'true');
        });
        
        setTimeout(() => banner.classList.add('show'), 100);
    },

    async installApp() {
        if (!this.deferredPrompt) return;

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        console.log('[PWA] Usuário escolheu:', outcome);
        
        if (outcome === 'accepted') {
            Toast.success('Instalando app...');
        } else {
            localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
        }
        
        this.deferredPrompt = null;
        this.hideInstallBanner();
    },

    hideInstallBanner() {
        const banner = document.getElementById('pwa-install-banner') || document.getElementById('pwa-ios-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 300);
        }
    },

    showUpdateNotification() {
        const updateBanner = document.createElement('div');
        updateBanner.className = 'pwa-update-banner';
        updateBanner.innerHTML = `
            <span>Nova versão disponível!</span>
            <button id="pwa-update-btn">Atualizar</button>
        `;
        document.body.appendChild(updateBanner);
        
        document.getElementById('pwa-update-btn')?.addEventListener('click', () => {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            }
            window.location.reload();
        });
    }
};

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
window.FatigueSystem = FatigueSystem;
window.NutritionSystem = NutritionSystem;
window.PWAInstaller = PWAInstaller;

