@echo off
REM MediOracle AI - Startup Script for Windows

echo =========================================
echo 🏥 MediOracle AI - Starting Services
echo =========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.10+.
    pause
    exit /b 1
)

echo ✓ Prerequisites verified

REM Start Backend (Node.js)
echo.
echo Starting Node.js Backend...
cd backend
call npm install >nul 2>&1
start "MediOracle Backend" cmd /k npm run dev
echo ✓ Backend started on http://localhost:5000
timeout /t 3 /nobreak

REM Start FastAPI Backend (Python)
echo.
echo Starting FastAPI Server...
cd ..\fastapi

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    python -m venv venv
)

REM Activate virtual environment and start server
call venv\Scripts\activate.bat
pip install -r requirements.txt >nul 2>&1
start "MediOracle FastAPI" cmd /k python -m uvicorn main:app --reload --port 8000
echo ✓ FastAPI started on http://localhost:8000
timeout /t 3 /nobreak

REM Start Frontend (React)
echo.
echo Starting React Frontend...
cd ..\frontend
call npm install >nul 2>&1
start "MediOracle Frontend" cmd /k npm run dev
echo ✓ Frontend started on http://localhost:5173
timeout /t 2 /nobreak

REM Display service information
echo.
echo =========================================
echo ✓ All services started!
echo =========================================
echo.
echo 📍 Service URLs:
echo   - Frontend:  http://localhost:5173
echo   - Backend:   http://localhost:5000
echo   - FastAPI:   http://localhost:8000
echo.
echo ⚠️  WARNING: This is an educational tool only!
echo              Always consult professional healthcare providers.
echo.
echo Services are running in separate windows.
echo Close individual windows to stop services.
echo =========================================
pause
