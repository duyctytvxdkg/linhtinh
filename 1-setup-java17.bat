@echo off
setlocal enabledelayedexpansion

echo.
echo ☕ STEP 1: Setup Java 17
echo =======================
echo.

REM Check current Java version
echo [INFO] Checking current Java version...
java -version 2>&1 | findstr "17\." >nul
if not errorlevel 1 (
    echo [SUCCESS] Java 17 already installed and active!
    java -version
    
    REM Check if Gradle is already configured
    if exist "android\gradle.properties" (
        findstr "org.gradle.java.home" android\gradle.properties >nul 2>&1
        if not errorlevel 1 (
            echo [SUCCESS] Gradle already configured for Java 17!
            goto :end
        )
    )
    goto :configure_gradle
)

echo [INFO] Java 17 not found or not active
echo.

REM Find Java 17 installation
set "java17_found="
echo [INFO] Searching for Java 17 installations...

REM Check Eclipse Adoptium (most common)
for /d %%d in ("C:\Program Files\Eclipse Adoptium\jdk-17*") do (
    if exist "%%d\bin\java.exe" (
        set "java17_found=%%d"
        echo [FOUND] Eclipse Adoptium Java 17: %%d
        goto :configure_java
    )
)

REM Check Oracle JDK
for /d %%d in ("C:\Program Files\Java\jdk-17*") do (
    if exist "%%d\bin\java.exe" (
        set "java17_found=%%d"
        echo [FOUND] Oracle Java 17: %%d
        goto :configure_java
    )
)

REM Check Microsoft OpenJDK
for /d %%d in ("C:\Program Files\Microsoft\jdk-17*") do (
    if exist "%%d\bin\java.exe" (
        set "java17_found=%%d"
        echo [FOUND] Microsoft Java 17: %%d
        goto :configure_java
    )
)

echo [ERROR] Java 17 not found!
echo.
echo Please install Java 17 first:
echo 1. Download from: https://adoptium.net/temurin/releases/?version=17
echo 2. Install it
echo 3. Run this script again
echo.
start https://adoptium.net/temurin/releases/?version=17
pause
exit /b 1

:configure_java
echo [INFO] Configuring Java 17: %java17_found%

REM Set JAVA_HOME
set "JAVA_HOME=%java17_found%"
set "PATH=%java17_found%\bin;%PATH%"

REM Try to set permanently
setx JAVA_HOME "%java17_found%" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Could not set JAVA_HOME permanently (need admin rights)
) else (
    echo [SUCCESS] JAVA_HOME set permanently
)

:configure_gradle
REM Configure Gradle to use Java 17
set "gradle_java_path=%java17_found:\=/%"

if not exist "android\gradle.properties" (
    mkdir android 2>nul
    echo # Gradle properties > android\gradle.properties
)

REM Update gradle.properties
(
echo # Project-wide Gradle settings
echo org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
echo android.useAndroidX=true
echo kotlin.code.style=official
echo android.nonTransitiveRClass=true
echo.
echo # Java 17 configuration
echo org.gradle.java.home=%gradle_java_path%
) > android\gradle.properties

echo [SUCCESS] Gradle configured for Java 17

echo.
echo ✅ STEP 1 COMPLETED!
echo [INFO] Java 17 setup completed
echo [INFO] JAVA_HOME: %JAVA_HOME%
echo.
if "%1"=="" (
    echo Next step: Run '2-setup-android-sdk.bat'
    pause
)