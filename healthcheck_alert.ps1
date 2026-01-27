# healthcheck_alert.ps1
# Envia alerta por e-mail se algum serviço falhar no healthcheck

param(
    [string]$EmailTo = "suporte@empresa.com"
)

$scriptPath = Join-Path $PSScriptRoot "healthcheck_all.ps1"
$logPath = Join-Path $PSScriptRoot "healthcheck_last.log"

# Executa healthcheck e salva saída
powershell -File $scriptPath | Tee-Object -FilePath $logPath

# Verifica falhas
$log = Get-Content $logPath
$fail = $log | Select-String -Pattern "FALHOU"

if ($fail) {
    $body = "Falha detectada no healthcheck:\n\n" + ($fail | ForEach-Object { $_.Line }) -join "\n"
    $subject = "[ALERTA] Falha no Healthcheck App-1.0"
    $smtp = "smtp.seudominio.com"
    $from = "monitor@empresa.com"
    try {
        Send-MailMessage -To $EmailTo -From $from -Subject $subject -Body $body -SmtpServer $smtp
        Write-Host "Alerta enviado para $EmailTo" -ForegroundColor Yellow
    } catch {
        Write-Host "Falha ao enviar alerta por e-mail" -ForegroundColor Red
    }
} else {
    Write-Host "Todos serviços OK. Nenhum alerta enviado." -ForegroundColor Green
}
