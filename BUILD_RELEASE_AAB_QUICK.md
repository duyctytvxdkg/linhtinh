# 🚀 Build Release AAB cho Google Play Store - Quick Guide

## ⚠️ Vấn đề hiện tại
Google Play Store yêu cầu app target API level 35, đã cập nhật:
- ✅ `compileSdkVersion = 35`
- ✅ `targetSdkVersion = 35` 
- ✅ `versionCode = 2`
- ✅ `versionName = "1.1"`

## 🔧 Cách build nhanh nhất: Android Studio

### Bước 1: Mở Android Studio
1. **Mở Android Studio**
2. **Open Project** → Chọn thư mục `android/`
3. **Đợi sync** hoàn thành

### Bước 2: Build Signed Bundle
1. **Menu** → **Build** → **Generate Signed Bundle / APK...**
2. **Chọn "Android App Bundle"**
3. **Next**

### Bước 3: Chọn Keystore
1. **Key store path**: `android/linhtinhapp-release-key.jks`
2. **Nhập thông tin**:
   ```
   Key store password: mdbAbc!23
   Key alias: linhtinhapp-key-alias  
   Key password: mdbAbc!23
   ```
3. **Next**

### Bước 4: Build Release
1. **Build Variants**: Chọn **"release"**
2. **✅ V1 Signature**
3. **✅ V2 Signature**  
4. **Create**

### Bước 5: Lấy AAB file
**Location**: `android/app/build/outputs/bundle/release/app-release.aab`

## 📱 Upload lên Google Play Store

### Thông tin version mới:
- **Version Code**: 2 (tăng từ 1)
- **Version Name**: 1.1 (tăng từ 1.0)
- **Target API**: 35 (tăng từ 34)

### Upload steps:
1. **Google Play Console** → **Production**
2. **Create new release**
3. **Upload AAB file**
4. **Release notes**: "Update target API to 35, fix lunar calendar display"
5. **Save** → **Review** → **Start rollout to production**

## 🔧 Alternative: Command Line (nếu Android Studio không có)

```bash
# 1. Build Angular
npm run build

# 2. Sync Capacitor  
npm run cap:sync

# 3. Build AAB
cd android
gradlew bundleRelease

# AAB location: android/app/build/outputs/bundle/release/app-release.aab
```

## ✅ Checklist
- [ ] API level 35 ✅ (đã cập nhật)
- [ ] Version code 2 ✅ (đã cập nhật)  
- [ ] Keystore ready ✅ (có sẵn)
- [ ] Build AAB thành công
- [ ] Upload lên Play Store
- [ ] Release notes đã điền

**🎯 Mục tiêu**: Upload AAB mới với API level 35 để pass Google Play Store requirements!