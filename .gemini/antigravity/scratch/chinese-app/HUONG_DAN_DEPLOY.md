# 🚀 HƯỚNG DẪN DEPLOY ỨNG DỤNG HỌC TIẾNG TRUNG

## 📱 Ứng dụng đã được tối ưu cho điện thoại!

✅ Giao diện tự động responsive  
✅ Menu hamburger trên mobile  
✅ Buttons full-width dễ bấm  
✅ Font size phù hợp màn hình nhỏ  
✅ Touch-friendly cho flashcards  

---

## 🎯 MỤC TIÊU

Deploy ứng dụng lên web **HOÀN TOÀN MIỄN PHÍ**, truy cập từ bất kỳ đâu:
- ✅ Frontend (HTML/CSS/JS) → **Vercel** (miễn phí)
- ✅ Backend (Python OCR) → **Railway** (miễn phí 500h/tháng)
- ✅ Database (SQLite) → Tự động lưu trên Railway

---

## ⏱️ THỜI GIAN: 20-30 PHÚT

---

## 📋 CHUẨN BỊ

### 1. Cài đặt Git
- Tải về: https://git-scm.com/download/win
- Cài đặt với các tùy chọn mặc định
- Khởi động lại terminal sau khi cài

### 2. Tạo tài khoản (MIỄN PHÍ)
- **GitHub**: https://github.com/signup
- **Vercel**: https://vercel.com/signup (đăng nhập bằng GitHub)
- **Railway**: https://railway.app (đăng nhập bằng GitHub)

---

## 🚀 BƯỚC 1: ĐẨY CODE LÊN GITHUB

### 1.1. Mở Terminal trong thư mục dự án
```bash
# Kiểm tra Git đã cài chưa
git --version
```

### 1.2. Khởi tạo Git repository
```bash
git init
git add .
git commit -m "Initial commit: Chinese learning app"
```

### 1.3. Tạo repository trên GitHub
1. Truy cập: https://github.com/new
2. **Repository name**: `chinese-learning-app` (hoặc tên bạn thích)
3. **Visibility**: Chọn **Public** (bắt buộc cho Vercel miễn phí)
4. **KHÔNG** chọn "Add README" hay "Add .gitignore"
5. Click **Create repository**

### 1.4. Đẩy code lên GitHub
```bash
# Thay YOUR_USERNAME bằng username GitHub của bạn
git remote add origin https://github.com/YOUR_USERNAME/chinese-learning-app.git
git branch -M main
git push -u origin main
```

**Lưu ý**: Nếu GitHub yêu cầu đăng nhập:
- Username: username GitHub của bạn
- Password: Dùng **Personal Access Token** (không phải password)
  - Tạo token tại: https://github.com/settings/tokens
  - Chọn: **Generate new token (classic)**
  - Scopes: Chọn **repo**
  - Copy token và dùng làm password

---

## 🌐 BƯỚC 2: DEPLOY FRONTEND LÊN VERCEL

### 2.1. Đăng nhập Vercel
1. Truy cập: https://vercel.com/login
2. Click **Continue with GitHub**
3. Cho phép Vercel truy cập GitHub

### 2.2. Import project
1. Vào Dashboard: https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Tìm repository `chinese-learning-app`
4. Click **Import**

### 2.3. Cấu hình project
- **Framework Preset**: Other (để mặc định)
- **Root Directory**: `./` (để mặc định)
- **Build Command**: Để trống
- **Output Directory**: `./` (để mặc định)
- **Install Command**: Để trống

### 2.4. Deploy
1. Click **Deploy**
2. Đợi 1-2 phút
3. Thấy 🎉 **Congratulations!** là thành công
4. Copy URL: `https://your-project.vercel.app`

### 2.5. Kiểm tra
- Mở URL vừa copy
- Ứng dụng đã chạy! (nhưng chưa có OCR vì chưa có backend)

---

## 🐍 BƯỚC 3: DEPLOY BACKEND LÊN RAILWAY

