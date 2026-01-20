@echo off
setlocal enabledelayedexpansion

echo.
echo 📱 STEP 2: Setup Android SDK
echo ===========================
echo.

echo [INFO] Current ANDROID_HOME: %ANDROID_HOME%
echo.

REM Check if already configured
if defined ANDROID_HOME (
    if exist "%ANDROID_HOME%" (
        if exist "android\local.properties" (
            echo [SUCCESS] Android SDK already configured!
            echo [INFO] ANDROID_HOME: %ANDROID_HOME%
            goto :end
        )
    )
)

REM Check common Android SDK locations
set "sdk_found="
set "sdk_paths[0]=C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
set "sdk_paths[1]=C:\Android\Sdk"
set "sdk_paths[2]=C:\Program Files\Android\Sdk"
set "sdk_paths[3]=C:\Program Files (x86)\Android\android-sdk"

echo [INFO] Searching for Android SDK...

for /L %%i in (0,1,3) do (
    if exist "!sdk_paths[%%i]!" (
        set "sdk_found=!sdk_paths[%%i]!"
        echo [FOUND] Android SDK at: !sdk_found!
        goto :configure_sdk
    )
)

echo [ERROR] Android SDK not found!
echo.
echo Please install Android Studio first:
echo 1. Download from: https://developer.android.com/studio
echo 2. Install Android Studio
echo 3. Open Android Studio and install SDK
echo 4. Run this script again
echo.
start https://developer.android.com/studio
pause
exit /b 1

:configure_sdk
echo [INFO] Configuring Android SDK: %sdk_found%

REM Verify SDK structure
if not exist "%sdk_found%\platform-tools" (
    echo [ERROR] Invalid SDK: platform-tools not found
    pause
    exit /b 1
)

if not exist "%sdk_found%\build-tools" (
    echo [ERROR] Invalid SDK: build-tools not found
    pause
    exit /b 1
)

echo [SUCCESS] Android SDK structure verified

REM Set ANDROID_HOME
set "ANDROID_HOME=%sdk_found%"
set "PATH=%sdk_found%\platform-tools;%sdk_found%\tools;%PATH%"

REM Try to set permanently
setx ANDROID_HOME "%sdk_found%" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Could not set ANDROID_HOME permanently (need admin rights)
) else (
    echo [SUCCESS] ANDROID_HOME set permanently
)

REM Create local.properties for Android project
echo [INFO] Creating android\local.properties...
set "sdk_path_clean=%sdk_found:\=/%"
(echo sdk.dir=%sdk_path_clean%) > android\local.properties
echo [SUCCESS] Created local.properties

REM Test ADB
if exist "%sdk_found%\platform-tools\adb.exe" (
    echo [INFO] Testing ADB...
    "%sdk_found%\platform-tools\adb.exe" version
    echo [SUCCESS] ADB working
) else (
    echo [WARNING] ADB not found
)

:end
echo.
echo ✅ STEP 2 COMPLETED!
echo [INFO] Android SDK setup completed
echo [INFO] ANDROID_HOME: %ANDROID_HOME%
echo.
if "%1"=="" (
    echo Next step: Run '3-downgrade-capacitor.bat'
    pause
)