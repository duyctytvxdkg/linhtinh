# 📱 Hướng dẫn Build APK và Publish lên Google Play Store

## 🚀 Bước 1: Chuẩn bị môi trường

### 1.1 Cài đặt Android Studio
```bash
# Download Android Studio từ: https://developer.android.com/studio
# Cài đặt Android SDK, Build Tools, và Platform Tools
```

### 1.2 Cài đặt Java JDK
```bash
# Download JDK 17 từ: https://adoptium.net/
# Hoặc sử dụng SDKMAN:
curl -s "https://get.sdkman.io" | bash
sdk install java 17.0.7-tem
```

### 1.3 Thiết lập biến môi trường
```bash
# Thêm vào ~/.bashrc hoặc ~/.zshrc:
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export JAVA_HOME=/path/to/your/jdk
```

## 🔧 Bước 2: Chuẩn bị project

### 2.1 Build Angular project
```bash
npm run build
```

### 2.2 Sync với Capacitor
```bash
npm run cap:sync
```

### 2.3 Mở Android Studio
```bash
npm run cap:open:android
```

## 📝 Bước 3: Cấu hình app trong Android Studio

### 3.1 Cập nhật app info
Mở file `android/app/src/main/AndroidManifest.xml`:
```xml
<application
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    android:label="Kho Tools Tiện Ích"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:supportsRtl="true"
    android:theme="@style/AppTheme">
```

### 3.2 Cập nhật version
Mở file `android/app/build.gradle`:
```gradle
android {
    compileSdk 34
    
    defaultConfig {
        applicationId "com.linhtinhapp.tools"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

### 3.3 Thêm icon và splash screen
- Thay thế icon trong `android/app/src/main/res/mipmap-*/`
- Cập nhật splash screen trong `android/app/src/main/res/drawable/`

## 🔐 Bước 4: Tạo Keystore để ký APK

### 4.1 Tạo keystore
```bash
keytool -genkey -v -keystore linhtinhapp-release-key.keystore -alias linhtinhapp -keyalg RSA -keysize 2048 -validity 10000
```

### 4.2 Cấu hình signing trong build.gradle
Thêm vào `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('../../linhtinhapp-release-key.keystore')
            storePassword 'your_store_password'
            keyAlias 'linhtinhapp'
            keyPassword 'your_key_password'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

## 📦 Bước 5: Build APK/AAB

### 5.1 Build Debug APK (để test)
```bash
cd android
./gradlew assembleDebug
# APK sẽ ở: android/app/build/outputs/apk/debug/
```

### 5.2 Build Release AAB (cho Play Store)
```bash
cd android
./gradlew bundleRelease
# AAB sẽ ở: android/app/build/outputs/bundle/release/
```

### 5.3 Build Release APK (nếu cần)
```bash
cd android
./gradlew assembleRelease
# APK sẽ ở: android/app/build/outputs/apk/release/
```

## 🏪 Bước 6: Chuẩn bị Google Play Store

### 6.1 Tạo Google Play Console Account
- Truy cập: https://play.google.com/console
- Đăng ký tài khoản developer (phí $25 một lần)
- Xác minh danh tính

### 6.2 Tạo app mới
1. Click "Create app"
2. Điền thông tin:
   - App name: "Kho Tools Tiện Ích"
   - Default language: Vietnamese
   - App type: App
   - Category: Tools

### 6.3 Chuẩn bị assets
- **App icon**: 512x512px PNG
- **Feature graphic**: 1024x500px
- **Screenshots**: Ít nhất 2 ảnh cho phone (16:9 hoặc 9:16)
- **Privacy Policy**: URL tới privacy policy
- **App description**: Mô tả chi tiết app

## 📋 Bước 7: Upload và Publish

### 7.1 Upload AAB
1. Vào "Release" > "Production"
2. Click "Create new release"
3. Upload file AAB đã build
4. Điền release notes

### 7.2 Điền Store Listing
- **Short description** (80 ký tự)
- **Full description** (4000 ký tự)
- **Screenshots** cho các device types
- **Feature graphic**
- **App icon**

### 7.3 Content Rating
- Điền questionnaire về nội dung app
- Chọn rating phù hợp

### 7.4 Target Audience
- Chọn độ tuổi target
- Xác nhận không có ads (nếu không có)

### 7.5 Privacy Policy
- Thêm URL privacy policy
- Khai báo data collection practices

## 🚀 Bước 8: Submit để Review

### 8.1 Review checklist
- [ ] AAB uploaded và signed
- [ ] Store listing hoàn chỉnh
- [ ] Screenshots đầy đủ
- [ ] Privacy policy valid
- [ ] Content rating completed
- [ ] Target audience set

### 8.2 Submit
1. Click "Send for review"
2. Chờ Google review (1-3 ngày)
3. Nhận email thông báo kết quả

## 🔄 Bước 9: Update app (sau này)

### 9.1 Tăng version
Trong `android/app/build.gradle`:
```gradle
versionCode 2  // Tăng lên
versionName "1.0.1"  // Tăng version
```

### 9.2 Build và upload
```bash
npm run build
npm run cap:sync
cd android
./gradlew bundleRelease
```

### 9.3 Create new release
- Upload AAB mới
- Điền release notes
- Submit

## 📱 Script tự động

Tạo file `build-android.sh`:
```bash
#!/bin/bash
echo "🔨 Building Angular app..."
npm run build

echo "🔄 Syncing with Capacitor..."
npm run cap:sync

echo "📦 Building Android AAB..."
cd android
./gradlew bundleRelease

echo "✅ Build completed!"
echo "📁 AAB location: android/app/build/outputs/bundle/release/"
```

Chạy:
```bash
chmod +x build-android.sh
./build-android.sh
```

## 🎯 Tips quan trọng

1. **Test kỹ trước khi publish**: Dùng debug APK test trên nhiều device
2. **Backup keystore**: Mất keystore = không thể update app
3. **Version management**: Luôn tăng versionCode khi update
4. **Screenshots**: Chụp trên device thật, không emulator
5. **Privacy Policy**: Bắt buộc phải có, host trên domain riêng
6. **ASO (App Store Optimization)**: Tối ưu title, description, keywords

## 🚨 Troubleshooting

### Lỗi build
```bash
# Clean project
cd android
./gradlew clean

# Rebuild
./gradlew bundleRelease
```

### Lỗi signing
- Kiểm tra đường dẫn keystore
- Xác nhận password đúng
- Đảm bảo alias name đúng

### Lỗi upload
- File AAB phải < 150MB
- Kiểm tra versionCode phải lớn hơn version trước
- Đảm bảo app đã signed

## 📞 Support

Nếu gặp vấn đề:
1. Check Android Studio logs
2. Xem Google Play Console help
3. Tham khảo Capacitor docs: https://capacitorjs.com/docs/android