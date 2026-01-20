#!/bin/bash

echo "🔐 Creating Android Keystore for Linh Tinh App"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if keytool exists
if ! command -v keytool &> /dev/null; then
    print_error "keytool not found. Please install Java JDK first."
    exit 1
fi

# App details
APP_NAME="linhtinhapp"
KEYSTORE_FILE="${APP_NAME}-release-key.jks"
KEY_ALIAS="${APP_NAME}-key-alias"

print_info "App Name: Kho Tools Tiện Ích"
print_info "Keystore File: $KEYSTORE_FILE"
print_info "Key Alias: $KEY_ALIAS"
echo ""

# Get passwords
echo "Please enter passwords (remember these!):"
read -s -p "Enter keystore password: " STORE_PASSWORD
echo ""
read -s -p "Re-enter keystore password: " STORE_PASSWORD_CONFIRM
echo ""

if [ "$STORE_PASSWORD" != "$STORE_PASSWORD_CONFIRM" ]; then
    print_error "Passwords don't match!"
    exit 1
fi

read -s -p "Enter key password (or press ENTER to use same as keystore): " KEY_PASSWORD
echo ""

if [ -z "$KEY_PASSWORD" ]; then
    KEY_PASSWORD="$STORE_PASSWORD"
fi

# Create keystore
print_info "Creating keystore..."
keytool -genkey -v \
    -keystore "$KEYSTORE_FILE" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "$STORE_PASSWORD" \
    -keypass "$KEY_PASSWORD" \
    -dname "CN=Linh Tinh App, OU=IT Department, O=Linh Tinh App, L=Ho Chi Minh City, ST=Ho Chi Minh, C=VN"

if [ $? -eq 0 ]; then
    print_success "Keystore created successfully!"
    
    # Move to android folder if exists
    if [ -d "android" ]; then
        mv "$KEYSTORE_FILE" android/
        print_info "Keystore moved to android/ folder"
    fi
    
    # Create key.properties file
    print_info "Creating key.properties file..."
    cat > android/key.properties << EOF
storePassword=$STORE_PASSWORD
keyPassword=$KEY_PASSWORD
keyAlias=$KEY_ALIAS
storeFile=$KEYSTORE_FILE
EOF
    
    print_success "key.properties created in android/ folder"
    
    # Update .gitignore
    if [ -f ".gitignore" ]; then
        if ! grep -q "key.properties" .gitignore; then
            echo "" >> .gitignore
            echo "# Android keystore" >> .gitignore
            echo "*.jks" >> .gitignore
            echo "*.keystore" >> .gitignore
            echo "android/key.properties" >> .gitignore
            print_info "Updated .gitignore to exclude keystore files"
        fi
    fi
    
    echo ""
    print_success "Setup completed!"
    print_warning "IMPORTANT: Backup these files safely:"
    echo "  - android/$KEYSTORE_FILE"
    echo "  - android/key.properties"
    echo ""
    print_info "Next steps:"
    echo "1. Update android/app/build.gradle to use signing config"
    echo "2. Run './build-android.sh' to build signed APK"
    
else
    print_error "Failed to create keystore!"
    exit 1
fi