/**
 * APP TRAINER - JavaScript Principal
 * Gerencia interface, API calls e interações
 * v4.0 - Consolidado e funcional
 */

// ==================== CONFIGURAÇÃO ====================
const API_BASE = '';  // Usa mesmo host/porta do servidor Java
const ML_SERVICE = 'http://localhost:8001'; // Serviço ML Python

const ENDPOINTS = {
    alunos: `${API_BASE}/api/alunos`,
    professores: `${API_BASE}/api/professores`,
    profs: `${API_BASE}/api/profs`,
    coach: `${API_BASE}/api/coach`,
    sugestao: `${API_BASE}/api/sugestao`,
    health: `${API_BASE}/api/health`,
    // Auth endpoints - Java server
    authLogin: `${API_BASE}/auth/login`,
    authRegistro: `${API_BASE}/auth/registro`,
    authVerificar: `${API_BASE}/auth/verificar`,
    // ML Service endpoints
    mlCoach: `${ML_SERVICE}/coach`,
    mlPerfil: `${ML_SERVICE}/perfil`,
    mlTreino: `${ML_SERVICE}/treino/gerar`,
    mlFeedback: `${ML_SERVICE}/feedback`,
    mlProgresso: `${ML_SERVICE}/progresso`,
    mlAuthLogin: `${ML_SERVICE}/auth/login`,
    mlAuthRegistro: `${ML_SERVICE}/auth/registro`,
    mlAuthVerificar: `${ML_SERVICE}/auth/verificar`
};

// Estado do usuário
let currentUserId = localStorage.getItem('userId') || null;
let currentUserName = localStorage.getItem('userName') || null;
let currentToken = localStorage.getItem('token') || null;
let useMLService = true;

// ==================== UTILITÁRIOS ====================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

