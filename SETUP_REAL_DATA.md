# Hướng dẫn Setup Dữ liệu Thực từ Cau-Ca.com

## Tại sao cần Proxy?

Browser không thể gọi trực tiếp đến `https://cau-ca.com` do CORS policy. Khi bạn chạy `curl` thì không bị giới hạn này, nhưng từ browser thì bị chặn.

## Cách 1: Sử dụng Angular Proxy (Khuyến nghị)

### Bước 1: Đã tạo file `proxy.conf.json`
```json
{
  "/api/tide/*": {
    "target": "https://cau-ca.com",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug",
    "pathRewrite": {
      "^/api/tide": ""
    },
    "headers": {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
  }
}
```

### Bước 2: Đã cập nhật `angular.json`
Thêm `"proxyConfig": "proxy.conf.json"` vào development configuration.

### Bước 3: Chạy Angular với proxy
```bash
ng serve
```

### Bước 4: Test
- Mở ứng dụng
- Nhấn nút "Dữ liệu thực" 
- Kiểm tra console để xem có lỗi gì không

## Cách 2: Sử dụng Node.js Proxy Server

### Bước 1: Cài đặt dependencies
```bash
npm install express cors
```

### Bước 2: Chạy proxy server
```bash
node proxy-server.js
```

### Bước 3: Cập nhật service
Thay đổi URL trong `getTideDataFromCauCa()` thành:
```typescript
const url = 'http://localhost:3001/api/tide-data';
```

## Cách 3: Sử dụng Browser Extension (Tạm thời)

Cài đặt extension "CORS Unblock" hoặc tương tự để tắt CORS trong development.

## Kiểm tra kết quả

Khi thành công, bạn sẽ thấy:
1. Console log: "✅ Successfully parsed real tide data"
2. Bảng thủy triều với dữ liệu thực từ cau-ca.com
3. Chart vẽ dựa trên dữ liệu thực
4. Thông báo: "Dữ liệu thực từ cau-ca.com được tải thành công"

## Troubleshooting

### Lỗi CORS
```
Access to XMLHttpRequest at 'https://cau-ca.com/...' from origin 'http://localhost:4200' has been blocked by CORS policy
```
**Giải pháp:** Đảm bảo proxy config đúng và restart `ng serve`

### Lỗi 404 Not Found
```
GET http://localhost:4200/api/tide/vn/ho-chi-minh/coral-bank 404 (Not Found)
```
**Giải pháp:** Kiểm tra `proxy.conf.json` và restart `ng serve`

### Lỗi Parse HTML
```
❌ Could not extract current day tide data
```
**Giải pháp:** Kiểm tra cấu trúc HTML từ cau-ca.com có thay đổi không

## Lưu ý Production

Trong production, bạn cần:
1. Tạo backend API để proxy request
2. Hoặc sử dụng serverless function (Vercel, Netlify)
3. Không thể dùng Angular proxy trong production build