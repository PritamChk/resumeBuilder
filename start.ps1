# Resume Builder - Start Script (PowerShell)
# Starts both backend and frontend servers

Write-Host "Starting Resume Builder..." -ForegroundColor Green

# Start backend
Write-Host "Starting backend (FastAPI)..." -ForegroundColor Cyan
Push-Location backend
Start-Process -NoNewWindow -FilePath "python" -ArgumentList "-m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
Write-Host "Backend started on port 8000" -ForegroundColor Green

# Wait for backend to be ready
Write-Host "Waiting for backend to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend (Next.js)..." -ForegroundColor Cyan
Pop-Location
Push-Location frontend
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run dev"
Write-Host "Frontend started on port 3000" -ForegroundColor Green

Pop-Location

Write-Host ""
Write-Host "Resume Builder is running!" -ForegroundColor Green
Write-Host "Backend:  http://localhost:8000"
Write-Host "Frontend: http://localhost:3000"
Write-Host ""
Write-Host "Use stop.ps1 to stop all services" -ForegroundColor Yellow
Write-Host ""
