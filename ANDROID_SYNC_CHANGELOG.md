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


## Ngày: 12/02/2026

### 🔧 Các thay đổi được đồng bộ:

#### 1. 📅 Social Insurance - Date Format Update (MM/yyyy)
- **Files**: `src/app/features/socialinsurrance.component.html`, `src/app/features/socialinsurrance.component.ts`, `src/app/features/socialinsurrance.component.scss`
- **Issue**: Cột Từ/Đến trong bảng lương hưu sử dụng `type="month"` hiển thị theo browser locale, tốn không gian
- **Fix**: 
  - Đổi input type từ `month` sang `text` với placeholder "MM/yyyy"
  - Thêm pattern validation: `(0[1-9]|1[0-2])\/\d{4}`
  - Implement `parseMonthYear()` helper để parse cả MM/yyyy và yyyy-MM formats
  - Implement `formatMonthYear()` helper để convert dates sang MM/yyyy display
  - Update CSV import/export để tự động convert format
  - Loại bỏ month-specific CSS styling
- **Impact**: 
  - Date columns hiển thị compact hơn (01/2020 thay vì browser locale format)
  - Tiết kiệm không gian trên mobile
  - Backward compatible với CSV files cũ (yyyy-MM format)
  - User có thể nhập trực tiếp theo format MM/yyyy

**Build Status:** ✅ Success (12.776 seconds)
**Sync Status:** ✅ Success (0.523 seconds)


## Ngày: 12/02/2026 (Buổi chiều)

### 🎉 Tính năng mới: Chiếc nón kỳ diệu

#### 1. 🎩 Magic Hat - Công cụ quay thưởng
- **Files**: `src/app/features/magic-hat.component.ts`, `src/app/features/magic-hat.component.html`, `src/app/features/magic-hat.component.scss`
- **Route**: `/non`
- **Tính năng**:
  - Nhập tối đa 5 loại giải thưởng với tên và số lượng
  - Nút "Khởi tạo nón kỳ diệu" để tạo pool giải thưởng
  - Nút "PLAY" để quay số random trúng thưởng
  - Animation quay số sinh động với hiệu ứng spin
  - Tracking số lượng còn lại của từng loại giải real-time
  - Progress bar hiển thị tỷ lệ giải còn lại
  - Lịch sử 10 lần quay gần nhất với timestamp
  - Màu sắc phân biệt rõ ràng cho 5 loại giải
  - Weighted random: xác suất dựa trên số lượng còn lại
  - Responsive design với gradient vàng đẹp mắt
- **UI/UX**:
  - Icon nón 🎩 với animation float
  - Nút Play đỏ nổi bật kích thước lớn (80x80px)
  - Result card với màu tương ứng loại giải
  - Spin animation khi đang quay
  - Scale-in animation khi hiển thị kết quả
  - Info modal với hướng dẫn chi tiết
- **Ứng dụng**: Quay thưởng sự kiện, rút thăm may mắn, phân phối quà tặng ngẫu nhiên

**Build Status:** ✅ Success (17.121 seconds)
**Sync Status:** ✅ Success (0.376 seconds)

**Home Page Update:**
- Cập nhật subtitle: "10 công cụ hữu ích cho cuộc sống"
- Thêm tool card mới: 🎩 Nón kỳ diệu - Quay số trúng thưởng
