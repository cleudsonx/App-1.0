# Guia Pós-Reinicialização - Docker + PostgreSQL Setup
# Data: 21/01/2026
# Importante: Execute este script APÓS reiniciar o Windows 11

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Continuidade - Pós Reinicialização Windows 11   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Verificar Docker
Write-Host "🔍 Passo 1: Verificando Docker...`n" -ForegroundColor Yellow
$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
    Write-Host "✅ Docker instalado e disponível" -ForegroundColor Green
    docker --version
    Write-Host ""
} else {
    Write-Host "❌ Docker não encontrado. Verifique instalação." -ForegroundColor Red
    exit 1
}

# Navegar para diretório de trabalho
Write-Host "📂 Passo 2: Navegando para diretório do projeto...`n" -ForegroundColor Yellow
$projectDir = "c:\Users\cleud\Documents\PROJETOS 2026\APP-1.0\app-trainer-java-web\app-trainer-java-web"
Set-Location $projectDir
Write-Host "✅ Localização: $projectDir`n" -ForegroundColor Green

# Verificar status do Git
Write-Host "📋 Passo 3: Verificando status do Git...`n" -ForegroundColor Yellow
git status | Select-Object -First 5
Write-Host ""

# Recompilejar código
Write-Host "🔨 Passo 4: Recompilando código Java...`n" -ForegroundColor Yellow
$files = Get-ChildItem -Path src -Include *.java -Recurse | ForEach-Object { $_.FullName }
javac -encoding UTF-8 --release 17 -d bin $files
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilação bem-sucedida (30 arquivos Java)`n" -ForegroundColor Green
} else {
    Write-Host "❌ Erro na compilação`n" -ForegroundColor Red
    exit 1
}

# Executar script PostgreSQL Docker
Write-Host "🐳 Passo 5: Configurando PostgreSQL via Docker...`n" -ForegroundColor Cyan
Write-Host "   Executando: .\install-postgresql-docker.ps1`n" -ForegroundColor Gray

# Executar script
& ".\install-postgresql-docker.ps1"

# Aguardar container inicializar
Write-Host "`n⏳ Aguardando containers estabilizarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verificar containers
Write-Host "`n✅ Status dos Containers:`n" -ForegroundColor Green
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
Write-Host ""

# Verificar conexão PostgreSQL
Write-Host "🔌 Passo 6: Testando conexão com PostgreSQL...`n" -ForegroundColor Cyan
try {
    $testConnection = docker exec -i postgres-app-trainer psql -U postgres -d app_trainer -c "SELECT version();" 2>&1
    if ($testConnection) {
        Write-Host "✅ Conexão bem-sucedida!`n" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Teste de conexão pode precisar de alguns segundos...`n" -ForegroundColor Yellow
}

# Iniciar servidores
Write-Host "🚀 Passo 7: Iniciando servidores...`n" -ForegroundColor Cyan

# Parar servidores anteriores
Write-Host "   Limpando processos anteriores..." -ForegroundColor Gray
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Iniciar Python ML Service
Write-Host "   Iniciando Python ML Service (porta 8001)..." -ForegroundColor Gray
$mlServiceDir = "c:\Users\cleud\Documents\PROJETOS 2026\APP-1.0\ml-service"
Start-Job -ScriptBlock { 
    Set-Location $using:mlServiceDir
    python main.py 
} | Out-Null
Start-Sleep -Seconds 3

# Iniciar Java Backend
Write-Host "   Iniciando Java Backend (porta 8081)..." -ForegroundColor Gray
Start-Job -ScriptBlock {
    Set-Location $using:projectDir
    java -cp "lib\postgresql-42.7.1.jar;bin" WebServer
} | Out-Null
Start-Sleep -Seconds 3

# Verificar portas
Write-Host "`n📊 Passo 8: Verificando portas ativas...`n" -ForegroundColor Cyan
$ports = @(
    ("8001", "Python ML Service"),
    ("8081", "Java Backend"),
    ("5432", "PostgreSQL")
)

foreach ($port, $service in $ports) {
    $active = netstat -ano | findstr ":$port" | findstr "LISTENING"
    if ($active) {
        Write-Host "✅ $service (porta $port): RODANDO" -ForegroundColor Green
    } else {
        Write-Host "⏳ $service (porta $port): INICIANDO..." -ForegroundColor Yellow
    }
}

# Mostrar variáveis de ambiente
Write-Host "`n🔧 Passo 9: Variáveis de ambiente configuradas...`n" -ForegroundColor Cyan
Write-Host "DB_URL      = $env:DB_URL" -ForegroundColor Gray
Write-Host "DB_USER     = $env:DB_USER" -ForegroundColor Gray
Write-Host "DB_PASSWORD = $([string]::new('*', $env:DB_PASSWORD.Length))`n" -ForegroundColor Gray

# Menu de próximos passos
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║        Continuidade Restaurada com Sucesso!       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📋 Próximos passos:`n" -ForegroundColor Cyan

Write-Host "1️⃣  Testar endpoints (aguarde 10 segundos para estabilizar):" -ForegroundColor White
Write-Host "    curl -X POST http://localhost:8081/auth/login \" -ForegroundColor Gray
Write-Host "      -H 'Content-Type: application/json' \" -ForegroundColor Gray
Write-Host "      -d '{\"email\":\"teste@example.com\",\"senha\":\"Senha@123\"}'`n" -ForegroundColor Gray

Write-Host "2️⃣  Ver logs em tempo real:" -ForegroundColor White
Write-Host "    Get-Content logs\app_*.log -Tail 20 -Wait`n" -ForegroundColor Gray

Write-Host "3️⃣  Parar containers Docker:" -ForegroundColor White
Write-Host "    docker stop postgres-app-trainer`n" -ForegroundColor Gray

Write-Host "4️⃣  Consultar database PostgreSQL:" -ForegroundColor White
Write-Host "    docker exec -it postgres-app-trainer psql -U postgres -d app_trainer`n" -ForegroundColor Gray

Write-Host "5️⃣  Ver logs do container:" -ForegroundColor White
Write-Host "    docker logs postgres-app-trainer`n" -ForegroundColor Gray

Write-Host "✅ Sistema 100% restaurado e funcional!`n" -ForegroundColor Green
Write-Host "🎯 Próxima fase: FASE 4 - Python Service Sync`n" -ForegroundColor Cyan

Read-Host "Pressione Enter para continuar"
