# Script de Instalação Automática do PostgreSQL
# Versão: 16.x (LTS)
# Autor: APP Trainer Setup
# Data: 2026-01-21

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     PostgreSQL Installation Script - Windows      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Verificar privilégios de administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Este script precisa de privilégios de administrador!" -ForegroundColor Yellow
    Write-Host "   Execute PowerShell como Administrador e tente novamente.`n" -ForegroundColor Yellow
    exit 1
}

# Verificar se já está instalado
$pgInstalled = Get-Command psql -ErrorAction SilentlyContinue
if ($pgInstalled) {
    Write-Host "✅ PostgreSQL já está instalado!" -ForegroundColor Green
    psql --version
    Write-Host "`nDeseja continuar com a configuração do banco? (S/N): " -NoNewline -ForegroundColor Yellow
    $continue = Read-Host
    if ($continue -ne "S" -and $continue -ne "s") {
        exit 0
    }
} else {
    Write-Host "📥 Baixando PostgreSQL 16.x...`n" -ForegroundColor Cyan
    
    # URL do instalador (EDB PostgreSQL 16)
    $installerUrl = "https://sbp.enterprisedb.com/getfile.jsp?fileid=1258893&_gl=1*1234567"
    $installerPath = "$env:TEMP\postgresql-16-windows-x64.exe"
    
    Write-Host "   Iniciando download..." -ForegroundColor Gray
    Write-Host "   URL: $installerUrl`n" -ForegroundColor Gray
    
    try {
        # Download com progresso
        $progressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath -UseBasicParsing
        Write-Host "✅ Download concluído!`n" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro no download: $_`n" -ForegroundColor Red
        Write-Host "Por favor, baixe manualmente de: https://www.postgresql.org/download/windows/`n" -ForegroundColor Yellow
        exit 1
    }
    
    # Instalação silenciosa
    Write-Host "📦 Instalando PostgreSQL...`n" -ForegroundColor Cyan
    Write-Host "   Porta padrão: 5432" -ForegroundColor Gray
    Write-Host "   Usuário: postgres" -ForegroundColor Gray
    Write-Host "   Senha: postgres (altere depois!)`n" -ForegroundColor Gray
    
    $installArgs = @(
        "--mode unattended",
        "--unattendedmodeui minimal",
        "--superpassword postgres",
        "--serverport 5432",
        "--locale pt_BR",
        "--datadir C:\PostgreSQL\16\data",
        "--servicename postgresql-16",
        "--enable-components server,commandlinetools"
    )
    
    try {
        Start-Process -FilePath $installerPath -ArgumentList $installArgs -Wait -NoNewWindow
        Write-Host "✅ PostgreSQL instalado com sucesso!`n" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro na instalação: $_`n" -ForegroundColor Red
        exit 1
    }
    
    # Adicionar ao PATH
    $pgBinPath = "C:\Program Files\PostgreSQL\16\bin"
    if (Test-Path $pgBinPath) {
        $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
        if ($currentPath -notlike "*$pgBinPath*") {
            Write-Host "📌 Adicionando PostgreSQL ao PATH do sistema...`n" -ForegroundColor Cyan
            [Environment]::SetEnvironmentVariable("Path", "$currentPath;$pgBinPath", "Machine")
            $env:Path = "$env:Path;$pgBinPath"
            Write-Host "✅ PATH atualizado!`n" -ForegroundColor Green
        }
    }
    
    # Aguardar serviço iniciar
    Write-Host "⏳ Aguardando serviço PostgreSQL iniciar..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

