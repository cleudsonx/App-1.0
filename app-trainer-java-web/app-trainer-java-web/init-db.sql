-- Criar tabelas para APP Trainer
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alunos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    idade INTEGER DEFAULT 0,
    objetivo VARCHAR(50) DEFAULT 'hipertrofia',
    nivel VARCHAR(50) DEFAULT 'iniciante',
    peso_kg DECIMAL(5,2) DEFAULT 0,
    altura_cm INTEGER DEFAULT 0,
    restricoes TEXT,
    equipamentos TEXT,
    rpe INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS professores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    especialidade VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS treinos (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER REFERENCES alunos(id) ON DELETE CASCADE,
    titulo VARCHAR(255),
    objetivo VARCHAR(50),
    nivel VARCHAR(50),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_alunos_user_id ON alunos(user_id);
CREATE INDEX IF NOT EXISTS idx_treinos_aluno_id ON treinos(aluno_id);

-- Exibir status
\dt
\di
