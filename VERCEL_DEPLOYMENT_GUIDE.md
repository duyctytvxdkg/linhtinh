# Hướng dẫn Deploy lên Vercel (Miễn phí)

## 🚀 Tại sao chọn Vercel?

### Vercel Free Plan
- **Bandwidth**: 100GB/tháng
- **Function executions**: 1M/tháng  
- **Build time**: Unlimited
- **Sites**: Unlimited
- **Performance**: Tốt hơn Netlify
- **CDN**: Global edge network

## 📋 Bước 1: Tạo Vercel Config

Tạo file `vercel.json` trong root project:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/linhtinhapp/browser"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*\\.(js|css|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot))",
      "headers": {
        "cache-control": "public, max-age=31536000"
      }
    },
    {
      "src": "/manifest.webmanifest",
      "headers": {
        "content-type": "application/manifest+json"
      }
    },
    {
      "src": "/ngsw-worker.js",
      "headers": {
        "cache-control": "no-cache"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 📋 Bước 2: Update package.json

Thêm build script cho Vercel:

```json
{
  "scripts": {
    "build": "ng build --configuration production",
    "vercel-build": "ng build --configuration production"
  }
}
```

## 📋 Bước 3: Deploy lên Vercel

### Cách 1: Vercel CLI (Nhanh nhất)
```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Deploy từ local
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: linhtinhapp
# - Directory: ./
# - Override settings? No
```

### Cách 2: Vercel Dashboard (Dễ nhất)
1. **Truy cập**: https://vercel.com
2. **Sign up/Login** với GitHub account
3. **Import Git Repository**
4. **Chọn repository**: linhtinhApp
5. **Configure Project**:
   - Framework Preset: `Other`
   - Build Command: `npm run build`
   - Output Directory: `dist/linhtinhapp/browser`
6. **Deploy**

## 📋 Bước 4: Cấu hình Domain (Tùy chọn)

### Custom Domain
1. **Vào Project Settings**
2. **Domains tab**
3. **Add domain**: yourdomain.com
4. **Configure DNS** theo hướng dẫn

### Vercel Subdomain
- Tự động có: `your-project.vercel.app`
- Có thể đổi tên trong settings

## 🔧 Tối ưu cho Vercel

### Environment Variables
Nếu cần API keys:
1. **Project Settings** → **Environment Variables**
2. **Add variables** cho production

### Analytics
Vercel cung cấp analytics miễn phí:
1. **Project Settings** → **Analytics**
2. **Enable Web Analytics**

## 📱 PWA Support

Vercel hỗ trợ PWA tốt:
- Service Worker hoạt động bình thường
- Manifest.json được serve đúng
- Cache headers tối ưu

## 🚀 Ưu điểm Vercel vs Netlify

| Feature | Vercel Free | Netlify Free |
|---------|-------------|--------------|
| Bandwidth | 100GB | 100GB |
| Build time | Unlimited | 300 min |
| Sites | Unlimited | 500 |
| Performance | Faster | Good |
| CDN | Global | Global |
| Analytics | Free | Paid |

## 🔄 Migration từ Netlify

1. **Backup**: Download source từ GitHub
2. **Deploy**: Lên Vercel theo hướng dẫn trên
3. **Test**: Kiểm tra tất cả features
4. **Update**: Links và bookmarks
5. **Delete**: Netlify site (nếu muốn)

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Community**: https://github.com/vercel/vercel/discussions
- **Discord**: Vercel Community Discord

---

**Lưu ý**: Vercel thường có performance tốt hơn và ít bị giới hạn hơn Netlify free plan.