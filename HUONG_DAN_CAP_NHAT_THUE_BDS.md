# HƯỚNG DẪN CẬP NHẬT THAM SỐ THUẾ BẤT ĐỘNG SẢN

## 📋 Tổng quan
Component tính thuế bất động sản sử dụng hệ thống tham số CSV để dễ dàng cập nhật các quy định thuế khi có thay đổi.

## 📁 File tham số: `src/assets/real-estate-tax.csv`

### Cấu trúc file CSV:
```csv
parameter,value,description
documentFee,100000,Phí thẩm định hồ sơ (VND)
certificateFee,500000,Phí cấp giấy chứng nhận (VND)
notaryFeeRate,0.001,Tỷ lệ phí công chứng (0.1%)
firstTimeBuyerDiscount,0.5,Giảm giá cho người mua nhà lần đầu (50%)
transferTaxRate1,0.20,Thuế suất chuyển nhượng < 2 năm (20%)
...
```

## 🔧 Các tham số có thể cập nhật:

### 1. Phí cố định:
- `documentFee`: Phí thẩm định hồ sơ (VND)
- `certificateFee`: Phí cấp giấy chứng nhận (VND)
- `notaryFeeRate`: Tỷ lệ phí công chứng (dạng thập phân)
- `firstTimeBuyerDiscount`: Giảm giá cho người mua nhà lần đầu (dạng thập phân)

### 2. Thuế suất chuyển nhượng theo thời gian:
- `transferTaxRate1`: Thuế suất < 2 năm (dạng thập phân, 0.20 = 20%)
- `transferTaxRate2`: Thuế suất 2-5 năm (dạng thập phân, 0.15 = 15%)
- `transferTaxRate3`: Thuế suất >= 5 năm (dạng thập phân, 0.10 = 10%)
- `exemptionThreshold1`: Ngưỡng miễn thuế (2 năm)
- `exemptionThreshold2`: Ngưỡng giảm thuế (5 năm)

### 3. Thuế suất theo loại bất động sản:
**Thuế sử dụng đất:**
- `residentialLandUseTaxRate`: Thuế suất đất ở (3%/năm)
- `commercialLandUseTaxRate`: Thuế suất đất thương mại (7%/năm)
- `industrialLandUseTaxRate`: Thuế suất đất công nghiệp (5%/năm)
- `agriculturalLandUseTaxRate`: Thuế suất đất nông nghiệp (1%/năm)
- `officeLandUseTaxRate`: Thuế suất đất văn phòng (8%/năm)
- `warehouseLandUseTaxRate`: Thuế suất đất kho bãi (4%/năm)

**Thuế chuyển nhượng:**
- `residentialTransferTaxRate`: Thuế suất chuyển nhượng nhà ở (2%)
- `commercialTransferTaxRate`: Thuế suất chuyển nhượng thương mại (2%)
- `industrialTransferTaxRate`: Thuế suất chuyển nhượng công nghiệp (2%)
- `agriculturalTransferTaxRate`: Thuế suất chuyển nhượng nông nghiệp (2%)
- `officeTransferTaxRate`: Thuế suất chuyển nhượng văn phòng (2%)
- `warehouseTransferTaxRate`: Thuế suất chuyển nhượng kho bãi (2%)

**Lệ phí trước bạ:**
- `residentialRegistrationFeeRate`: Lệ phí trước bạ nhà ở (0.5%)
- `commercialRegistrationFeeRate`: Lệ phí trước bạ thương mại (0.5%)
- `industrialRegistrationFeeRate`: Lệ phí trước bạ công nghiệp (0.5%)
- `agriculturalRegistrationFeeRate`: Lệ phí trước bạ nông nghiệp (0.5%)
- `officeRegistrationFeeRate`: Lệ phí trước bạ văn phòng (0.5%)
- `warehouseRegistrationFeeRate`: Lệ phí trước bạ kho bãi (0.5%)

### 4. Hệ số khu vực:
- `urban1Coefficient`: Hệ số đô thị loại 1 (HN, HCM) - 1.5
- `urban2Coefficient`: Hệ số đô thị loại 2 - 1.3
- `urban3Coefficient`: Hệ số đô thị loại 3 - 1.1
- `ruralCoefficient`: Hệ số nông thôn - 1.0
- `remoteCoefficient`: Hệ số vùng sâu vùng xa - 0.8

### 5. Diện tích miễn thuế:
- `residentialExemptionArea`: Diện tích miễn thuế đất ở (200 m²)
- `commercialExemptionArea`: Diện tích miễn thuế đất thương mại (0 m²)
- `industrialExemptionArea`: Diện tích miễn thuế đất công nghiệp (0 m²)
- `agriculturalExemptionArea`: Diện tích miễn thuế đất nông nghiệp (1000 m²)
- `officeExemptionArea`: Diện tích miễn thuế đất văn phòng (0 m²)
- `warehouseExemptionArea`: Diện tích miễn thuế đất kho bãi (0 m²)