async function api(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : endpoint;
    try {
        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        });
        const text = await response.text();
        console.log('API Response:', text);
        const data = JSON.parse(text);
        
        if (!response.ok) {
            throw new Error(data.error || data.detail || data.message || `HTTP ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function showLoading(show = true) {
    let loading = $('#loading');
    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'loading';
        loading.className = 'loading-overlay';
        loading.innerHTML = '<div class="loading-spinner"></div><p>Carregando...</p>';
        document.body.appendChild(loading);
    }
    loading.style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'success') {
    let container = $('#toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}</span>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== AUTENTICAÇÃO ====================

function initAuth() {
    const authScreen = $('#auth-screen');
    const loginForm = $('#login-form');
    const registerForm = $('#register-form');
    const authTabs = $$('.auth-tab');
    
    if (!authScreen || !loginForm) {
        console.error('[Auth] Elementos de autenticação não encontrados');
        return;
    }
    
    console.log('[Auth] Inicializando autenticação...');
    
    // Tabs de login/registro
    authTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabType = tab.dataset.tab;
            console.log('[Auth] Tab clicada:', tabType);
            
            // Atualiza tabs
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Atualiza forms
            $$('.auth-form').forEach(f => f.classList.remove('active'));
            
            if (tabType === 'login') {
                loginForm.classList.add('active');
            } else if (tabType === 'register' || tabType === 'registro') {
                if (registerForm) registerForm.classList.add('active');
            }
            
            // Limpar erros
            const loginError = $('#login-error');
            const registerError = $('#register-error');
            if (loginError) loginError.textContent = '';
            if (registerError) registerError.textContent = '';
        });
    });
    
    // Form de login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await fazerLogin();
    });
    
    // Form de registro
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await fazerRegistro();
        });
    }
    
    // Logout
    const btnLogout = $('#btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', fazerLogout);
    }
    
    // Verificar se já está logado
    verificarSessao();
}

async function fazerLogin() {
    const email = $('#login-email')?.value?.trim();
    const senha = $('#login-senha')?.value;
    const errorEl = $('#login-error');
    
    if (errorEl) errorEl.textContent = '';
    
    if (!email || !senha) {
        if (errorEl) errorEl.textContent = 'Preencha todos os campos';
        return;
    }
    
    try {
        showLoading(true);
        
        // Tentar primeiro no servidor Java, depois ML
        let response;
        try {
            response = await api(ENDPOINTS.authLogin, {
                method: 'POST',
                body: JSON.stringify({ email, senha })
            });
        } catch (javaError) {
            console.log('[Auth] Java falhou, tentando ML Service...');
            response = await api(ENDPOINTS.mlAuthLogin, {
                method: 'POST',
                body: JSON.stringify({ email, senha })
            });
        }
        
        // Processar resposta
        if (response.user_id || response.success) {
            currentUserId = response.user_id;
            currentUserName = response.nome;
            currentToken = response.token;
            
            localStorage.setItem('userId', currentUserId);
            localStorage.setItem('userName', currentUserName);
            localStorage.setItem('token', currentToken);
            
            entrarNoApp(response.tem_perfil_completo || !!response.perfil);
            showToast(`Bem-vindo, ${response.nome}! 🎉`);
        } else {
            if (errorEl) errorEl.textContent = response.message || 'Erro ao fazer login';
        }
        
    } catch (error) {
        console.error('[Auth] Erro no login:', error);
        if (errorEl) errorEl.textContent = error.message || 'Erro de conexão';
    } finally {
        showLoading(false);
    }
}

async function fazerRegistro() {
    const nome = $('#register-nome')?.value?.trim();
    const email = $('#register-email')?.value?.trim();
    const senha = $('#register-senha')?.value;
    const errorEl = $('#register-error');
    
    if (errorEl) errorEl.textContent = '';
    
    if (!nome || !email || !senha) {
        if (errorEl) errorEl.textContent = 'Preencha todos os campos';
        return;
    }
    
    if (senha.length < 6) {
        if (errorEl) errorEl.textContent = 'A senha deve ter pelo menos 6 caracteres';
        return;
    }
    
    try {
        showLoading(true);
        
        // Tentar primeiro no servidor Java, depois ML
        let response;
        try {
            response = await api(ENDPOINTS.authRegistro, {
                method: 'POST',
                body: JSON.stringify({ nome, email, senha })
            });
        } catch (javaError) {
            console.log('[Auth] Java falhou, tentando ML Service...');
            response = await api(ENDPOINTS.mlAuthRegistro, {
                method: 'POST',
                body: JSON.stringify({ nome, email, senha })
            });
        }
        
        if (response.user_id || response.success) {
            currentUserId = response.user_id;
            currentUserName = response.nome;
            currentToken = response.token;
            
            localStorage.setItem('userId', currentUserId);
            localStorage.setItem('userName', currentUserName);
            localStorage.setItem('token', currentToken);
            
            showToast(`Conta criada! Bem-vindo, ${response.nome}! 🎉`);
            entrarNoApp(false);
        } else {
            if (errorEl) errorEl.textContent = response.detail || response.message || 'Erro ao criar conta';
        }
        
    } catch (error) {
        console.error('[Auth] Erro no registro:', error);
        if (error.message.includes('409') || error.message.includes('cadastrado')) {
            if (errorEl) errorEl.textContent = 'Email já cadastrado';
        } else {
            if (errorEl) errorEl.textContent = error.message || 'Erro de conexão';
        }
    } finally {
        showLoading(false);
    }
}

async function verificarSessao() {
    if (!currentUserId || !currentToken) {
        mostrarTelaLogin();
        return;
    }
    
    try {
        // Tentar verificar no Java primeiro
        let response;
        try {
            response = await api(`${ENDPOINTS.authVerificar}/${currentUserId}`);
        } catch (e) {
            response = await api(`${ENDPOINTS.mlAuthVerificar}/${currentUserId}`);
        }
        
        if (response.valid || response.id || response.nome) {
            currentUserName = response.nome || currentUserName;
            entrarNoApp(response.tem_perfil_completo || !!response.objetivo);
        } else {
            mostrarTelaLogin();
        }
    } catch (error) {
        console.log('[Auth] Sessão inválida');
        mostrarTelaLogin();
    }
}

function mostrarTelaLogin() {
    const authScreen = $('#auth-screen');
    const app = $('#app');
    
    if (authScreen) authScreen.style.display = 'flex';
    if (app) app.style.display = 'none';
    
    // Limpar dados de sessão
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    currentUserId = null;
    currentUserName = null;
    currentToken = null;
}

function entrarNoApp(temPerfilCompleto) {
    const authScreen = $('#auth-screen');
    const app = $('#app');
    const onboarding = $('#onboarding');
    
    if (authScreen) authScreen.style.display = 'none';
    if (app) app.style.display = 'flex';
    
    // Atualizar header
    const greetingName = $('#greeting-name');
    const userAvatar = $('#user-avatar');
    
    if (greetingName && currentUserName) {
        greetingName.textContent = currentUserName;
    }
    if (userAvatar && currentUserName) {
        userAvatar.textContent = currentUserName.charAt(0).toUpperCase();
    }
    
    // Saudação por hora
    const greetingTime = $('#greeting-time');
    if (greetingTime) {
        const hour = new Date().getHours();
        if (hour < 12) greetingTime.textContent = 'Bom dia';
        else if (hour < 18) greetingTime.textContent = 'Boa tarde';
        else greetingTime.textContent = 'Boa noite';
    }
    
    // Verificar se precisa onboarding
    if (!temPerfilCompleto && onboarding) {
        onboarding.style.display = 'flex';
    }
    
    // Inicializar app
    initApp();
}

function fazerLogout() {
    if (confirm('Deseja realmente sair?')) {
        mostrarTelaLogin();
        showToast('Você saiu da sua conta', 'success');
    }
}

// ==================== APP PRINCIPAL ====================

function initApp() {
    console.log('[App] Inicializando...');
    
    // Navegação por tabs
    initNavigation();
    
    // Botão de logout
    const btnSettings = $('#btn-settings');
    if (btnSettings) {
        btnSettings.addEventListener('click', () => {
            if (confirm('Deseja sair da conta?')) {
                fazerLogout();
            }
        });
    }
}

function initNavigation() {
    const navBtns = $$('.nav-btn');
    const tabContents = $$('.tab-content');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // Atualiza botões
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Atualiza conteúdo
            tabContents.forEach(content => {
                content.classList.toggle('active', content.id === `tab-${tab}`);
            });
        });
    });
}

// ==================== VERIFICAR SERVIÇO ML ====================
async function checkMLService() {
    try {
        const response = await fetch(`${ML_SERVICE}/health`, { 
            method: 'GET',
            mode: 'cors'
        });
        const data = await response.json();
        useMLService = data.status === 'healthy' || data.status === 'ok';
        console.log(`🧠 ML Service: ${useMLService ? 'Online' : 'Offline'}`);
    } catch (error) {
        useMLService = false;
        console.log('🧠 ML Service: Offline');
    }
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[App] DOM Carregado');
    
    // Verificar ML Service
    await checkMLService();
    
    // Inicializar autenticação
    initAuth();
    
    // Verificar API Java
    fetch(`${API_BASE}/api/health`)
        .then(r => r.json())
        .then(() => console.log('✅ API Java conectada'))
        .catch(() => console.warn('⚠️ API Java offline'));
});

// Export para debug
window.fazerLogin = fazerLogin;
window.fazerRegistro = fazerRegistro;
window.fazerLogout = fazerLogout;
