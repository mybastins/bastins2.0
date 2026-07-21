@echo off
echo.
echo ===============================================
echo    BASTINS E-Commerce Setup
echo ===============================================
echo.

REM Check if Node.js is installed
node --version > nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/2] Installing dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: Installation failed!
    pause
    exit /b 1
)
cd ..

echo.
echo [2/2] Environment setup...
if not exist frontend\.env (
    copy frontend\.env.example frontend\.env > nul
    echo Created frontend\.env — edit it with your MONGODB_URI and JWT_SECRET
)

echo.
echo ===============================================
echo    Setup Complete!
echo ===============================================
echo.
echo Next steps:
echo.
echo 1. Edit frontend\.env with your MongoDB Atlas connection string
echo 2. Run once to seed the database:
echo      cd frontend ^&^& npm run seed
echo.
echo To start the application (two terminals):
echo.
echo Terminal 1 - Start API:
echo   cd frontend
echo   npm run dev:api
echo.
echo Terminal 2 - Start Frontend:
echo   cd frontend
echo   npm run dev
echo.
echo Then open: http://localhost:3000
echo.
echo API runs on: http://localhost:5001
echo.
pause
