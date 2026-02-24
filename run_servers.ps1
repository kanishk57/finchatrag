# Start Backend and Frontend for FinChat RAG

$currentDir = Get-Location

Write-Host "Starting Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\python main.py"

Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Servers are starting up. Please wait a few seconds..." -ForegroundColor Yellow
Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:3000"
