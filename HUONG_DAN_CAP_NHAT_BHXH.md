# HƯỚNG DẪN CẬP NHẬT THAM SỐ BẢO HIỂM XÃ HỘI

## 📋 Tổng quan
Component tính bảo hiểm xã hội sử dụng hệ thống tham số CSV để dễ dàng cập nhật các quy định BHXH khi có thay đổi.

## 📁 File tham số: `src/assets/bhxh.csv`

### Cấu trúc file CSV:
```csv
parameter,value,description
minContributionYears,20,Số năm đóng tối thiểu để được hưởng lương hưu
replacementRate,0.45,Tỷ lệ thay thế cơ bản (45%)
yearlyIncreaseRate,0.02,Tỷ lệ tăng hàng năm (2%/năm)
maxReplacementRate,0.75,Tỷ lệ thay thế tối đa (75%)
retirementAgeM,62,Tuổi nghỉ hưu nam
retirementAgeF,60,Tuổi nghỉ hưu nữ
...
```

## 🔧 Các tham số có thể cập nhật:

### 1. Điều kiện hưởng lương hưu:
- `minContributionYears`: Số năm đóng tối thiểu (năm)
- `retirementAgeM`: Tuổi nghỉ hưu nam (tuổi)
- `retirementAgeF`: Tuổi nghỉ hưu nữ (tuổi)

### 2. Tỷ lệ thay thế lương:
- `replacementRate`: Tỷ lệ thay thế cơ bản (dạng thập phân, 0.45 = 45%)
- `yearlyIncreaseRate`: Tỷ lệ tăng hàng năm (dạng thập phân, 0.02 = 2%/năm)
- `maxReplacementRate`: Tỷ lệ thay thế tối đa (dạng thập phân, 0.75 = 75%)

### 3. Mức đóng bảo hiểm:
- `bhxhRate`: Tỷ lệ đóng BHXH (dạng thập phân, 0.08 = 8%)
- `bhytRate`: Tỷ lệ đóng BHYT (dạng thập phân, 0.015 = 1.5%)
- `bhtnRate`: Tỷ lệ đóng BHTN (dạng thập phân, 0.01 = 1%)
- `maxSalaryBase`: Mức lương tối đa đóng BHXH (VND/tháng)

### 4. Mức lương cơ sở:
- `baseSalary2024`: Lương cơ sở năm 2024 (VND/tháng)
- `baseSalary2025`: Lương cơ sở năm 2025 (VND/tháng)
- `baseSalary2026`: Lương cơ sở năm 2026 (VND/tháng)

### 5. Hệ số điều chỉnh:
- `adjustmentFactor2024`: Hệ số điều chỉnh năm 2024
- `adjustmentFactor2025`: Hệ số điều chỉnh năm 2025

### 5. Bảo hiểm thất nghiệp:
- `unemploymentMinMonths`: Số tháng đóng BHTN tối thiểu để được hưởng (12 tháng)
- `unemploymentMaxMonths`: Số tháng hưởng BHTN tối đa (12 tháng)
- `unemploymentRate`: Tỷ lệ hưởng BHTN (60% lương bình quân - cố định)
- `unemploymentMinBenefit`: Mức trợ cấp BHTN tối thiểu (bằng lương tối thiểu vùng)
- `unemploymentMaxBenefit`: Mức trợ cấp BHTN tối đa (5 lần lương tối thiểu vùng)

## � Qu y định pháp lý:

### Bảo hiểm thất nghiệp theo Luật Việc làm 2013 và Nghị định 28/2015/NĐ-CP:

**Điều kiện hưởng:**
- Đóng BHTN đủ 12 tháng trở lên trong 24 tháng trước khi thất nghiệp
- Chấm dứt hợp đồng lao động (trừ trường hợp tự ý nghỉ việc)
- Nộp hồ sơ hưởng BHTN trong 3 tháng kể từ ngày chấm dứt hợp đồng

**Mức hưởng:**
- 60% mức lương bình quân đóng BHTN của 6 tháng liền kề trước khi thất nghiệp
- Tối thiểu bằng mức lương tối thiểu vùng
- Tối đa bằng 5 lần mức lương tối thiểu vùng

**Thời gian hưởng:**
- Đóng 12-35 tháng: hưởng 3 tháng
- Đóng 36-71 tháng: hưởng 6 tháng  
- Đóng 72-143 tháng: hưởng 9 tháng
- Đóng 144 tháng trở lên: hưởng 12 tháng

## 📝 Ví dụ cập nhật:

### Thay đổi tuổi nghỉ hưu:
```csv
retirementAgeM,65,Tuổi nghỉ hưu nam
retirementAgeF,63,Tuổi nghỉ hưu nữ
```

