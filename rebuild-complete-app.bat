@echo off
echo ========================================
echo REBUILD TOÀN BỘ APP - FULL CLEAN BUILD
echo ========================================
echo.

echo 🧹 Bước 1: Clean tất cả build artifacts...
if exist "dist" (
    echo Xóa folder dist...
    rmdir /s /q "dist"
)
if exist "android\app\build" (
    echo Xóa Android build cache...
    rmdir /s /q "android\app\build"
)
if exist ".angular" (
    echo Xóa Angular cache...
    rmdir /s /q ".angular"
)
echo ✅ Clean hoàn tất
echo.

echo 📦 Bước 2: Reinstall dependencies...
echo Xóa node_modules...
if exist "node_modules" (
    rmdir /s /q "node_modules"
)
echo Xóa package-lock.json...
if exist "package-lock.json" (
    del "package-lock.json"
)
echo Cài đặt lại tất cả packages...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Lỗi npm install
    pause
    exit /b 1
)
echo ✅ Dependencies đã được cài đặt lại
echo.

echo 🔧 Bước 3: Build Angular app (production)...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Lỗi build Angular
    pause
    exit /b 1
)
echo ✅ Angular build thành công
echo.

echo 📱 Bước 4: Capacitor full sync...
call npx cap sync
if %errorlevel% neq 0 (
    echo ❌ Lỗi Capacitor sync
    pause
    exit /b 1
)
echo ✅ Capacitor sync thành công
echo.

echo 🧪 Bước 5: Verify build...
if exist "dist\linhtinhapp\browser\index.html" (
    echo ✅ Browser build OK
) else (
    echo ❌ Browser build missing
)

if exist "android\app\src\main\assets\public\index.html" (
    echo ✅ Android assets OK
) else (
    echo ❌ Android assets missing
)
echo.

echo ========================================
echo REBUILD HOÀN THÀNH!
echo ========================================
echo.
echo 📊 Build Summary:
echo ✅ Clean build artifacts
echo ✅ Reinstall dependencies  
echo ✅ Angular production build
echo ✅ Capacitor sync
echo ✅ Assets verification
echo.
echo 🚀 Sẵn sàng cho Android Studio:
echo 1. npx cap open android
echo 2. Clean Project
echo 3. Rebuild Project
echo 4. Generate APK/AAB
echo.
pause