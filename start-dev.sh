#!/bin/bash

# MediOracle AI - Startup Script for Development

echo "========================================="
echo "🏥 MediOracle AI - Starting Services"
echo "========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+."
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.10+."
    exit 1
fi

echo -e "${BLUE}✓ Prerequisites verified${NC}"

# Start Backend (Node.js)
echo -e "\n${BLUE}Starting Node.js Backend...${NC}"
cd backend
npm install > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
sleep 3

# Start FastAPI Backend (Python)
echo -e "\n${BLUE}Starting FastAPI Server...${NC}"
cd ../fastapi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt > /dev/null 2>&1

# Start FastAPI
python -m uvicorn main:app --reload --port 8000 &
FASTAPI_PID=$!
echo -e "${GREEN}✓ FastAPI started (PID: $FASTAPI_PID)${NC}"
sleep 3

# Start Frontend (React)
echo -e "\n${BLUE}Starting React Frontend...${NC}"
cd ../frontend
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
sleep 2

# Display service information
echo -e "\n========================================="
echo -e "${GREEN}✓ All services started!${NC}"
echo "========================================="
echo -e "\n📍 Service URLs:"
echo -e "  • Frontend:  ${BLUE}http://localhost:5173${NC}"
echo -e "  • Backend:   ${BLUE}http://localhost:5000${NC}"
echo -e "  • FastAPI:   ${BLUE}http://localhost:8000${NC}"
echo -e "  • API Docs:  ${BLUE}http://localhost:5000${NC}"
echo ""
echo -e "📝 Process IDs:"
echo -e "  • Backend:   $BACKEND_PID"
echo -e "  • FastAPI:   $FASTAPI_PID"
echo -e "  • Frontend:  $FRONTEND_PID"
echo ""
echo -e "⚠️  WARNING: This is an educational tool only!"
echo -e "              Always consult professional healthcare providers."
echo ""
echo -e "Press Ctrl+C to stop all services"
echo "========================================="

# Wait for all background processes
wait
