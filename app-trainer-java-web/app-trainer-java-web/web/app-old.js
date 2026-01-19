/**
 * APP TRAINER - JavaScript Principal
 * Gerencia interface, API calls e interações
 * v3.1 - Integração com ML Service + Autenticação
 */

// ==================== CONFIGURAÇÃO ====================
const API_BASE = '/api';
const ML_SERVICE = 'http://localhost:8001'; // Serviço ML Python

const ENDPOINTS = {
    alunos: `${API_BASE}/alunos`,
    professores: `${API_BASE}/professores`,
    profs: `${API_BASE}/profs`,
    coach: `${API_BASE}/coach`,
    sugestao: `${API_BASE}/sugestao`,
    health: `${API_BASE}/health`,
    // ML Service endpoints
    mlCoach: `${ML_SERVICE}/coach`,
    mlPerfil: `${ML_SERVICE}/perfil`,
    mlTreino: `${ML_SERVICE}/treino/gerar`,
    mlFeedback: `${ML_SERVICE}/feedback`,
    mlProgresso: `${ML_SERVICE}/progresso`,
    // Auth endpoints
    authLogin: `${ML_SERVICE}/auth/login`,
    authRegistro: `${ML_SERVICE}/auth/registro`,
    authVerificar: `${ML_SERVICE}/auth/verificar`
};

// Estado do usuário
let currentUserId = localStorage.getItem('userId') || null;
let currentUserName = localStorage.getItem('userName') || null;
let currentToken = localStorage.getItem('token') || null;
let useMLService = true; // Usar serviço ML quando disponível

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
        if (!response.ok) {
            console.error('API Error:', response.status, response.statusText);
            throw new Error(`HTTP ${response.status}`);
        }
        const text = await response.text();
        console.log('API Response:', text);
        return JSON.parse(text);
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function showLoading(show = true) {
    $('#loading').style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'success') {
    const container = $('#toast-container');
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

// ==================== NAVEGAÇÃO POR ABAS ====================
function initTabs() {
    $$('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // Atualiza botões
            $$('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Atualiza painéis
            $$('.tab-panel').forEach(p => p.classList.remove('active'));
            $(`#panel-${tab}`).classList.add('active');
            
            // Carrega dados se necessário
            if (tab === 'alunos') loadAlunos();
            if (tab === 'profs') loadProfessores();
            if (tab === 'perfil') loadPerfilForm();
        });
    });
}

// ==================== COACH VIRTUAL COM ML ====================
function initCoach() {
    const form = $('#chat-form');
    const input = $('#chat-input');
    const messages = $('#chat-messages');
    
    // Sugestões de perguntas
    $$('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            input.value = chip.dataset.q;
            form.dispatchEvent(new Event('submit'));
        });
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pergunta = input.value.trim();
        if (!pergunta) return;
        
        // Adiciona mensagem do usuário
        addMessage(pergunta, 'user');
        input.value = '';
        
        // Mostra indicador de digitando
        const typingId = addTypingIndicator();
        
        try {
            let response;
            
            // Tentar ML Service primeiro
            if (useMLService) {
                try {
                    const params = new URLSearchParams({ q: pergunta });
                    if (currentUserId) params.append('user_id', currentUserId);
                    response = await api(`${ENDPOINTS.mlCoach}?${params}`);
                    console.log('ML Service Response:', response);
                } catch (mlError) {
                    console.log('ML Service indisponível, usando fallback Java');
                    const params = new URLSearchParams({ q: pergunta });
                    response = await api(`${ENDPOINTS.coach}?${params}`);
                }
            } else {
                const params = new URLSearchParams({ q: pergunta });
                response = await api(`${ENDPOINTS.coach}?${params}`);
            }
            
            removeTypingIndicator(typingId);
            
            // Formata resposta
            let texto = response.texto || response.answer || 'Desculpe, não consegui processar sua pergunta.';
            
            // Adiciona info de confiança se disponível
            if (response.confianca) {
                const confPct = Math.round(response.confianca * 100);
                texto += `\n\n📊 Confiança: ${confPct}%`;
            }
            
            // Adiciona tópicos se disponível
            if (response.topicos && response.topicos.length > 0) {
                texto += `\n🏷️ Tópicos: ${response.topicos.join(', ')}`;
            }
            
            addMessage(texto, 'bot', response.confianca);
            
            // Mostrar sugestões alternativas se houver
            if (response.alternativas && response.alternativas.length > 0) {
                const sugestoes = response.alternativas
                    .map(a => `${a.topico} (${Math.round(a.relevancia * 100)}%)`)
                    .join(', ');
                addMessage(`💡 Tópicos relacionados: ${sugestoes}`, 'bot', null, true);
            }
            
        } catch (error) {
            removeTypingIndicator(typingId);
            addMessage('Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.', 'bot');
        }
    });
}

