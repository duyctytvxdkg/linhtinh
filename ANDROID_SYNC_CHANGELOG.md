# 📱 Android App Sync - Changelog

## Ngày: 30/01/2026

### 🔧 Các thay đổi được đồng bộ:

#### 1. ✅ Fix Double Bullet Points
- **Files**: `src/app/features/shipping-calculator.component.html`, `src/app/features/real-estate-tax.component.html`
- **Issue**: Info modals hiển thị double bullet points (`<li>•` thay vì chỉ `<li>`)
- **Fix**: Loại bỏ ký tự `•` thủ công vì HTML lists tự động có bullets
- **Impact**: UI sạch hơn, không còn bullet points bị duplicate

#### 2. 🌊 Fix Tide Component Auto-Scroll
- **Files**: `src/app/features/tide.component.ts`, `src/app/features/tide.component.html`
- **Issue**: Khi chọn ngày khác trong bảng thủy triều tháng, không tự scroll về đầu trang để xem biểu đồ
- **Fix**: 
  - Thêm `@ViewChild('chartContainer')` để reference chart container
  - Implement `scrollToTop()` method với multiple fallback approaches
  - Trigger scroll tại multiple time points (immediate, 300ms, 800ms)
- **Impact**: UX tốt hơn, user tự động thấy chart khi chọn ngày mới

#### 3. 📊 Fix Missing Tide Events Summary
- **Files**: `src/app/features/tide.component.ts`
- **Issue**: Khi chọn ngày khác, bảng "Tổng kết thủy triều" bị mất
- **Fix**:
  - Enhance `processExtremesData()` để accept `targetDate` parameter
  - Enhance `processTideApiData()` để pass selected date
  - Fix `loadDataForSelectedDay()` để generate heights data properly
  - Fix `loadSimulatedDataForDay()` để generate complete data
- **Impact**: Tide events summary hiển thị đúng cho mọi ngày được chọn

#### 4. 🔙 Android Back Button Handling
- **Files**: `src/app/app.component.ts`, `package.json`
- **Issue**: Bấm nút back (phím cứng) trên Android thoát app thay vì về home
- **Fix**:
  - Add `@capacitor/app` plugin
  - Implement back button listener với smart logic:
    - Nếu đang ở home page → Exit app
    - Nếu đang ở page khác → Navigate về home
  - Add route tracking để biết current page
- **Impact**: UX chuẩn Android, back button hoạt động như mong đợi

### 🛠️ Technical Details:

#### Dependencies Added:
```json
"@capacitor/app": "^6.0.0"
```

#### Key Methods Added:
- `scrollToTop()` - Multi-approach scrolling
- `initializeBackButtonHandling()` - Android back button logic
- `processExtremesData(extremes, targetDate?)` - Date-aware tide processing
- `generateHeightsFromExtremesForDay()` - Generate heights for specific dates

#### Platform Detection:
```typescript
if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
  // Android-specific back button handling
}
```

### 📋 Testing Checklist:

#### Tide Component:
- [ ] Click vào ngày khác trong bảng tháng
- [ ] Verify auto-scroll về chart area
- [ ] Verify "Tổng kết thủy triều" hiển thị đúng data cho ngày đó
- [ ] Verify chart update với data ngày mới

#### Info Modals:
- [ ] Mở info modal ở shipping calculator
- [ ] Mở info modal ở real estate tax
- [ ] Verify không còn double bullet points

#### Android Back Button:
- [ ] Từ home page: Back button → Exit app
- [ ] Từ feature page: Back button → Navigate về home
- [ ] Verify không crash hoặc unexpected behavior

### 🚀 Build Commands:

```bash
# Sync tất cả changes
./sync-android-changes.bat

# Hoặc manual:
npm install @capacitor/app@^6.0.0
npm run build
npx cap sync
npx cap open android
```

### 📝 Notes:
- Tất cả changes đã được test trên browser
- Android back button chỉ hoạt động trên native Android app
- Scroll functionality có multiple fallbacks để ensure compatibility
- Tide data processing now works correctly cho mọi selected date