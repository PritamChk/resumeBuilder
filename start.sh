#!/bin/bash

# Resume Builder - Start Script
# Starts both backend and frontend servers

set -e

echo "🚀 Starting Resume Builder..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Start backend
echo -e "${BLUE}Starting backend (FastAPI)...${NC}"
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
echo "Waiting for backend to initialize..."
sleep 3

# Start frontend
echo -e "${BLUE}Starting frontend (Next.js)...${NC}"
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}✓ Resume Builder is running!${NC}"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for both processes
wait
