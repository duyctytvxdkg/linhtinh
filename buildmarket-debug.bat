@echo off
setlocal enabledelayedexpansion

echo.
echo 🏪 Build Debug APK for Testing (Pre-Market)
echo ==========================================
echo.

echo [INFO] This will build a debug APK that you can test before creating release version
echo.

echo [STEP 1/6] Setup Java 17...
call 1-setup-java17.bat auto
if errorlevel 1 (
    echo [ERROR] Java 17 setup failed!
    pause
    exit /b 1
)

echo.
echo [STEP 2/6] Setup Android SDK...
call 2-setup-android-sdk.bat auto
if errorlevel 1 (
    echo [ERROR] Android SDK setup failed!
    pause
    exit /b 1
)

echo.
echo [STEP 3/6] Setup Capacitor v6...
call 3-downgrade-capacitor.bat auto
if errorlevel 1 (
    echo [ERROR] Capacitor setup failed!
    pause
    exit /b 1
)

echo.
echo [STEP 4/6] Clean Gradle Cache...
call 4-clean-gradle-cache.bat auto
if errorlevel 1 (
    echo [ERROR] Gradle cache cleanup failed!
    pause
    exit /b 1
)

echo.
echo [STEP 5/6] Build Angular App...
call 5-build-angular-app.bat auto
if errorlevel 1 (
    echo [ERROR] Angular build failed!
    pause
    exit /b 1
)

echo.
echo [STEP 6/6] Build Debug APK...
call 6-build-android-apk.bat auto
if errorlevel 1 (
    echo [ERROR] APK build failed!
    pause
    exit /b 1
)

echo.
echo ==========================================
echo 🎉 DEBUG APK BUILD SUCCESSFUL!
echo ==========================================
echo.

REM Check and display build outputs
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo [✅] DEBUG APK CREATED:
    echo     Location: android\app\build\outputs\apk\debug\app-debug.apk
    
    for %%A in ("android\app\build\outputs\apk\debug\app-debug.apk") do (
        set "size=%%~zA"
        set /a "sizeMB=!size!/1024/1024"
        echo     Size: !sizeMB! MB ^(!size! bytes^)
        echo     Modified: %%~tA
    )
) else (
    echo [❌] ERROR: Debug APK not found!
)

echo.
echo 📋 NEXT STEPS:
echo.
echo 1. Test this debug APK on your device first
echo 2. Install: adb install android\app\build\outputs\apk\debug\app-debug.apk
echo 3. When ready for Play Store, create keystore and build release version
echo.
echo 💡 For Google Play Store release:
echo 1. Run: create-keystore.bat (if not done yet)
echo 2. Then manually configure signing in Android Studio or build.gradle
echo.
pause