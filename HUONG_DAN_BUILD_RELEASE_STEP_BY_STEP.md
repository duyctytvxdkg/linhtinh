# 📱 Hướng dẫn Build Release APK/AAB cho Google Play Store - Step by Step

## 🎯 Mục tiêu
Tạo file APK/AAB đã ký (signed) để upload lên Google Play Store

## 📋 Chuẩn bị
- ✅ Đã có keystore: `android/linhtinhapp-release-key.jks`
- ✅ Đã có key.properties: `android/key.properties`
- ✅ Đã test debug APK thành công

---

## 🔧 PHƯƠNG PHÁP 1: SỬ DỤNG ANDROID STUDIO (KHUYẾN NGHỊ)

### Bước 1: Cài đặt Android Studio
1. **Download Android Studio** từ: https://developer.android.com/studio
2. **Cài đặt** và mở Android Studio
3. **Cài đặt SDK** nếu chưa có (Android Studio sẽ hướng dẫn)

### Bước 2: Import Project
1. **Mở Android Studio**
2. **Chọn "Open an Existing Project"**
3. **Navigate** đến thư mục project của bạn
4. **Chọn thư mục `android`** (không phải root project)
5. **Click "OK"**
6. **Đợi** Android Studio sync project (có thể mất vài phút)

### Bước 3: Kiểm tra Project
1. **Đợi sync hoàn thành** (thanh progress ở dưới)
2. **Kiểm tra** không có lỗi đỏ trong code
3. **Nếu có lỗi**: Click "Try Again" hoặc "Sync Now"

### Bước 4: Build Signed Bundle/APK
1. **Menu Bar** → **Build** → **Generate Signed Bundle / APK...**
2. **Chọn "Android App Bundle"** (khuyến nghị cho Play Store)
   - Hoặc chọn "APK" nếu muốn file APK
3. **Click "Next"**

### Bước 5: Chọn Keystore
1. **Key store path**: Click "Choose existing..." 
2. **Navigate** đến `android/linhtinhapp-release-key.jks`
3. **Chọn file keystore** và click "OK"
4. **Nhập thông tin**:
   ```
   Key store password: mdbAbc23
   Key alias: linhtinhapp-key-alias
   Key password: mdbAbc23
   ```
5. **✅ Check "Remember passwords"** (tùy chọn)
6. **Click "Next"**

### Bước 6: Chọn Build Variant
1. **Destination Folder**: Để mặc định hoặc chọn thư mục khác
2. **Build Variants**: Chọn **"release"**
3. **✅ Check cả hai**:
   - ✅ V1 Signature (Jar Signature)
   - ✅ V2 Signature (Full APK Signature)
4. **Click "Create"**

### Bước 7: Đợi Build Hoàn thành
1. **Đợi** quá trình build (có thể mất 2-5 phút)
2. **Xem progress** ở thanh dưới Android Studio
3. **Khi hoàn thành** sẽ có thông báo "Generate Signed Bundle"

### Bước 8: Lấy File Output
1. **Click "locate"** trong thông báo hoàn thành
2. **Hoặc navigate** đến:
   - **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`
   - **APK**: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🔧 PHƯƠNG PHÁP 2: SỬ DỤNG COMMAND LINE

### Bước 1: Chuẩn bị build.gradle
1. **Mở file** `android/app/build.gradle`
2. **Thêm code** sau vào đầu file (sau dòng `apply plugin`):

```gradle
// Load keystore properties
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

3. **Tìm block `android {`** và thêm `signingConfigs` trước `buildTypes`:

```gradle
android {
    // ... các config khác ...
    
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
            signingConfig signingConfigs.release  // Thêm dòng này
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Bước 2: Build từ Command Line
1. **Mở Command Prompt** trong thư mục project
2. **Chạy build debug** trước để đảm bảo mọi thứ OK:
   ```bash
   buildmarket-debug.bat
   ```
3. **Navigate** đến thư mục android:
   ```bash
   cd android
   ```
4. **Build release AAB** (khuyến nghị):
   ```bash
   gradlew bundleRelease
   ```
5. **Hoặc build release APK**:
   ```bash
   gradlew assembleRelease
   ```

### Bước 3: Kiểm tra Output
1. **AAB file**: `android/app/build/outputs/bundle/release/app-release.aab`
2. **APK file**: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📦 KIỂM TRA FILE OUTPUT

### Thông tin file AAB/APK
```bash
# Kiểm tra kích thước file
dir android\app\build\outputs\bundle\release\
dir android\app\build\outputs\apk\release\

