# 🔐 Hướng dẫn tạo Keystore cho Android App

## Bước 1: Tạo Keystore

```bash
keytool -genkey -v -keystore linhtinhapp-release-key.keystore -alias linhtinhapp -keyalg RSA -keysize 2048 -validity 10000
```

Điền thông tin khi được hỏi:
- **Keystore password**: [Tạo password mạnh và lưu lại]
- **Key password**: [Có thể giống keystore password]
- **First and last name**: Tên của bạn
- **Organizational unit**: IT Department
- **Organization**: Linh Tinh App
- **City**: Ho Chi Minh City
- **State**: Ho Chi Minh
- **Country code**: VN

## Bước 2: Cấu hình trong Android project

Tạo file `android/key.properties`:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=linhtinhapp
storeFile=../linhtinhapp-release-key.keystore
```

## Bước 3: Cập nhật build.gradle

Thêm vào `android/app/build.gradle`:

```gradle
// Thêm ở đầu file, sau android {
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing config ...
    
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
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

## ⚠️ Quan trọng

1. **Backup keystore**: Lưu file `.keystore` và `key.properties` ở nơi an toàn
2. **Không commit**: Thêm vào `.gitignore`:
   ```
   *.keystore
   key.properties
   ```
3. **Mất keystore = mất app**: Không thể update app nếu mất keystore

## 🔧 Script tự động setup

```bash
#!/bin/bash
echo "Setting up keystore for Android app..."

# Generate keystore
keytool -genkey -v -keystore linhtinhapp-release-key.keystore -alias linhtinhapp -keyalg RSA -keysize 2048 -validity 10000

# Move to android folder
mv linhtinhapp-release-key.keystore android/

echo "Keystore created successfully!"
echo "Remember to:"
echo "1. Create android/key.properties file"
echo "2. Update android/app/build.gradle"
echo "3. Backup your keystore file!"
```