# 📦 HƯỚNG DẪN CẬP NHẬT GIÁ SHIP

## 📋 Cấu trúc file CSV

File `src/assets/giaship.csv` chứa thông tin giá ship của các đơn vị vận chuyển.

### Các cột trong CSV:

| Cột | Mô tả | Ví dụ |
|-----|-------|-------|
| `provider` | Mã đơn vị (không đổi) | grab, shopee, lazada, ghn, viettelpost, jt |
| `providerName` | Tên hiển thị | Grab Express, Shopee Express |
| `logo` | Icon emoji | 🚗, 🛒, 🛍️, 📦, 📮, ⚡ |
| `baseFee` | Phí cơ bản (VND) | 15000 |
| `distanceFeePerZone` | Phí theo khoảng cách/zone (VND) | 8000 |
| `weightFreeLimit` | Trọng lượng miễn phí (kg) | 2 |
| `weightFeePerKg` | Phí mỗi kg vượt quá (VND) | 5000 |
| `expressMultiplier` | Hệ số giao nhanh | 1.5 |
| `insuranceRate` | Tỷ lệ bảo hiểm (%) | 0.005 (= 0.5%) |
| `codMinFee` | Phí COD tối thiểu (VND) | 5000 |
| `codRate` | Tỷ lệ phí COD (%) | 0.01 (= 1%) |
| `standardTimeZone1` | Thời gian giao Zone 1 | 2-4 giờ |
| `standardTimeZone2` | Thời gian giao Zone 2 | 3-5 giờ |
| `standardTimeZone3` | Thời gian giao Zone 3 | 4-6 giờ |
| `expressTimeZone1` | Thời gian giao nhanh Zone 1 | 1-2 giờ |
| `expressTimeZone2` | Thời gian giao nhanh Zone 2 | 2-3 giờ |
| `expressTimeZone3` | Thời gian giao nhanh Zone 3 | 3-4 giờ |
| `features` | Tính năng (cách nhau bởi \|) | Giao nhanh\|Theo dõi realtime |
| `discount` | Tỷ lệ giảm giá (%) | 0.1 (= 10%) |

## 🔄 Cách cập nhật:

### 1. Mở file CSV
```
src/assets/giaship.csv
```

### 2. Cập nhật giá theo bảng giá mới
- Thay đổi `baseFee`, `distanceFeePerZone`, `weightFeePerKg`
- Cập nhật `insuranceRate`, `codMinFee`, `codRate`
- Điều chỉnh thời gian giao hàng nếu cần

### 3. Lưu file
- Lưu file với encoding UTF-8
- Đảm bảo không có dấu phẩy thừa
- Kiểm tra format đúng

### 4. Deploy lên web
- Upload file lên server
- Ngày modify của file sẽ được hiển thị trên web

## 📊 Ví dụ cập nhật:

### Trước:
```csv
grab,Grab Express,🚗,15000,8000,2,5000,1.5,0.005,5000,0.01,...
```

### Sau (tăng giá 10%):
```csv
grab,Grab Express,🚗,16500,8800,2,5500,1.5,0.005,5500,0.01,...
```

## ⚠️ Lưu ý quan trọng:

1. **Không thay đổi cột `provider`** - đây là mã định danh
2. **Giữ nguyên thứ tự các cột**
3. **Sử dụng dấu phẩy (,) làm separator**
4. **Features phân cách bằng dấu | (pipe)**
5. **Số thập phân dùng dấu chấm (.)**
6. **Không có khoảng trắng thừa**

## 🎯 Zones (Khu vực):

- **Zone 1**: TP.HCM, Hà Nội, Đà Nẵng
- **Zone 2**: Bình Dương, Đồng Nai, Hải Phòng, v.v.
- **Zone 3**: Các tỉnh lẻ khác

## 📅 Lịch cập nhật:

- **Hàng tháng**: Kiểm tra bảng giá mới
- **Khi có thay đổi**: Cập nhật ngay lập tức
- **Sau sự kiện**: Tết, Black Friday, v.v.

## 🔍 Kiểm tra sau cập nhật:

1. Mở trang web
2. Kiểm tra "Giá cập nhật: X ngày trước"
3. Test tính toán với vài trường hợp
4. So sánh với giá chính thức của đơn vị

## 📞 Nguồn thông tin giá:

- **Grab**: App Grab, website chính thức
- **Shopee**: Seller Center, bảng giá ship
- **Lazada**: Seller Center
- **GHN**: Website, bảng giá công khai
- **Viettel Post**: Website chính thức
- **J&T**: Website, hotline

---

**Lưu ý**: File này chỉ là hướng dẫn. Giá thực tế luôn thay đổi theo chính sách của từng đơn vị.