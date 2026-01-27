-- Exemplo de backup para restauração
-- Crie suas tabelas e insira dados conforme necessário

CREATE TABLE IF NOT EXISTS exemplo (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

INSERT INTO exemplo (nome) VALUES ('Teste 1'), ('Teste 2');
