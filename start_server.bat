@echo off
echo ================================================
echo   MarketPulse Backend Server
echo ================================================
echo.
echo Starting server on http://localhost:8001
echo.
echo To stop the server: Press Ctrl+C
echo.
echo ================================================

cd /d "%~dp0backend"

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Start the server
echo Starting uvicorn...
echo.
uvicorn app:app --host 127.0.0.1 --port 8001

pause
