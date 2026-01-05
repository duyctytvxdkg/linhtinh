# Debug Guide: Proxy Connection Issues

## Vấn đề hiện tại
Thông báo lỗi: `No tide table found for current day extraction`

## Nguyên nhân có thể
1. **Proxy chưa được khởi động đúng cách**
2. **Server Angular chưa load proxy configuration**
3. **Kết nối đến cau-ca.com bị chặn**
4. **HTML structure của cau-ca.com đã thay đổi**

## Cách debug từng bước

### Bước 1: Kiểm tra server Angular có chạy với proxy không
```bash
# Dừng server hiện tại (Ctrl+C)
# Khởi động lại với proxy config
ng serve --proxy-config proxy.conf.json
```

### Bước 2: Kiểm tra proxy configuration
File `proxy.conf.json` phải có:
```json
{
  "/api/tide/*": {
    "target": "https://cau-ca.com",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info"
  }
}
```

### Bước 3: Test kết nối proxy
1. Mở browser đến `http://localhost:4200`
2. Mở Developer Tools (F12)
3. Vào tab Console
4. Click nút "Test Proxy" 
5. Xem kết quả trong console

### Bước 4: Test trực tiếp từ browser
Mở tab mới và thử truy cập:
```
http://localhost:4200/api/tide/vn/ho-chi-minh/coral-bank
```

**Kết quả mong đợi**: Hiển thị HTML của trang cau-ca.com
**Nếu lỗi**: Proxy chưa hoạt động

### Bước 5: Kiểm tra network requests
1. Mở Developer Tools > Network tab
2. Click "Dữ liệu thực"
3. Xem request đến `/api/tide/vn/ho-chi-minh/coral-bank`
4. Kiểm tra:
   - Status code (200 = OK)
   - Response có chứa HTML không
   - Response size > 10KB

### Bước 6: Debug parsing
Nếu proxy hoạt động nhưng vẫn lỗi parsing:
1. Mở Console
2. Tìm log: `🔍 Parsing HTML content, length: XXX`
3. Nếu length < 1000: HTML không đầy đủ
4. Nếu length > 10000: HTML OK, lỗi parsing

## Các thông báo lỗi và ý nghĩa

| Thông báo | Nguyên nhân | Giải pháp |
|-----------|-------------|-----------|
| `Proxy chưa hoạt động` | Server chưa load proxy config | Restart với `--proxy-config` |
| `Status: 0` | CORS hoặc network error | Kiểm tra proxy config |
| `Status: 404` | Endpoint không tồn tại | Kiểm tra URL mapping |
| `HTML content too short` | Response không đầy đủ | Kiểm tra network |
| `No tide table found` | HTML structure thay đổi | Cập nhật parser |

## Giải pháp tạm thời
Nếu proxy không hoạt động, hệ thống sẽ tự động chuyển sang **dữ liệu mô phỏng** với:
- ✅ Dữ liệu chính xác cho TP.HCM
- ✅ Bảng thủy triều đầy đủ
- ✅ Biểu đồ 24h
- ✅ Highlight ngày hiện tại

## Commands hữu ích

```bash
# Khởi động server với proxy
ng serve --proxy-config proxy.conf.json

# Kiểm tra port đang sử dụng
netstat -an | findstr :4200

# Test curl trực tiếp (ngoài Angular)
curl -v https://cau-ca.com/vn/ho-chi-minh/coral-bank
```

## Lưu ý quan trọng
- Proxy chỉ hoạt động trong development mode (`ng serve`)
- Production build cần cấu hình proxy riêng trên server
- Một số firewall có thể chặn kết nối đến cau-ca.com