### 3.1. Tạo file cấu hình Railway

Tạo file `railway.json` trong thư mục gốc:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn ocr_server:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Tạo file `Procfile`:
```
web: uvicorn ocr_server:app --host 0.0.0.0 --port $PORT
```

### 3.2. Commit và push
```bash
git add railway.json Procfile
git commit -m "Add Railway config"
git push origin main
```

### 3.3. Deploy trên Railway
1. Truy cập: https://railway.app
2. Click **Login** → **Login with GitHub**
3. Click **New Project**
4. Chọn **Deploy from GitHub repo**
5. Chọn repository `chinese-learning-app`
6. Railway sẽ tự động:
   - Phát hiện Python
   - Cài đặt dependencies từ `requirements.txt`
   - Chạy server

### 3.4. Lấy URL backend
1. Trong Railway dashboard, click vào project
2. Click tab **Settings**
3. Scroll xuống **Networking**
4. Click **Generate Domain**
5. Copy URL: `https://your-app.railway.app`

### 3.5. Kiểm tra backend
- Mở: `https://your-app.railway.app/docs`
- Thấy FastAPI documentation là thành công!

---

## 🔗 BƯỚC 4: KẾT NỐI FRONTEND VỚI BACKEND

### 4.1. Cập nhật API URL trong code

Mở file `js/core.js`, tìm dòng:
```javascript
window.API_BASE_URL = window.API_BASE_URL || 'http://127.0.0.1:8000';
```

Đổi thành:
```javascript
window.API_BASE_URL = window.API_BASE_URL || 'https://your-app.railway.app';
```

**Thay `your-app.railway.app` bằng URL Railway của bạn!**

### 4.2. Commit và push
```bash
git add js/core.js
git commit -m "Update API endpoint to Railway"
git push origin main
```

### 4.3. Vercel tự động deploy lại
- Vercel phát hiện thay đổi trên GitHub
- Tự động deploy lại (1-2 phút)
- Vào Vercel dashboard để xem tiến trình

---

## ✅ BƯỚC 5: KIỂM TRA ỨNG DỤNG

### 5.1. Truy cập ứng dụng
Mở: `https://your-project.vercel.app`

### 5.2. Test các tính năng
- ✅ Upload PDF → OCR extract text
- ✅ Tạo vocabulary thủ công
- ✅ Flashcards
- ✅ Exercises
- ✅ Export data
- ✅ Session persistence

### 5.3. Test trên điện thoại
- Mở URL trên điện thoại
- ✅ Menu hamburger hiện ra
- ✅ Buttons dễ bấm
- ✅ Flashcards vuốt được
- ✅ Giao diện responsive

---

## 📱 TÍNH NĂNG MOBILE MỚI

### Đã thêm:
1. **Menu Hamburger** (☰) - Bấm để mở/đóng sidebar
2. **Overlay** - Bấm ngoài sidebar để đóng
3. **Full-width buttons** - Dễ bấm hơn trên mobile
4. **Responsive grids** - Tự động 1 cột trên mobile
5. **Touch-friendly** - Kích thước phù hợp cho ngón tay
6. **Font scaling** - Tự động điều chỉnh theo màn hình
7. **Optimized spacing** - Padding/margin phù hợp mobile

### Breakpoints:
- **Desktop**: > 900px (sidebar đầy đủ)
- **Tablet**: 600-900px (sidebar thu gọn)
- **Mobile**: < 600px (sidebar ẩn, menu hamburger)
- **Small mobile**: < 380px (font nhỏ hơn)

---

## 🎉 HOÀN THÀNH!

### Bạn đã có:
- ✅ Ứng dụng web chạy 24/7
- ✅ Truy cập từ bất kỳ đâu
- ✅ Hoàn toàn miễn phí
- ✅ Tự động deploy khi push code
- ✅ SSL certificate (HTTPS)
- ✅ CDN toàn cầu (Vercel)
- ✅ Backend Python với OCR
- ✅ Responsive mobile-friendly

