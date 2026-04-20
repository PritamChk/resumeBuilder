#!/bin/bash
# Resume Builder - Stop Script (Shell)
# Stops all running services based on README

echo -e "\033[33mStopping Resume Builder...\033[0m"
echo ""

STOPPED=false

# Kill all Node.js processes (Frontend)
echo -e "\033[36mStopping Node.js (Frontend)...\033[0m"
if pkill -f "node" 2>/dev/null; then
    echo -e "\033[32mNode.js stopped\033[0m"
    STOPPED=true
else
    echo -e "\033[90mNo Node.js processes found\033[0m"
fi

echo ""

# Kill all Python processes (Backend)
echo -e "\033[36mStopping Python (Backend)...\033[0m"
if pkill -f "python" 2>/dev/null; then
    echo -e "\033[32mPython stopped\033[0m"
    STOPPED=true
else
    echo -e "\033[90mNo Python processes found\033[0m"
fi

echo ""
if [ "$STOPPED" = true ]; then
    echo -e "\033[32m✓ Resume Builder stopped successfully\033[0m"
    echo -e "\033[32mRun './start.sh' to start again\033[0m"
else
    echo -e "\033[90mNo services were running\033[0m"
fi
echo ""
