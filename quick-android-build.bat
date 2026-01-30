@echo off
echo ========================================
echo QUICK ANDROID BUILD & TEST
echo ========================================
echo.

echo 🔧 Building Angular app...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo 📱 Syncing to Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ❌ Sync failed  
    pause
    exit /b 1
)

echo 🚀 Opening Android Studio...
call npx cap open android

echo.
echo ✅ Ready for testing!
echo In Android Studio:
echo 1. Clean Project
echo 2. Rebuild Project
echo 3. Run on device/emulator
echo.
pause