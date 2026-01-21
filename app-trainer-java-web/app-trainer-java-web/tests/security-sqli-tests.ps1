param(
    [string]$JavaUrl = "http://localhost:8081",
    [string]$DbContainer = "postgres-app-trainer",
    [string]$DbName = "app_trainer",
    [string]$DbUser = "postgres",
    [string]$DbPassword = "postgres123"
)

$ErrorActionPreference = "SilentlyContinue"
$script:fail = $false

function Assert-True($cond, $msg) {
    if ($cond) { Write-Host "[PASS] $msg" -ForegroundColor Green } else { Write-Host "[FAIL] $msg" -ForegroundColor Red; $script:fail = $true }
}

Write-Host "=== Security Tests: SQL Injection ===" -ForegroundColor Cyan

# 1) Login com payload de SQLi deve falhar (401)
try {
    $body = @{ email = "x' OR '1'='1"; senha = "qualquer" } | ConvertTo-Json
    $res = Invoke-WebRequest -Uri "$JavaUrl/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    Assert-True $false "Login com SQLi deve falhar (retornou $($res.StatusCode))"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Assert-True ($code -eq 401 -or $code -eq 400) "Login com SQLi rejeitado ($code)"
}

# 2) Registro com nome malicioso deve ser rejeitado (400)
$unique = [DateTime]::UtcNow.ToString('yyyyMMddHHmmss')
$maliciousName = "Robert'); DROP TABLE alunos;--"
$regBody = @{ email = "sqli+$unique@local.test"; senha = "SenhaForte@2026"; nome = $maliciousName } | ConvertTo-Json
try {
    $reg = Invoke-WebRequest -Uri "$JavaUrl/auth/registro" -Method POST -Body $regBody -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    # Se passou (201), ainda assim não deve quebrar o banco. Consideramos falha de validação esperada.
    Assert-True $false "Registro com input malicioso deveria ser 400 (recebido $($reg.StatusCode))"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Assert-True ($code -eq 400) "Registro com input malicioso rejeitado ($code)"
}

# 3) Listagem com filtros contendo SQLi não deve causar erro (esperado 200 ou 400)
try {
    $resp = Invoke-WebRequest -Uri "$JavaUrl/api/alunos?objetivo=hipertrofia'%20OR%20'1'%3D'1&nivel=iniciante" -Method GET -UseBasicParsing -ErrorAction Stop
    Assert-True ($resp.StatusCode -eq 200) "Lista alunos robusta contra SQLi (200)"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Assert-True ($code -eq 400) "Lista alunos rejeitou filtro inválido ($code)"
}

# 4) Integridade: tabelas ainda existem
try {
    $check = docker exec -e PGPASSWORD=$DbPassword $DbContainer psql -U $DbUser -d $DbName -t -c "SELECT 1 FROM alunos LIMIT 1;" | Out-String
    Assert-True ($LASTEXITCODE -eq 0) "Integridade: tabela alunos acessível"
} catch { Assert-True $false "Integridade: tabela alunos acessível" }

if ($script:fail) { Write-Host "=== Security Tests: FALHOU ===" -ForegroundColor Red; exit 1 } else { Write-Host "=== Security Tests: SUCESSO ===" -ForegroundColor Green; exit 0 }
