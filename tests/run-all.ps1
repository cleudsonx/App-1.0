# run-all.ps1 - Executa toda a suíte de testes (Smoke, Java, Pytest)
# Uso: cd APP-1.0; .\tests\run-all.ps1

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUITE DE TESTES COMPLETA - APP-1.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Get-Location
$appRoot = Join-Path $projectRoot "app-trainer-java-web\app-trainer-java-web"
$mlRoot = Join-Path $projectRoot "ml-service"
$parentRoot = Split-Path $projectRoot -Parent
$venvPath = Join-Path $parentRoot ".venv"

# 1. SMOKE TESTS (PowerShell)
Write-Host "1. Iniciando Smoke Tests..." -ForegroundColor Yellow
$smokePath = Join-Path $appRoot "tests\smoke-tests.ps1"
if (Test-Path $smokePath) {
    & $smokePath
    $smokeResult = $LASTEXITCODE
} else {
    Write-Host "[ERRO] Arquivo não encontrado: $smokePath" -ForegroundColor Red
    $smokeResult = 1
}
Write-Host ""

# 2. PYTHON PYTEST
Write-Host "2. Executando Pytest (ML Service)..." -ForegroundColor Yellow
$pythonExe = Join-Path $venvPath "Scripts\python.exe"

if (Test-Path $pythonExe) {
    try {
        Push-Location $mlRoot
        $output = & $pythonExe -m pytest -q 2>&1
        $pytestResult = if ($output -match "passed") { 0 } else { 1 }
        Write-Host $output
    }
    catch {
        Write-Host "[ERRO] Falha ao executar Pytest: $_" -ForegroundColor Red
        $pytestResult = 1
    }
    finally {
        Pop-Location
    }
} else {
    Write-Host "[ERRO] Python venv não encontrado: $venvPath" -ForegroundColor Red
    $pytestResult = 1
}
Write-Host ""

# 2. PYTHON PYTEST
Write-Host "2. Executando Pytest (ML Service)..." -ForegroundColor Yellow
$pythonExe = Join-Path $venvPath "Scripts\python.exe"

if (Test-Path $pythonExe) {
    try {
        Push-Location $mlRoot
        $output = & $pythonExe -m pytest -q 2>&1
        $pytestResult = if ($output -match "passed") { 0 } else { 1 }
        Write-Host $output
    }
    catch {
        Write-Host "[ERRO] Falha ao executar Pytest: $_" -ForegroundColor Red
        $pytestResult = 1
    }
    finally {
        Pop-Location
    }
} else {
    Write-Host "[ERRO] Python venv não encontrado: $venvPath" -ForegroundColor Red
    $pytestResult = 1
}
Write-Host ""

# RESUMO
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUMO DE TESTES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$smokeStatus = if ($smokeResult -eq 0) { "[PASS]" } else { "[FAIL]" }
$pytestStatus = if ($pytestResult -eq 0) { "[PASS]" } else { "[FAIL]" }

Write-Host "Smoke Tests:         $smokeStatus" -ForegroundColor $(if ($smokeResult -eq 0) { "Green" } else { "Red" })
Write-Host "Pytest (ML):         $pytestStatus" -ForegroundColor $(if ($pytestResult -eq 0) { "Green" } else { "Red" })
Write-Host ""

$totalFailed = @($smokeResult, $pytestResult) | Where-Object { $_ -ne 0 } | Measure-Object | Select-Object -ExpandProperty Count
if ($totalFailed -eq 0) {
    Write-Host "[PASS] TODOS OS TESTES PASSARAM!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "[FAIL] $totalFailed suite(s) falharam." -ForegroundColor Red
    exit 1
}
