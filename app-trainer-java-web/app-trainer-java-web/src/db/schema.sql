-- Schema inicial para backend Java (schema: java_app)
CREATE SCHEMA IF NOT EXISTS java_app;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS java_app.usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de autenticação (tokens, refresh, etc)
CREATE TABLE IF NOT EXISTS java_app.autenticacao (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES java_app.usuarios(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255),
    criado_em TIMESTAMP DEFAULT NOW(),
    expira_em TIMESTAMP
);

-- Tabela de logs de acesso
CREATE TABLE IF NOT EXISTS java_app.logs_acesso (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES java_app.usuarios(id) ON DELETE SET NULL,
    acao VARCHAR(100),
    ip VARCHAR(45),
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Schema inicial para backend Python (schema: python_app)
CREATE SCHEMA IF NOT EXISTS python_app;

-- Tabela de perfil do usuário (referencia usuário do Java)
CREATE TABLE IF NOT EXISTS python_app.perfil_usuario (
    id_usuario INTEGER PRIMARY KEY REFERENCES java_app.usuarios(id) ON DELETE CASCADE,
    idade INTEGER,
    peso NUMERIC,
    altura NUMERIC,
    objetivo VARCHAR(50),
    nivel VARCHAR(50),
    dias INTEGER,
    duracao INTEGER,
    local VARCHAR(30),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de treinos
CREATE TABLE IF NOT EXISTS python_app.treinos (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES java_app.usuarios(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    tipo VARCHAR(50),
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de histórico de treinos
CREATE TABLE IF NOT EXISTS python_app.historico_treino (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES java_app.usuarios(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    resultado TEXT,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de nutrição diária
CREATE TABLE IF NOT EXISTS python_app.nutricao_diaria (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES java_app.usuarios(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    calorias INTEGER,
    proteina NUMERIC,
    carboidrato NUMERIC,
    gordura NUMERIC,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de conquistas
CREATE TABLE IF NOT EXISTS python_app.conquistas (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES java_app.usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50),
    descricao TEXT,
    data_conquista DATE DEFAULT CURRENT_DATE
);

-- Tabela de mensagens do coach IA
CREATE TABLE IF NOT EXISTS python_app.mensagens_ia (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES java_app.usuarios(id) ON DELETE CASCADE,
    mensagem TEXT,
    tipo VARCHAR(30),
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de auditoria de ações do Python
CREATE TABLE IF NOT EXISTS python_app.logs_acao (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES java_app.usuarios(id) ON DELETE SET NULL,
    acao VARCHAR(100),
    detalhes TEXT,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de notificações para o usuário
CREATE TABLE IF NOT EXISTS python_app.notificacoes (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES java_app.usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(100),
    mensagem TEXT,
    lida BOOLEAN DEFAULT FALSE,
    tipo VARCHAR(30),
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de feedbacks do usuário
CREATE TABLE IF NOT EXISTS python_app.feedbacks (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES java_app.usuarios(id) ON DELETE CASCADE,
    mensagem TEXT,
    nota INTEGER CHECK (nota BETWEEN 1 AND 5),
    origem VARCHAR(30),
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de planos personalizados (ex: plano premium, consultoria)
CREATE TABLE IF NOT EXISTS python_app.planos_personalizados (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES java_app.usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(100),
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de agendamento de treinos
CREATE TABLE IF NOT EXISTS python_app.agendamentos (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES java_app.usuarios(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    hora TIME,
    tipo VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pendente',
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de histórico de login do usuário
CREATE TABLE IF NOT EXISTS java_app.historico_login (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES java_app.usuarios(id) ON DELETE CASCADE,
    ip VARCHAR(45),
    user_agent TEXT,
    sucesso BOOLEAN,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de preferências do usuário
CREATE TABLE IF NOT EXISTS python_app.preferencias_usuario (
    id_usuario INTEGER PRIMARY KEY REFERENCES java_app.usuarios(id) ON DELETE CASCADE,
    tema VARCHAR(20) DEFAULT 'dark',
    notificacoes BOOLEAN DEFAULT TRUE,
    idioma VARCHAR(10) DEFAULT 'pt-br',
    outros JSONB
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_usuario_email ON java_app.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_treinos_usuario_data ON python_app.treinos(id_usuario, data);
CREATE INDEX IF NOT EXISTS idx_nutricao_usuario_data ON python_app.nutricao_diaria(id_usuario, data);

-- Trigger para atualizar automaticamente o campo atualizado_em ao alterar perfil
CREATE OR REPLACE FUNCTION atualiza_data_perfil()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_atualiza_perfil ON python_app.perfil_usuario;

CREATE TRIGGER trg_atualiza_perfil
BEFORE UPDATE ON python_app.perfil_usuario
FOR EACH ROW EXECUTE FUNCTION atualiza_data_perfil();

-- Exemplo de query analítica: evolução de peso do usuário
-- SELECT atualizado_em, peso FROM python_app.perfil_usuario WHERE id_usuario = 1 ORDER BY atualizado_em DESC LIMIT 10;

-- Exemplo de consulta cruzada: relatório completo do usuário
-- SELECT u.nome, p.objetivo, t.data, n.calorias
-- FROM java_app.usuarios u
-- LEFT JOIN python_app.perfil_usuario p ON u.id = p.id_usuario
-- LEFT JOIN python_app.treinos t ON u.id = t.id_usuario
-- LEFT JOIN python_app.nutricao_diaria n ON u.id = n.id_usuario AND n.data = CURRENT_DATE
-- WHERE u.id = 1;
