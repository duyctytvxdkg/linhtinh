@echo off
setlocal enabledelayedexpansion

echo.
echo 📱 STEP 6: Build Android APK
echo ===========================
echo.

echo [INFO] Building Android APK...
cd android

echo [INFO] Starting Gradle build (this may take several minutes)...
gradlew assembleDebug --no-daemon

if errorlevel 1 (
    echo [ERROR] APK build failed!
    echo.
    echo [INFO] Trying with clean first...
    gradlew clean
    gradlew assembleDebug --no-daemon
    
    if errorlevel 1 (
        echo [ERROR] APK build failed even after clean!
        echo.
        echo Common solutions:
        echo 1. Make sure Java 17 is properly configured
        echo 2. Make sure Android SDK is properly installed
        echo 3. Check if antivirus is blocking Gradle
        echo 4. Try restarting your computer
        cd ..
        pause
        exit /b 1
    )
)

cd ..

echo [SUCCESS] APK build completed!
echo.

REM Check and display APK information
echo [INFO] Checking APK output...

if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo [✅] SUCCESS! APK file created:
    echo     Location: android\app\build\outputs\apk\debug\app-debug.apk
    
    REM Get file size
    for %%A in ("android\app\build\outputs\apk\debug\app-debug.apk") do (
        set "size=%%~zA"
        set /a "sizeMB=!size!/1024/1024"
        echo     Size: !sizeMB! MB ^(!size! bytes^)
        echo     Modified: %%~tA
    )
    
    echo.
    echo [INFO] APK is ready for installation!
    echo.
    echo To install on Android device:
    echo 1. Enable Developer Options on your phone
    echo 2. Enable USB Debugging  
    echo 3. Connect phone via USB
    echo 4. Run: adb install android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo Or copy the APK file to your phone and install manually
    
) else (
    echo [❌] ERROR: APK file not found!
    echo.
    echo Expected location: android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo Please check the build logs above for errors
)

echo.
echo ✅ STEP 6 COMPLETED!
echo [INFO] Android APK build process finished
echo.
echo 🎉 ALL STEPS COMPLETED!
echo Your app is ready for testing on Android devices.
echo.
if "%1"=="" (
    pause
)