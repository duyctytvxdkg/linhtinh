# 🍎 AWS EC2 Mac Setup Step-by-Step - Tận dụng AWS Credit

## 💰 Chi phí AWS EC2 Mac (sử dụng credit)
- **mac1.metal**: ~$1.083/giờ (~$26/ngày)
- **mac2.metal**: ~$1.444/giờ (~$35/ngày)  
- **mac2-m2.metal**: ~$1.444/giờ (~$35/ngày)
- **Minimum**: 24 giờ (không thể terminate sớm)

## ⚠️ LƯU Ý QUAN TRỌNG
- **Minimum commitment**: 24 giờ
- **Không thể stop/start** - chỉ có thể terminate
- **Dedicated Host** - không share với ai khác
- **Hợp pháp** 100% (chính thức từ Apple + AWS)

---

## 🚀 BƯỚC 1: TẠO AWS EC2 MAC INSTANCE

### 1.1 Truy cập AWS Console
1. **Đăng nhập** AWS Console: https://console.aws.amazon.com
2. **Chọn region**: **US East (N. Virginia)** hoặc **US West (Oregon)**
   - Mac instances chỉ có ở một số region
3. **Services** → **EC2**

### 1.2 Launch Mac Instance
1. **EC2 Dashboard** → **Launch Instance**
2. **Name**: `iOS-Build-Mac`
3. **Application and OS Images**:
   - **Quick Start** → **macOS**
   - **AMI**: `macOS Monterey 12.x` hoặc `macOS Ventura 13.x`
   - **Architecture**: `64-bit (Arm)` cho M2 hoặc `64-bit (x86)` cho Intel

### 1.3 Instance Type
**Chọn một trong:**
- **mac1.metal** (Intel, cũ hơn, rẻ hơn)
- **mac2.metal** (Intel M1, nhanh hơn)
- **mac2-m2.metal** (Apple M2, nhanh nhất)

**Khuyến nghị**: `mac2.metal` (cân bằng giá/hiệu suất)

### 1.4 Key Pair
1. **Create new key pair**:
   - **Name**: `ios-build-key`
   - **Type**: `RSA`
   - **Format**: `.pem`
2. **Download** và lưu an toàn

### 1.5 Network Settings
1. **VPC**: Default VPC
2. **Subnet**: Default subnet
3. **Auto-assign public IP**: Enable
4. **Security Group**: Create new
   - **Name**: `mac-build-sg`
   - **Rules**:
     - **SSH (22)**: Your IP only
     - **VNC (5900)**: Your IP only (optional)
     - **Custom TCP (5901-5910)**: Your IP only (VNC range)

### 1.6 Storage
1. **Root volume**: 
   - **Size**: 200 GB (minimum)
   - **Type**: `gp3` (faster)
   - **IOPS**: 3000
   - **Throughput**: 125 MB/s

### 1.7 Advanced Details
1. **Tenancy**: `Dedicated Host` (tự động chọn)
2. **User data** (optional):
```bash
#!/bin/bash
# Enable SSH
sudo systemsetup -setremotelogin on
# Enable VNC
sudo /System/Library/CoreServices/RemoteManagement/ARDAgent.app/Contents/Resources/kickstart -activate -configure -access -on -clientopts -setvnclegacy -vnclegacy yes -clientopts -setvncpw -vncpw yourpassword -restart -agent -privs -all
```

### 1.8 Launch Instance
1. **Review** tất cả settings
2. **Launch Instance**
3. **⏰ Đợi 10-15 phút** để instance boot

---

## 🔌 BƯỚC 2: CONNECT ĐẾN MAC INSTANCE

### 2.1 Lấy thông tin connection
1. **EC2 Console** → **Instances**
2. **Select instance** → **Connect**
3. **Copy Public IP**: `xx.xx.xx.xx`

### 2.2 SSH Connection (Command Line)
```bash
# Windows (PowerShell/CMD)
ssh -i ios-build-key.pem ec2-user@[PUBLIC-IP]

# Nếu gặp lỗi permissions (Windows)
icacls ios-build-key.pem /inheritance:r
icacls ios-build-key.pem /grant:r %username%:R
```

### 2.3 VNC Connection (GUI - Khuyến nghị)
1. **Download VNC Viewer**: https://www.realvnc.com/download/viewer/
2. **Connect**: `[PUBLIC-IP]:5900`
3. **Password**: `yourpassword` (nếu đã set trong user data)

