@echo off
setlocal enabledelayedexpansion

echo.
echo Complete Android APK Build Process
echo ====================================
echo.
echo This will run all 6 steps to build your Android APK:
echo.
echo 1. Setup Java 17
echo 2. Setup Android SDK  
echo 3. Downgrade Capacitor to v6
echo 4. Clean Gradle Cache
echo 5. Build Angular App
echo 6. Build Android APK
echo.

set /p confirm="Continue with complete build? (y/n): "
if /i not "%confirm%"=="y" exit /b 0

echo.
echo ==========================================
echo STARTING COMPLETE BUILD PROCESS...
echo ==========================================

echo.
call 1-setup-java17.bat auto
if errorlevel 1 (
    echo [ERROR] Step 1 failed!
    pause
    exit /b 1
)

echo.
call 2-setup-android-sdk.bat auto
if errorlevel 1 (
    echo [ERROR] Step 2 failed!
    pause
    exit /b 1
)

echo.
call 3-downgrade-capacitor.bat auto
if errorlevel 1 (
    echo [ERROR] Step 3 failed!
    pause
    exit /b 1
)

echo.
call 4-clean-gradle-cache.bat auto
if errorlevel 1 (
    echo [ERROR] Step 4 failed!
    pause
    exit /b 1
)

echo.
call 5-build-angular-app.bat auto
if errorlevel 1 (
    echo [ERROR] Step 5 failed!
    pause
    exit /b 1
)

echo.
call 6-build-android-apk.bat auto
if errorlevel 1 (
    echo [ERROR] Step 6 failed!
    pause
    exit /b 1
)

echo.
echo ==========================================
echo BUILD SUCCESSFUL!
echo ==========================================
echo.
echo Your Android APK is ready at:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo You can now install it on your Android device for testing.
echo.
pause