# Verify signing (tùy chọn)
keytool -printcert -jarfile android\app\build\outputs\apk\release\app-release.apk
```

### Kích thước mong đợi:
- **AAB**: ~3-4 MB
- **APK**: ~4-5 MB

---

## 🚀 UPLOAD LÊN GOOGLE PLAY STORE

### Bước 1: Tạo Google Play Console Account
1. **Truy cập**: https://play.google.com/console
2. **Đăng ký** Developer Account ($25 một lần)
3. **Verify** identity và payment method

### Bước 2: Tạo App mới
1. **Click "Create app"**
2. **Nhập thông tin**:
   - App name: "Kho Tools Tiện Ích" (hoặc tên bạn muốn)
   - Default language: Vietnamese
   - App or game: App
   - Free or paid: Free
3. **Accept** Play Console Developer Policy
4. **Click "Create app"**

### Bước 3: Upload App Bundle/APK
1. **Sidebar** → **Release** → **Production**
2. **Click "Create new release"**
3. **Upload** file AAB (khuyến nghị) hoặc APK
4. **Đợi** upload và processing hoàn thành

### Bước 4: Điền thông tin App
1. **App content**:
   - Target audience: 18+
   - Content rating: Everyone
   - Privacy policy: (cần tạo)
2. **Store listing**:
   - App description
   - Screenshots (ít nhất 2 ảnh)
   - App icon (512x512 px)
3. **Pricing & distribution**:
   - Free
   - Available countries: Vietnam (hoặc worldwide)

### Bước 5: Submit for Review
1. **Review** tất cả thông tin
2. **Click "Send for review"**
3. **Đợi** Google review (1-3 ngày)

---

## ⚠️ LƯU Ý QUAN TRỌNG

### Bảo mật Keystore
- **🔒 Backup keystore** `linhtinhapp-release-key.jks` ở nơi an toàn
- **🔒 Backup key.properties** chứa passwords
- **❌ KHÔNG** commit keystore vào Git
- **⚠️ Mất keystore = không thể update app mãi mãi**

### Version Management
- **Mỗi lần update** phải tăng `versionCode` trong `build.gradle`
- **Tăng `versionName`** cho user-friendly (1.0, 1.1, 2.0...)

### Passwords hiện tại
```
Keystore file: linhtinhapp-release-key.jks
Key alias: linhtinhapp-key-alias
Store password: mdbAbc23
Key password: mdbAbc23
```

---

## 🛠️ TROUBLESHOOTING

### Lỗi thường gặp:

#### 1. "Keystore not found"
**Giải pháp**:
- Kiểm tra file `android/linhtinhapp-release-key.jks` có tồn tại
- Kiểm tra đường dẫn trong Android Studio

#### 2. "Wrong password"
**Giải pháp**:
- Kiểm tra lại password: `mdbAbc23`
- Đảm bảo không có space thừa

#### 3. "Build failed"
**Giải pháp**:
- Chạy `buildmarket-debug.bat` trước để test
- Clean project: **Build** → **Clean Project**
- Rebuild: **Build** → **Rebuild Project**

#### 4. "Signing config not found"
**Giải pháp**:
- Kiểm tra file `android/key.properties` có tồn tại
- Kiểm tra cấu hình trong `build.gradle`

### Debug commands:
```bash
# Test debug build
buildmarket-debug.bat

# Verify keystore
keytool -list -v -keystore android/linhtinhapp-release-key.jks

# Check Gradle
cd android
gradlew --version
```

---

## 📞 HỖ TRỢ

### Nếu gặp vấn đề:
1. **Chạy debug build** trước: `buildmarket-debug.bat`
2. **Kiểm tra logs** trong Android Studio
3. **Google** error message cụ thể
4. **Backup** project trước khi thử fix

### Resources hữu ích:
- **Android Developer Guide**: https://developer.android.com/studio/publish
- **Google Play Console Help**: https://support.google.com/googleplay/android-developer
- **Signing Guide**: https://developer.android.com/studio/publish/app-signing

---

## ✅ CHECKLIST HOÀN THÀNH

### Trước khi upload:
- [ ] Debug APK test thành công
- [ ] Keystore và passwords đã backup
- [ ] Release APK/AAB build thành công
- [ ] File size hợp lý (~3-5 MB)
- [ ] App icon và screenshots chuẩn bị sẵn

### Sau khi upload:
- [ ] App đã submit for review
- [ ] Backup keystore ở nơi an toàn
- [ ] Ghi chú version và changes
- [ ] Chuẩn bị cho update tiếp theo

**🎉 Chúc mừng! Bạn đã hoàn thành việc build và upload app lên Google Play Store!**