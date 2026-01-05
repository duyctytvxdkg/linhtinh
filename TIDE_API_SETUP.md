# Hướng dẫn cấu hình API Thủy triều

## Tổng quan
App hiện tại sử dụng 3 API thủy triều chuẩn quốc tế thay vì scraping cau-ca.com:

1. **WorldTides API** (Ưu tiên 1)
2. **NOAA Tides API** (Ưu tiên 2) 
3. **Stormglass API** (Backup)

## API Keys cần thiết

### 1. WorldTides API (Khuyến nghị)
- **Website**: https://www.worldtides.info
- **Free tier**: 100 requests/tháng
- **Ưu điểm**: Dữ liệu toàn cầu, chính xác cao
- **Đăng ký**: Tạo tài khoản miễn phí → lấy API key

```typescript
// Thay 'demo' bằng API key thật
const url = `https://www.worldtides.info/api/v3?extremes&lat=${lat}&lon=${lon}&start=${start}&end=${end}&key=YOUR_API_KEY`;
```

### 2. NOAA Tides API (Miễn phí)
- **Website**: https://tidesandcurrents.noaa.gov
- **Free tier**: Không giới hạn
- **Ưu điểm**: Miễn phí hoàn toàn
- **Nhược điểm**: Chủ yếu cho US, cần tìm station gần TP.HCM

### 3. Stormglass API (Backup)
- **Website**: https://stormglass.io
- **Free tier**: 50 requests/ngày
- **Ưu điểm**: Dữ liệu chi tiết, nhiều thông số
- **Đăng ký**: Tạo tài khoản → lấy API key

```typescript
// Thay 'demo-key' bằng API key thật
headers: {
  'Authorization': 'YOUR_STORMGLASS_API_KEY'
}
```

## Cách cấu hình

### Bước 1: Lấy API Keys
1. Đăng ký tài khoản tại WorldTides.info
2. Xác nhận email và lấy API key
3. (Tùy chọn) Đăng ký Stormglass.io để có backup

### Bước 2: Cập nhật code
Trong file `tide.service.ts`, thay các demo keys:

```typescript
// WorldTides API
const url = `https://www.worldtides.info/api/v3?extremes&lat=${lat}&lon=${lon}&start=${start}&end=${end}&key=YOUR_WORLDTIDES_KEY`;

// Stormglass API
headers: {
  'Authorization': 'YOUR_STORMGLASS_KEY'
}
```

### Bước 3: Environment Variables (Khuyến nghị)
Tạo file `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  worldTidesApiKey: 'your-worldtides-key',
  stormglassApiKey: 'your-stormglass-key'
};
```

Sau đó import và sử dụng:

```typescript
import { environment } from '../../environments/environment';

const url = `...&key=${environment.worldTidesApiKey}`;
```

## Tọa độ TP.HCM
- **Latitude**: 10.7461
- **Longitude**: 106.7516
- **Vị trí**: Nhà Bè, TP.HCM (gần cảng Sài Gòn)

## Fallback Strategy
App sẽ thử các API theo thứ tự:
1. WorldTides → NOAA → Stormglass
2. Nếu tất cả fail → Dữ liệu mô phỏng chính xác

## Lợi ích của API chuẩn

### ✅ So với scraping cau-ca.com:
- **Không có CORS issues**
- **Dữ liệu JSON chuẩn** (không cần parse HTML)
- **Độ tin cậy cao** (API chính thức)
- **Cập nhật real-time**
- **Không bị chặn** bởi website

### ✅ Tính năng:
- **Extremes data**: Thời gian và độ cao thủy triều
- **Predictions**: Dự báo 24h-7 ngày
- **Multiple locations**: Hỗ trợ nhiều vị trí
- **Historical data**: Dữ liệu lịch sử

## Chi phí
- **WorldTides**: $0 (100 requests/tháng) → $5/tháng (unlimited)
- **NOAA**: Miễn phí hoàn toàn
- **Stormglass**: $0 (50 requests/ngày) → $9/tháng (unlimited)

## Test thử
1. Mở app → Click "Test API"
2. Xem console logs để debug
3. Click "API Thủy triều" để load dữ liệu thực
4. Nếu fail → tự động fallback sang dữ liệu mô phỏng

## Production Setup
Để deploy production:
1. Đăng ký API keys
2. Cấu hình environment variables
3. Set up rate limiting nếu cần
4. Monitor API usage

Với setup này, app sẽ có dữ liệu thủy triều chính xác và đáng tin cậy! 🌊