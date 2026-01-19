#!/bin/bash

echo "🚀 Starting Android build process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
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

# Check if Android folder exists
if [ ! -d "android" ]; then
    print_error "Android folder not found. Run 'npm run cap:add:android' first."
    exit 1
fi

# Step 1: Build Angular app
print_status "Building Angular application..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Angular build failed!"
    exit 1
fi
print_success "Angular build completed!"

# Step 2: Sync with Capacitor
print_status "Syncing with Capacitor..."
npm run cap:sync
if [ $? -ne 0 ]; then
    print_error "Capacitor sync failed!"
    exit 1
fi
print_success "Capacitor sync completed!"

# Step 3: Build Android
cd android

print_status "Cleaning previous builds..."
./gradlew clean

print_status "Building debug APK..."
./gradlew assembleDebug
if [ $? -ne 0 ]; then
    print_error "Debug APK build failed!"
    exit 1
fi
print_success "Debug APK build completed!"

print_status "Building release AAB (for Play Store)..."
./gradlew bundleRelease
if [ $? -ne 0 ]; then
    print_warning "Release AAB build failed. This might be due to missing keystore."
    print_warning "Debug APK is still available for testing."
else
    print_success "Release AAB build completed!"
fi

# Show output locations
echo ""
echo "📁 Build outputs:"
echo "   Debug APK: android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "app/build/outputs/bundle/release/app-release.aab" ]; then
    echo "   Release AAB: android/app/build/outputs/bundle/release/app-release.aab"
fi

echo ""
print_success "Build process completed!"
print_status "You can now:"
print_status "1. Install debug APK on device for testing"
print_status "2. Upload release AAB to Google Play Console"