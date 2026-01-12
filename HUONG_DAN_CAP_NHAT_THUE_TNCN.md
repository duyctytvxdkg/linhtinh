# HƯỚNG DẪN CẬP NHẬT THAM SỐ THUẾ THU NHẬP CÁ NHÂN

## 📋 Tổng quan
Component tính thuế thu nhập cá nhân sử dụng hệ thống tham số CSV để dễ dàng cập nhật các quy định thuế khi có thay đổi.

## 📁 File tham số: `src/assets/thuetncn.csv`

### Cấu trúc file CSV:
```csv
parameter,value,description
personalDeduction,11000000,Giảm trừ bản thân (VND/tháng)
dependentDeduction,4400000,Giảm trừ người phụ thuộc (VND/tháng)
insuranceDeduction,10500000,Giảm trừ bảo hiểm bắt buộc tối đa (VND/tháng)
tier1Min,0,Bậc 1 - Thu nhập từ (VND/tháng)
tier1Max,5000000,Bậc 1 - Thu nhập đến (VND/tháng)
tier1Rate,0.05,Bậc 1 - Thuế suất (5%)
...
```

## 🔧 Các tham số có thể cập nhật:

### 1. Giảm trừ cơ bản:
- `personalDeduction`: Giảm trừ bản thân (VND/tháng)
- `dependentDeduction`: Giảm trừ người phụ thuộc (VND/tháng)  
- `insuranceDeduction`: Giảm trừ bảo hiểm tối đa (VND/tháng)

### 2. Bậc thuế (tối đa 7 bậc):
Mỗi bậc thuế có 3 tham số:
- `tierXMin`: Thu nhập từ (VND/tháng)
- `tierXMax`: Thu nhập đến (VND/tháng) - dùng 999999999 cho bậc cuối
- `tierXRate`: Thuế suất (dạng thập phân, ví dụ: 0.05 = 5%)

## 📝 Ví dụ cập nhật:

### Thay đổi giảm trừ bản thân từ 11 triệu lên 15 triệu:
```csv
personalDeduction,15000000,Giảm trừ bản thân (VND/tháng)
```

### Thêm bậc thuế mới 40% cho thu nhập trên 100 triệu:
```csv
tier7Min,80000001,Bậc 7 - Thu nhập từ (VND/tháng)
tier7Max,100000000,Bậc 7 - Thu nhập đến (VND/tháng)
tier7Rate,0.35,Bậc 7 - Thuế suất (35%)
tier8Min,100000001,Bậc 8 - Thu nhập từ (VND/tháng)
tier8Max,999999999,Bậc 8 - Thu nhập đến (VND/tháng)
tier8Rate,0.40,Bậc 8 - Thuế suất (40%)
```

## 🚀 Cách cập nhật:

1. **Chỉnh sửa file CSV**: Mở `src/assets/thuetncn.csv` và cập nhật các giá trị cần thiết
2. **Kiểm tra định dạng**: Đảm bảo file CSV đúng cấu trúc (parameter,value,description)
3. **Upload lên server**: Thay thế file cũ bằng file mới
4. **Tự động cập nhật**: Component sẽ tự động tải tham số mới khi refresh trang

## ⚠️ Lưu ý quan trọng:

### Định dạng số:
- Số tiền: Nhập đầy đủ (ví dụ: 11000000 cho 11 triệu)
- Thuế suất: Dạng thập phân (0.05 cho 5%, 0.35 cho 35%)
- Không sử dụng dấu phẩy hoặc dấu chấm phân cách hàng nghìn

### Bậc thuế:
- Phải có ít nhất 1 bậc thuế
- Tối đa 7 bậc thuế (tier1 đến tier7)
- Bậc cuối cùng dùng `tierXMax = 999999999`
- Các bậc phải liên tục không có khoảng trống

### Kiểm tra tính hợp lệ:
- Thu nhập `tierXMin` của bậc sau = `tierXMax` của bậc trước + 1
- Thuế suất tăng dần theo bậc
- Không có bậc thuế âm hoặc > 100%

## 📊 Hiển thị thông tin cập nhật:

Component sẽ hiển thị:
- ✅ Ngày cập nhật tham số lần cuối
- ✅ Các giá trị giảm trừ hiện tại
- ✅ Số bậc thuế đang áp dụng
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