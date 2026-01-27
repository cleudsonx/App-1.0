# healthcheck_schedule.ps1
# Agenda execução automática do healthcheck_all.ps1 a cada 5 minutos

$scriptPath = Join-Path $PSScriptRoot "healthcheck_alert.ps1"
$taskName = "AppHealthCheck"

# Remove tarefa existente se houver
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# Cria nova tarefa agendada
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration ([TimeSpan]::MaxValue)
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName $taskName -Description "Healthcheck automático dos serviços App-1.0" -User "$env:USERNAME" -RunLevel Highest

Write-Host "Healthcheck com alertas agendado a cada 5 minutos. Tarefa: $taskName" -ForegroundColor Green
