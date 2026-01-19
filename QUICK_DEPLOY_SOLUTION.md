# 🚨 Giải pháp nhanh cho Netlify Usage Limit

## Vấn đề hiện tại
Netlify site bị tạm dừng vì vượt quá usage limits (100GB bandwidth/tháng hoặc 300 build minutes/tháng).

## ⚡ Giải pháp nhanh nhất: Deploy lên Vercel

### Bước 1: Truy cập Vercel
1. Vào https://vercel.com
2. Sign up/Login bằng GitHub account

### Bước 2: Import Project  
1. Click **"New Project"**
2. **Import Git Repository**
3. Chọn repository **"linhtinhApp"**
4. Click **"Import"**

### Bước 3: Configure Project Settings
**QUAN TRỌNG**: Cấu hình chính xác như sau:

```
Framework Preset: Other
Build Command: npm run build
Output Directory: dist/linhtinhapp/browser  
Install Command: npm install
Root Directory: ./
```

**Hoặc nếu vẫn lỗi, thử cấu hình này:**
```
Framework Preset: Angular
Build Command: npm run build
Output Directory: dist/linhtinhapp/browser
Install Command: npm install
```

### Bước 4: Deploy
1. Click **"Deploy"**
2. Đợi 2-3 phút build xong
3. Nhận được URL: `https://your-project.vercel.app`

## 📱 Test PWA trên iPhone
1. Mở URL Vercel trên Safari iPhone
2. Tap **Share button** (⬆️)
3. Chọn **"Add to Home Screen"**
4. App sẽ hoạt động như native app

## 🔄 So sánh Plans

### Vercel Free (Khuyến nghị)
- ✅ 100GB bandwidth/tháng
- ✅ Unlimited build time
- ✅ Unlimited sites  
- ✅ Performance tốt hơn
- ✅ Analytics miễn phí

### Netlify Pro ($19/tháng)
- ✅ 1TB bandwidth/tháng
- ✅ 25,000 build minutes
- ✅ Advanced features

## 🎯 Khuyến nghị

**Chọn Vercel** vì:
1. **Miễn phí** và ít giới hạn hơn
2. **Performance tốt hơn** Netlify
3. **Unlimited build time**
4. **Setup dễ dàng** (5 phút)

## 📞 Nếu cần hỗ trợ
- Vercel docs: https://vercel.com/docs
- GitHub Issues: Tạo issue trong repo
- Email: Liên hệ qua email trong app

---
**Thời gian ước tính**: 5-10 phút để có app chạy trên Vercel

## 🔧 Troubleshooting Vercel Deploy

### Lỗi "No Output Directory named www found"

**Giải pháp 1**: Cấu hình trong Vercel Dashboard
1. Vào **Project Settings** → **General**
2. **Output Directory**: `dist/linhtinhapp/browser`
3. **Build Command**: `npm run build`
4. Click **Save** và **Redeploy**

**Giải pháp 2**: Thử Framework Preset khác
1. **Framework Preset**: `Angular` (thay vì Other)
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist/linhtinhapp/browser`

**Giải pháp 3**: Manual Override
1. Trong **Project Settings**
2. **Build & Development Settings**
3. **Override**: Enable tất cả settings
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist/linhtinhapp/browser`
6. **Install Command**: `npm install`

### Kiểm tra Build Log
Nếu vẫn lỗi:
1. Vào **Deployments** tab
2. Click vào deployment bị lỗi
3. Xem **Build Logs** để tìm lỗi cụ thể
4. Thường là do path không đúng

### Alternative: GitHub Pages (Backup)
Nếu Vercel vẫn không work:
1. Vào GitHub repository
2. **Settings** → **Pages**
3. **Source**: GitHub Actions
4. Tạo `.github/workflows/deploy.yml`

---
**Lưu ý**: Vercel có thể cần 1-2 lần thử để detect đúng Angular project structure.