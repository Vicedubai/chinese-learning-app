# ⚡ DEPLOY NHANH - 15 PHÚT

## 📱 ĐÃ TỐI ỨU CHO MOBILE!
✅ Menu hamburger  
✅ Responsive design  
✅ Touch-friendly  

---

## BƯỚC 1: PUSH LÊN GITHUB (5 phút)

```bash
# Cài Git: https://git-scm.com/download/win

# Khởi tạo
git init
git add .
git commit -m "Initial commit"

# Tạo repo trên GitHub: https://github.com/new
# Tên: chinese-learning-app
# Public

# Push (thay YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/chinese-learning-app.git
git branch -M main
git push -u origin main
```

---

## BƯỚC 2: DEPLOY FRONTEND (5 phút)

1. Vào: https://vercel.com/login
2. Login with GitHub
3. **New Project** → Chọn repo `chinese-learning-app`
4. **Deploy** (giữ nguyên settings)
5. Copy URL: `https://your-project.vercel.app`

---

## BƯỚC 3: DEPLOY BACKEND (5 phút)

1. Vào: https://railway.app
2. Login with GitHub
3. **New Project** → **Deploy from GitHub**
4. Chọn repo `chinese-learning-app`
5. Đợi build xong
6. **Settings** → **Networking** → **Generate Domain**
7. Copy URL: `https://your-app.railway.app`

---

## BƯỚC 4: KẾT NỐI (2 phút)

Sửa file `js/core.js`:
```javascript
// Dòng 2: Đổi thành URL Railway của bạn
window.API_BASE_URL = window.API_BASE_URL || 'https://chinese-learning-app-production.up.railway.app';
```

Push lại:
```bash
git add js/core.js
git commit -m "Update API endpoint"
git push origin main
```

---

## ✅ XONG!

- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-app.railway.app`
- **Miễn phí**: $0-5/tháng
- **Mobile**: Responsive tự động!

---

## 📱 TEST TRÊN ĐIỆN THOẠI

1. Mở URL trên điện thoại
2. Thấy menu hamburger (☰)
3. Bấm để mở sidebar
4. Tất cả buttons dễ bấm
5. Flashcards vuốt mượt

---

## 🐛 LỖI THƯỜNG GẶP

**Git not found**: Cài Git và restart terminal  
**Permission denied**: Dùng Personal Access Token (https://github.com/settings/tokens)  
**API not working**: Kiểm tra URL trong `js/core.js`  
**Railway build failed**: Xem logs trong Railway dashboard  

---

## 🔄 CẬP NHẬT SAU NÀY

```bash
# Sửa code → Commit → Push
git add .
git commit -m "Update"
git push origin main

# Vercel & Railway tự động deploy!
```

---

**Chi tiết đầy đủ**: Xem file `HUONG_DAN_DEPLOY.md`
