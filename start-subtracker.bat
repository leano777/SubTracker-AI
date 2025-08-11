@echo off
title SubTracker AI - Starting Server
echo.
echo ==================================
echo    SubTracker AI - Starting...
echo ==================================
echo.
echo Stopping any existing processes...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

echo Starting SubTracker on port 4000 (CLEAN PORT)...
echo.
echo URLs:
echo   Primary: http://localhost:4000/
echo   Network: http://192.168.0.231:4000/
echo.
echo Email: mleano.business@gmail.com
echo.
echo Press Ctrl+C to stop the server
echo.

npx vite --host --port 4000
