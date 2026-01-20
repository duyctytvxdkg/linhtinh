@echo off
setlocal enabledelayedexpansion

echo.
echo 🏪 Build Signed APK/AAB for Google Play Store
echo ============================================
echo.

REM Check if key.properties exists
if not exist "android\key.properties" (
    echo [ERROR] key.properties not found!
    echo.
    echo Please create keystore first using: create-keystore.bat
    echo Or make sure key.properties exists in android\ folder
    pause
    exit /b 1
)

REM Check if keystore file exists
for /f "tokens=2 delims==" %%i in ('findstr "storeFile" android\key.properties') do set KEYSTORE_FILE=%%i
if not exist "android\%KEYSTORE_FILE%" (
    echo [ERROR] Keystore file not found: android\%KEYSTORE_FILE%
    echo Please make sure the keystore file exists in android\ folder
    pause
    exit /b 1
)

echo [INFO] Using existing keystore configuration from key.properties
echo [INFO] Keystore: %KEYSTORE_FILE%
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
echo [STEP 6/6] Configure Signing and Build Release...

echo [INFO] Setting up Android signing configuration...
call setup-android-signing.bat auto
if errorlevel 1 (
    echo [ERROR] Failed to setup signing configuration!
    pause
    exit /b 1
)

echo.
echo [INFO] Building signed release APK and AAB...
cd android

echo [INFO] Building release APK...
gradlew assembleRelease --no-daemon
if errorlevel 1 (
    echo [ERROR] Release APK build failed!
    cd ..
    pause
    exit /b 1
)

echo [INFO] Building release AAB (Android App Bundle)...
gradlew bundleRelease --no-daemon
if errorlevel 1 (
    echo [ERROR] Release AAB build failed!
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ==========================================
echo 🎉 BUILD SUCCESSFUL!
echo ==========================================
echo.

REM Check and display build outputs
if exist "android\app\build\outputs\apk\release\app-release.apk" (
    echo [✅] SIGNED APK CREATED:
    echo     Location: android\app\build\outputs\apk\release\app-release.apk
    
    for %%A in ("android\app\build\outputs\apk\release\app-release.apk") do (
        set "size=%%~zA"
        set /a "sizeMB=!size!/1024/1024"
        echo     Size: !sizeMB! MB ^(!size! bytes^)
        echo     Modified: %%~tA
    )
) else (
    echo [❌] ERROR: Signed APK not found!
)

echo.

if exist "android\app\build\outputs\bundle\release\app-release.aab" (
    echo [✅] SIGNED AAB CREATED:
    echo     Location: android\app\build\outputs\bundle\release\app-release.aab
    
    for %%A in ("android\app\build\outputs\bundle\release\app-release.aab") do (
        set "size=%%~zA"
        set /a "sizeMB=!size!/1024/1024"
        echo     Size: !sizeMB! MB ^(!size! bytes^)
        echo     Modified: %%~tA
    )
) else (
    echo [❌] ERROR: Signed AAB not found!
)

echo.
echo 📋 NEXT STEPS FOR GOOGLE PLAY STORE:
echo.
echo 1. Upload the AAB file (recommended) or APK file to Google Play Console
echo 2. AAB file: android\app\build\outputs\bundle\release\app-release.aab
echo 3. APK file: android\app\build\outputs\apk\release\app-release.apk
echo.
echo 💡 Google Play Store prefers AAB format for better optimization
echo.
echo ⚠️  SECURITY REMINDER:
echo - Keep your keystore file (%KEYSTORE_FILE%) safe and backed up
echo - Never share your keystore passwords
echo - Store keystore in a secure location
echo.
pause