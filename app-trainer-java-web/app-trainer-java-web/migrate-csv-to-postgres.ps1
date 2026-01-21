param(
    [string]$DataDir = "./data",
    [string]$Container = "postgres-app-trainer",
    [string]$DbName = "app_trainer",
    [string]$DbUser = "postgres",
    [string]$DbPassword = "postgres123",
    [string]$TmpDir = "$env:TEMP"
)

$ErrorActionPreference = "Stop"

function Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Err($msg)  { Write-Host "[ERRO] $msg" -ForegroundColor Red }

$alunosSrc = Join-Path $DataDir "alunos.csv"
$profsSrc  = Join-Path $DataDir "professores.csv"

if (-not (Test-Path $alunosSrc)) { Err "Arquivo nao encontrado: $alunosSrc"; exit 1 }
if (-not (Test-Path $profsSrc))  { Err "Arquivo nao encontrado: $profsSrc"; exit 1 }

$alunosTmp = Join-Path $TmpDir "alunos_migrate.csv"
$profsTmp  = Join-Path $TmpDir "professores_migrate.csv"

Info "Gerando CSV temporario (sem coluna id)..."
Get-Content $alunosSrc | ForEach-Object {
    if ($_ -and $_.Trim()) {
        $cols = $_.Split(';')
        if ($cols.Length -ge 10) {
            # descartar id (col0) e manter: nome;idade;objetivo;nivel;peso;altura;restricoes;equipamentos;rpe
            $line = @($cols[1],$cols[2],$cols[3],$cols[4],$cols[5],$cols[6],$cols[7],$cols[8],$cols[9]) -join ';'
            $line
        }
    }
} | Set-Content -Path $alunosTmp -Encoding UTF8

Get-Content $profsSrc | ForEach-Object {
    if ($_ -and $_.Trim()) {
        $cols = $_.Split(';')
        if ($cols.Length -ge 3) {
            # descartar id (col0) e manter: nome;especialidade
            $line = @($cols[1],$cols[2]) -join ';'
            $line
        }
    }
} | Set-Content -Path $profsTmp -Encoding UTF8

Info "Copiando CSVs temporarios para o container..."
docker cp $alunosTmp "${Container}:/tmp/alunos_migrate.csv"
docker cp $profsTmp  "${Container}:/tmp/professores_migrate.csv"

Info "Truncando tabelas e importando..."
docker exec -e PGPASSWORD=$DbPassword $Container psql -U $DbUser -d $DbName -c "TRUNCATE TABLE alunos RESTART IDENTITY CASCADE;"
docker exec -e PGPASSWORD=$DbPassword $Container psql -U $DbUser -d $DbName -c "TRUNCATE TABLE professores RESTART IDENTITY CASCADE;"

docker exec -e PGPASSWORD=$DbPassword $Container psql -U $DbUser -d $DbName -c "COPY alunos (nome, idade, objetivo, nivel, peso_kg, altura_cm, restricoes, equipamentos, rpe) FROM '/tmp/alunos_migrate.csv' WITH (FORMAT csv, DELIMITER ';', NULL '', ENCODING 'UTF8');"
docker exec -e PGPASSWORD=$DbPassword $Container psql -U $DbUser -d $DbName -c "COPY professores (nome, especialidade) FROM '/tmp/professores_migrate.csv' WITH (FORMAT csv, DELIMITER ';', NULL '', ENCODING 'UTF8');"

Info "Migração concluida com sucesso."
