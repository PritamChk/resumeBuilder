#!/bin/bash
# Resume Builder - Start Script (Shell)
# Starts both backend and frontend servers based on README instructions

echo -e "\033[32mStarting Resume Builder...\033[0m"
echo ""

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Kill any existing processes
echo -e "\033[36mCleaning up any existing processes...\033[0m"
pkill -f "python.*uvicorn" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true
sleep 1

# Start Backend (FastAPI on port 8000)
echo -e "\033[32mStarting Backend (FastAPI)...\033[0m"
(
    cd "$PROJECT_ROOT/backend"
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    uvicorn main:app --reload
) &
BACKEND_PID=$!
sleep 3

# Start Frontend (Next.js on port 3000)
echo -e "\033[32mStarting Frontend (Next.js)...\033[0m"
(
    cd "$PROJECT_ROOT/frontend"
    npm install
    npm run dev
) &
FRONTEND_PID=$!

echo ""
echo -e "\033[32m✓ Resume Builder is starting...\033[0m"
echo -e "\033[36m  Backend:  http://localhost:8000 (Swagger: http://localhost:8000/docs)\033[0m"
echo -e "\033[36m  Frontend: http://localhost:3000\033[0m"
echo ""
echo -e "\033[33mBackground processes:\033[0m"
echo "  Backend PID:  $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo ""
echo -e "\033[33mTo stop, run: ./stop.sh\033[0m"
