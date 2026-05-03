# 🧪 HƯỚNG DẪN TEST AUTHENTICATION

## ✅ ĐÃ HOÀN THÀNH

- ✅ Supabase đã được cấu hình
- ✅ Authentication system đã được tích hợp
- ✅ UI đăng nhập/đăng ký đã sẵn sàng
- ✅ Code đã được push lên GitHub
- ✅ Vercel sẽ tự động deploy (2-3 phút)

---

## 🚀 SAU KHI VERCEL DEPLOY XONG

### Bước 1: Mở app

Truy cập: `https://chinese-learning-app.blush.vercel.app`

### Bước 2: Kiểm tra UI

Bạn sẽ thấy:
- ✅ Sidebar có nút **"🔐 Đăng nhập"**
- ✅ Text "Hoặc tiếp tục với chế độ Guest"

### Bước 3: Test Guest Mode (không đăng nhập)

1. **Không click đăng nhập**, dùng app bình thường
2. Thêm flashcard, học bài
3. Dữ liệu lưu trong localStorage (trên máy)
4. ✅ Mọi tính năng vẫn hoạt động

---

## 🔐 TEST ĐĂNG NHẬP

### Test 1: Đăng ký tài khoản mới

1. Click **"🔐 Đăng nhập"**
2. Click **"Chưa có tài khoản? Đăng ký"**
3. Nhập:
   ```
   Tên: Test User
   Email: test@example.com
   Mật khẩu: test123456
   ```
4. Click **"Đăng ký"**
5. **Kết quả mong đợi:**
   - ✅ Thông báo "Đăng ký thành công!"
   - ✅ Modal đóng lại
   - ⚠️ Supabase sẽ gửi email xác nhận (có thể bỏ qua)

### Test 2: Đăng nhập bằng tài khoản admin

1. Click **"🔐 Đăng nhập"**
2. Nhập email admin (email bạn đã setup trong Supabase)
3. Nhập mật khẩu
4. Click **"Đăng nhập"**
5. **Kết quả mong đợi:**
   - ✅ Thông báo "Chào [email]!"
   - ✅ Sidebar hiện thông tin user
   - ✅ Nút "🚪 Đăng xuất"

### Test 3: Kiểm tra thông tin user

Sau khi đăng nhập:
- ✅ Sidebar hiện avatar (👤)
- ✅ Hiện tên user
- ✅ Hiện email
- ✅ Có nút "🚪 Đăng xuất"

### Test 4: Đăng xuất

1. Click **"🚪 Đăng xuất"**
2. **Kết quả mong đợi:**
   - ✅ Thông báo "Đã đăng xuất"
   - ✅ Sidebar trở về nút "🔐 Đăng nhập"
   - ✅ Vẫn có thể dùng app (Guest mode)

---

## 🐛 XỬ LÝ LỖI

### Lỗi 1: "Supabase chưa được cấu hình"

**Nguyên nhân:** Credentials chưa đúng

**Cách sửa:**
1. Mở Console (F12)
2. Xem error message
3. Kiểm tra `js/supabase-client.js`

### Lỗi 2: "Invalid login credentials"

**Nguyên nhân:** Email/password sai

**Cách sửa:**
- Kiểm tra lại email/password
- Hoặc đăng ký tài khoản mới

### Lỗi 3: Không thấy nút đăng nhập

**Nguyên nhân:** Vercel chưa deploy xong

**Cách sửa:**
- Đợi 2-3 phút
- Refresh trang (Ctrl+F5)

### Lỗi 4: "User already registered"

**Nguyên nhân:** Email đã được đăng ký

**Cách sửa:**
- Dùng email khác
- Hoặc đăng nhập với email đó

---

## 🔍 DEBUG

### Kiểm tra Supabase connection

1. Mở Console (F12)
2. Gõ:
   ```javascript
   SupabaseClient.isConfigured()
   ```
3. Kết quả: `true` → OK

### Kiểm tra user hiện tại

```javascript
await SupabaseClient.getCurrentUser()
```

Kết quả:
- `null` → Chưa đăng nhập
- `{...}` → Đã đăng nhập, xem thông tin user

### Kiểm tra admin

```javascript
await SupabaseClient.isAdmin()
```

Kết quả:
- `true` → Là admin
- `false` → Không phải admin

---

## 📊 KIỂM TRA DATABASE

### Vào Supabase Dashboard

1. Truy cập: https://supabase.com
2. Chọn project `chinese-learning-app`
3. Sidebar → **Table Editor**

### Kiểm tra bảng users

1. Click table **"users"**
2. Bạn sẽ thấy:
   - Admin user (đã tạo từ trước)
   - Test user (vừa đăng ký)

### Kiểm tra bảng activity_log

1. Click table **"activity_log"**
2. Bạn sẽ thấy:
   - Login activities
   - Timestamps

---

## ✅ CHECKLIST TEST

- [ ] Guest mode hoạt động (không đăng nhập)
- [ ] Đăng ký tài khoản mới thành công
- [ ] Đăng nhập thành công
- [ ] Sidebar hiện thông tin user
- [ ] Đăng xuất thành công
- [ ] Supabase connection OK
- [ ] Database có dữ liệu user
- [ ] Activity log được ghi nhận

---

## 🎯 BƯỚC TIẾP THEO

Sau khi test xong, tôi sẽ tiếp tục:

### Phase 2: Settings Page (1 giờ)
- [ ] Tạo trang Settings
- [ ] Move backup/sync vào Settings
- [ ] Move Gemini config vào Settings
- [ ] Theme settings

### Phase 3: Admin Panel (2 giờ)
- [ ] Admin dashboard
- [ ] Quản lý chapters
- [ ] Quản lý users
- [ ] Statistics

### Phase 4: User Progress Sync (1 giờ)
- [ ] Sync flashcards progress
- [ ] Sync XP, streak
- [ ] Multi-device support

---

**Hãy test và cho tôi biết kết quả!** 🚀
