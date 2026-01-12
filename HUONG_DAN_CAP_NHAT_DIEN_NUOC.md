# ⚡ HƯỚNG DẪN CẬP NHẬT GIÁ ĐIỆN NƯỚC

## 📋 Cấu trúc file CSV

### 1. File tiendien.csv (Giá điện sinh hoạt)

| Cột | Mô tả | Ví dụ |
|-----|-------|-------|
| `tier` | Bậc thang (1-6) | 1, 2, 3, 4, 5, 6 |
| `minKwh` | kWh tối thiểu | 0, 51, 101, 201, 301, 401 |
| `maxKwh` | kWh tối đa | 50, 100, 200, 300, 400, 999999 |
| `pricePerKwh` | Giá VND/kWh | 1728, 1786, 2074, 2612, 2919, 3015 |
| `description` | Mô tả bậc | Bậc 1 (0-50 kWh) |

### 2. File tiennuoc.csv (Giá nước)

| Cột | Mô tả | Ví dụ |
|-----|-------|-------|
| `tier` | Bậc thang | 1, 2, 3, 4 |
| `minM3` | m³ tối thiểu | 0, 11, 21, 31 |
| `maxM3` | m³ tối đa | 10, 20, 30, 999999 |
| `pricePerM3` | Giá VND/m³ | 5973, 7052, 8669, 15929 |
| `description` | Mô tả bậc | Bậc 1 (0-10 m³) |
| `category` | Loại khách hàng | household, business, production |

## 🔄 Cách cập nhật:

### 1. Cập nhật giá điện (tiendien.csv)

```csv
tier,minKwh,maxKwh,pricePerKwh,description
1,0,50,1728,Bậc 1 (0-50 kWh)
2,51,100,1786,Bậc 2 (51-100 kWh)
3,101,200,2074,Bậc 3 (101-200 kWh)
4,201,300,2612,Bậc 4 (201-300 kWh)
5,301,400,2919,Bậc 5 (301-400 kWh)
6,401,999999,3015,Bậc 6 (trên 400 kWh)
```

### 2. Cập nhật giá nước (tiennuoc.csv)

#### Sinh hoạt (household):
```csv
1,0,10,5973,Bậc 1 (0-10 m³),household
2,11,20,7052,Bậc 2 (11-20 m³),household
3,21,30,8669,Bậc 3 (21-30 m³),household
4,31,999999,15929,Bậc 4 (trên 30 m³),household
```

#### Kinh doanh (business):
```csv
1,0,20,9955,Bậc 1 (0-20 m³),business
2,21,50,12947,Bậc 2 (21-50 m³),business
3,51,999999,15929,Bậc 3 (trên 50 m³),business
```

#### Sản xuất (production):
```csv
1,0,999999,22068,Giá cố định,production
```

## 📊 Bậc thang hiện tại (2025):

### ⚡ Điện sinh hoạt:
- **Bậc 1**: 0-50 kWh = 1,728 VND/kWh
- **Bậc 2**: 51-100 kWh = 1,786 VND/kWh  
- **Bậc 3**: 101-200 kWh = 2,074 VND/kWh
- **Bậc 4**: 201-300 kWh = 2,612 VND/kWh
- **Bậc 5**: 301-400 kWh = 2,919 VND/kWh
- **Bậc 6**: >400 kWh = 3,015 VND/kWh

### 💧 Nước sinh hoạt:
- **Bậc 1**: 0-10 m³ = 5,973 VND/m³
- **Bậc 2**: 11-20 m³ = 7,052 VND/m³
- **Bậc 3**: 21-30 m³ = 8,669 VND/m³
- **Bậc 4**: >30 m³ = 15,929 VND/m³

## 🔍 Nguồn thông tin chính thức:

### ⚡ Điện:
- **EVN**: Website chính thức, thông báo giá điện
- **Bộ Công Thương**: Quyết định về giá điện
- **Website**: evn.com.vn

### 💧 Nước:
- **SAWACO** (TP.HCM): sawaco.com.vn
- **HAWACO** (Hà Nội): hawacom.com.vn
- **Công ty cấp nước địa phương**

## ⚠️ Lưu ý quan trọng:

1. **Không thay đổi cấu trúc CSV**
2. **Giữ nguyên thứ tự các cột**
3. **Sử dụng dấu phẩy (,) làm separator**
4. **Số nguyên không có dấu chấm thập phân**
5. **maxKwh/maxM3 = 999999 cho bậc cuối**
6. **category phải là: household, business, production**

## 📅 Lịch cập nhật:

- **Hàng quý**: Kiểm tra thông báo mới từ EVN
- **Khi có quyết định**: Cập nhật ngay lập tức
- **Đầu năm**: Review toàn bộ bảng giá

## 🔧 Quy trình cập nhật:

1. **Thu thập thông tin** từ nguồn chính thức
2. **Mở file CSV** bằng text editor hoặc Excel
3. **Cập nhật giá** theo bảng giá mới
4. **Lưu file** với encoding UTF-8
5. **Upload lên server**
6. **Kiểm tra trên web** - ngày cập nhật sẽ thay đổi

## 📈 Ví dụ cập nhật giá điện tăng 5%:

### Trước:
```csv
1,0,50,1728,Bậc 1 (0-50 kWh)
```

### Sau:
```csv
1,0,50,1814,Bậc 1 (0-50 kWh)
```
*(1728 × 1.05 = 1814)*

## 🧮 Công thức tính:

### Điện:
```
Tiền điện (chưa VAT) = Σ(kWh_bậc_i × Giá_bậc_i)
VAT = Tiền điện × 8%
Tổng tiền = Tiền điện + VAT
```

### Nước:
```
Tổng tiền = Σ(m³_bậc_i × Giá_bậc_i)
(Chưa bao gồm VAT 5% - tùy địa phương)
```

## 💡 Mẹo:

- **Backup file** trước khi sửa
- **Test với vài trường hợp** sau khi cập nhật
- **So sánh với hóa đơn thật** để kiểm tra độ chính xác
- **Cập nhật mô tả** nếu có thay đổi khoảng bậc

---

**Lưu ý**: 
- **Tiền điện**: Đã bao gồm VAT 8% theo quy định
- **Tiền nước**: Chưa bao gồm VAT 5% (tùy địa phương)
- Hóa đơn thực tế có thể bao gồm các phí dịch vụ khác