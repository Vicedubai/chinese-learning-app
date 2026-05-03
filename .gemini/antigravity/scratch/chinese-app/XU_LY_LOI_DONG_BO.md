# 🔧 XỬ LÝ LỖI ĐỒNG BỘ

## ❌ Lỗi: "Lỗi đồng bộ"

### 🔍 KIỂM TRA NGUYÊN NHÂN

#### Bước 1: Kiểm tra Railway Backend

1. **Vào Railway Dashboard**: https://railway.app
2. **Chọn project `chinese-learning-app`**
3. **Kiểm tra tab Deployments**:
   - ✅ **Success** (màu xanh) → Backend đang chạy
   - ❌ **Failed** (màu đỏ) → Cần sửa lỗi build
   - ⏸️ **Sleeping** → Cần wake up

#### Bước 2: Test kết nối trực tiếp

**Cách 1: Dùng file test**
1. Mở file `test_railway_api.html` trong trình duyệt
2. Click **"1. Test Connection"**
3. Xem kết quả:
   - ✅ Xanh → Backend OK
   - ❌ Đỏ → Backend có vấn đề

**Cách 2: Dùng Console**
1. Mở app → F12 → Console
2. Gõ: `AutoSync.testConnection()`
3. Xem kết quả

**Cách 3: Truy cập trực tiếp**
- Mở: https://chinese-learning-app-production.up.railway.app
- Nếu thấy trang web → Backend OK
- Nếu lỗi 404/502 → Backend có vấn đề

---

## 🛠️ CÁCH SỬA

### Giải pháp 1: Wake up Railway (nếu đang sleep)

Railway free tier sẽ sleep sau 5 phút không dùng.

**Cách wake up:**
1. Truy cập: https://chinese-learning-app-production.up.railway.app
2. Đợi 10-20 giây để backend khởi động
3. Thử đồng bộ lại

### Giải pháp 2: Redeploy Railway

Nếu deployment failed:

1. Vào Railway → **Deployments**
2. Click vào deployment mới nhất
3. Xem **Build Logs** để tìm lỗi
4. Click **"Redeploy"** để deploy lại

### Giải pháp 3: Kiểm tra URL

1. Mở file `js/core.js`
2. Kiểm tra dòng 2:
   ```javascript
   window.API_BASE_URL = 'https://chinese-learning-app-production.up.railway.app';
   ```
3. So sánh với URL trong Railway:
   - Railway → Settings → Networking → Public Domain
4. Nếu khác → Sửa lại cho đúng

### Giải pháp 4: Tắt Auto-Sync, dùng thủ công

Nếu vẫn lỗi:

1. Click nút **🔄** để tắt auto-sync
2. Dùng **"💾 Xuất file backup"** thay thế
3. Lưu file `.json` vào Google Drive/Dropbox

---

## 🚨 LỖI THƯỜNG GẶP

### Lỗi 1: "Failed to fetch"

**Nguyên nhân:**
- Railway backend chưa deploy
- URL sai
- Mạng bị chặn

**Cách sửa:**
- Kiểm tra Railway deployment
- Kiểm tra URL trong `js/core.js`
- Thử mạng khác

### Lỗi 2: "HTTP 502 Bad Gateway"

**Nguyên nhân:**
- Backend đang khởi động (Railway cold start)
- Backend bị crash

**Cách sửa:**
- Đợi 30 giây rồi thử lại
- Kiểm tra Railway logs
- Redeploy nếu cần

### Lỗi 3: "HTTP 500 Internal Server Error"

**Nguyên nhân:**
- Lỗi code trong backend
- Database bị lỗi

**Cách sửa:**
- Xem Railway logs để tìm lỗi
- Báo lỗi cho developer

### Lỗi 4: "CORS error"

**Nguyên nhân:**
- Backend chưa cấu hình CORS

**Cách sửa:**
- Kiểm tra file `ocr_server.py` có dòng:
  ```python
  app.add_middleware(CORSMiddleware, allow_origins=["*"], ...)
  ```

---

## 💡 GIẢI PHÁP TẠM THỜI

Nếu không sửa được ngay:

### Dùng File Backup

1. **Xuất dữ liệu**:
   - Click **"💾 Xuất file backup"**
   - Lưu file `.json`

2. **Trên thiết bị khác**:
   - Kéo thả file `.json` vào app
   - Dữ liệu sẽ được import

### Dùng JSONBin (backup plan)

1. Đăng ký: https://jsonbin.io
2. Lấy API Key
3. Cấu hình trong app
4. Dùng nút "☁️ Lưu cloud" thủ công

---

## 🔍 DEBUG NÂNG CAO

### Xem logs trong Console

1. Mở app → F12 → Console
2. Xem các log:
   - `🔄 Syncing to: ...` → Đang sync
   - `✅ Sync result: ...` → Thành công
   - `❌ Sync failed: ...` → Lỗi (xem chi tiết)

### Test API thủ công

```javascript
// Trong Console (F12)

// Test sync
fetch('https://chinese-learning-app-production.up.railway.app/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chapters: [],
    cards: [],
    progress: { xp: 0 }
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);

// Test load
fetch('https://chinese-learning-app-production.up.railway.app/load')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

---

## 📞 HỖ TRỢ

Nếu vẫn không sửa được:

1. Chụp ảnh màn hình lỗi
2. Mở Console (F12) → chụp logs
3. Gửi cho developer kèm:
   - Ảnh lỗi
   - Console logs
   - Railway deployment status
