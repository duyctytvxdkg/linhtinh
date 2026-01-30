@echo off
echo ========================================
echo ĐỒNG BỘ THAY ĐỔI VÀO ANDROID APP
echo ========================================
echo.

echo 📦 Bước 1: Cài đặt Capacitor App plugin (nếu chưa có)...
call npm install @capacitor/app@^6.0.0
if %errorlevel% neq 0 (
    echo ❌ Lỗi cài đặt Capacitor App plugin
    pause
    exit /b 1
)
echo ✅ Capacitor App plugin đã được cài đặt
echo.

echo 🔧 Bước 2: Build Angular app với tất cả thay đổi mới...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Lỗi build Angular app
    pause
    exit /b 1
)
echo ✅ Angular app đã được build thành công
echo.

echo 📱 Bước 3: Đồng bộ với Capacitor...
call npx cap sync
if %errorlevel% neq 0 (
    echo ❌ Lỗi đồng bộ Capacitor
    pause
    exit /b 1
)
echo ✅ Đã đồng bộ thành công với Capacitor
echo.

echo 🚀 Bước 4: Mở Android Studio...
call npx cap open android
echo.

echo ========================================
echo HOÀN THÀNH ĐỒNG BỘ!
echo ========================================
echo.
echo Các thay đổi đã được đồng bộ:
echo ✅ Fix double bullet points trong info modals
echo ✅ Auto-scroll khi chọn ngày khác trong thủy triều  
echo ✅ Fix missing tide events khi chọn ngày khác
echo ✅ Android back button handling (về home thay vì thoát app)
echo.
echo Tiếp theo trong Android Studio:
echo 1. Build → Clean Project
echo 2. Build → Rebuild Project  
echo 3. Build → Generate Signed Bundle/APK
echo 4. Test trên thiết bị Android
echo.
pause