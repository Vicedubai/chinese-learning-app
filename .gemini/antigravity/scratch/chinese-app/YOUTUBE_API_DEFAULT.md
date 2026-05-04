# 🔑 YOUTUBE API - CẤU HÌNH MẶC ĐỊNH

## ✅ ĐÃ CẤU HÌNH

API Key mặc định đã được cấu hình cho tất cả users:
```
AIzaSyAcr5xrIzl02jskeIeYI8Yn3vGysygbQsE
```

---

## 🎯 CÁCH HOẠT ĐỘNG

### Cho Users:
1. **Không cần setup** - Tìm kiếm hoạt động ngay
2. **Nhập từ khóa** → Nhấn Enter → Xem kết quả
3. **Click thumbnail** → Xem video
4. **Click "Chọn video"** → Load vào dictation

### Giới hạn:
- **100 lần tìm kiếm/ngày** (chia sẻ cho tất cả users)
- **10,000 quota units/ngày** (1 search = 100 units)

---

## 💡 TÙY CHỌN CHO USERS

Users có thể dùng API Key riêng nếu muốn:

### Cách 1: Click nút "🔑 API Key"
1. Sau khi tìm kiếm, click nút **"🔑 API Key"**
2. Nhập API Key riêng
3. Click **"💾 Lưu"**

### Cách 2: Mở Console
```javascript
localStorage.setItem('youtube-api-key', 'YOUR_API_KEY_HERE');
```

### Lợi ích:
- ✅ Không giới hạn (10,000 requests riêng)
- ✅ Không ảnh hưởng users khác
- ✅ Tốc độ nhanh hơn

---

## 📊 GIÁM SÁT QUOTA

### Xem quota đã dùng:
1. Vào: https://console.cloud.google.com
2. Chọn project: **Chinese Learning App**
3. **APIs & Services** → **Dashboard**
4. Click **"YouTube Data API v3"**
5. Xem biểu đồ **"Quota usage"**

### Thông tin:
- Quota hôm nay: X / 10,000
- Requests: Y lần
- Reset: 00:00 UTC mỗi ngày

---

## 🔒 BẢO MẬT

### ✅ Đã làm:
- ✅ Giới hạn API Key chỉ cho YouTube Data API v3
- ✅ Không public API Key trên GitHub (hardcode trong app)
- ✅ Users có thể dùng API Key riêng

### ⚠️ Lưu ý:
- API Key này **public** (ai cũng xem được source code)
- Nếu bị abuse, có thể bị vượt quota
- Giải pháp: Users dùng API Key riêng

---

## 🚀 NÂNG CẤP (TƯƠNG LAI)

### Option 1: Backend Proxy
```
User → Backend Server → YouTube API
```
- ✅ Ẩn API Key
- ✅ Rate limiting per user
- ✅ Analytics
- ❌ Cần server (chi phí)

### Option 2: Multiple API Keys
```javascript
const apiKeys = [
  'KEY_1',
  'KEY_2',
  'KEY_3'
];
// Rotate keys
```
- ✅ Tăng quota (30,000/ngày)
- ✅ Không cần server
- ❌ Phức tạp hơn

### Option 3: Freemium Model
```
Free: 10 searches/day (default key)
Premium: Unlimited (own key)
```
- ✅ Khuyến khích users dùng key riêng
- ✅ Giảm tải default key
- ❌ Cần UI/UX cho premium

---

## 📈 THỐNG KÊ (DỰ KIẾN)

### Giả sử:
- **100 users active/ngày**
- **Mỗi user tìm 5 lần/ngày**
- **Tổng: 500 searches/ngày**

### Quota:
- 500 searches × 100 units = **50,000 units**
- Giới hạn: **10,000 units/ngày**
- **→ Vượt quota!**

### Giải pháp:
1. **Khuyến khích users dùng API Key riêng**
2. **Thêm cache** (lưu kết quả tìm kiếm)
3. **Rate limiting** (giới hạn số lần tìm/user)
4. **Multiple API Keys** (rotate)

---

## 🐛 XỬ LÝ LỖI

### Lỗi: "Quota exceeded"
**Khi nào:** Vượt 10,000 units/ngày

**Hiển thị:**
```
⚠️ Đã vượt giới hạn tìm kiếm hôm nay
💡 Hãy dùng API Key riêng để tiếp tục
```

**Action:**
- Hiển thị form nhập API Key
- Link đến hướng dẫn
- Nút "Tìm trên YouTube" (fallback)

---

### Lỗi: "API key not valid"
**Khi nào:** API Key bị revoke/xóa

**Hiển thị:**
```
❌ API Key không hợp lệ
🔧 Vui lòng liên hệ admin
```

**Action:**
- Thông báo cho admin
- Cập nhật API Key mới
- Deploy lại

---

## 📞 LIÊN HỆ ADMIN

Nếu gặp vấn đề với API Key mặc định:
- 📧 Email: admin@example.com
- 💬 GitHub Issues
- 🐛 Bug report

---

## 🎉 KẾT LUẬN

Cấu hình API Key mặc định:
- ✅ **Dễ dùng** - Users không cần setup
- ✅ **Nhanh** - Hoạt động ngay
- ✅ **Linh hoạt** - Users có thể dùng key riêng
- ⚠️ **Giới hạn** - 100 searches/ngày (chia sẻ)

**Phù hợp cho:** MVP, testing, small user base
**Nâng cấp khi:** User base lớn, cần scale

---

_Cập nhật: 2025-01-XX_
_API Key: AIzaSyAcr5xrIzl02jskeIeYI8Yn3vGysygbQsE_
_Owner: vicedubai_