### 2.4 Nếu VNC chưa setup
```bash
# SSH vào instance trước
ssh -i ios-build-key.pem ec2-user@[PUBLIC-IP]

# Enable VNC
sudo /System/Library/CoreServices/RemoteManagement/ARDAgent.app/Contents/Resources/kickstart -activate -configure -access -on -clientopts -setvnclegacy -vnclegacy yes -clientopts -setvncpw -vncpw yourpassword -restart -agent -privs -all

# Restart VNC service
sudo launchctl unload /System/Library/LaunchDaemons/com.apple.screensharing.plist
sudo launchctl load /System/Library/LaunchDaemons/com.apple.screensharing.plist
```

---

## 🛠️ BƯỚC 3: SETUP DEVELOPMENT ENVIRONMENT

### 3.1 System Update
```bash
# Update macOS (có thể mất 30-60 phút)
sudo softwareupdate -i -a

# Reboot nếu cần
sudo reboot
```

### 3.2 Install Command Line Tools
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Verify installation
xcode-select -p
```

### 3.3 Install Homebrew
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add to PATH
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### 3.4 Install Development Tools
```bash
# Install Node.js
brew install node

# Install Git
brew install git

# Install wget (useful)
brew install wget

# Verify installations
node --version
npm --version
git --version
```

---

## 📱 BƯỚC 4: INSTALL XCODE

### 4.1 Download Xcode (Cách 1 - App Store)
1. **Open App Store** trên Mac
2. **Search "Xcode"**
3. **Install** (miễn phí, ~10GB, mất 1-2 giờ)

### 4.2 Download Xcode (Cách 2 - Developer Portal)
1. **Truy cập**: https://developer.apple.com/download/
2. **Đăng nhập** Apple ID
3. **Download Xcode** (.xip file)
4. **Extract và install**

### 4.3 Setup Xcode
```bash
# Accept Xcode license
sudo xcodebuild -license accept

# Install additional components
sudo xcodebuild -runFirstLaunch

# Verify Xcode
xcodebuild -version
```

---

## 📂 BƯỚC 5: CLONE VÀ SETUP PROJECT

### 5.1 Clone Repository
```bash
# Clone project
git clone https://github.com/duyctytvxdkg/linhtinh.git
cd linhtinh

# Verify files
ls -la
```

### 5.2 Install Dependencies
```bash
# Install npm dependencies
npm install

# Install Capacitor CLI globally
npm install -g @capacitor/cli

# Verify Capacitor
npx cap --version
```

### 5.3 Build Angular App
```bash
# Build for production
npm run build

# Verify build output
ls -la dist/
```

### 5.4 Add iOS Platform
```bash
# Add iOS platform
npx cap add ios

# Sync Capacitor
npx cap sync ios

# Verify iOS platform
ls -la ios/
```

---

## 🍎 BƯỚC 6: BUILD IOS APP

### 6.1 Open Xcode Project
```bash
# Open iOS project in Xcode
npx cap open ios

# Hoặc mở thủ công
open ios/App/App.xcworkspace
```

### 6.2 Configure Project trong Xcode
1. **Select project** "App" trong navigator
2. **General tab**:
   - **Display Name**: "Kho Tools Tiện Ích"
   - **Bundle Identifier**: `com.linhtinhapp.tools`
   - **Version**: 1.0
   - **Build**: 1
3. **Signing & Capabilities**:
   - **Team**: Chọn Apple Developer team (cần Apple Developer Account)
   - **Provisioning Profile**: Automatic

### 6.3 Build for Simulator
```bash
# Build for simulator (không cần certificates)
cd ios
xcodebuild -workspace App/App.xcworkspace \
           -scheme App \
           -destination 'platform=iOS Simulator,name=iPhone 15' \
           build
```

### 6.4 Build for Device (cần Apple Developer Account)
```bash
# Archive for device
xcodebuild -workspace App/App.xcworkspace \
           -scheme App \
           -configuration Release \
           -destination 'generic/platform=iOS' \
           -archivePath App.xcarchive \
           archive
```

---

## 📦 BƯỚC 7: EXPORT VÀ DISTRIBUTE

### 7.1 Export IPA (trong Xcode)
1. **Window** → **Organizer**
2. **Archives** tab
3. **Select archive** → **Distribute App**
4. **App Store Connect** → **Next**
5. **Upload** → **Next**
6. **Automatically manage signing** → **Next**
7. **Upload**

### 7.2 Export IPA (Command Line)
```bash
# Tạo ExportOptions.plist
cat > ExportOptions.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
</dict>
</plist>
EOF

# Export IPA
xcodebuild -exportArchive \
           -archivePath App.xcarchive \
           -exportPath ./export \
           -exportOptionsPlist ExportOptions.plist