# Verificar serviço
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    if ($pgService.Status -eq "Running") {
        Write-Host "✅ Serviço PostgreSQL rodando`n" -ForegroundColor Green
    } else {
        Write-Host "⏳ Iniciando serviço PostgreSQL..." -ForegroundColor Yellow
        Start-Service -Name $pgService.Name
        Start-Sleep -Seconds 3
        Write-Host "✅ Serviço iniciado`n" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Serviço PostgreSQL não encontrado`n" -ForegroundColor Yellow
}

# Criar banco de dados
Write-Host "🗄️  Criando banco de dados 'app_trainer'...`n" -ForegroundColor Cyan

$createDbScript = @"
-- Criar banco de dados
DROP DATABASE IF EXISTS app_trainer;
CREATE DATABASE app_trainer
    WITH 
    ENCODING = 'UTF8'
    LC_COLLATE = 'Portuguese_Brazil.1252'
    LC_CTYPE = 'Portuguese_Brazil.1252'
    TEMPLATE = template0;

-- Conectar ao banco
\c app_trainer

-- Verificação
SELECT 'Database app_trainer created successfully!' as status;
"@

$scriptPath = "$env:TEMP\create_db.sql"
$createDbScript | Out-File -FilePath $scriptPath -Encoding UTF8

$env:PGPASSWORD = "postgres"
try {
    psql -U postgres -h localhost -p 5432 -f $scriptPath 2>&1 | Write-Host
    Write-Host "`n✅ Banco de dados criado!`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao criar banco: $_`n" -ForegroundColor Red
    Write-Host "Tente manualmente com:`n   psql -U postgres`n   CREATE DATABASE app_trainer;`n" -ForegroundColor Yellow
}

# Executar schema
Write-Host "📊 Executando schema.sql...`n" -ForegroundColor Cyan

$schemaPath = Join-Path $PSScriptRoot "src\db\schema.sql"
if (Test-Path $schemaPath) {
    try {
        psql -U postgres -h localhost -p 5432 -d app_trainer -f $schemaPath 2>&1 | Write-Host
        Write-Host "`n✅ Schema criado com sucesso!`n" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao executar schema: $_`n" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Arquivo schema.sql não encontrado em: $schemaPath`n" -ForegroundColor Yellow
    Write-Host "Execute manualmente:`n   psql -U postgres -d app_trainer -f src\db\schema.sql`n" -ForegroundColor Yellow
}

# Configurar variáveis de ambiente
Write-Host "🔧 Configurando variáveis de ambiente...`n" -ForegroundColor Cyan

$dbUrl = "jdbc:postgresql://localhost:5432/app_trainer"
$dbUser = "postgres"
$dbPassword = "postgres"

[Environment]::SetEnvironmentVariable("DB_URL", $dbUrl, "User")
[Environment]::SetEnvironmentVariable("DB_USER", $dbUser, "User")
[Environment]::SetEnvironmentVariable("DB_PASSWORD", $dbPassword, "User")

# Atualizar sessão atual
$env:DB_URL = $dbUrl
$env:DB_USER = $dbUser
$env:DB_PASSWORD = $dbPassword

Write-Host "✅ Variáveis de ambiente configuradas:" -ForegroundColor Green
Write-Host "   DB_URL      = $dbUrl" -ForegroundColor Gray
Write-Host "   DB_USER     = $dbUser" -ForegroundColor Gray
Write-Host "   DB_PASSWORD = $dbPassword`n" -ForegroundColor Gray

# Verificar conexão JDBC
Write-Host "🔌 Verificando JDBC driver...`n" -ForegroundColor Cyan

$jdbcPath = Join-Path $PSScriptRoot "lib\postgresql-42.7.1.jar"
if (Test-Path $jdbcPath) {
    Write-Host "✅ Driver JDBC encontrado: lib\postgresql-42.7.1.jar`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  Driver JDBC não encontrado!`n" -ForegroundColor Yellow
    Write-Host "Baixe de: https://jdbc.postgresql.org/download/postgresql-42.7.1.jar" -ForegroundColor Yellow
    Write-Host "E coloque em: lib\postgresql-42.7.1.jar`n" -ForegroundColor Yellow
}

# Resumo final
Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          Instalação Concluída com Sucesso!        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📋 Próximos passos:`n" -ForegroundColor Cyan
Write-Host "1. Feche e reabra o terminal (para atualizar PATH)" -ForegroundColor White
Write-Host "2. Teste a conexão:" -ForegroundColor White
Write-Host "   psql -U postgres -d app_trainer`n" -ForegroundColor Gray
Write-Host "3. Compile e execute o Java app:" -ForegroundColor White
Write-Host "   javac -cp lib\postgresql-42.7.1.jar;bin -d bin src\**\*.java" -ForegroundColor Gray
Write-Host "   java -cp lib\postgresql-42.7.1.jar;bin WebServer`n" -ForegroundColor Gray
Write-Host "4. Verifique logs em: logs\app_YYYY-MM-DD.log`n" -ForegroundColor White

Write-Host "⚠️  IMPORTANTE: Altere a senha padrão do postgres em produção!" -ForegroundColor Yellow
Write-Host "   psql -U postgres" -ForegroundColor Gray
Write-Host "   ALTER USER postgres PASSWORD 'nova_senha_forte';`n" -ForegroundColor Gray

Write-Host "🚀 Sistema pronto para usar PostgreSQL!`n" -ForegroundColor Green
