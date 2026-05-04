# 🔑 HƯỚNG DẪN LẤY YOUTUBE API KEY

## 🎯 TẠI SAO CẦN API KEY?

YouTube API Key cho phép:
- ✅ Tìm kiếm video YouTube chính xác
- ✅ Lấy thông tin video đầy đủ (tiêu đề, kênh, mô tả...)
- ✅ Không bị giới hạn như các phương pháp khác
- ✅ **MIỄN PHÍ** - 10,000 requests/ngày (đủ dùng)

---

## 📝 CÁCH LẤY API KEY (5 PHÚT)

### Bước 1: Vào Google Cloud Console

1. Mở trình duyệt
2. Vào: **https://console.cloud.google.com**
3. Đăng nhập bằng tài khoản Google

---

### Bước 2: Tạo Project

1. Click vào **"Select a project"** (góc trên bên trái)
2. Click **"NEW PROJECT"**
3. Nhập tên project: `Chinese Learning App`
4. Click **"CREATE"**
5. Đợi 10-20 giây để project được tạo

---

### Bước 3: Enable YouTube Data API v3

1. Ở menu bên trái, click **"APIs & Services"**
2. Click **"Library"**
3. Tìm kiếm: `YouTube Data API v3`
4. Click vào **"YouTube Data API v3"**
5. Click nút **"ENABLE"** (màu xanh)
6. Đợi 5-10 giây

---

### Bước 4: Tạo API Key

1. Ở menu bên trái, click **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** (góc trên)
3. Chọn **"API key"**
4. API Key sẽ được tạo và hiển thị
5. Click **"COPY"** để copy API Key
6. Click **"CLOSE"**

---

### Bước 5: (Tùy chọn) Giới hạn API Key

**Khuyến nghị:** Giới hạn API Key để bảo mật

1. Click vào API Key vừa tạo
2. Trong phần **"API restrictions"**:
   - Chọn **"Restrict key"**
   - Chọn **"YouTube Data API v3"**
3. Click **"SAVE"**

---

### Bước 6: Paste API Key vào App

1. Mở app: **https://chinese-learning-app-blush.vercel.app**
2. Vào trang **🎧 Nghe chép**
3. Nhập từ khóa tìm kiếm (vd: "học tiếng trung")
4. Nhấn Enter
5. Sẽ hiển thị form nhập API Key
6. **Paste API Key** vào ô
7. Click **"💾 Lưu"**
8. Xong! Tìm kiếm sẽ hoạt động ngay

---

## 🎬 VIDEO HƯỚNG DẪN

### YouTube:
- Tìm kiếm: "How to get YouTube API Key"
- Video ngắn 3-5 phút

### Hoặc xem ảnh:
![Google Cloud Console](https://developers.google.com/static/youtube/images/youtube-data-api-v3.png)

---

## 💡 MẸO

### 1. Lưu API Key ở đâu?
- API Key được lưu trong **localStorage** của browser
- Chỉ lưu trên máy bạn, không gửi lên server
- An toàn và bảo mật

### 2. API Key có hết hạn không?
- **Không** - API Key không hết hạn
- Trừ khi bạn xóa hoặc revoke

### 3. Giới hạn 10,000 requests/ngày là bao nhiêu?
- 1 lần tìm kiếm = 100 quota units
- 10,000 / 100 = **100 lần tìm kiếm/ngày**
- Đủ dùng cho cá nhân

### 4. Nếu vượt giới hạn?
- Đợi đến ngày hôm sau (reset lúc 00:00 UTC)
- Hoặc tạo project mới với API Key mới

---

## 🔒 BẢO MẬT

### ✅ NÊN:
- Giới hạn API Key chỉ cho YouTube Data API v3
- Không chia sẻ API Key với người khác
- Lưu API Key ở nơi an toàn

### ❌ KHÔNG NÊN:
- Đăng API Key lên GitHub public
- Chia sẻ API Key trên mạng xã hội
- Dùng API Key của người khác

---

## 🐛 TROUBLESHOOTING

### Lỗi: "API key not valid"
**Nguyên nhân:** API Key sai hoặc chưa enable YouTube API

**Cách sửa:**
1. Kiểm tra lại API Key (copy đúng chưa?)
2. Kiểm tra đã enable YouTube Data API v3 chưa?
3. Đợi 1-2 phút sau khi enable API

---

### Lỗi: "The request cannot be completed because you have exceeded your quota"
**Nguyên nhân:** Đã vượt giới hạn 10,000 requests/ngày

**Cách sửa:**
1. Đợi đến ngày hôm sau
2. Hoặc tạo project mới với API Key mới

---

### Lỗi: "Access Not Configured"
**Nguyên nhân:** Chưa enable YouTube Data API v3

**Cách sửa:**
1. Vào Google Cloud Console
2. APIs & Services → Library
3. Tìm "YouTube Data API v3"
4. Click "ENABLE"

---

## 📊 GIÁM SÁT SỬ DỤNG

### Xem quota đã dùng:

1. Vào Google Cloud Console
2. **APIs & Services** → **Dashboard**
3. Click **"YouTube Data API v3"**
4. Xem biểu đồ **"Quota usage"**

### Thông tin hiển thị:
- Số requests đã dùng hôm nay
- Số requests còn lại
- Biểu đồ theo ngày

---

## 🎉 HOÀN THÀNH!

Sau khi có API Key, bạn có thể:
- ✅ Tìm kiếm video YouTube
- ✅ Xem thông tin video đầy đủ
- ✅ Chọn video để luyện nghe chép
- ✅ Không giới hạn (trong 10,000 requests/ngày)

---

## 🔄 CẬP NHẬT API KEY

### Nếu muốn đổi API Key:

1. Vào trang **🎧 Nghe chép**
2. Mở Console (F12)
3. Gõ: `localStorage.removeItem('youtube-api-key')`
4. Nhấn Enter
5. Refresh trang (F5)
6. Nhập API Key mới

---

## 📞 HỖ TRỢ

### Nếu gặp vấn đề:

1. **Chụp ảnh màn hình** lỗi
2. **Mở Console** (F12) xem error
3. **Gửi thông tin** cho tôi:
   - Screenshot
   - Error message
   - Bước bạn đã làm

---

## 📚 TÀI LIỆU THAM KHẢO

- [YouTube Data API v3 Documentation](https://developers.google.com/youtube/v3)
- [Google Cloud Console](https://console.cloud.google.com)
- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)

---

**Chúc bạn thành công!** 🚀

---

_Cập nhật: 2025-01-XX_
_Phiên bản: 3.0_
_Tác giả: Kiro AI Assistant_
