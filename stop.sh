#!/bin/bash

# Resume Builder - Stop Script
# Stops all running services

echo "🛑 Stopping Resume Builder..."

# Kill processes on specific ports
# Backend on 8000
if lsof -Pi :8000 -sTCP:LISTEN -t > /dev/null ; then
    echo "Stopping backend on port 8000..."
    kill -9 $(lsof -Pi :8000 -sTCP:LISTEN -t) 2>/dev/null || true
    echo "✓ Backend stopped"
fi

# Frontend on 3000
if lsof -Pi :3000 -sTCP:LISTEN -t > /dev/null ; then
    echo "Stopping frontend on port 3000..."
    kill -9 $(lsof -Pi :3000 -sTCP:LISTEN -t) 2>/dev/null || true
    echo "✓ Frontend stopped"
fi

# Kill any remaining node and python processes
pkill -f "next dev" 2>/dev/null || true
pkill -f "uvicorn" 2>/dev/null || true

echo "✓ All services stopped"
