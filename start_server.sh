#!/bin/bash

echo "================================================"
echo "  MarketPulse Backend Server"
echo "================================================"
echo ""
echo "Starting server on http://localhost:8001"
echo ""
echo "To stop the server: Press Ctrl+C"
echo ""
echo "================================================"

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Activate virtual environment
source venv/bin/activate

# Start the server
echo "Starting uvicorn..."
echo ""
uvicorn app:app --host 127.0.0.1 --port 8001
