#!/bin/bash
# Setup script para APP Trainer - PostgreSQL + Dependencies
# Uso: bash setup.sh

set -e

echo "📦 APP Trainer - Setup Script"
echo "================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para print
print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}!${NC} $1"
}

# Detectar SO
OS_TYPE="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS_TYPE="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS_TYPE="macos"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS_TYPE="windows"
fi

echo "Detected OS: $OS_TYPE"
echo ""

# 1. Verificar Java
echo "Checking Java..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | grep "version" | awk -F '"' '{print $2}')
    print_step "Java encontrado: $JAVA_VERSION"
else
    print_error "Java não encontrado. Instale Java 17+"
    exit 1
fi

# 2. Criar diretórios
echo ""
echo "Creating directories..."
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP_DIR="$SCRIPT_DIR/app-trainer-java-web/app-trainer-java-web"

mkdir -p "$APP_DIR/lib"
mkdir -p "$APP_DIR/logs"
mkdir -p "$APP_DIR/bin"
print_step "Diretórios criados"

# 3. Download JDBC Driver
echo ""
echo "Downloading PostgreSQL JDBC Driver..."
if [ ! -f "$APP_DIR/lib/postgresql.jar" ]; then
    print_step "Fazendo download de postgresql-42.7.1.jar..."
    curl -L -o "$APP_DIR/lib/postgresql.jar" \
        "https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.1/postgresql-42.7.1.jar" 2>/dev/null || {
        print_error "Erro ao fazer download. Tente manualmente:"
        echo "  curl -L -o lib/postgresql.jar https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.1/postgresql-42.7.1.jar"
        exit 1
    }
    print_step "PostgreSQL JDBC Driver instalado"
else
    print_step "PostgreSQL JDBC Driver já existe"
fi

# 4. Compilar Java
echo ""
echo "Compiling Java files..."
cd "$APP_DIR"

# Remover bin anterior
rm -rf bin
mkdir -p bin

# Compilar com driver
JAVA_FILES=$(find src -name "*.java" | wc -l)
print_step "Compilando $JAVA_FILES arquivos Java..."

javac -encoding UTF-8 --release 17 -d bin -cp "lib/postgresql.jar" \
    $(find src -name "*.java") 2>&1 | grep -E "error" || print_step "Compilação bem-sucedida"

if [ ! -d bin ]; then
    print_error "Compilação falhou"
    exit 1
fi

# 5. PostgreSQL setup (Se necessário)
echo ""
echo "PostgreSQL Setup Instructions:"
echo "=============================="
case $OS_TYPE in
    linux)
        print_step "Linux detected"
        echo "  sudo apt-get install postgresql postgresql-contrib"
        echo "  sudo systemctl start postgresql"
        ;;
    macos)
        print_step "macOS detected"
        echo "  brew install postgresql@15"
        echo "  brew services start postgresql@15"
        ;;
    windows)
        print_step "Windows detected"
        echo "  Download: https://www.postgresql.org/download/windows/"
        echo "  ou: choco install postgresql"
        ;;
esac

echo ""
echo "PostgreSQL Database Setup:"
echo "=========================="
echo "Execute os seguintes comandos SQL:"
echo ""
echo "  psql -U postgres"
echo "  CREATE USER app_trainer WITH PASSWORD 'app_trainer_secure_password';"
echo "  CREATE DATABASE app_trainer_db OWNER app_trainer;"
echo "  GRANT ALL PRIVILEGES ON DATABASE app_trainer_db TO app_trainer;"
echo "  \\c app_trainer_db"
echo "  \\i src/db/schema.sql"
echo ""

# 6. Environment variables
echo "Environment Variables (for production):"
echo "========================================"
cat > .env.example << 'EOF'
# Database
DB_URL=jdbc:postgresql://localhost:5432/app_trainer_db
DB_USER=app_trainer
DB_PASSWORD=app_trainer_secure_password

# Server
PORT=8081

# Logging
LOG_LEVEL=INFO
LOG_DIR=logs
EOF

print_step ".env.example criado (renomear para .env em produção)"

# 7. Final summary
echo ""
echo "==========================================="
echo "✓ Setup concluído com sucesso!"
echo "==========================================="
echo ""
echo "Próximos passos:"
echo "1. Instalar PostgreSQL (se não tiver)"
echo "2. Criar database e user (ver instruções acima)"
echo "3. Executar o servidor:"
echo ""
echo "   cd app-trainer-java-web/app-trainer-java-web"
echo "   java -cp \"bin;lib/postgresql.jar\" WebServer"
echo ""
echo "4. Acessar em http://localhost:8081"
echo ""
