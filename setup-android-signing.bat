@echo off
setlocal enabledelayedexpansion

echo.
echo 🔧 Setting up Android App Signing
echo =================================
echo.

REM Check if key.properties exists
if not exist "android\key.properties" (
    echo [ERROR] key.properties not found!
    echo Please run 'create-keystore.bat' first to create keystore and key.properties
    pause
    exit /b 1
)

REM Check if keystore file exists
for /f "tokens=2 delims==" %%i in ('findstr "storeFile" android\key.properties') do set KEYSTORE_FILE=%%i
if not exist "android\%KEYSTORE_FILE%" (
    echo [ERROR] Keystore file not found: android\%KEYSTORE_FILE%
    echo Please make sure the keystore file is in the android folder
    pause
    exit /b 1
)

echo [INFO] Found keystore configuration:
type android\key.properties
echo.

REM Backup original build.gradle
if not exist "android\app\build.gradle.backup" (
    copy "android\app\build.gradle" "android\app\build.gradle.backup"
    echo [INFO] Created backup of build.gradle
)

REM Check if signing config already exists
findstr /C:"signingConfigs" android\app\build.gradle >nul 2>&1
if not errorlevel 1 (
    echo [INFO] Signing configuration already exists in build.gradle
    echo [INFO] Skipping automatic setup
    goto :end
)

echo [INFO] Adding signing configuration to build.gradle...

REM Create temporary file with signing config
(
echo.
echo // Load keystore properties
echo def keystoreProperties = new Properties^(^)
echo def keystorePropertiesFile = rootProject.file^('key.properties'^)
echo if ^(keystorePropertiesFile.exists^(^)^) {
echo     keystoreProperties.load^(new FileInputStream^(keystorePropertiesFile^)^)
echo }
echo.
) > temp_signing.txt

REM Find the android { line and insert after it
set "found_android=false"
(
for /f "delims=" %%i in (android\app\build.gradle) do (
    echo %%i
    if "%%i"=="android {" (
        echo.
        echo     signingConfigs {
        echo         release {
        echo             keyAlias keystoreProperties['keyAlias']
        echo             keyPassword keystoreProperties['keyPassword']
        echo             storeFile keystoreProperties['storeFile'] ? file^(keystoreProperties['storeFile']^) : null
        echo             storePassword keystoreProperties['storePassword']
        echo         }
        echo     }
        echo.
        set "found_android=true"
    )
    REM Add signingConfig to release buildType
    if "%%i"=="        release {" (
        echo %%i
        echo             signingConfig signingConfigs.release
    ) else if not "%%i"=="        release {" (
        echo %%i
    )
)
) > temp_build.gradle

REM Add keystore properties loading at the top
(
type temp_signing.txt
type temp_build.gradle
) > android\app\build.gradle.new

move android\app\build.gradle.new android\app\build.gradle
del temp_signing.txt
del temp_build.gradle

echo [SUCCESS] Signing configuration added to build.gradle!

:end
echo.
echo [INFO] Android app signing setup completed!
echo [INFO] You can now build signed release APK/AAB using 'build-android.bat'
echo.
echo [WARNING] Remember to:
echo 1. Keep your keystore file safe
echo 2. Backup key.properties file
echo 3. Never commit keystore files to git
echo.
if "%1"=="" (
    pause
)