### URLs của bạn:
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-app.railway.app`
- **API Docs**: `https://your-app.railway.app/docs`
- **GitHub**: `https://github.com/YOUR_USERNAME/chinese-learning-app`

---

## 🔄 CẬP NHẬT ỨNG DỤNG SAU NÀY

Khi bạn muốn thay đổi code:

```bash
# 1. Sửa code
# 2. Commit
git add .
git commit -m "Mô tả thay đổi"

# 3. Push
git push origin main

# 4. Vercel và Railway tự động deploy!
```

---

## 💰 CHI PHÍ

### Vercel (Frontend)
- **Miễn phí**: 100GB bandwidth/tháng
- **Đủ cho**: Hàng nghìn người dùng
- **Giới hạn**: Không có (cho hobby projects)

### Railway (Backend)
- **Miễn phí**: $5 credit/tháng (~500 giờ)
- **Đủ cho**: Chạy 24/7 cả tháng
- **Sau khi hết**: $0.000231/GB-hour (~$5/tháng nếu dùng nhiều)

### Tổng chi phí: **$0-5/tháng**

---

## 🐛 XỬ LÝ LỖI

### Lỗi: "Git not found"
```bash
# Cài Git: https://git-scm.com/download/win
# Khởi động lại terminal
```

### Lỗi: "Permission denied" khi push
```bash
# Dùng Personal Access Token thay vì password
# Tạo tại: https://github.com/settings/tokens
```

### Lỗi: Railway build failed
```bash
# Kiểm tra requirements.txt có đúng không
# Xem logs trong Railway dashboard
```

### Lỗi: API không kết nối được
```bash
# Kiểm tra URL trong js/core.js
# Kiểm tra Railway app đang chạy
# Xem logs trong Railway dashboard
```

### Lỗi: CORS error
```bash
# Backend đã có CORS config
# Nếu vẫn lỗi, kiểm tra ocr_server.py
```

---

## 📊 GIÁM SÁT

### Vercel Dashboard
- Xem số lượt truy cập
- Xem thời gian deploy
- Xem logs

### Railway Dashboard
- Xem CPU/Memory usage
- Xem logs real-time
- Xem metrics

---

## 🔒 BẢO MẬT

### Đã có:
- ✅ HTTPS (SSL certificate tự động)
- ✅ CORS configured
- ✅ Input validation
- ✅ File size limits

### Nên làm thêm:
- 🔐 Thêm authentication (nếu cần)
- 🔐 Rate limiting (nếu có nhiều người dùng)
- 🔐 Environment variables cho API keys

---

## 🎓 HỌC THÊM

### Git & GitHub
- https://git-scm.com/doc
- https://docs.github.com

### Vercel
- https://vercel.com/docs
- https://vercel.com/guides

### Railway
- https://docs.railway.app
- https://railway.app/help

---

## 💡 MẸO HAY

1. **Custom Domain**: Vercel hỗ trợ domain riêng miễn phí
2. **Environment Variables**: Dùng cho API keys
3. **Preview Deployments**: Mỗi branch có URL riêng
4. **Rollback**: Quay lại version cũ dễ dàng
5. **Analytics**: Vercel có analytics miễn phí

---

## 🆘 HỖ TRỢ

### Nếu gặp vấn đề:
1. Xem logs trong Vercel/Railway dashboard
2. Kiểm tra GitHub Actions (nếu có)
3. Google error message
4. Hỏi trên Stack Overflow
5. Xem docs của Vercel/Railway

---

## ✨ TÍNH NĂNG TIẾP THEO

Sau khi deploy thành công, bạn có thể:
- 🎨 Tùy chỉnh giao diện
- 🔊 Thêm text-to-speech
- 📊 Thêm analytics
- 👥 Thêm user authentication
- 🌍 Thêm nhiều ngôn ngữ
- 📱 Tạo PWA (Progressive Web App)

---

**Chúc bạn deploy thành công! 🚀**

Nếu có vấn đề gì, hãy kiểm tra logs và docs của từng platform.