## 📝 Ví dụ cập nhật:

### Thay đổi thuế suất chuyển nhượng:
```csv
transferTaxRate1,0.25,Thuế suất chuyển nhượng < 2 năm (25%)
transferTaxRate2,0.18,Thuế suất chuyển nhượng 2-5 năm (18%)
transferTaxRate3,0.12,Thuế suất chuyển nhượng >= 5 năm (12%)
```

### Cập nhật phí cố định:
```csv
documentFee,150000,Phí thẩm định hồ sơ (VND)
certificateFee,600000,Phí cấp giấy chứng nhận (VND)
notaryFeeRate,0.0015,Tỷ lệ phí công chứng (0.15%)
```

### Điều chỉnh hệ số khu vực:
```csv
urban1Coefficient,1.8,Hệ số đô thị loại 1 (HN HCM)
urban2Coefficient,1.5,Hệ số đô thị loại 2
urban3Coefficient,1.2,Hệ số đô thị loại 3
```

## 🚀 Cách cập nhật:

1. **Chỉnh sửa file CSV**: Mở `src/assets/real-estate-tax.csv` và cập nhật các giá trị cần thiết
2. **Kiểm tra định dạng**: Đảm bảo file CSV đúng cấu trúc (parameter,value,description)
3. **Upload lên server**: Thay thế file cũ bằng file mới
4. **Tự động cập nhật**: Component sẽ tự động tải tham số mới khi refresh trang

## ⚠️ Lưu ý quan trọng:

### Định dạng số:
- Số tiền: Nhập đầy đủ (ví dụ: 100000 cho 100 nghìn)
- Thuế suất: Dạng thập phân (0.20 cho 20%, 0.05 cho 5%)
- Hệ số: Số thập phân (1.5, 0.8)
- Diện tích: Số nguyên (200, 1000)

### Tính hợp lệ:
- Thuế suất: 0.01-0.50 (1%-50%)
- Hệ số khu vực: 0.5-3.0
- Diện tích miễn thuế: 0-5000 m²
- Phí cố định: 50,000-2,000,000 VND
- Ngưỡng thời gian: 1-10 năm

### Công thức tính toán:

**Thuế sử dụng đất:**
```
Diện tích chịu thuế = Max(0, Diện tích - Diện tích miễn thuế)
Giá trị chịu thuế = (Diện tích chịu thuế / Tổng diện tích) × Giá đất
Thuế suất thực tế = Thuế suất cơ bản × Hệ số khu vực
Thuế hàng năm = Giá trị chịu thuế × Thuế suất thực tế
```

**Thuế chuyển nhượng:**
```
Lợi nhuận = Giá bán - Giá mua - Chi phí cải tạo - Chi phí bán
Thuế suất = f(Thời gian nắm giữ)
Thuế = Max(0, Lợi nhuận × Thuế suất)
```

**Lệ phí trước bạ:**
```
Lệ phí cơ bản = Giá trị BDS × Thuế suất lệ phí
Lệ phí thực tế = Lệ phí cơ bản × (1 - Giảm giá lần đầu)
Tổng phí = Lệ phí + Phí thẩm định + Phí giấy CN + Phí công chứng
```

## 📊 Hiển thị thông tin cập nhật:

Component sẽ hiển thị:
- ✅ Ngày cập nhật tham số lần cuối
- ✅ Các thuế suất hiện tại theo loại BDS
- ✅ Hệ số khu vực áp dụng
- ✅ Phí cố định và tỷ lệ phí
- ✅ Thông báo nếu tải tham số thất bại (dùng giá trị mặc định)

## 🔄 Tự động refresh:

Để áp dụng tham số mới mà không cần restart ứng dụng:
1. Thay thế file CSV trên server
2. Người dùng refresh trang web
3. Component tự động tải tham số mới từ file CSV

## 📞 Hỗ trợ:

Nếu gặp vấn đề khi cập nhật tham số:
1. Kiểm tra định dạng file CSV
2. Xem console browser để debug lỗi
3. Component sẽ dùng giá trị mặc định nếu file CSV lỗi
4. Liên hệ developer để hỗ trợ kỹ thuật

## 📈 Lịch sử thay đổi quy định:

### 2024:
- Thuế chuyển nhượng: 20%, 15%, 10% theo thời gian nắm giữ
- Lệ phí trước bạ: 0.5% với giảm 50% lần đầu mua nhà
- Thuế sử dụng đất: 1%-8% tùy loại đất

### 2025 (dự kiến):
- Có thể điều chỉnh thuế suất theo tình hình thị trường
- Cập nhật hệ số khu vực theo quy hoạch mới
- Thay đổi diện tích miễn thuế theo chính sách nhà ở xã hội