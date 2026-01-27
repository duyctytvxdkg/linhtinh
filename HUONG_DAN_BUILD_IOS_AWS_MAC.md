# 🍎 Hướng dẫn Build iOS App trên AWS EC2 Mac - Step by Step

## ⚠️ LƯU Ý QUAN TRỌNG

**Vấn đề pháp lý:**
- Chạy macOS trên hardware không phải Apple vi phạm EULA của Apple
- AWS EC2 Mac instances là hợp pháp nhưng đắt ($25+/ngày)
- Khuyến nghị sử dụng GitHub Actions (miễn phí) hoặc thuê Mac thật

---

## 🚀 PHƯƠNG PHÁP 1: GITHUB ACTIONS (KHUYẾN NGHỊ - MIỄN PHÍ)

### Bước 1: Tạo GitHub Actions Workflow

Tạo file `.github/workflows/build-ios.yml`:

```yaml
name: Build iOS App

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-ios:
    runs-on: macos-latest
    
    steps:
    - name: Checkout Repository
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install Dependencies
      run: npm ci
      
    - name: Build Angular App
      run: npm run build
      
    - name: Sync Capacitor iOS
      run: |
        npx cap add ios
        npx cap sync ios
      
    - name: Build iOS App (Simulator)
      run: |
        cd ios
        xcodebuild -workspace App/App.xcworkspace \
                   -scheme App \
                   -destination 'platform=iOS Simulator,name=iPhone 15' \
                   build
                   
    - name: Upload iOS Build
      uses: actions/upload-artifact@v4
      with:
        name: ios-build
        path: ios/build/
```

### Ưu điểm GitHub Actions:
- ✅ **Miễn phí** 2000 phút/tháng
- ✅ **Hợp pháp** 100%
- ✅ **macOS mới nhất** với Xcode
- ✅ **Tự động** khi push code
- ✅ **Không cần** setup phức tạp

---

## 🚀 PHƯƠNG PHÁP 2: AWS EC2 MAC INSTANCES (ĐẮNG TIỀN)

### Chi phí AWS EC2 Mac:
- **mac1.metal**: ~$25/ngày (~$750/tháng)
- **mac2.metal**: ~$35/ngày (~$1050/tháng)
- **Minimum**: 24 giờ (không thể terminate sớm)

### Bước 1: Tạo AWS EC2 Mac Instance

1. **AWS Console** → **EC2** → **Launch Instance**
2. **AMI**: macOS Big Sur hoặc Monterey
3. **Instance Type**: mac1.metal hoặc mac2.metal
4. **Key Pair**: Tạo hoặc chọn existing
5. **Security Group**: 
   - SSH (22): Your IP
   - VNC (5900): Your IP (optional)
6. **Storage**: 200GB+ EBS
7. **Launch Instance**

### Bước 2: Connect đến Mac Instance

```bash
# SSH vào instance
ssh -i your-key.pem ec2-user@[instance-ip]

# Hoặc sử dụng VNC
# Enable VNC trong System Preferences
```

### Bước 3: Setup macOS Environment

```bash
# Update system
sudo softwareupdate -i -a

# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Git
brew install git

# Install Xcode Command Line Tools
xcode-select --install
```

### Bước 4: Install Xcode

```bash
# Download Xcode từ App Store hoặc Developer Portal
# Cần Apple ID với Developer Account

# Hoặc install Xcode Command Line Tools only
sudo xcode-select --install
```

### Bước 5: Clone và Setup Project

```bash
# Clone repository
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
```

### Bước 6: Build iOS App

```bash
# Open Xcode project
npx cap open ios

# Hoặc build từ command line
cd ios
xcodebuild -workspace App/App.xcworkspace \
           -scheme App \
           -destination 'platform=iOS Simulator,name=iPhone 15' \
           build
```

---

## 🚀 PHƯƠNG PHÁP 3: MACOS TRÊN VMWARE/VIRTUALBOX (KHÔNG KHUYẾN NGHỊ)

