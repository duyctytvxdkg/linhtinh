@echo off
setlocal enabledelayedexpansion

echo.
echo 🚀 STEP 5: Build Angular App
echo ===========================
echo.

echo [INFO] Building Angular application for production...
npm run build

if errorlevel 1 (
    echo [ERROR] Angular build failed!
    echo.
    echo Common solutions:
    echo 1. Run 'npm install' to install dependencies
    echo 2. Check for TypeScript errors in your code
    echo 3. Make sure all imports are correct
    pause
    exit /b 1
)

echo [SUCCESS] Angular build completed!

echo [INFO] Syncing with Capacitor...
npm run cap:sync

if errorlevel 1 (
    echo [ERROR] Capacitor sync failed!
    pause
    exit /b 1
)

echo [SUCCESS] Capacitor sync completed!

REM Verify build output
if exist "dist" (
    echo [SUCCESS] Angular build output found in 'dist' folder
) else (
    echo [ERROR] Angular build output not found!
    pause
    exit /b 1
)

if exist "android\app\src\main\assets\public" (
    echo [SUCCESS] Web assets copied to Android project
) else (
    echo [ERROR] Web assets not found in Android project!
    pause
    exit /b 1
)

echo.
echo ✅ STEP 5 COMPLETED!
echo [INFO] Angular app built and synced with Capacitor
echo [INFO] Ready to build Android APK
echo.
if "%1"=="" (
    echo Next step: Run '6-build-android-apk.bat'
    pause
)