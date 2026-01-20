@echo off
setlocal enabledelayedexpansion

echo.
echo 📦 STEP 3: Downgrade Capacitor to v6 (Java 17 Compatible)
echo ========================================================
echo.

echo [INFO] Capacitor v8 requires Java 21, but we're using Java 17
echo [INFO] Downgrading to Capacitor v6 for compatibility
echo.

REM Check if Capacitor v6 already installed
if exist "package.json" (
    findstr "@capacitor/core.*6\." package.json >nul 2>&1
    if not errorlevel 1 (
        if exist "android" (
            echo [SUCCESS] Capacitor v6 already installed and Android platform exists!
            goto :end
        )
    )
)

REM Check current Capacitor version
if exist "package.json" (
    findstr "@capacitor" package.json | findstr "8\."
    if not errorlevel 1 (
        echo [INFO] Found Capacitor v8, downgrading to v6...
    ) else (
        echo [INFO] Capacitor version check...
    )
)

echo [INFO] Installing Capacitor v6...
npm install @capacitor/core@^6.0.0 @capacitor/cli@^6.0.0 @capacitor/android@^6.0.0 --force

if errorlevel 1 (
    echo [ERROR] Failed to install Capacitor v6
    pause
    exit /b 1
)

echo [SUCCESS] Capacitor v6 installed

REM Remove existing Android platform if exists
if exist "android" (
    echo [INFO] Removing existing Android platform...
    rmdir /s /q "android"
    echo [SUCCESS] Removed existing Android platform
)

echo [INFO] Adding Android platform with Capacitor v6...
npx cap add android

if errorlevel 1 (
    echo [ERROR] Failed to add Android platform
    pause
    exit /b 1
)

echo [SUCCESS] Android platform added with Capacitor v6

:end
echo.
echo ✅ STEP 3 COMPLETED!
echo [INFO] Capacitor v6 installed and Android platform added
echo.
if "%1"=="" (
    echo Next step: Run '4-clean-gradle-cache.bat'
    pause
)