### Cập nhật tỷ lệ thay thế:
```csv
replacementRate,0.50,Tỷ lệ thay thế cơ bản (50%)
yearlyIncreaseRate,0.025,Tỷ lệ tăng hàng năm (2.5%/năm)
maxReplacementRate,0.80,Tỷ lệ thay thế tối đa (80%)
```

### Điều chỉnh mức đóng bảo hiểm:
```csv
bhxhRate,0.085,Tỷ lệ đóng BHXH (8.5%)
bhytRate,0.02,Tỷ lệ đóng BHYT (2%)
maxSalaryBase,50000000,Mức lương tối đa đóng BHXH (50 triệu/tháng)
```

### Cập nhật tham số bảo hiểm thất nghiệp:
```csv
unemploymentMinMonths,12,Số tháng đóng BHTN tối thiểu để được hưởng
unemploymentMaxMonths,12,Số tháng hưởng BHTN tối đa
unemploymentRate,0.60,Tỷ lệ hưởng BHTN (60% lương bình quân)
unemploymentMinBenefit,1800000,Mức trợ cấp BHTN tối thiểu (lương tối thiểu vùng)
unemploymentMaxBenefit,9000000,Mức trợ cấp BHTN tối đa (5 lần lương tối thiểu vùng)
```

## 🚀 Cách cập nhật:

1. **Chỉnh sửa file CSV**: Mở `src/assets/bhxh.csv` và cập nhật các giá trị cần thiết
2. **Kiểm tra định dạng**: Đảm bảo file CSV đúng cấu trúc (parameter,value,description)
3. **Upload lên server**: Thay thế file cũ bằng file mới
4. **Tự động cập nhật**: Component sẽ tự động tải tham số mới khi refresh trang

## ⚠️ Lưu ý quan trọng:

### Định dạng số:
- Số tiền: Nhập đầy đủ (ví dụ: 1800000 cho 1.8 triệu)
- Tỷ lệ phần trăm: Dạng thập phân (0.45 cho 45%, 0.02 cho 2%)
- Tuổi: Số nguyên (62, 60)
- Số năm: Số nguyên (20, 25)

### Tính hợp lệ:
- Tuổi nghỉ hưu: 55-70 tuổi
- Tỷ lệ thay thế: 0.3-0.8 (30%-80%)
- Tỷ lệ tăng hàng năm: 0.01-0.05 (1%-5%)
- Số năm đóng tối thiểu: 15-25 năm
- Số tháng đóng BHTN tối thiểu: 12-24 tháng
- Tỷ lệ hưởng BHTN: 60% (cố định theo quy định)
- Mức trợ cấp BHTN: 1.8-9 triệu VND/tháng (1-5 lần lương tối thiểu vùng)

### Công thức tính lương hưu:
```
Tỷ lệ hưởng = Tỷ lệ cơ bản + (Số năm đóng - Năm cơ sở) × Tỷ lệ tăng/năm
Tỷ lệ hưởng = Min(Tỷ lệ hưởng, Tỷ lệ tối đa)
Lương hưu = Lương bình quân × Tỷ lệ hưởng
```

### Công thức tính bảo hiểm thất nghiệp:
```
Số tháng được hưởng = f(Số tháng đóng)
- 12-35 tháng đóng → 3 tháng hưởng
- 36-71 tháng đóng → 6 tháng hưởng  
- 72-143 tháng đóng → 9 tháng hưởng
- 144+ tháng đóng → 12 tháng hưởng

Tỷ lệ hưởng = 60% lương bình quân (cố định)

Trợ cấp = Min(Max(Lương BQ × 60%, Mức tối thiểu), Mức tối đa)
Mức tối thiểu = Lương tối thiểu vùng
Mức tối đa = 5 × Lương tối thiểu vùng
```

## 📊 Hiển thị thông tin cập nhật:

Component sẽ hiển thị:
- ✅ Ngày cập nhật tham số lần cuối
- ✅ Các điều kiện hưởng lương hưu hiện tại
- ✅ Tỷ lệ đóng bảo hiểm áp dụng
- ✅ Điều kiện và mức trợ cấp BHTN
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
- Tuổi nghỉ hưu: Nam 62, Nữ 60
- Tỷ lệ thay thế cơ bản: 45%
- Mức lương tối đa đóng BHXH: 46.8 triệu/tháng

### 2025 (dự kiến):
- Tuổi nghỉ hưu có thể tăng dần
- Tỷ lệ thay thế có thể điều chỉnh
- Mức lương tối đa đóng BHXH tăng theo lương cơ sở
- Điều kiện hưởng BHTN có thể thay đổi theo tình hình kinh tế