function addMessage(content, type, confidence = null, isSmall = false) {
    const messages = $('#chat-messages');
    const div = document.createElement('div');
    div.className = `message ${type}${isSmall ? ' small' : ''}`;
    
    const avatar = type === 'user' ? '👤' : '🤖';
    const formattedContent = content.replace(/\n/g, '<br>').replace(/• /g, '<br>• ');
    
    // Indicador de confiança
    let confidenceIndicator = '';
    if (confidence !== null && type === 'bot') {
        const level = confidence >= 0.8 ? 'high' : confidence >= 0.5 ? 'medium' : 'low';
        confidenceIndicator = `<div class="confidence-indicator ${level}" title="Confiança: ${Math.round(confidence*100)}%"></div>`;
    }
    
    div.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">${formattedContent}</div>
        ${confidenceIndicator}
    `;
    
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function addTypingIndicator() {
    const messages = $('#chat-messages');
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'message bot';
    div.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <span class="typing-dots">🧠 Processando com IA<span>.</span><span>.</span><span>.</span></span>
        </div>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// ==================== GERADOR DE TREINO COM ML ====================
function initTreino() {
    const form = $('#treino-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading(true);
        
        const objetivo = $('#treino-objetivo').value;
        const nivel = $('#treino-nivel').value;
        const diasSemana = $('#treino-dias').value;
        const restricoes = $('#treino-restricoes').value;
        
        // Pega equipamentos selecionados
        const equipamentos = Array.from($$('input[name="equip"]:checked'))
            .map(cb => cb.value)
            .join(',');
        
        try {
            const params = new URLSearchParams({ objetivo, nivel, diasSemana, restricoes, equipamentos });
            const treino = await api(`${ENDPOINTS.sugestao}?${params}`);
            
            renderTreino(treino);
            showToast('Treino gerado com sucesso!');
        } catch (error) {
            showToast('Erro ao gerar treino', 'error');
        } finally {
            showLoading(false);
        }
    });
}

function renderTreino(treino) {
    const container = $('#treino-resultado');
    const titulo = $('#treino-titulo');
    const info = $('#treino-info');
    const content = $('#treino-content');
    const obs = $('#treino-obs');
    
    titulo.textContent = treino.titulo || 'Seu Treino Personalizado';
    info.textContent = `${treino.frequencia || ''} • ${capitalize(treino.objetivo)} • ${capitalize(treino.nivel)}`;
    
    // Renderiza dias de treino
    let html = '';
    if (treino.treinos && treino.treinos.length > 0) {
        treino.treinos.forEach(dia => {
            html += `
                <div class="treino-dia">
                    <div class="treino-dia-header">
                        Dia ${dia.numero}: ${dia.nome}
                    </div>
                    <div class="treino-dia-content">
                        ${dia.exercicios.map(ex => `
                            <div class="exercicio-item">
                                <div class="exercicio-ordem">${ex.ordem}</div>
                                <div>
                                    <div class="exercicio-nome">${ex.nome}</div>
                                    <div class="exercicio-grupo">${capitalize(ex.grupoMuscular)}</div>
                                </div>
                                <div class="exercicio-config">
                                    ${ex.series}x${ex.repeticoes}<br>
                                    <small>⏱️ ${ex.descansoSeg}s</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
    } else if (treino.exercicios) {
        // Fallback para formato antigo
        html = `
            <div class="treino-dia">
                <div class="treino-dia-header">${treino.titulo || 'Treino'}</div>
                <div class="treino-dia-content">
                    ${treino.exercicios.map((ex, i) => `
                        <div class="exercicio-item">
                            <div class="exercicio-ordem">${i + 1}</div>
                            <div class="exercicio-nome">${ex}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    content.innerHTML = html;
    obs.textContent = treino.observacoes || '';
    
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });
}

// ==================== ALUNOS ====================
function initAlunos() {
    const form = $('#aluno-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading(true);
        
        const params = new URLSearchParams({
            nome: $('#aluno-nome').value,
            idade: $('#aluno-idade').value,
            objetivo: $('#aluno-objetivo').value,
            nivel: $('#aluno-nivel').value,
            pesoKg: $('#aluno-peso').value || '0',
            alturaCm: $('#aluno-altura').value || '0',
            restricoes: $('#aluno-restricoes').value,
            rpe: $('#aluno-rpe').value || ''
        });
        
        try {
            await api(`${ENDPOINTS.alunos}?${params}`, { method: 'POST' });
            showToast('Aluno cadastrado com sucesso!');
            form.reset();
            loadAlunos();
        } catch (error) {
            showToast('Erro ao cadastrar aluno', 'error');
        } finally {
            showLoading(false);
        }
    });
    
    $('#refresh-alunos').addEventListener('click', loadAlunos);
}

async function loadAlunos() {
    const list = $('#alunos-list');
    try {
        const alunos = await api(ENDPOINTS.alunos);
        
        if (!alunos || alunos.length === 0) {
            list.innerHTML = '<p class="empty-state">Nenhum aluno cadastrado</p>';
            return;
        }
        
        list.innerHTML = alunos.map(a => `
            <div class="data-item">
                <div class="data-item-info">
                    <h4>${a.nome}</h4>
                    <div class="data-item-meta">
                        <span>🎂 ${a.idade} anos</span>
                        <span>🎯 ${capitalize(a.objetivo)}</span>
                        <span>📊 ${capitalize(a.nivel)}</span>
                        ${a.pesoKg > 0 ? `<span>⚖️ ${a.pesoKg}kg</span>` : ''}
                        ${a.imc > 0 ? `<span>📈 IMC: ${a.imc}</span>` : ''}
                    </div>
                </div>
                <div class="data-item-actions">
                    <button class="btn btn-small btn-outline" onclick="deleteAluno(${a.id})">🗑️</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        list.innerHTML = '<p class="empty-state">Erro ao carregar alunos</p>';
    }
}

async function deleteAluno(id) {
    if (!confirm('Confirma a exclusão deste aluno?')) return;
    try {
        await api(`${ENDPOINTS.alunos}/${id}`, { method: 'DELETE' });
        showToast('Aluno removido');
        loadAlunos();
    } catch (error) {
        showToast('Erro ao remover aluno', 'error');
    }
}

// ==================== PROFESSORES ====================
function initProfessores() {
    const form = $('#prof-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading(true);
        
        const params = new URLSearchParams({
            nome: $('#prof-nome').value,
            especialidade: $('#prof-esp').value
        });
        
        try {
            await api(`${ENDPOINTS.profs}?${params}`, { method: 'POST' });
            showToast('Professor cadastrado com sucesso!');
            form.reset();
            loadProfessores();
        } catch (error) {
            showToast('Erro ao cadastrar professor', 'error');
        } finally {
            showLoading(false);
        }
    });
    
    $('#refresh-profs').addEventListener('click', loadProfessores);
}

async function loadProfessores() {
    const list = $('#profs-list');
    try {
        const profs = await api(ENDPOINTS.profs);
        
        if (!profs || profs.length === 0) {
            list.innerHTML = '<p class="empty-state">Nenhum professor cadastrado</p>';
            return;
        }
        
        list.innerHTML = profs.map(p => `
            <div class="data-item">
                <div class="data-item-info">
                    <h4>${p.nome}</h4>
                    <div class="data-item-meta">
                        <span>🏋️ ${capitalize(p.especialidade)}</span>
                    </div>
                </div>
                <div class="data-item-actions">
                    <button class="btn btn-small btn-outline" onclick="deleteProfessor(${p.id})">🗑️</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        list.innerHTML = '<p class="empty-state">Erro ao carregar professores</p>';
    }
}

async function deleteProfessor(id) {
    if (!confirm('Confirma a exclusão deste professor?')) return;
    try {
        await api(`${ENDPOINTS.professores}/${id}`, { method: 'DELETE' });
        showToast('Professor removido');
        loadProfessores();
    } catch (error) {
        showToast('Erro ao remover professor', 'error');
    }
}

// ==================== HELPERS ====================
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}

// ==================== GERENCIAMENTO DE PERFIL ====================
function loadPerfilForm() {
    // Carregar perfil se existir
    if (currentUserId) {
        loadUserProfile();
    }
}

async function criarPerfil(dados) {
    try {
        showLoading(true);
        const response = await api(ENDPOINTS.mlPerfil, {
            method: 'POST',
            body: JSON.stringify(dados)
        });
        
        if (response.success) {
            currentUserId = response.user_id;
            localStorage.setItem('userId', currentUserId);
            showToast(`Perfil criado! Seu ID: ${currentUserId}`);
            return response;
        }
    } catch (error) {
        showToast('Erro ao criar perfil', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadUserProfile() {
    if (!currentUserId) return;
    
    try {
        const data = await api(`${ENDPOINTS.mlPerfil}/${currentUserId}`);
        console.log('Perfil carregado:', data);
        
        // Preencher campos se existirem
        if (data.perfil) {
            const p = data.perfil;
            if ($('#perfil-nome')) $('#perfil-nome').value = p.nome || '';
            if ($('#perfil-idade')) $('#perfil-idade').value = p.idade || 25;
            if ($('#perfil-peso')) $('#perfil-peso').value = p.peso || 70;
        }
        
        // Mostrar estatísticas
        if (data.estatisticas) {
            console.log('Estatísticas:', data.estatisticas);
        }
        
    } catch (error) {
        console.log('Perfil não encontrado, criar novo');
    }
}

async function gerarTreinoML() {
    if (!currentUserId) {
        showToast('Crie um perfil primeiro!', 'warning');
        return null;
    }
    
    try {
        showLoading(true);
        const response = await api(ENDPOINTS.mlTreino, {
            method: 'POST',
            body: JSON.stringify({ user_id: currentUserId })
        });
        
        if (response.success) {
            return response.treino;
        }
    } catch (error) {
        console.error('Erro ao gerar treino ML:', error);
        return null;
    } finally {
        showLoading(false);
    }
}

async function enviarFeedback(feedback) {
    if (!currentUserId) return;
    
    try {
        await api(ENDPOINTS.mlFeedback, {
            method: 'POST',
            body: JSON.stringify({
                user_id: currentUserId,
                feedback: feedback
            })
        });
        showToast('Feedback registrado!');
    } catch (error) {
        console.error('Erro ao enviar feedback:', error);
    }
}

// ==================== FORMULÁRIO DE AVALIAÇÃO INICIAL ====================
function initPerfilForm() {
    const form = $('#perfil-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await criarPerfilCompleto();
    });
    
    // Botão editar perfil
    const btnEditar = $('#btn-editar-perfil');
    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            $('#perfil-status').style.display = 'none';
            form.style.display = 'flex';
        });
    }
    
    // Botões do treino gerado
    const btnAceitar = $('#btn-aceitar-treino');
    if (btnAceitar) {
        btnAceitar.addEventListener('click', async () => {
            await enviarFeedback('treino_aceito', 'positivo');
            showToast('Treino salvo! Bom treino! 💪');
            // Ir para aba Coach
            $$('.tab-btn')[1].click();
        });
    }
    
    const btnAjustar = $('#btn-ajustar-treino');
    if (btnAjustar) {
        btnAjustar.addEventListener('click', () => {
            const motivo = prompt('O que você gostaria de ajustar no treino?');
            if (motivo) {
                enviarFeedback('ajuste_treino', motivo);
                showToast('Solicitação registrada. Fale com o Coach para ajustes!');
                $$('.tab-btn')[1].click();
            }
        });
    }
}

async function criarPerfilCompleto() {
    showLoading(true);
    
    try {
        // Coleta todos os dados do formulário
        const perfil = {
            // Dados pessoais
            nome: $('#perfil-nome').value,
            idade: parseInt($('#perfil-idade').value),
            sexo: $('#perfil-sexo').value,
            peso_kg: parseFloat($('#perfil-peso').value),
            altura_cm: parseInt($('#perfil-altura').value),
            gordura_corporal: $('#perfil-bf').value ? parseFloat($('#perfil-bf').value) : null,
            
            // Objetivo
            objetivo: document.querySelector('input[name="objetivo"]:checked')?.value || 'hipertrofia',
            
            // Experiência
            nivel: $('#perfil-nivel').value,
            tempo_treino_meses: $('#perfil-tempo-treino').value ? parseInt($('#perfil-tempo-treino').value) : 0,
            
            // Disponibilidade
            dias_semana: parseInt($('#perfil-dias').value),
            duracao_treino_min: parseInt($('#perfil-duracao').value),
            horario_preferido: $('#perfil-horario').value,
            
            // Local e Equipamentos
            local_treino: $('#perfil-local').value,
            equipamentos: Array.from($$('input[name="equip"]:checked')).map(cb => cb.value),
            
            // Restrições
            restricoes: Array.from($$('input[name="restricao"]:checked')).map(cb => cb.value),
            detalhes_restricao: $('#perfil-detalhes-restricao').value || '',
            medicamentos: $('#perfil-medicamentos').value || '',
            
            // Preferências
            exercicios_preferidos: Array.from($$('input[name="preferencia"]:checked')).map(cb => cb.value),
            exercicios_evitar: Array.from($$('input[name="evitar"]:checked')).map(cb => cb.value),
            observacoes: $('#perfil-observacoes').value || ''
        };
        
        // Calcular IMC
        if (perfil.peso_kg && perfil.altura_cm) {
            const alturaM = perfil.altura_cm / 100;
            perfil.imc = Math.round((perfil.peso_kg / (alturaM * alturaM)) * 10) / 10;
        }
        
        console.log('Enviando perfil:', perfil);
        
        let response;
        
        // Se usuário já está logado, usar endpoint de completar avaliação
        if (currentUserId) {
            console.log('Usuário logado, completando avaliação...');
            response = await api(`${ML_SERVICE}/perfil/${currentUserId}/completar`, {
                method: 'POST',
                body: JSON.stringify(perfil)
            });
        } else {
            // Novo usuário - criar perfil do zero
            response = await api(ENDPOINTS.mlPerfil, {
                method: 'POST',
                body: JSON.stringify(perfil)
            });
        }
        
        console.log('Resposta do ML Service:', response);
        
        // Salvar ID do usuário (caso seja novo)
        if (response.user_id && !currentUserId) {
            currentUserId = response.user_id;
            localStorage.setItem('userId', currentUserId);
        }
        
        showToast('Perfil criado com sucesso! 🎉');
        
        // Mostrar status e esconder form
        $('#perfil-status').style.display = 'flex';
        $('#perfil-form').style.display = 'none';
        
        // Renderizar treino que veio na resposta
        if (response.treino) {
            renderTreinoIA(response.treino);
        } else {
            // Fallback se não veio treino
            renderTreinoFallback(perfil);
        }
        
    } catch (error) {
        console.error('Erro ao criar perfil:', error);
        showToast('Erro ao criar perfil. Verifique se o ML Service está online.', 'error');
        
        // Tentar gerar treino localmente como fallback
        const perfil = {
            objetivo: document.querySelector('input[name="objetivo"]:checked')?.value || 'hipertrofia',
            nivel: $('#perfil-nivel')?.value || 'iniciante',
            dias_semana: parseInt($('#perfil-dias')?.value) || 4,
            restricoes: Array.from($$('input[name="restricao"]:checked')).map(cb => cb.value),
            duracao_treino_min: parseInt($('#perfil-duracao')?.value) || 60
        };
        renderTreinoFallback(perfil);
    } finally {
        showLoading(false);
    }
}

async function gerarTreinoPersonalizado(perfil) {
    showLoading(true);
    
    try {
        // Chamar endpoint de geração de treino
        const response = await api(`${ENDPOINTS.mlTreino}?user_id=${currentUserId}`, {
            method: 'POST',
            body: JSON.stringify(perfil)
        });
        
        renderTreinoIA(response);
        
    } catch (error) {
        console.error('Erro ao gerar treino:', error);
        // Tentar gerar treino localmente como fallback
        renderTreinoFallback(perfil);
    } finally {
        showLoading(false);
    }
}

function renderTreinoIA(treino) {
    const container = $('#treino-ia-resultado');
    const content = $('#treino-ia-content');
    
    if (!container || !content) return;
    
    console.log('Renderizando treino:', treino);
    
    let html = '';
    
    // Extrair dados do perfil se existir
    const perfilResumo = treino.perfil_resumo || {};
    const objetivo = perfilResumo.objetivo || treino.objetivo || 'HIPERTROFIA';
    const diasSemana = perfilResumo.dias_semana || treino.dias || (treino.divisao?.length) || 4;
    
    // Header com resumo
    html += `
        <div class="treino-resumo">
            <div class="resumo-item">
                <span class="resumo-label">🎯 Objetivo</span>
                <span class="resumo-valor">${capitalize(objetivo)}</span>
            </div>
            <div class="resumo-item">
                <span class="resumo-label">📅 Frequência</span>
                <span class="resumo-valor">${diasSemana}x por semana</span>
            </div>
            <div class="resumo-item">
                <span class="resumo-label">⚙️ Divisão</span>
                <span class="resumo-valor">${treino.divisao?.join(' / ') || 'Personalizada'}</span>
            </div>
        </div>
    `;
    
    // Treinos por dia (formato ML Service)
    if (treino.treinos && treino.treinos.length > 0) {
        treino.treinos.forEach((dia, index) => {
            const grupos = dia.grupos?.join(', ') || '';
            const duracao = dia.duracao_estimada || 45;
            
            html += `
                <div class="treino-dia">
                    <div class="treino-dia-header">
                        <span class="dia-numero">Dia ${index + 1}</span>
                        <span class="treino-dia-titulo">${dia.dia || dia.nome || 'Treino'}</span>
                        <span class="treino-duracao">⏱️ ~${duracao}min</span>
                    </div>
                    ${grupos ? `<div class="treino-grupos">🎯 ${grupos}</div>` : ''}
                    <div class="exercicios-lista">
            `;
            
            if (dia.exercicios && dia.exercicios.length > 0) {
                dia.exercicios.forEach(ex => {
                    const nome = ex.exercicio || ex.nome || ex;
                    const tipo = ex.tipo || '';
                    const tipoClass = tipo === 'composto' ? 'tipo-composto' : 'tipo-isolador';
                    
                    html += `
                        <div class="exercicio-item">
                            <span class="exercicio-nome">${nome} ${tipo ? `<span class="exercicio-tipo ${tipoClass}">${tipo}</span>` : ''}</span>
                            <span class="exercicio-series">${ex.series || 3}x</span>
                            <span class="exercicio-reps">${ex.repeticoes || ex.reps || '10-12'}</span>
                            <span class="exercicio-descanso">${ex.descanso || '60-90s'}</span>
                        </div>
                    `;
                });
            }
            
            html += `
                    </div>
                </div>
            `;
        });
    } else if (treino.exercicios && typeof treino.exercicios === 'object') {
        // Formato com grupos
        Object.entries(treino.exercicios).forEach(([grupo, exs]) => {
            html += `
                <div class="treino-dia">
                    <div class="treino-dia-header">
                        <span class="treino-dia-titulo">${capitalize(grupo)}</span>
                    </div>
                    <div class="exercicios-lista">
            `;
            
            exs.forEach(ex => {
                html += `
                    <div class="exercicio-item">
                        <span class="exercicio-nome">${ex.exercicio || ex}</span>
                        <span class="exercicio-series">${ex.series || 3}x</span>
                        <span class="exercicio-reps">${ex.reps || ex.repeticoes || '10-12'}</span>
                        <span class="exercicio-descanso">${ex.descanso || 60}s</span>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
    }
    
    // Configuração geral
    if (treino.config_geral) {
        const cfg = treino.config_geral;
        html += `
            <div class="treino-config">
                <h4>⚙️ Configuração Geral</h4>
                <div class="config-grid">
                    <div class="config-item"><strong>Séries:</strong> ${cfg.series}</div>
                    <div class="config-item"><strong>Repetições:</strong> ${cfg.repeticoes}</div>
                    <div class="config-item"><strong>Descanso:</strong> ${cfg.descanso}</div>
                    <div class="config-item"><strong>Intensidade:</strong> ${cfg.intensidade}</div>
                </div>
            </div>
        `;
    }
    
    // Recomendações
    if (treino.recomendacoes && treino.recomendacoes.length > 0) {
        html += `
            <div class="treino-observacoes">
                <h4>💡 Recomendações do Coach:</h4>
                <ul class="recomendacoes-lista">
                    ${treino.recomendacoes.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    content.innerHTML = html;
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });
}

function renderTreinoFallback(perfil) {
    // Gera treino básico se ML falhar
    const treino = {
        objetivo: perfil.objetivo,
        dias: perfil.dias_semana,
        duracao: perfil.duracao_treino_min,
        treinos: []
    };
    
    // Lógica básica de divisão de treino
    const diasSemana = perfil.dias_semana || 4;
    
    const divisoes = {
        2: [
            { nome: 'Superior (Peito, Costas, Ombros, Braços)', grupos: ['peito', 'costas', 'ombros', 'biceps', 'triceps'] },
            { nome: 'Inferior (Pernas e Core)', grupos: ['quadriceps', 'posterior', 'gluteos', 'panturrilha', 'abdomen'] }
        ],
        3: [
            { nome: 'Push (Peito, Ombros, Tríceps)', grupos: ['peito', 'ombros', 'triceps'] },
            { nome: 'Pull (Costas, Bíceps)', grupos: ['costas', 'biceps'] },
            { nome: 'Legs (Pernas)', grupos: ['quadriceps', 'posterior', 'gluteos', 'panturrilha'] }
        ],
        4: [
            { nome: 'Peito e Tríceps', grupos: ['peito', 'triceps'] },
            { nome: 'Costas e Bíceps', grupos: ['costas', 'biceps'] },
            { nome: 'Pernas', grupos: ['quadriceps', 'posterior', 'gluteos', 'panturrilha'] },
            { nome: 'Ombros e Abdomen', grupos: ['ombros', 'abdomen'] }
        ],
        5: [
            { nome: 'Peito', grupos: ['peito'] },
            { nome: 'Costas', grupos: ['costas'] },
            { nome: 'Ombros', grupos: ['ombros'] },
            { nome: 'Pernas', grupos: ['quadriceps', 'posterior', 'gluteos', 'panturrilha'] },
            { nome: 'Braços', grupos: ['biceps', 'triceps'] }
        ],
        6: [
            { nome: 'Peito', grupos: ['peito'] },
            { nome: 'Costas', grupos: ['costas'] },
            { nome: 'Ombros', grupos: ['ombros'] },
            { nome: 'Quadríceps e Glúteos', grupos: ['quadriceps', 'gluteos'] },
            { nome: 'Posterior e Panturrilha', grupos: ['posterior', 'panturrilha'] },
            { nome: 'Braços e Core', grupos: ['biceps', 'triceps', 'abdomen'] }
        ]
    };
    
    const exerciciosBase = {
        peito: ['Supino reto', 'Supino inclinado', 'Crucifixo', 'Crossover'],
        costas: ['Puxada frontal', 'Remada curvada', 'Remada baixa', 'Pulldown'],
        ombros: ['Desenvolvimento', 'Elevação lateral', 'Elevação frontal', 'Face pull'],
        biceps: ['Rosca direta', 'Rosca alternada', 'Rosca martelo', 'Rosca concentrada'],
        triceps: ['Tríceps corda', 'Tríceps francês', 'Tríceps testa', 'Mergulho'],
        quadriceps: ['Agachamento', 'Leg press', 'Cadeira extensora', 'Afundo'],
        posterior: ['Stiff', 'Mesa flexora', 'Cadeira flexora', 'Good morning'],
        gluteos: ['Hip thrust', 'Elevação pélvica', 'Abdução', 'Kickback'],
        panturrilha: ['Panturrilha em pé', 'Panturrilha sentado'],
        abdomen: ['Abdominal crunch', 'Prancha', 'Elevação de pernas']
    };
    
    const divisao = divisoes[diasSemana] || divisoes[4];
    
    divisao.forEach((dia, i) => {
        const exercicios = [];
        dia.grupos.forEach(grupo => {
            const exGrupo = exerciciosBase[grupo] || [];
            // Pega 2-3 exercícios por grupo
            const quantidade = dia.grupos.length <= 2 ? 3 : 2;
            exGrupo.slice(0, quantidade).forEach(ex => {
                // Verifica restrições
                const temRestricao = perfil.restricoes && perfil.restricoes.some(r => {
                    if (r === 'joelho' && (ex.includes('Agachamento') || ex.includes('Afundo'))) return true;
                    if (r === 'ombro' && (ex.includes('Desenvolvimento') || ex.includes('Supino'))) return true;
                    if (r === 'lombar' && (ex.includes('Terra') || ex.includes('Stiff'))) return true;
                    return false;
                });
                
                if (!temRestricao) {
                    exercicios.push({
                        nome: ex,
                        series: perfil.nivel === 'iniciante' ? 3 : 4,
                        reps: perfil.objetivo === 'forca' ? '4-6' : perfil.objetivo === 'resistencia' ? '15-20' : '8-12',
                        descanso: perfil.objetivo === 'forca' ? 120 : perfil.objetivo === 'resistencia' ? 30 : 60
                    });
                }
            });
        });
        
        treino.treinos.push({
            nome: dia.nome,
            exercicios
        });
    });
    
    treino.observacoes = `Treino gerado para objetivo de ${perfil.objetivo}. ` +
        (perfil.restricoes?.length ? `Exercícios adaptados considerando suas restrições: ${perfil.restricoes.join(', ')}.` : '') +
        ` Ajuste as cargas progressivamente.`;
    
    renderTreinoIA(treino);
}

function loadPerfilForm() {
    // Carregar dados existentes do perfil se houver
    if (currentUserId) {
        loadUserProfile();
    }
}

// ==================== AUTENTICAÇÃO ====================

function initAuth() {
    const authOverlay = $('#auth-overlay');
    const loginForm = $('#login-form');
    const registroForm = $('#registro-form');
    const authTabs = $$('.auth-tab');
    const btnLogout = $('#btn-logout');
    
    // Tabs de login/registro
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (tab.dataset.auth === 'login') {
                loginForm.style.display = 'flex';
                registroForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                registroForm.style.display = 'flex';
            }
            
            // Limpar erros
            $('#login-error').textContent = '';
            $('#registro-error').textContent = '';
        });
    });
    
    // Form de login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await fazerLogin();
    });
    
    // Form de registro
    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await fazerRegistro();
    });
    
    // Logout
    if (btnLogout) {
        btnLogout.addEventListener('click', fazerLogout);
    }
    
    // Verificar se já está logado
    verificarSessao();
}

async function fazerLogin() {
    const email = $('#login-email').value.trim();
    const senha = $('#login-senha').value;
    const errorEl = $('#login-error');
    
    errorEl.textContent = '';
    
    try {
        showLoading(true);
        
        const response = await api(ENDPOINTS.authLogin, {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });
        
        if (response.success) {
            // Salvar sessão
            currentUserId = response.user_id;
            currentUserName = response.nome;
            currentToken = response.token;
            
            localStorage.setItem('userId', currentUserId);
            localStorage.setItem('userName', currentUserName);
            localStorage.setItem('token', currentToken);
            
            // Esconder login e mostrar app
            entrarNoApp(response.tem_perfil_completo);
            
            showToast(`Bem-vindo de volta, ${response.nome}! 🎉`);
        } else {
            errorEl.textContent = response.message || 'Erro ao fazer login';
        }
        
    } catch (error) {
        console.error('Erro no login:', error);
        errorEl.textContent = 'Erro de conexão. Verifique se o servidor está online.';
    } finally {
        showLoading(false);
    }
}

async function fazerRegistro() {
    const nome = $('#registro-nome').value.trim();
    const email = $('#registro-email').value.trim();
    const senha = $('#registro-senha').value;
    const senha2 = $('#registro-senha2').value;
    const errorEl = $('#registro-error');
    
    errorEl.textContent = '';
    
    // Validar senhas
    if (senha !== senha2) {
        errorEl.textContent = 'As senhas não coincidem';
        return;
    }
    
    if (senha.length < 6) {
        errorEl.textContent = 'A senha deve ter pelo menos 6 caracteres';
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await api(ENDPOINTS.authRegistro, {
            method: 'POST',
            body: JSON.stringify({ nome, email, senha })
        });
        
        if (response.success) {
            // Salvar sessão
            currentUserId = response.user_id;
            currentUserName = response.nome;
            currentToken = response.token;
            
            localStorage.setItem('userId', currentUserId);
            localStorage.setItem('userName', currentUserName);
            localStorage.setItem('token', currentToken);
            
            // Esconder login e mostrar app
            entrarNoApp(false); // Novo usuário precisa preencher perfil
            
            showToast(`Conta criada com sucesso! Bem-vindo, ${response.nome}! 🎉`);
            
            // Direcionar para aba de avaliação
            setTimeout(() => {
                $$('.tab-btn')[0].click(); // Clicar na aba Avaliação
            }, 500);
        } else {
            errorEl.textContent = response.detail || response.message || 'Erro ao criar conta';
        }
        
    } catch (error) {
        console.error('Erro no registro:', error);
        if (error.message.includes('400')) {
            errorEl.textContent = 'Email já cadastrado. Faça login ou use outro email.';
        } else {
            errorEl.textContent = 'Erro de conexão. Verifique se o servidor está online.';
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
        const response = await api(`${ENDPOINTS.authVerificar}/${currentUserId}`);
        
        if (response.valid) {
            currentUserName = response.nome;
            entrarNoApp(response.tem_perfil_completo);
        } else {
            mostrarTelaLogin();
        }
    } catch (error) {
        console.log('Sessão inválida, mostrando login');
        mostrarTelaLogin();
    }
}

function mostrarTelaLogin() {
    const authOverlay = $('#auth-overlay');
    authOverlay.classList.remove('hidden');
    
    // Limpar dados de sessão
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    currentUserId = null;
    currentUserName = null;
    currentToken = null;
}

async function entrarNoApp(temPerfilCompleto) {
    const authOverlay = $('#auth-overlay');
    authOverlay.classList.add('hidden');
    
    // Mostrar nome do usuário no header
    const headerUser = $('#header-user');
    const userName = $('#user-name');
    
    if (headerUser && userName) {
        headerUser.style.display = 'flex';
        userName.textContent = currentUserName;
    }
    
    // Se tem perfil completo, carregar dados e treino
    if (temPerfilCompleto) {
        try {
            showLoading(true);
            
            // Carregar perfil do usuário
            const perfil = await api(`${ML_SERVICE}/perfil/${currentUserId}`);
            console.log('Perfil carregado:', perfil);
            
            // Mostrar status e esconder form
            if ($('#perfil-status')) $('#perfil-status').style.display = 'flex';
            if ($('#perfil-form')) $('#perfil-form').style.display = 'none';
            
            // Se tem treino salvo, renderizar
            if (perfil.treino_atual) {
                renderTreinoIA(perfil.treino_atual);
            } else {
                // Gerar treino se não tem
                try {
                    const treinoResp = await api(`${ML_SERVICE}/treino/gerar?user_id=${currentUserId}`, {
                        method: 'POST',
                        body: JSON.stringify({})
                    });
                    renderTreinoIA(treinoResp);
                } catch (e) {
                    console.log('Sem treino disponível');
                }
            }
            
            showToast(`Bem-vindo de volta, ${currentUserName}! 💪`);
            
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
        } finally {
            showLoading(false);
        }
    } else {
        // Não tem perfil completo - mostrar formulário de avaliação
        showToast(`Olá ${currentUserName}! Complete sua avaliação física.`);
    }
}

function fazerLogout() {
    if (confirm('Deseja realmente sair?')) {
        mostrarTelaLogin();
        showToast('Você saiu da sua conta');
        
        // Limpar formulário de login
        if ($('#login-email')) $('#login-email').value = '';
        if ($('#login-senha')) $('#login-senha').value = '';
    }
}

// ==================== VERIFICAR SERVIÇO ML ====================
async function checkMLService() {
    try {
        const response = await fetch(`${ML_SERVICE}/health`, { 
            method: 'GET',
            mode: 'cors'
        });
        const data = await response.json();
        useMLService = data.status === 'healthy';
        console.log(`🧠 ML Service: ${useMLService ? 'Online' : 'Offline'}`);
    } catch (error) {
        useMLService = false;
        console.log('🧠 ML Service: Offline (usando fallback Java)');
    }
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar ML Service
    await checkMLService();
    
    // Inicializar autenticação primeiro
    initAuth();
    
    initTabs();
    initCoach();
    initTreino();
    initAlunos();
    initProfessores();
    initPerfilForm();
    
    // Verifica saúde da API Java
    api(ENDPOINTS.health)
        .then(() => console.log('✅ API Java conectada'))
        .catch(() => console.warn('⚠️ API Java offline'));
    
    // Adicionar indicador de status ML
    const statusEl = document.createElement('div');
    statusEl.id = 'ml-status';
    statusEl.className = useMLService ? 'online' : 'offline';
    statusEl.innerHTML = `🧠 ML: ${useMLService ? 'Online' : 'Fallback'}`;
    statusEl.style.cssText = 'position:fixed;bottom:10px;right:10px;padding:5px 10px;border-radius:15px;font-size:12px;background:' + (useMLService ? '#4CAF50' : '#ff9800') + ';color:white;z-index:1000;';
    document.body.appendChild(statusEl);
});

// Service Worker para PWA (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}
