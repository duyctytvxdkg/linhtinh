@echo off
setlocal enabledelayedexpansion

echo.
echo 🏪 Build Signed APK/AAB for Google Play Store
echo ============================================
echo.

REM Check parameters
if "%1"=="" (
    echo [ERROR] Missing parameters!
    echo.
    echo Usage: buildmarket.bat [keystore_file] [key_alias] [store_password] [key_password]
    echo.
    echo Example: buildmarket.bat myapp.jks myapp-key myStorePass myKeyPass
    echo.
    echo Parameters:
    echo   keystore_file  - Name of keystore file (e.g., myapp.jks)
    echo   key_alias      - Key alias name (e.g., myapp-key)
    echo   store_password - Keystore password
    echo   key_password   - Key password (optional, will use store_password if not provided)
    echo.
    pause
    exit /b 1
)

if "%2"=="" (
    echo [ERROR] Missing key alias parameter!
    pause
    exit /b 1
)

if "%3"=="" (
    echo [ERROR] Missing store password parameter!
    pause
    exit /b 1
)

set "KEYSTORE_FILE=%1"
set "KEY_ALIAS=%2"
set "STORE_PASSWORD=%3"
set "KEY_PASSWORD=%4"

REM Use store password for key password if not provided
if "%KEY_PASSWORD%"=="" set "KEY_PASSWORD=%STORE_PASSWORD%"

echo [INFO] Build Configuration:
echo   Keystore: %KEYSTORE_FILE%
echo   Key Alias: %KEY_ALIAS%
echo   Store Password: [HIDDEN]
echo   Key Password: [HIDDEN]
echo.

REM Check if keystore file exists
if not exist "android\%KEYSTORE_FILE%" (
    echo [ERROR] Keystore file not found: android\%KEYSTORE_FILE%
    echo.
    echo Please make sure the keystore file is in the android\ folder
    echo or create one using: create-keystore.bat
    pause
    exit /b 1
)

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

REM Create key.properties file
echo [INFO] Creating signing configuration...
(
echo storePassword=%STORE_PASSWORD%
echo keyPassword=%KEY_PASSWORD%
echo keyAlias=%KEY_ALIAS%
echo storeFile=%KEYSTORE_FILE%
) > android\key.properties

echo [SUCCESS] Signing configuration created

REM Backup original build.gradle
if not exist "android\app\build.gradle.backup" (
    copy "android\app\build.gradle" "android\app\build.gradle.backup" >nul
    echo [INFO] Created backup of build.gradle
)

REM Check if signing config already exists
findstr /C:"signingConfigs" android\app\build.gradle >nul 2>&1
if errorlevel 1 (
    echo [INFO] Adding signing configuration to build.gradle...
    
    REM Read current build.gradle and add signing config
    powershell -Command "
    $content = Get-Content 'android\app\build.gradle' -Raw
    $keystoreConfig = @'

// Load keystore properties
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
'@
    
    $signingConfig = @'
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
'@
    
    # Add keystore config at the top
    $content = $keystoreConfig + $content
    
    # Add signing config after 'android {'
    $content = $content -replace '(android\s*\{)', ('$1' + [Environment]::NewLine + $signingConfig)
    
    # Add signingConfig to release buildType
    $content = $content -replace '(\s+release\s*\{)', ('$1' + [Environment]::NewLine + '            signingConfig signingConfigs.release')
    
    Set-Content 'android\app\build.gradle' $content
    "
    
    echo [SUCCESS] Signing configuration added to build.gradle
) else (
    echo [INFO] Signing configuration already exists in build.gradle
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