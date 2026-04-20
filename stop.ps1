# Resume Builder - Stop Script
# Kills all Resume Builder processes

Write-Host "🛑 Stopping Resume Builder..." -ForegroundColor Yellow

# Kill Python (Backend)
Write-Host "Stopping Backend (Python)..." -ForegroundColor Cyan
Get-Process -Name python -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

# Kill Node (Frontend)
Write-Host "Stopping Frontend (Node)..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

# Clear ports just to be sure
Write-Host "Clearing ports 8000 and 3000..." -ForegroundColor Cyan
$null = netstat -ano | findstr ":8000 " | ForEach-Object {
    $pid = ($_ -split '\s+')[-1]
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
}
$null = netstat -ano | findstr ":3000 " | ForEach-Object {
    $pid = ($_ -split '\s+')[-1]
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
}

Write-Host "✅ Resume Builder stopped." -ForegroundColor Green
