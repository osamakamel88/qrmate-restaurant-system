@echo off
title QRMate License Generator
color 0A

echo ========================================================
echo   🔑  QRMate Egypt - Yearly Offline License Generator
echo ========================================================
echo.

set /p CLIENT_NAME="Enter Restaurant / Client Name (e.g. Cafe El-Nile): "
set /p MACHINE_ID="Enter Client Machine ID (or type ANY for universal): "
set /p DAYS_VALID="Enter Validity Days (Default 365): "
if "%DAYS_VALID%"=="" set DAYS_VALID=365
set /p MAX_TABLES="Enter Max Tables (Default 50): "
if "%MAX_TABLES%"=="" set MAX_TABLES=50

echo.
echo Generating cryptographic license...
echo.

node "%~dp0\issue-license.js" "%CLIENT_NAME%" "%MACHINE_ID%" "%DAYS_VALID%" "%MAX_TABLES%"

echo.
pause