```

---

## 🔄 BƯỚC 8: AUTOMATION SCRIPT

### 8.1 Tạo Build Script
```bash
# Tạo script tự động
cat > build-ios.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting iOS build process..."

# Build Angular
echo "📦 Building Angular app..."
npm run build

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync ios

# Build iOS
echo "🍎 Building iOS app..."
cd ios
xcodebuild -workspace App/App.xcworkspace \
           -scheme App \
           -configuration Release \
           -destination 'generic/platform=iOS' \
           -archivePath App.xcarchive \
           archive

echo "✅ Build completed successfully!"
echo "📁 Archive location: ios/App.xcarchive"
EOF

# Make executable
chmod +x build-ios.sh

# Run build
./build-ios.sh
```

---

## 💾 BƯỚC 9: BACKUP VÀ CLEANUP

### 9.1 Backup Build Artifacts
```bash
# Tạo backup folder
mkdir -p ~/ios-builds/$(date +%Y%m%d_%H%M%S)

# Copy artifacts
cp -r ios/App.xcarchive ~/ios-builds/$(date +%Y%m%d_%H%M%S)/
cp -r ios/export ~/ios-builds/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true

# List backups
ls -la ~/ios-builds/
```

### 9.2 Download Files (nếu cần)
```bash
# Từ local machine, download files từ EC2
scp -i ios-build-key.pem -r ec2-user@[PUBLIC-IP]:~/ios-builds ./
```

---

## 🛑 BƯỚC 10: TERMINATE INSTANCE (QUAN TRỌNG)

### ⚠️ Lưu ý: Sau 24 giờ minimum
```bash
# Kiểm tra thời gian đã chạy
aws ec2 describe-instances --instance-ids i-xxxxxxxxx --query 'Reservations[0].Instances[0].LaunchTime'

# Terminate instance (chỉ sau 24h)
aws ec2 terminate-instances --instance-ids i-xxxxxxxxx
```

### Hoặc từ Console:
1. **EC2 Console** → **Instances**
2. **Select instance** → **Instance State** → **Terminate**
3. **Confirm termination**

---

## 📊 MONITORING CHI PHÍ

### Kiểm tra chi phí real-time:
1. **AWS Console** → **Billing & Cost Management**
2. **Cost Explorer** → **Daily costs**
3. **Set up billing alerts** nếu cần

### Ước tính chi phí:
- **24 giờ đầu**: ~$26-35 (minimum)
- **Mỗi giờ thêm**: ~$1-1.5
- **Với credit**: Sẽ trừ từ credit trước

---

## ✅ CHECKLIST HOÀN THÀNH

### Trước khi bắt đầu:
- [ ] AWS account với credit
- [ ] Apple Developer Account ($99/năm)
- [ ] VNC Viewer installed
- [ ] SSH key downloaded

### Trong quá trình:
- [ ] EC2 Mac instance launched
- [ ] VNC/SSH connection established
- [ ] Xcode installed và configured
- [ ] Project cloned và dependencies installed
- [ ] iOS build successful
- [ ] Archive created

### Sau khi hoàn thành:
- [ ] IPA exported
- [ ] Files backed up
- [ ] Instance terminated (sau 24h)
- [ ] Chi phí kiểm tra

---

## 🚨 TROUBLESHOOTING

### Lỗi thường gặp:

#### 1. "Instance failed to launch"
- **Nguyên nhân**: Không có Dedicated Host available
- **Giải pháp**: Thử region khác hoặc instance type khác

#### 2. "Cannot connect via SSH"
- **Nguyên nhân**: Security Group hoặc key permissions
- **Giải pháp**: Kiểm tra Security Group rules và key permissions

#### 3. "Xcode build failed"
- **Nguyên nhân**: Missing certificates hoặc provisioning profiles
- **Giải pháp**: Setup Apple Developer Account và certificates

#### 4. "VNC connection refused"
- **Nguyên nhân**: VNC chưa được enable
- **Giải pháp**: SSH vào và enable VNC manually

---

## 🎯 TIMELINE DỰ KIẾN

### Ngày 1 (Setup):
- **0-2h**: Launch instance và connect
- **2-4h**: Install Xcode và development tools
- **4-6h**: Clone project và setup

### Ngày 2 (Build):
- **0-2h**: Configure certificates và provisioning
- **2-4h**: Build và test
- **4-6h**: Export IPA và upload

### Tổng thời gian: ~24-48 giờ
### Chi phí ước tính: $50-100 (tùy instance type)

**🚀 Bắt đầu ngay để tận dụng AWS credit của bạn!**