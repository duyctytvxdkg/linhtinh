#!/bin/bash

echo "🚀 Preparing app for production release..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Remove debug logs from lunar calendar
print_status "Removing debug logs from production build..."

# Remove console.log from lunar calendar component
sed -i.bak '/console\.log/d' src/app/features/lunar-calendar.component.ts

print_success "Debug logs removed!"

# Update version in capacitor config
print_status "Current app configuration:"
echo "App ID: com.linhtinhapp.tools"
echo "App Name: Kho Tools Tiện Ích"

# Build for production
print_status "Building for production..."
npm run build --prod

if [ $? -eq 0 ]; then
    print_success "Production build completed!"
else
    print_warning "Production build failed. Check errors above."
    exit 1
fi

# Sync with Capacitor
print_status "Syncing with Capacitor..."
npm run cap:sync

print_success "App prepared for production!"
print_status "Next steps:"
echo "1. Run './build-android.sh' to build APK/AAB"
echo "2. Test the debug APK thoroughly"
echo "3. Setup keystore if not done yet"
echo "4. Build release AAB for Play Store"
echo "5. Upload to Google Play Console"

# Restore original file (remove backup)
if [ -f "src/app/features/lunar-calendar.component.ts.bak" ]; then
    rm src/app/features/lunar-calendar.component.ts.bak
fi