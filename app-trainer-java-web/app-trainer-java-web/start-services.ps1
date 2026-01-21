# Script Simples para Iniciar Serviços
# Data: 21/01/2026

Write-Host "`n=== Iniciando Serviços ===" -ForegroundColor Cyan

# Segurança: exigir JWT_SECRET_KEY definida antes de subir serviços
if (-not $env:JWT_SECRET_KEY -or [string]::IsNullOrWhiteSpace($env:JWT_SECRET_KEY)) {
    Write-Host "[ERRO] JWT_SECRET_KEY não configurada. Defina uma chave forte em variável de ambiente antes de iniciar." -ForegroundColor Red
    Write-Host "Exemplo: $env:JWT_SECRET_KEY = 'sua-chave-super-segura'" -ForegroundColor Yellow
    exit 1
}

# 1. Iniciar PostgreSQL
Write-Host "`n[1/4] Iniciando PostgreSQL Docker..." -ForegroundColor Yellow
& ".\install-postgresql-docker.ps1"
Start-Sleep -Seconds 5

# 2. Verificar se compilação existe
Write-Host "`n[2/4] Verificando compilação Java..." -ForegroundColor Yellow
if (!(Test-Path "bin\WebServer.class")) {
    Write-Host "Compilando código Java..." -ForegroundColor Yellow
    $files = Get-ChildItem -Path src -Include *.java -Recurse | ForEach-Object { $_.FullName }
    javac -encoding UTF-8 --release 17 -d bin $files
}
Write-Host "OK" -ForegroundColor Green

# 3. Iniciar Java Backend
Write-Host "`n[3/4] Iniciando Java Backend (porta 8081)..." -ForegroundColor Yellow
$env:DB_URL = "jdbc:postgresql://localhost:5432/app_trainer"
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "postgres123"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; java -cp 'bin;lib/*' WebServer" -WindowStyle Minimized

# 4. Iniciar Python ML Service
Write-Host "`n[4/4] Iniciando Python ML Service (porta 8001)..." -ForegroundColor Yellow
$mlServicePath = "..\..\ml-service"
if (Test-Path $mlServicePath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$mlServicePath'; python main.py" -WindowStyle Minimized
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "AVISO: ML Service não encontrado em $mlServicePath" -ForegroundColor Yellow
}

Write-Host "`n=== Aguardando estabilização (10 segundos) ===" -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host "`n=== Status dos Serviços ===" -ForegroundColor Green
Write-Host "✅ PostgreSQL: docker ps | findstr postgres" -ForegroundColor White
docker ps | findstr postgres

Write-Host "`n✅ Java Backend (8081): netstat -ano | findstr :8081" -ForegroundColor White
netstat -ano | findstr ":8081"

Write-Host "`n✅ Python ML (8001): netstat -ano | findstr :8001" -ForegroundColor White
netstat -ano | findstr ":8001"

Write-Host "`n=== Serviços Iniciados ===" -ForegroundColor Green
Write-Host "Para testar: Invoke-WebRequest -Uri http://localhost:8081/auth/login -Method POST -Body '{\"email\":\"teste@example.com\",\"senha\":\"Senha@123\"}' -ContentType 'application/json'" -ForegroundColor Gray
