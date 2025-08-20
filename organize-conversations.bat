@echo off
REM Quick batch file to organize conversation exports
REM Calls the PowerShell script for full functionality

echo 🗂️ Organizing Conversation Exports to saved-conversations...
echo =====================================

powershell -ExecutionPolicy Bypass -File "%~dp0organize-conversations.ps1"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Organization complete! Check the saved-conversations folder.
) else (
    echo.
    echo ❌ Organization failed. Check the error messages above.
)

pause