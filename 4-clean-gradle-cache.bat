@echo off
setlocal enabledelayedexpansion

echo.
echo 🧹 STEP 4: Clean Gradle Cache
echo ============================
echo.

echo [INFO] Cleaning corrupted Gradle cache to prevent build errors
echo.

echo [INFO] Stopping all Gradle daemons...
if exist "android" (
    pushd android
    gradlew --stop 2>nul
    popd
)

echo [INFO] Cleaning project Gradle cache...
if exist "android\.gradle" (
    rmdir /s /q "android\.gradle"
    echo [SUCCESS] Removed project .gradle cache
)

echo [INFO] Cleaning global Gradle cache...
if exist "%USERPROFILE%\.gradle\caches" (
    rmdir /s /q "%USERPROFILE%\.gradle\caches"
    echo [SUCCESS] Removed global Gradle caches
)

if exist "%USERPROFILE%\.gradle\daemon" (
    rmdir /s /q "%USERPROFILE%\.gradle\daemon"
    echo [SUCCESS] Removed Gradle daemon cache
)

echo [INFO] Cleaning Android build cache...
if exist "android\app\build" (
    rmdir /s /q "android\app\build"
    echo [SUCCESS] Removed Android build cache
)

if exist "android\build" (
    rmdir /s /q "android\build"
    echo [SUCCESS] Removed Android root build cache
)

echo [INFO] Recreating clean Gradle configuration...

REM Ensure local.properties exists
if not exist "android\local.properties" (
    (echo sdk.dir=C:/Users/%USERNAME%/AppData/Local/Android/Sdk) > android\local.properties
)

REM Ensure gradle.properties exists
if not exist "android\gradle.properties" (
    (
    echo # Project-wide Gradle settings
    echo org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
    echo android.useAndroidX=true
    echo kotlin.code.style=official
    echo android.nonTransitiveRClass=true
    ) > android\gradle.properties
)

echo.
echo ✅ STEP 4 COMPLETED!
echo [INFO] All Gradle caches cleaned
echo [INFO] Clean configuration created
echo.
if "%1"=="" (
    echo Next step: Run '5-build-angular-app.bat'
    pause
)