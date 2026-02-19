# 🏪 Hướng dẫn Build Release APK/AAB cho Google Play Store

## 📋 Tổng quan
Để build APK/AAB signed cho Google Play Store, bạn cần:
1. Keystore file (đã có: `linhtinhapp-release-key.jks`)
2. Key.properties file (đã có: `key.properties`)
3. Cấu hình signing trong build.gradle

## 🔧 Cách 1: Sử dụng Android Studio (Khuyến nghị)

### Bước 1: Mở project trong Android Studio
```bash
# Mở Android Studio và import project từ thư mục android/
```

### Bước 2: Build Release
1. Trong Android Studio: **Build** → **Generate Signed Bundle/APK**
2. Chọn **Android App Bundle** (khuyến nghị) hoặc **APK**
3. Chọn keystore: `android/linhtinhapp-release-key.jks`
4. Nhập thông tin:
   - **Key store password**: `mdbAbc23`
   - **Key alias**: `linhtinhapp-key-alias`
   - **Key password**: `mdbAbc23`
5. Chọn **release** build variant
6. Click **Finish**

### Bước 3: Lấy file output
- **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`
- **APK**: `android/app/build/outputs/apk/release/app-release.apk`

## 🔧 Cách 2: Command Line (Thủ công)

### Bước 1: Cấu hình build.gradle
Thêm vào file `android/app/build.gradle`:

```gradle
// Thêm ở đầu file, sau apply plugin
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // Thêm signingConfigs trước buildTypes
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    
    buildTypes {
        release {
            // Thêm dòng này vào release buildType
            signingConfig signingConfigs.release
            
            // Các cấu hình khác...
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Bước 2: Build từ command line
```bash
# Chạy build script debug trước
buildmarket-debug.bat

# Sau đó build release manually
cd android
gradlew assembleRelease    # Cho APK
gradlew bundleRelease      # Cho AAB
```

## 📦 Files Output

### APK (Android Package)
- **Location**: `android/app/build/outputs/apk/release/app-release.apk`
- **Size**: ~4-5 MB
- **Use**: Direct install, testing

### AAB (Android App Bundle) - Khuyến nghị
- **Location**: `android/app/build/outputs/bundle/release/app-release.aab`
- **Size**: ~3-4 MB
- **Use**: Google Play Store upload (tối ưu hơn)

## 🚀 Upload lên Google Play Store

1. Truy cập [Google Play Console](https://play.google.com/console)
2. Tạo app mới hoặc chọn app existing
3. Vào **Release** → **Production** → **Create new release**
4. Upload file **AAB** (khuyến nghị) hoặc **APK**
5. Điền thông tin app: description, screenshots, etc.
6. Submit for review

## ⚠️ Lưu ý quan trọng

### Bảo mật Keystore
- **Backup keystore**: `linhtinhapp-release-key.jks`
- **Backup key.properties**: Chứa passwords
- **Không commit** keystore vào git
- **Mất keystore = không thể update app**

### Passwords hiện tại
```
Keystore: linhtinhapp-release-key.jks
Key Alias: linhtinhapp-key-alias
Store Password: mdbAbc23
Key Password: mdbAbc23
```

### Version Management
- Mỗi lần update phải tăng `versionCode` trong `build.gradle`
- Tăng `versionName` cho user-friendly version

## 🛠️ Troubleshooting

### Lỗi thường gặp:
1. **Signing config not found**: Kiểm tra `key.properties` và `build.gradle`
2. **Keystore not found**: Đảm bảo file `.jks` trong thư mục `android/`
3. **Wrong password**: Kiểm tra lại passwords trong `key.properties`

### Debug:
```bash
# Test debug build trước
buildmarket-debug.bat

# Kiểm tra keystore
keytool -list -v -keystore android/linhtinhapp-release-key.jks
```

## 📞 Hỗ trợ
Nếu gặp vấn đề, hãy:
1. Chạy `buildmarket-debug.bat` để test
2. Kiểm tra logs trong Android Studio
3. Verify keystore và passwords