# healthcheck_all.ps1
# Executa healthcheck dos serviços Java, Python e PostgreSQL

$javaUrl = $env:JAVA_HEALTH_URL
$pythonUrl = $env:PYTHON_HEALTH_URL
$dbHost = $env:DB_HOST
$dbPort = $env:DB_PORT
$dbUser = $env:DB_USER
$dbName = $env:DB_NAME

if (-not $javaUrl) { $javaUrl = "http://localhost:8081/api/health" }
if (-not $pythonUrl) { $pythonUrl = "http://localhost:8001/api/health" }
if (-not $dbHost) { $dbHost = "localhost" }
if (-not $dbPort) { $dbPort = "5432" }
if (-not $dbUser) { $dbUser = "postgres" }
if (-not $dbName) { $dbName = "app_trainer" }

Write-Host "Testando backend Java..."
try {
    $respJava = Invoke-WebRequest -Uri $javaUrl -UseBasicParsing -TimeoutSec 5
    if ($respJava.StatusCode -eq 200) {
        Write-Host "Java OK" -ForegroundColor Green
    } else {
        Write-Host "Java FALHOU ($($respJava.StatusCode))" -ForegroundColor Red
    }
} catch { Write-Host "Java FALHOU" -ForegroundColor Red }

Write-Host "Testando backend Python..."
try {
    $respPy = Invoke-WebRequest -Uri $pythonUrl -UseBasicParsing -TimeoutSec 5
    if ($respPy.StatusCode -eq 200) {
        Write-Host "Python OK" -ForegroundColor Green
    } else {
        Write-Host "Python FALHOU ($($respPy.StatusCode))" -ForegroundColor Red
    }
} catch { Write-Host "Python FALHOU" -ForegroundColor Red }

Write-Host "Testando PostgreSQL..."
try {
    $connStr = "Host=$dbHost;Port=$dbPort;Username=$dbUser;Database=$dbName"
    $pgTest = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "SELECT 1;"
    if ($pgTest -like "*1 row*") {
        Write-Host "PostgreSQL OK" -ForegroundColor Green
    } else {
        Write-Host "PostgreSQL FALHOU" -ForegroundColor Red
    }
} catch { Write-Host "PostgreSQL FALHOU" -ForegroundColor Red }
