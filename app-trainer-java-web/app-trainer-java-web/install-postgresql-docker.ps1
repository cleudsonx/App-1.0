# Instalação Rápida do PostgreSQL via Docker
# Recomendado para desenvolvimento e testes
# Data: 2026-01-21

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    PostgreSQL Docker Setup - Instalação Rápida    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Verificar Docker
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerInstalled) {
    Write-Host "❌ Docker não está instalado!`n" -ForegroundColor Red
    Write-Host "📥 Baixe e instale Docker Desktop:" -ForegroundColor Yellow
    Write-Host "   https://www.docker.com/products/docker-desktop/`n" -ForegroundColor Cyan
    Write-Host "Após instalar, execute este script novamente.`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker encontrado!" -ForegroundColor Green
docker --version
Write-Host ""

# Parar container existente (se houver)
$existingContainer = docker ps -a --filter "name=postgres-app-trainer" --format "{{.Names}}" 2>$null
if ($existingContainer) {
    Write-Host "⚠️  Container 'postgres-app-trainer' já existe. Removendo...`n" -ForegroundColor Yellow
    docker stop postgres-app-trainer 2>&1 | Out-Null
    docker rm postgres-app-trainer 2>&1 | Out-Null
    Write-Host "✅ Container antigo removido`n" -ForegroundColor Green
}

# Criar e iniciar container PostgreSQL
Write-Host "🐳 Criando container PostgreSQL...`n" -ForegroundColor Cyan

$containerName = "postgres-app-trainer"
$pgPassword = "postgres123"
$pgDatabase = "app_trainer"
$pgPort = 5432

Write-Host "📋 Configurações:" -ForegroundColor Cyan
Write-Host "   Container: $containerName" -ForegroundColor Gray
Write-Host "   Database:  $pgDatabase" -ForegroundColor Gray
Write-Host "   User:      postgres" -ForegroundColor Gray
Write-Host "   Password:  $pgPassword" -ForegroundColor Gray
Write-Host "   Port:      $pgPort`n" -ForegroundColor Gray

try {
    docker run -d `
        --name $containerName `
        -e POSTGRES_PASSWORD=$pgPassword `
        -e POSTGRES_DB=$pgDatabase `
        -e POSTGRES_USER=postgres `
        -p "${pgPort}:5432" `
        -v postgres-app-trainer-data:/var/lib/postgresql/data `
        postgres:16-alpine
    
    Write-Host "✅ Container criado com sucesso!`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao criar container: $_`n" -ForegroundColor Red
    exit 1
}

# Aguardar container inicializar
Write-Host "⏳ Aguardando PostgreSQL inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verificar status
$containerStatus = docker ps --filter "name=$containerName" --format "{{.Status}}"
if ($containerStatus -like "*Up*") {
    Write-Host "✅ Container rodando: $containerStatus`n" -ForegroundColor Green
} else {
    Write-Host "❌ Container não está rodando`n" -ForegroundColor Red
    Write-Host "Verifique logs: docker logs $containerName`n" -ForegroundColor Yellow
    exit 1
}

# Executar schema.sql
Write-Host "📊 Executando schema.sql...`n" -ForegroundColor Cyan

$schemaPath = Join-Path $PSScriptRoot "src\db\schema.sql"
if (Test-Path $schemaPath) {
    try {
        # Copiar schema para container
        docker cp $schemaPath "${containerName}:/tmp/schema.sql"
        
        # Executar schema
        docker exec -i $containerName psql -U postgres -d $pgDatabase -f /tmp/schema.sql 2>&1 | Write-Host
        
        Write-Host "`n✅ Schema executado com sucesso!`n" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao executar schema: $_`n" -ForegroundColor Red
        Write-Host "Execute manualmente:`n" -ForegroundColor Yellow
        Write-Host "   docker exec -i $containerName psql -U postgres -d $pgDatabase -f /tmp/schema.sql`n" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️  Arquivo schema.sql não encontrado: $schemaPath`n" -ForegroundColor Yellow
}

# Configurar variáveis de ambiente
Write-Host "🔧 Configurando variáveis de ambiente...`n" -ForegroundColor Cyan

$dbUrl = "jdbc:postgresql://localhost:$pgPort/$pgDatabase"
$dbUser = "postgres"

[Environment]::SetEnvironmentVariable("DB_URL", $dbUrl, "User")
[Environment]::SetEnvironmentVariable("DB_USER", $dbUser, "User")
[Environment]::SetEnvironmentVariable("DB_PASSWORD", $pgPassword, "User")

# Atualizar sessão atual
$env:DB_URL = $dbUrl
$env:DB_USER = $dbUser
$env:DB_PASSWORD = $pgPassword

Write-Host "✅ Variáveis de ambiente configuradas:" -ForegroundColor Green
Write-Host "   DB_URL      = $dbUrl" -ForegroundColor Gray
Write-Host "   DB_USER     = $dbUser" -ForegroundColor Gray
Write-Host "   DB_PASSWORD = $pgPassword`n" -ForegroundColor Gray

# Verificar conexão
Write-Host "🔌 Testando conexão...`n" -ForegroundColor Cyan

try {
    $testQuery = docker exec -i $containerName psql -U postgres -d $pgDatabase -c "SELECT version();" 2>&1
    Write-Host $testQuery
    Write-Host "`n✅ Conexão bem-sucedida!`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao testar conexão: $_`n" -ForegroundColor Red
}

# Resumo final
Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║        PostgreSQL Docker - Pronto para Usar!      ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📋 Comandos úteis:`n" -ForegroundColor Cyan

Write-Host "Parar container:" -ForegroundColor White
Write-Host "   docker stop $containerName`n" -ForegroundColor Gray

Write-Host "Iniciar container:" -ForegroundColor White
Write-Host "   docker start $containerName`n" -ForegroundColor Gray

Write-Host "Acessar psql no container:" -ForegroundColor White
Write-Host "   docker exec -it $containerName psql -U postgres -d $pgDatabase`n" -ForegroundColor Gray

Write-Host "Ver logs do container:" -ForegroundColor White
Write-Host "   docker logs $containerName`n" -ForegroundColor Gray

Write-Host "Remover container (CUIDADO - apaga dados!):" -ForegroundColor White
Write-Host "   docker stop $containerName" -ForegroundColor Gray
Write-Host "   docker rm $containerName" -ForegroundColor Gray
Write-Host "   docker volume rm postgres-app-trainer-data`n" -ForegroundColor Gray

Write-Host "🚀 Próximos passos:`n" -ForegroundColor Cyan
Write-Host "1. Feche e reabra o terminal" -ForegroundColor White
Write-Host "2. Compile com JDBC driver:" -ForegroundColor White
Write-Host "   javac -cp lib\postgresql-42.7.1.jar;bin -encoding UTF-8 --release 17 -d bin (Get-ChildItem -Path src -Include *.java -Recurse).FullName" -ForegroundColor Gray
Write-Host "3. Execute o servidor:" -ForegroundColor White
Write-Host "   java -cp lib\postgresql-42.7.1.jar;bin WebServer`n" -ForegroundColor Gray

Write-Host "✅ Sistema pronto! PostgreSQL rodando em localhost:$pgPort`n" -ForegroundColor Green
