# restore-db.ps1
# Restaura backup do banco PostgreSQL automaticamente

param(
    [string]$BackupFile = "backup-db.sql"
)

$dbHost = $env:DB_HOST
$dbPort = $env:DB_PORT
$dbUser = $env:DB_USER
$dbName = $env:DB_NAME

if (-not $dbHost) { $dbHost = "localhost" }
if (-not $dbPort) { $dbPort = "5432" }
if (-not $dbUser) { $dbUser = "postgres" }
if (-not $dbName) { $dbName = "app_trainer" }

Write-Host "Restaurando backup do banco: $BackupFile..."
try {
    psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $BackupFile
    Write-Host "Restore concluído com sucesso." -ForegroundColor Green
} catch {
    Write-Host "Falha ao restaurar backup." -ForegroundColor Red
}
