# 🚀 Quick Start: Build iOS App - Bắt đầu ngay!

## 🎯 Tóm tắt
- ✅ **GitHub Actions** đã setup (miễn phí)
- ✅ **Capacitor iOS config** đã cập nhật
- ✅ **Workflow** tự động build khi push code

---

## 📱 BƯỚC 1: ĐĂNG KÝ APPLE DEVELOPER (BẮT BUỘC)

### Chi phí: $99/năm
1. **Truy cập**: https://developer.apple.com/programs/
2. **Enroll** → **Individual** (hoặc Organization)
3. **Thanh toán** $99
4. **Verify identity** (có thể mất 1-2 ngày)

### Tại sao cần:
- **Bắt buộc** để publish lên App Store
- **Code signing** certificates
- **TestFlight** distribution
- **App Store Connect** access

---

## 🔧 BƯỚC 2: TEST BUILD VỚI GITHUB ACTIONS

### Đã setup sẵn:
- ✅ File `.github/workflows/build-ios.yml`
- ✅ Capacitor iOS config
- ✅ Tự động build khi push code

### Cách test:
1. **Commit và push** code hiện tại
2. **GitHub** → **Actions** tab
3. **Xem build process** (mất ~10-15 phút)
4. **Download artifacts** nếu build thành công

### Kết quả mong đợi:
- ✅ **Build simulator**: Thành công
- ⚠️ **Archive device**: Có thể fail (cần certificates)

---

## 📋 BƯỚC 3: SETUP CERTIFICATES (SAU KHI CÓ DEVELOPER ACCOUNT)

### 3.1 Tạo App ID
1. **Developer Portal** → **Certificates, Identifiers & Profiles**
2. **Identifiers** → **+** → **App IDs**
3. **Bundle ID**: `com.linhtinhapp.tools`
4. **Description**: "Kho Tools Tiện Ích"
5. **Capabilities**: Default (có thể thêm sau)

### 3.2 Tạo Certificates
1. **Certificates** → **+**
2. **iOS Distribution** (cho App Store)
3. **Upload CSR** (tạo từ Keychain Access trên Mac)
4. **Download certificate**

### 3.3 Tạo Provisioning Profile
1. **Profiles** → **+**
2. **App Store** distribution
3. **Select App ID**: com.linhtinhapp.tools
4. **Select Certificate**: Vừa tạo
5. **Download profile**

---

## 🍎 BƯỚC 4: BUILD TRÊN MAC (NẾU CÓ)

### Nếu có Mac:
```bash
# Clone project
git clone https://github.com/duyctytvxdkg/linhtinh.git
cd linhtinh

# Install dependencies
npm install

# Build Angular
npm run build

# Add iOS platform
npx cap add ios

# Sync Capacitor
npx cap sync ios

# Open Xcode
npx cap open ios
```

### Trong Xcode:
1. **Import certificates** và provisioning profiles
2. **Select Team** (Apple Developer Account)
3. **Build** → **Archive**
4. **Distribute** → **App Store Connect**

---

## ☁️ BƯỚC 5: SỬ DỤNG MAC CLOUD (NẾU KHÔNG CÓ MAC)

### Khuyến nghị: MacinCloud
- **Chi phí**: $30-50/tháng
- **URL**: https://www.macincloud.com
- **Plan**: Dedicated Server (có Xcode)

### Setup trên MacinCloud:
1. **Đăng ký** và chọn plan
2. **Connect** qua VNC/RDP
3. **Install** Node.js, Git
4. **Clone project** và build như trên Mac thật

---

## 🤖 BƯỚC 6: TỐI ƯU GITHUB ACTIONS (NÂNG CAO)

### Thêm secrets cho auto-signing:
1. **GitHub repo** → **Settings** → **Secrets**
2. **Add secrets**:
   - `IOS_CERTIFICATE_BASE64`
   - `IOS_CERTIFICATE_PASSWORD`
   - `IOS_PROVISIONING_PROFILE_BASE64`

### Update workflow để auto-sign:
```yaml
- name: Import Certificate
  run: |
    echo "${{ secrets.IOS_CERTIFICATE_BASE64 }}" | base64 --decode > certificate.p12
    security create-keychain -p "" build.keychain
    security import certificate.p12 -k build.keychain -P "${{ secrets.IOS_CERTIFICATE_PASSWORD }}" -A
    security list-keychains -s build.keychain
    security default-keychain -s build.keychain
    security unlock-keychain -p "" build.keychain
```

---

## 📱 BƯỚC 7: APP STORE CONNECT

### Setup App Store Connect:
1. **https://appstoreconnect.apple.com**
2. **My Apps** → **+** → **New App**
3. **App Information**:
   - Name: "Kho Tools Tiện Ích"
   - Bundle ID: com.linhtinhapp.tools
   - Language: Vietnamese
4. **Pricing**: Free
5. **Availability**: Vietnam (hoặc worldwide)

### App Store Listing:
- **Screenshots**: iPhone (6.7", 6.5", 5.5")
- **App Description**: Tiếng Việt
- **Keywords**: "công cụ, tiện ích, tính thuế, lịch âm"
- **Privacy Policy**: URL đã tạo

---

## ⏰ TIMELINE DỰ KIẾN

### Tuần 1:
- [ ] Đăng ký Apple Developer ($99)
- [ ] Test GitHub Actions build
- [ ] Setup MacinCloud (nếu cần)

### Tuần 2:
- [ ] Tạo certificates & provisioning
- [ ] Build và test trên device
- [ ] Setup App Store Connect

### Tuần 3:
- [ ] Upload build lên TestFlight
- [ ] Internal testing
- [ ] Submit for App Store review

### Tuần 4:
- [ ] App Store review (1-7 ngày)
- [ ] App live trên App Store

---

## 💰 CHI PHÍ TỔNG

### Bắt buộc:
- **Apple Developer**: $99/năm

### Tùy chọn (nếu không có Mac):
- **MacinCloud**: $30-50/tháng
- **AWS EC2 Mac**: $750+/tháng (không khuyến nghị)

### Miễn phí:
- **GitHub Actions**: 2000 phút/tháng
- **App Store hosting**: Miễn phí

---

## 🎯 BƯỚC TIẾP THEO NGAY BÂY GIỜ

### 1. Đăng ký Apple Developer (ưu tiên cao)
**Link**: https://developer.apple.com/programs/

### 2. Test GitHub Actions
```bash
# Push code để trigger build
git add .
git commit -m "Add iOS build workflow"
git push origin main

# Xem kết quả tại: https://github.com/[username]/[repo]/actions
```

### 3. Chuẩn bị assets
- **App Icon**: 1024x1024px
- **Screenshots**: iPhone các size
- **App Description**: Tiếng Việt

### 4. Nếu cần Mac ngay
**MacinCloud**: https://www.macincloud.com (có thể dùng ngay)

---

## 📞 HỖ TRỢ

### Nếu gặp vấn đề:
1. **GitHub Actions logs**: Chi tiết lỗi build
2. **Apple Developer Forums**: Hỗ trợ certificates
3. **Capacitor Docs**: https://capacitorjs.com/docs/ios

### Files quan trọng đã tạo:
- ✅ `.github/workflows/build-ios.yml` - GitHub Actions
- ✅ `capacitor.config.ts` - iOS config
- ✅ `HUONG_DAN_BUILD_IOS_AWS_MAC.md` - Hướng dẫn chi tiết

**🚀 Bắt đầu với Apple Developer registration ngay hôm nay!**