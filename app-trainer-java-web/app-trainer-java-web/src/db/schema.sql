-- ================================================================
-- APP Trainer - Database Schema
-- PostgreSQL 12+
-- ================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== TABELAS ====================

-- Tabela de usuários (alunos com autenticação)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email)
);

-- Tabela de alunos (perfil de treino)
CREATE TABLE IF NOT EXISTS alunos (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    nome VARCHAR(255) NOT NULL,
    idade INT,
    objetivo VARCHAR(50) CHECK (objetivo IN ('hipertrofia', 'perda_peso', 'resistencia')),
    nivel VARCHAR(50) CHECK (nivel IN ('iniciante', 'intermediario', 'avancado')),
    peso_kg DECIMAL(6,2),
    altura_cm INT,
    restricoes TEXT,
    equipamentos TEXT,
    rpe INT,
    lesoes TEXT,
    observacoes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_objetivo_nivel (objetivo, nivel)
);

-- Tabela de professores (coaches)
CREATE TABLE IF NOT EXISTS professores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    especialidade VARCHAR(50) CHECK (especialidade IN ('musculacao', 'cardio', 'funcional', 'alongamento')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_especialidade (especialidade)
);

-- Tabela de treinos gerados
CREATE TABLE IF NOT EXISTS treinos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id INT NOT NULL,
    professor_id INT,
    nome VARCHAR(255),
    descricao TEXT,
    exercicios JSONB,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_execucao TIMESTAMP,
    completado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES professores(id),
    INDEX idx_aluno_data (aluno_id, data_criacao)
);

-- Tabela de histórico de treinos
CREATE TABLE IF NOT EXISTS historico_treinos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id INT NOT NULL,
    treino_id UUID,
    data_execucao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exercicios_completos INT,
    series_completas INT,
    repeticoes_totais INT,
    duracao_minutos INT,
    observacoes TEXT,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE SET NULL,
    INDEX idx_aluno_data_exec (aluno_id, data_execucao)
);

-- Tabela de rate limiting (segurança)
CREATE TABLE IF NOT EXISTS rate_limit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    endpoint VARCHAR(255),
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    INDEX idx_email_time (email, attempt_time),
    INDEX idx_cleanup (attempt_time)
);

-- ==================== ÍNDICES ====================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_alunos_user_id ON alunos(user_id);
CREATE INDEX idx_alunos_objetivo ON alunos(objetivo);
CREATE INDEX idx_alunos_nivel ON alunos(nivel);
CREATE INDEX idx_treinos_aluno ON treinos(aluno_id);
CREATE INDEX idx_historico_aluno ON historico_treinos(aluno_id);

-- ==================== FUNÇÕES ====================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_alunos_updated_at BEFORE UPDATE ON alunos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== VERSÃO ====================
-- v1.0 - Initial schema with users, alunos, professores, treinos
