# Resume Builder - Stop Script (PowerShell)
# Stops all running services

Write-Host "Stopping Resume Builder..." -ForegroundColor Yellow

# Kill backend on port 8000
Write-Host "Stopping backend on port 8000..."
Get-Process -Name python -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_.CommandLine -match "uvicorn") {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        Write-Host "Backend stopped" -ForegroundColor Green
    }
}

# Kill frontend on port 3000
Write-Host "Stopping frontend on port 3000..."
Get-Process -Name node -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_.CommandLine -match "next") {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        Write-Host "Frontend stopped" -ForegroundColor Green
    }
}

Write-Host "All services stopped" -ForegroundColor Green
