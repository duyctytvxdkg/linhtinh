@echo off
setlocal enabledelayedexpansion

echo.
echo 🔐 Creating Android Keystore for Linh Tinh App
echo ==============================================
echo.

REM Check if keytool exists
keytool -help >nul 2>&1
if errorlevel 1 (
    echo [ERROR] keytool not found. Please install Java JDK first.
    echo Download from: https://adoptium.net/
    pause
    exit /b 1
)

REM App details
set APP_NAME=linhtinhapp
set KEYSTORE_FILE=%APP_NAME%-release-key.jks
set KEY_ALIAS=%APP_NAME%-key-alias

echo [INFO] App Name: Kho Tools Tiện Ích
echo [INFO] Keystore File: %KEYSTORE_FILE%
echo [INFO] Key Alias: %KEY_ALIAS%
echo.

REM Get passwords
echo Please enter passwords (remember these!):
set /p STORE_PASSWORD="Enter keystore password: "
set /p STORE_PASSWORD_CONFIRM="Re-enter keystore password: "

if not "%STORE_PASSWORD%"=="%STORE_PASSWORD_CONFIRM%" (
    echo [ERROR] Passwords don't match!
    pause
    exit /b 1
)

set /p KEY_PASSWORD="Enter key password (or press ENTER to use same as keystore): "
if "%KEY_PASSWORD%"=="" set KEY_PASSWORD=%STORE_PASSWORD%

echo.
echo [INFO] Creating keystore...

REM Create keystore
keytool -genkey -v ^
    -keystore "%KEYSTORE_FILE%" ^
    -alias "%KEY_ALIAS%" ^
    -keyalg RSA ^
    -keysize 2048 ^
    -validity 10000 ^
    -storepass "%STORE_PASSWORD%" ^
    -keypass "%KEY_PASSWORD%" ^
    -dname "CN=Linh Tinh App, OU=IT Department, O=Linh Tinh App, L=Ho Chi Minh City, ST=Ho Chi Minh, C=VN"

if errorlevel 1 (
    echo [ERROR] Failed to create keystore!
    pause
    exit /b 1
)

echo [SUCCESS] Keystore created successfully!

REM Move to android folder if exists
if exist "android" (
    move "%KEYSTORE_FILE%" android\
    echo [INFO] Keystore moved to android\ folder
)

REM Create key.properties file
echo [INFO] Creating key.properties file...
(
echo storePassword=%STORE_PASSWORD%
echo keyPassword=%KEY_PASSWORD%
echo keyAlias=%KEY_ALIAS%
echo storeFile=%KEYSTORE_FILE%
) > android\key.properties

echo [SUCCESS] key.properties created in android\ folder

REM Update .gitignore
if exist ".gitignore" (
    findstr /C:"key.properties" .gitignore >nul 2>&1
    if errorlevel 1 (
        echo. >> .gitignore
        echo # Android keystore >> .gitignore
        echo *.jks >> .gitignore
        echo *.keystore >> .gitignore
        echo android/key.properties >> .gitignore
        echo [INFO] Updated .gitignore to exclude keystore files
    )
)

echo.
echo [SUCCESS] Setup completed!
echo [WARNING] IMPORTANT: Backup these files safely:
echo   - android\%KEYSTORE_FILE%
echo   - android\key.properties
echo.
echo [INFO] Next steps:
echo 1. Update android\app\build.gradle to use signing config
echo 2. Run 'build-android.bat' to build signed APK
echo.
pause