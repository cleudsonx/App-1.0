# PostgreSQL via Docker (dev/test)
# Date: 2026-01-21

param(
    [string]$ContainerName = "postgres-app-trainer",
    [string]$Password = "postgres123",
    [string]$Database = "app_trainer",
    [int]$Port = 5432
)

Write-Host "`n=== PostgreSQL Docker Setup ===" -ForegroundColor Cyan

# 1) Docker check
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerInstalled) {
    Write-Host "[ERRO] Docker não está instalado." -ForegroundColor Red
    Write-Host "Instale Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# 2) Remove existing container
$existing = docker ps -a --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
if ($existing) {
    Write-Host "[INFO] Removendo container existente '$ContainerName'" -ForegroundColor Yellow
    docker stop $ContainerName 2>$null | Out-Null
    docker rm $ContainerName 2>$null | Out-Null
}

# 3) Create container
Write-Host "[INFO] Criando container Postgres..." -ForegroundColor Cyan
$dockerArgs = @(
    "run","-d",
    "--name", $ContainerName,
    "-e", "POSTGRES_PASSWORD=$Password",
    "-e", "POSTGRES_DB=$Database",
    "-e", "POSTGRES_USER=postgres",
    "-p", "$Port:5432",
    "-v", "${ContainerName}-data:/var/lib/postgresql/data",
    "postgres:16-alpine"
)
Write-Host "[DEBUG] docker $($dockerArgs -join ' ')" -ForegroundColor Gray
$runResult = docker @dockerArgs

if (-not $runResult) {
    Write-Host "[ERRO] Falha ao criar container." -ForegroundColor Red
    exit 1
}

# 4) Wait and check
Start-Sleep -Seconds 5
$status = docker ps --filter "name=$ContainerName" --format "{{.Status}}"
if ($status -notlike "*Up*") {
    Write-Host "[ERRO] Container não está rodando. Verifique logs: docker logs $ContainerName" -ForegroundColor Red
    exit 1
}

# 5) Run schema if present
$schemaPath = Join-Path $PSScriptRoot "src/db/schema.sql"
if (Test-Path $schemaPath) {
    Write-Host "[INFO] Aplicando schema.sql" -ForegroundColor Cyan
    docker cp $schemaPath "${ContainerName}:/tmp/schema.sql"
    docker exec -i $ContainerName psql -U postgres -d $Database -f /tmp/schema.sql
} else {
    Write-Host "[WARN] schema.sql não encontrado: $schemaPath" -ForegroundColor Yellow
}

# 6) Export env vars (User scope + session)
$dbUrl = "jdbc:postgresql://localhost:$Port/$Database"
[Environment]::SetEnvironmentVariable("DB_URL", $dbUrl, "User")
[Environment]::SetEnvironmentVariable("DB_USER", "postgres", "User")
[Environment]::SetEnvironmentVariable("DB_PASSWORD", $Password, "User")
$env:DB_URL = $dbUrl
$env:DB_USER = "postgres"
$env:DB_PASSWORD = $Password

Write-Host "[OK] Container: $ContainerName" -ForegroundColor Green
Write-Host "[OK] DB_URL=$dbUrl" -ForegroundColor Green
Write-Host "[OK] DB_USER=postgres" -ForegroundColor Green
Write-Host "[OK] DB_PASSWORD=$Password" -ForegroundColor Green

Write-Host "`nPara logs: docker logs $ContainerName" -ForegroundColor Gray
Write-Host "Para psql: docker exec -it $ContainerName psql -U postgres -d $Database" -ForegroundColor Gray
