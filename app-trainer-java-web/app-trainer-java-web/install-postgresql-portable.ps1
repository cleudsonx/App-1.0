# PostgreSQL Portable - Instalação Rápida sem Docker
# Usa versão portable que não requer instalação no sistema
# Data: 2026-01-21

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   PostgreSQL Portable - Instalação Simplificada   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$baseDir = $PSScriptRoot
$pgDir = Join-Path $baseDir "postgresql-portable"
$dataDir = Join-Path $pgDir "data"
$binDir = Join-Path $pgDir "bin"

# Verificar se já existe instalação
if (Test-Path $pgDir) {
    Write-Host "✅ PostgreSQL Portable já existe em: $pgDir`n" -ForegroundColor Green
    $response = Read-Host "Deseja reinstalar? (S/N)"
    if ($response -ne "S" -and $response -ne "s") {
        Write-Host "`nUsando instalação existente...`n" -ForegroundColor Yellow
        goto :ConfigureAndStart
    }
    Write-Host "`nRemovendo instalação antiga...`n" -ForegroundColor Yellow
    Remove-Item -Path $pgDir -Recurse -Force -ErrorAction SilentlyContinue
}

# Download PostgreSQL Portable (binaries)
Write-Host "📥 Baixando PostgreSQL 16 (portable)...`n" -ForegroundColor Cyan

# Vamos usar uma abordagem diferente: criar estrutura local e usar JDBC diretamente
# Para desenvolvimento, vamos focar em ter o JDBC driver e usar H2 como alternativa temporária

Write-Host "ℹ️  Para desenvolvimento local sem Docker/instalação, temos 2 opções:`n" -ForegroundColor Cyan

Write-Host "OPÇÃO A - PostgreSQL Online (ElephantSQL - Gratuito)" -ForegroundColor Yellow
Write-Host "  • Sem instalação local" -ForegroundColor Gray
Write-Host "  • 20MB grátis" -ForegroundColor Gray
Write-Host "  • Pronto em 1 minuto" -ForegroundColor Gray
Write-Host "  • URL: https://www.elephantsql.com/`n" -ForegroundColor Cyan

Write-Host "OPÇÃO B - H2 Database (Embedded)" -ForegroundColor Yellow
Write-Host "  • Banco de dados Java embarcado" -ForegroundColor Gray
Write-Host "  • Zero configuração" -ForegroundColor Gray
Write-Host "  • Compatível com PostgreSQL" -ForegroundColor Gray
Write-Host "  • Perfeito para desenvolvimento`n" -ForegroundColor Gray

Write-Host "OPÇÃO C - Instalar PostgreSQL Manualmente" -ForegroundColor Yellow
Write-Host "  • Download: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
Write-Host "  • Execute o instalador EDB" -ForegroundColor Gray
Write-Host "  • Depois execute: .\setup-database.ps1`n" -ForegroundColor Gray

$choice = Read-Host "Escolha uma opção (A/B/C)"

if ($choice -eq "B" -or $choice -eq "b") {
    Write-Host "`n🔧 Configurando H2 Database...`n" -ForegroundColor Cyan
    
    # Download H2
    $h2Version = "2.2.224"
    $h2Url = "https://repo1.maven.org/maven2/com/h2database/h2/$h2Version/h2-$h2Version.jar"
    $h2Path = Join-Path $baseDir "lib\h2-$h2Version.jar"
    
    New-Item -ItemType Directory -Path (Join-Path $baseDir "lib") -Force | Out-Null
    
    try {
        Write-Host "Baixando H2 Database..." -ForegroundColor Gray
        Invoke-WebRequest -Uri $h2Url -OutFile $h2Path -UseBasicParsing
        Write-Host "✅ H2 Database baixado: lib\h2-$h2Version.jar`n" -ForegroundColor Green
        
        # Configurar variáveis para H2
        $dbUrl = "jdbc:h2:./data/app_trainer;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH"
        $dbUser = "sa"
        $dbPassword = ""
        
        [Environment]::SetEnvironmentVariable("DB_URL", $dbUrl, "User")
        [Environment]::SetEnvironmentVariable("DB_USER", $dbUser, "User")
        [Environment]::SetEnvironmentVariable("DB_PASSWORD", $dbPassword, "User")
        
        $env:DB_URL = $dbUrl
        $env:DB_USER = $dbUser
        $env:DB_PASSWORD = $dbPassword
        
        Write-Host "✅ H2 Database configurado!`n" -ForegroundColor Green
        Write-Host "Variáveis de ambiente:" -ForegroundColor Cyan
        Write-Host "  DB_URL      = $dbUrl" -ForegroundColor Gray
        Write-Host "  DB_USER     = $dbUser" -ForegroundColor Gray
        Write-Host "  DB_PASSWORD = (vazio)`n" -ForegroundColor Gray
        
        Write-Host "📝 Para usar H2, compile com:" -ForegroundColor Cyan
        Write-Host "  javac -cp lib\h2-$h2Version.jar;bin -encoding UTF-8 --release 17 -d bin (Get-ChildItem src -Include *.java -Recurse).FullName`n" -ForegroundColor Gray
        
        Write-Host "🚀 Execute com:" -ForegroundColor Cyan
        Write-Host "  java -cp lib\h2-$h2Version.jar;bin WebServer`n" -ForegroundColor Gray
        
        Write-Host "⚠️  NOTA: Ajuste ConnectionPool.java para aceitar H2 URLs`n" -ForegroundColor Yellow
        
    } catch {
        Write-Host "❌ Erro no download: $_`n" -ForegroundColor Red
    }
    
} elseif ($choice -eq "A" -or $choice -eq "a") {
    Write-Host "`n🌐 Configurando ElephantSQL...`n" -ForegroundColor Cyan
    Write-Host "1. Acesse: https://www.elephantsql.com/" -ForegroundColor White
    Write-Host "2. Crie conta gratuita" -ForegroundColor White
    Write-Host "3. Crie nova instância (plan: Tiny Turtle - Free)" -ForegroundColor White
    Write-Host "4. Copie a URL de conexão (algo como: postgres://user:pass@server.db.elephantsql.com/dbname)`n" -ForegroundColor White
    
    $elephantUrl = Read-Host "Cole a URL do ElephantSQL aqui (ou Enter para pular)"
    
    if ($elephantUrl) {
        # Converter URL do formato postgres:// para jdbc:postgresql://
        $jdbcUrl = $elephantUrl -replace "postgres://", "jdbc:postgresql://"
        
        # Extrair user e password da URL
        if ($elephantUrl -match "postgres://([^:]+):([^@]+)@") {
            $dbUser = $matches[1]
            $dbPassword = $matches[2]
            
            [Environment]::SetEnvironmentVariable("DB_URL", $jdbcUrl, "User")
            [Environment]::SetEnvironmentVariable("DB_USER", $dbUser, "User")
            [Environment]::SetEnvironmentVariable("DB_PASSWORD", $dbPassword, "User")
            
            $env:DB_URL = $jdbcUrl
            $env:DB_USER = $dbUser
            $env:DB_PASSWORD = $dbPassword
            
            Write-Host "`n✅ ElephantSQL configurado!`n" -ForegroundColor Green
            Write-Host "Variáveis de ambiente salvas." -ForegroundColor Gray
            Write-Host "`nAgora execute o schema.sql no painel web do ElephantSQL.`n" -ForegroundColor Yellow
        }
    }
    
} else {
    Write-Host "`nℹ️  Instale PostgreSQL manualmente e execute .\setup-database.ps1`n" -ForegroundColor Cyan
}

Write-Host "Pressione Enter para continuar..." -ForegroundColor Gray
Read-Host
