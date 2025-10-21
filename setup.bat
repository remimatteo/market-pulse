@echo off
echo =======================================
echo   MarketPulse Setup Script (Windows)
echo =======================================
echo.

echo [1/4] Setting up backend...
cd backend

echo Creating Python virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing Python dependencies...
pip install -r requirements.txt

echo Creating .env file from template...
if not exist .env (
    copy .env.example .env
    echo .env file created. Please configure if needed.
) else (
    echo .env file already exists.
)

cd ..

echo.
echo [2/4] Setting up frontend...
cd frontend

echo Installing Node dependencies...
call npm install

cd ..

echo.
echo [3/4] Creating data directory...
if not exist data mkdir data

echo.
echo [4/4] Setup complete!
echo.
echo =======================================
echo   Next Steps:
echo =======================================
echo.
echo 1. Start the backend:
echo    cd backend
echo    venv\Scripts\activate
echo    python -m uvicorn app.main:app --reload
echo.
echo 2. Start the frontend (in a new terminal):
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open http://localhost:3000 in your browser
echo.
echo =======================================

pause
