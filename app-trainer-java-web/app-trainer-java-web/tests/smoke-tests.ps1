param(
    [string]$JavaUrl = "http://localhost:8081",
    [string]$MlUrl = "http://localhost:8001",
    [string]$DbContainer = "postgres-app-trainer"
)

function Assert-True($cond, $msg) {
    if ($cond) { Write-Host "[PASS] $msg" -ForegroundColor Green } else { Write-Host "[FAIL] $msg" -ForegroundColor Red; $script:fail = $true }
}

$script:fail = $false
Write-Host "=== Smoke Tests: APP Trainer ===" -ForegroundColor Cyan

# 1) Portas ativas
$javaListening = (netstat -ano | findstr ":8081" | findstr "LISTENING").Length -gt 0
$mlListening = (netstat -ano | findstr ":8001" | findstr "LISTENING").Length -gt 0
Assert-True $javaListening "Java Backend escutando em 8081"
Assert-True $mlListening "Python ML escutando em 8001"

# 2) Docker Postgres
$pgRunning = (docker ps | findstr $DbContainer).Length -gt 0
Assert-True $pgRunning "PostgreSQL container em execução"

# 3) Auth registro/login
$regSuccess = $false
try {
    $reg = Invoke-WebRequest -Uri "$JavaUrl/auth/registro" -Method POST -Body '{"email":"smoke.test@local.com","senha":"SenhaForte@2026","nome":"Smoke Test"}' -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    $regSuccess = ($reg.StatusCode -eq 201)
} catch {
    # Se StatusCode for 409 (Conflict - usuário já existe), é sucesso
    $regSuccess = ($_.Exception.Response.StatusCode.value__ -eq 409)
}
Assert-True $regSuccess "Registro usuário"

try {
    Start-Sleep -Seconds 1
    $login = Invoke-WebRequest -Uri "$JavaUrl/auth/login" -Method POST -Body '{"email":"smoke.test@local.com","senha":"SenhaForte@2026"}' -ContentType "application/json" -UseBasicParsing
    if ($login.StatusCode -eq 429) {
        # Possível rate limiting, tenta novamente
        Start-Sleep -Seconds 2
        $login = Invoke-WebRequest -Uri "$JavaUrl/auth/login" -Method POST -Body '{"email":"smoke.test@local.com","senha":"SenhaForte@2026"}' -ContentType "application/json" -UseBasicParsing
    }
    $loginJson = $login.Content | ConvertFrom-Json
    Assert-True ($login.StatusCode -eq 200 -and $loginJson.access_token) "Login retorna token"
} catch { Assert-True $false "Login retorna token" }

# 4) ML endpoints via Java Proxy
try {
    $coach = Invoke-WebRequest -Uri "$JavaUrl/ml/coach?q=como+fazer+supino&nome=Smoke&objetivo=hipertrofia&nivel=iniciante" -Method GET -UseBasicParsing
    Assert-True ($coach.StatusCode -eq 200) "ML Coach via Java"
} catch { Assert-True $false "ML Coach via Java" }

try {
    $suggest = Invoke-WebRequest -Uri "$JavaUrl/ml/suggest?objetivo=hipertrofia&nivel=intermediario&diasSemana=4" -Method GET -UseBasicParsing
    Assert-True ($suggest.StatusCode -eq 200) "ML Suggest via Java"
} catch { Assert-True $false "ML Suggest via Java" }

# 5) Confirmar persistência no Postgres
try {
    $count = docker exec -i $DbContainer psql -U postgres -d app_trainer -t -c "SELECT COUNT(*) FROM users;" | Out-String
    $parsed = [int]($count.Trim())
    Assert-True ($parsed -ge 1) "Users persistidos no PostgreSQL"
} catch { Assert-True $false "Users persistidos no PostgreSQL" }

if ($script:fail) { Write-Host "=== Smoke Tests: FALHOU ===" -ForegroundColor Red; exit 1 } else { Write-Host "=== Smoke Tests: SUCESSO ===" -ForegroundColor Green }