### ⚠️ Cảnh báo:
- **Vi phạm EULA** của Apple
- **Hiệu suất kém**
- **Không ổn định**
- **Có thể gặp vấn đề pháp lý**

### Nếu vẫn muốn thử (tự chịu rủi ro):

1. **Download macOS installer**
2. **Tạo VM** với VMware/VirtualBox
3. **Cấu hình**:
   - RAM: 8GB+
   - Storage: 100GB+
   - CPU: 4+ cores
4. **Install macOS**
5. **Setup development environment**

---

## 🚀 PHƯƠNG PHÁP 4: THUÊ MAC CLOUD (KHUYẾN NGHỊ)

### MacStadium, MacinCloud, AWS EC2 Mac:
- **MacStadium**: $79-199/tháng
- **MacinCloud**: $30-100/tháng  
- **AWS EC2 Mac**: $750+/tháng

### Ưu điểm:
- ✅ **Hợp pháp**
- ✅ **Hiệu suất tốt**
- ✅ **macOS chính thức**
- ✅ **Support tốt**

---

## 📱 SETUP IOS DEVELOPMENT

### Bước 1: Apple Developer Account
1. **Đăng ký**: https://developer.apple.com
2. **Chi phí**: $99/năm
3. **Verify identity**

### Bước 2: Certificates & Provisioning
1. **Xcode** → **Preferences** → **Accounts**
2. **Add Apple ID**
3. **Download certificates**
4. **Create App ID**: com.linhtinhapp.tools
5. **Create Provisioning Profile**

### Bước 3: Configure Capacitor iOS
```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.linhtinhapp.tools',
  appName: 'Kho Tools Tiện Ích',
  webDir: 'dist/linhtinhapp',
  server: {
    androidScheme: 'https'
  },
  ios: {
    scheme: 'Kho Tools Tiện Ích'
  }
};

export default config;
```

### Bước 4: Build & Archive
```bash
# Open in Xcode
npx cap open ios

# Trong Xcode:
# 1. Select "Any iOS Device"
# 2. Product → Archive
# 3. Distribute App → App Store Connect
```

---

## 🎯 KHUYẾN NGHỊ CUỐI CÙNG

### Cho người mới bắt đầu:
1. **GitHub Actions** (miễn phí, dễ setup)
2. **MacinCloud** ($30/tháng, ổn định)
3. **Mượn/thuê Mac** từ bạn bè

### Cho doanh nghiệp:
1. **Mua Mac Mini** ($599)
2. **MacStadium** (chuyên nghiệp)
3. **AWS EC2 Mac** (enterprise)

### Tránh:
- ❌ Hackintosh/VM (vi phạm EULA)
- ❌ AWS EC2 Mac cho hobby (quá đắt)
- ❌ Các service không chính thức

---

## 📋 CHECKLIST BUILD IOS

### Chuẩn bị:
- [ ] Apple Developer Account ($99/năm)
- [ ] macOS environment (GitHub Actions/Cloud/Real Mac)
- [ ] Xcode installed
- [ ] Project đã có iOS platform

### Build process:
- [ ] `npm run build` - Build Angular
- [ ] `npx cap sync ios` - Sync Capacitor
- [ ] Configure signing in Xcode
- [ ] Archive & upload to App Store Connect
- [ ] Submit for review

### App Store Connect:
- [ ] App information
- [ ] Screenshots (iPhone/iPad)
- [ ] App Store description
- [ ] Privacy policy URL
- [ ] Submit for review

---

## 🚀 BƯỚC TIẾP THEO

**Khuyến nghị ngay:**
1. **Setup GitHub Actions** (miễn phí, 10 phút)
2. **Đăng ký Apple Developer** ($99)
3. **Test build iOS** với GitHub Actions
4. **Nếu OK** → Submit lên App Store

**File cần tạo:**
- `.github/workflows/build-ios.yml` (GitHub Actions)
- Update `capacitor.config.ts` (iOS config)
- iOS certificates & provisioning profiles

Bạn muốn bắt đầu với phương pháp nào? GitHub Actions là nhanh nhất và miễn phí!