@echo off
echo.
echo 🚀 Build Release AAB (Clean Method)
echo ==================================
echo.

echo [STEP 1] Stop all Gradle daemons...
cd android
gradlew --stop

echo [STEP 2] Clean build cache...
gradlew clean

echo [STEP 3] Kill any remaining Java processes...
taskkill /F /IM java.exe 2>nul

echo [STEP 4] Build Angular app...
cd ..
npm run build

echo [STEP 5] Sync Capacitor...
npm run cap:sync

echo [STEP 6] Build release AAB...
cd android
gradlew bundleRelease

echo.
echo ==========================================
echo 🎉 BUILD SUCCESSFUL!
echo ==========================================
echo.

if exist "app\build\outputs\bundle\release\app-release.aab" (
    echo [✅] SIGNED AAB CREATED:
    echo     Location: android\app\build\outputs\bundle\release\app-release.aab
    
    for %%A in ("app\build\outputs\bundle\release\app-release.aab") do (
        set "size=%%~zA"
        set /a "sizeMB=!size!/1024/1024"
        echo     Size: !sizeMB! MB ^(!size! bytes^)
        echo     Modified: %%~tA
    )
) else (
    echo [❌] ERROR: AAB file not found!
)

echo.
echo 📱 Ready for Google Play Store upload!
echo.
cd ..
pause