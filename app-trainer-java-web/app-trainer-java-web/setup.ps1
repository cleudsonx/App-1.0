# Setup script para APP Trainer - PostgreSQL + Dependencies (Windows)
# Uso: powershell.exe -ExecutionPolicy Bypass -File setup.ps1

param(
    [switch]$SkipJava = $false,
    [switch]$SkipPostgreSQL = $false,
    [switch]$SkipCompile = $false,
    [switch]$ShowHelp = $false
)

# Cores
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Yellow = [System.ConsoleColor]::Yellow

function Write-Step {
    param([string]$Message)
    Write-Host "✓ " -ForegroundColor $Green -NoNewline
    Write-Host $Message
}

function Write-Error-Step {
    param([string]$Message)
    Write-Host "✗ " -ForegroundColor $Red -NoNewline
    Write-Host $Message
}

function Write-Warn-Step {
    param([string]$Message)
    Write-Host "! " -ForegroundColor $Yellow -NoNewline
    Write-Host $Message
}

# Header
Write-Host ""
Write-Host "================================"
Write-Host "📦 APP Trainer - Setup (Windows)"
Write-Host "================================"
Write-Host ""

# Diretórios
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$AppDir = Join-Path $ScriptDir "app-trainer-java-web" "app-trainer-java-web"

# 1. Check Java
if (-not $SkipJava) {
    Write-Host "Checking Java..."
    try {
        $JavaVersion = java -version 2>&1 | Select-String "version"
        Write-Step "Java encontrado: $JavaVersion"
    } catch {
        Write-Error-Step "Java não encontrado. Instale Java 17+"
        exit 1
    }
}

# 2. Create directories
Write-Host ""
Write-Host "Creating directories..."
$Dirs = @("lib", "logs", "bin")
foreach ($Dir in $Dirs) {
    $Path = Join-Path $AppDir $Dir
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
    }
}
Write-Step "Diretórios criados"

# 3. Download JDBC Driver
Write-Host ""
Write-Host "PostgreSQL JDBC Driver..."
$DriverPath = Join-Path $AppDir "lib" "postgresql.jar"

if (-not (Test-Path $DriverPath)) {
    Write-Step "Fazendo download de postgresql-42.7.1.jar..."
    try {
        $Url = "https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.1/postgresql-42.7.1.jar"
        Invoke-WebRequest -Uri $Url -OutFile $DriverPath -ErrorAction Stop
        Write-Step "PostgreSQL JDBC Driver instalado"
    } catch {
        Write-Error-Step "Erro ao fazer download"
        Write-Host "Tente manualmente:"
        Write-Host "  Invoke-WebRequest -Uri 'https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.1/postgresql-42.7.1.jar' -OutFile '$(Split-Path $DriverPath -Leaf)'"
        exit 1
    }
} else {
    Write-Step "PostgreSQL JDBC Driver já existe"
}

# 4. Compile Java
if (-not $SkipCompile) {
    Write-Host ""
    Write-Host "Compiling Java files..."
    
    Push-Location $AppDir
    
    # Remove old bin
    if (Test-Path "bin") {
        Remove-Item "bin" -Recurse -Force -ErrorAction SilentlyContinue
    }
    New-Item -ItemType Directory -Path "bin" | Out-Null
    
    # Get Java files
    $JavaFiles = Get-ChildItem -Recurse src -Filter "*.java"
    Write-Step "Compilando $($JavaFiles.Count) arquivos Java..."
    
    # Compile
    $CompileOutput = @()
    $CompileOutput += javac -encoding UTF-8 --release 17 -d bin -cp "lib/postgresql.jar" $JavaFiles.FullName 2>&1
    
    # Check for errors
    $Errors = $CompileOutput | Select-String "error"
    if ($Errors) {
        Write-Error-Step "Erros de compilação detectados:"
        $Errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
        exit 1
    } else {
        Write-Step "Compilação bem-sucedida"
    }
    
    Pop-Location
}

# 5. PostgreSQL Instructions
Write-Host ""
Write-Host "PostgreSQL Setup Instructions:"
Write-Host "=============================="
Write-Host ""
Write-Host "1. Instalar PostgreSQL:"
Write-Host "   Download: https://www.postgresql.org/download/windows/"
Write-Host "   ou via Chocolatey: choco install postgresql"
Write-Host ""
Write-Host "2. Executar PostgreSQL CLI:"
Write-Host "   psql -U postgres"
Write-Host ""
Write-Host "3. Executar comandos SQL:"
Write-Host "   CREATE USER app_trainer WITH PASSWORD 'app_trainer_secure_password';"
Write-Host "   CREATE DATABASE app_trainer_db OWNER app_trainer;"
Write-Host "   GRANT ALL PRIVILEGES ON DATABASE app_trainer_db TO app_trainer;"
Write-Host "   \c app_trainer_db"
Write-Host ""

# 6. Create .env.example
Write-Host ""
Write-Host "Creating .env.example..."

$EnvContent = @"
# Database
DB_URL=jdbc:postgresql://localhost:5432/app_trainer_db
DB_USER=app_trainer
DB_PASSWORD=app_trainer_secure_password

# Server
PORT=8081

# Logging
LOG_LEVEL=INFO
LOG_DIR=logs
"@

$EnvPath = Join-Path $AppDir ".env.example"
Set-Content -Path $EnvPath -Value $EnvContent
Write-Step ".env.example criado (renomear para .env em produção)"

# 7. Summary
Write-Host ""
Write-Host "==========================================="
Write-Host "✓ Setup concluído com sucesso!"
Write-Host "==========================================="
Write-Host ""
Write-Host "Próximos passos:"
Write-Host "1. Instalar PostgreSQL (se não tiver)"
Write-Host "2. Criar database e user (ver instruções acima)"
Write-Host "3. Executar o servidor:"
Write-Host ""
Write-Host "   cd 'app-trainer-java-web\app-trainer-java-web'"
Write-Host "   java -cp 'bin;lib\postgresql.jar' WebServer"
Write-Host ""
Write-Host "4. Acessar em http://localhost:8081"
Write-Host ""
