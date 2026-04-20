# Resume Builder - Start Script
# Starts both backend and frontend servers in separate terminal windows

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting Resume Builder..." -ForegroundColor Green

# Kill any processes on ports 8000 and 3000
Write-Host "Cleaning up ports 8000 and 3000..." -ForegroundColor Yellow
$null = netstat -ano | findstr ":8000 " | ForEach-Object {
    $pid = ($_ -split '\s+')[-1]
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
}
$null = netstat -ano | findstr ":3000 " | ForEach-Object {
    $pid = ($_ -split '\s+')[-1]
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2

# Start Backend in a new terminal window
Write-Host "Starting Backend (FastAPI on port 8000)..." -ForegroundColor Cyan
$backendPath = Join-Path $projectRoot "backend"
$backendCmd = "cd `"$backendPath`"; pip install -q -r requirements.txt; uvicorn main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Start-Sleep -Seconds 2

# Start Frontend in a new terminal window
Write-Host "Starting Frontend (Next.js on port 3000)..." -ForegroundColor Cyan
$frontendPath = Join-Path $projectRoot "frontend"
$frontendCmd = "cd `"$frontendPath`"; npm install -q; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Services started in separate windows:" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop: Run '.\stop.ps1' in a new terminal" -ForegroundColor Yellow
