# Setup PostgreSQL - APP Trainer

## 1. Instalação do PostgreSQL

### Windows (via chocolatey)
```powershell
choco install postgresql
# Ou baixar em: https://www.postgresql.org/download/windows/
```

### macOS (via Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## 2. Criar Database e User

```sql
-- Conectar ao PostgreSQL como superuser
psql -U postgres

-- Criar user
CREATE USER app_trainer WITH PASSWORD 'app_trainer_secure_password';

-- Criar database
CREATE DATABASE app_trainer_db OWNER app_trainer;

-- Conceder permissões
GRANT ALL PRIVILEGES ON DATABASE app_trainer_db TO app_trainer;

-- Conectar ao database
\c app_trainer_db

-- Executar schema
\i src/db/schema.sql
```

## 3. Download do PostgreSQL JDBC Driver

O driver PostgreSQL para Java precisa estar no classpath. Há 2 opções:

### Opção A: Download Manual (Recomendado)
```powershell
# Windows PowerShell
cd 'c:\Users\cleud\Documents\PROJETOS 2026\APP-1.0\app-trainer-java-web\app-trainer-java-web\lib'

# Baixar driver (versão 42.7.1)
Invoke-WebRequest -Uri "https://jdbc.postgresql.org/download/postgresql-42.7.1.jar" -OutFile "postgresql.jar"

# Ou via curl
curl -L "https://jdbc.postgresql.org/download/postgresql-42.7.1.jar" -o postgresql.jar
```

### Opção B: Maven (se usar Maven)
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.1</version>
</dependency>
```

## 4. Configuração da Aplicação

No `WebServer.java`, inicializar ConnectionPool:

```java
// Antes de criar handlers
String dbUrl = System.getenv("DB_URL");
String dbUser = System.getenv("DB_USER");
String dbPassword = System.getenv("DB_PASSWORD");

if (dbUrl == null) {
    // Default local
    dbUrl = "jdbc:postgresql://localhost:5432/app_trainer_db";
    dbUser = "app_trainer";
    dbPassword = "app_trainer_secure_password";
}

ConnectionPool pool = ConnectionPool.getInstance(dbUrl, dbUser, dbPassword);
DataStorageSQL storage = new DataStorageSQL();
```

## 5. Variáveis de Ambiente (Produção)

```bash
# .env ou environment variables
DB_URL=jdbc:postgresql://db.railway.app:5432/app_trainer_db
DB_USER=postgres
DB_PASSWORD=<senha_segura>
```

## 6. Compilação com Driver

```powershell
cd 'c:\Users\cleud\Documents\PROJETOS 2026\APP-1.0\app-trainer-java-web\app-trainer-java-web'

# Compilar
$files = @(Get-ChildItem -Recurse src -Filter "*.java" | Select-Object -ExpandProperty FullName)
javac -encoding UTF-8 --release 17 -d bin -cp "lib/postgresql.jar" $files

# Executar
java -cp "bin;lib/postgresql.jar" WebServer
```

## 7. Testes de Conexão

```sql
-- Verificar schema
\dt

-- Listar alunos migrados
SELECT COUNT(*) FROM alunos;

-- Listar professores
SELECT COUNT(*) FROM professores;
```

## Troubleshooting

### Erro: "PostgreSQL Driver não encontrado"
- Verifique se `postgresql.jar` está em `lib/`
- Confirme que está no classpath: `-cp "bin;lib/postgresql.jar"`

### Erro: "Connection refused"
- PostgreSQL não está rodando: `sudo systemctl start postgresql`
- Verificar porta: `SELECT setting FROM pg_settings WHERE name = 'port';`

### Erro: "User does not have CONNECT privilege"
```sql
GRANT CONNECT ON DATABASE app_trainer_db TO app_trainer;
```

### Performance Lenta
- Aumentar pool size: `new ConnectionPool(..., 20)`
- Adicionar índices adicionais conforme necessidade
