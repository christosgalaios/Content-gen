@echo off
title Socialise Content Generator
cd /d "%~dp0"

echo.
echo   ================================
echo    Socialise Content Generator
echo   ================================
echo.
echo   1. Remotion Studio (preview videos)
echo   2. Pipeline Dashboard
echo   3. Full Pipeline (ingest to render)
echo   4. Dry Run (plan without rendering)
echo   5. Exit
echo.

set /p choice="  Pick an option: "

if "%choice%"=="1" (
    echo.
    echo   Starting Remotion Studio on http://localhost:3000 ...
    echo.
    npx remotion studio
) else if "%choice%"=="2" (
    echo.
    echo   Starting Dashboard on http://localhost:3001 ...
    echo.
    npx tsx pipeline/dashboard/server.ts
) else if "%choice%"=="3" (
    echo.
    echo   Running full pipeline...
    echo.
    npx tsx pipeline/index.ts
    echo.
    pause
) else if "%choice%"=="4" (
    echo.
    echo   Running dry run...
    echo.
    npx tsx pipeline/index.ts --dry-run
    echo.
    pause
) else if "%choice%"=="5" (
    exit
) else (
    echo.
    echo   Invalid option.
    pause
)
