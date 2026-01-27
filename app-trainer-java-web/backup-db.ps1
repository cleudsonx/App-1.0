# backup-db.ps1
# Script de backup automático do PostgreSQL
# Uso: .\backup-db.ps1

$env:PGPASSWORD = $env:DB_PASSWORD
$backupDir = "backup"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$dbName = $env:DB_NAME
$dbUser = $env:DB_USER
$dbHost = $env:DB_HOST
$dbPort = $env:DB_PORT

if (-not $dbName) { $dbName = "app_trainer" }
if (-not $dbUser) { $dbUser = "postgres" }
if (-not $dbHost) { $dbHost = "localhost" }
if (-not $dbPort) { $dbPort = "5432" }

if (!(Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir | Out-Null }

$backupFile = "$backupDir\$dbName-$timestamp.sql"

Write-Host "Iniciando backup do banco $dbName..."

pg_dump -h $dbHost -p $dbPort -U $dbUser -F p -b -v -f $backupFile $dbName

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup realizado com sucesso: $backupFile" -ForegroundColor Green
} else {
    Write-Host "Falha no backup!" -ForegroundColor Red
}
