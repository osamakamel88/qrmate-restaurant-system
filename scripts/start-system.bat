@echo off
title QRMate - On-Premises Restaurant & Cafe System (Egypt)
color 0E

echo ========================================================
echo   🍽️  QRMate - On-Premises Restaurant & Cafe System
echo   📍  Egypt Edition - 100% Local-First & Zero Cloud Risk
echo ========================================================
echo.

cd /d "%~dp0\..\server"

echo [1/2] Checking Server Environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this PC! Please install Node.js v18+ to proceed.
    pause
    exit /b
)

echo [2/2] Launching Local Server on Port 3001...
start "" http://localhost:3001/

node server.js

pause
