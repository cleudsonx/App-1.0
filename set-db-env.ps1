# set-db-env.ps1
# Script para definir variáveis de ambiente do banco

$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_USER = "postgres"
$env:DB_NAME = "app_trainer"
Write-Host "Variáveis de ambiente do banco configuradas." -ForegroundColor Green
