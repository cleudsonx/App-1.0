# monitoramento_recursos.ps1
# Script para monitorar CPU, RAM e disco e alertar se limites forem excedidos

param(
    [int]$CpuLimite = 90,
    [int]$MemLimite = 90,
    [int]$DiscoLimite = 90,
    [string]$EmailTo = "suporte@empresa.com"
)

# CPU
$cpu = (Get-Counter '\Processor(_Total)\% Processor Time' -SampleInterval 1 -MaxSamples 3).CounterSamples | Measure-Object -Property CookedValue -Average | Select-Object -ExpandProperty Average
$cpu = [math]::Round($cpu, 1)

# RAM
$mem = Get-WmiObject Win32_OperatingSystem
$memTotal = $mem.TotalVisibleMemorySize
$memLivre = $mem.FreePhysicalMemory
$memUso = 100 - [math]::Round(($memLivre / $memTotal) * 100, 1)

# Disco (C:)
$disco = Get-WmiObject Win32_LogicalDisk -Filter "DeviceID='C:'"
$discoLivre = $disco.FreeSpace
$discoTotal = $disco.Size
$discoUso = 100 - [math]::Round(($discoLivre / $discoTotal) * 100, 1)

$alertas = @()
if ($cpu -ge $CpuLimite) { $alertas += "CPU em $cpu%" }
if ($memUso -ge $MemLimite) { $alertas += "RAM em $memUso%" }
if ($discoUso -ge $DiscoLimite) { $alertas += "Disco C: em $discoUso%" }

if ($alertas.Count -gt 0) {
    $body = "Alerta de recursos no servidor:\n" + ($alertas -join ", ")
    $subject = "[ALERTA] Recursos críticos App-1.0"
    $smtp = "smtp.seudominio.com"
    $from = "monitor@empresa.com"
    try {
        Send-MailMessage -To $EmailTo -From $from -Subject $subject -Body $body -SmtpServer $smtp
        Write-Host "Alerta de recursos enviado para $EmailTo" -ForegroundColor Yellow
    } catch {
        Write-Host "Falha ao enviar alerta de recursos" -ForegroundColor Red
    }
} else {
    Write-Host "Recursos OK: CPU $cpu%, RAM $memUso%, Disco $discoUso%" -ForegroundColor Green
}
