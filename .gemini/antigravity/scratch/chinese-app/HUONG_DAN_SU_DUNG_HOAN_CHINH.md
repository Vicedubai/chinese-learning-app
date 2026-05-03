# 📚 HƯỚNG DẪN SỬ DỤNG HOÀN CHỈNH

## ✅ ĐÃ HOÀN THÀNH

- ✅ Supabase database
- ✅ Authentication system (đăng nhập/đăng ký)
- ✅ Settings page
- ✅ Admin Panel
- ✅ Guest mode
- ✅ User management
- ✅ Activity logging

---

## 🚀 SAU KHI VERCEL DEPLOY XONG (2-3 phút)

### 1. TẠO TÀI KHOẢN ADMIN

**Bước 1: Vào Supabase Dashboard**
1. Truy cập: https://supabase.com
2. Chọn project `chinese-learning-app`
3. Sidebar → **Table Editor** → **users**

**Bước 2: Thêm admin user**
1. Click **"Insert row"** → **"Insert row"**
2. Điền:
   ```
   email: your-email@gmail.com
   name: Admin
   role: admin
   ```
3. Click **"Save"**

**Bước 3: Đăng ký tài khoản**
1. Mở app: `https://chinese-learning-app.blush.vercel.app`
2. Click **"🔐 Đăng nhập"**
3. Click **"Chưa có tài khoản? Đăng ký"**
4. Đăng ký với **email admin** (email vừa tạo ở Supabase)
5. Nhập mật khẩu
6. Click **"Đăng ký"**

**Bước 4: Đăng nhập**
1. Đăng nhập với email và mật khẩu vừa tạo
2. Bạn sẽ thấy sidebar có thêm **"🔐 Admin Panel"**

---

## 👤 CHO ADMIN (BẠN)

### Đăng nhập

1. Mở app
2. Click **"🔐 Đăng nhập"**
3. Nhập email admin và mật khẩu
4. Click **"Đăng nhập"**

### Xem Admin Panel

1. Sidebar → Click **"🔐 Admin Panel"**
2. Bạn sẽ thấy:
   - **Thống kê**: Tổng users, chapters, flashcards, active users
   - **Quản lý Users**: Danh sách tất cả users
   - **Activity Log**: Lịch sử hoạt động
   - **Quản lý Chapters**: Đồng bộ chapters lên Supabase

### Quản lý Users

**Xem danh sách users:**
- Vào Admin Panel
- Phần "👥 Quản lý Users"
- Thấy tất cả users với:
  - Avatar (👑 cho admin, 👤 cho user thường)
  - Tên và email
  - Ngày tham gia
  - Lần đăng nhập cuối

**Xem tiến độ user:**
- Click nút **👁️** bên cạnh user
- Xem chapters đã học, XP, streak, số thẻ

**Xóa user:**
- Click nút **🗑️** bên cạnh user (không thể xóa admin)
- Confirm
- User sẽ bị xóa khỏi database

### Quản lý Chapters

**Đồng bộ chapters lên Supabase:**
1. Vào Admin Panel
2. Phần "📚 Quản lý Chapters"
3. Click **"☁️ Đồng bộ Chapters lên Supabase"**
4. Tất cả chapters trong localStorage sẽ được lưu lên Supabase
5. Users khác có thể truy cập chapters này

**Thêm/sửa/xóa chapters:**
- Click **"📚 Quản lý trong Library"**
- Sẽ chuyển đến trang Library
- Quản lý chapters như bình thường

### Xem Activity Log

- Vào Admin Panel
- Phần "📊 Activity Log"
- Xem 20 hoạt động gần nhất:
  - Đăng nhập/đăng xuất
  - Học flashcard
  - Hoàn thành bài tập
  - Thêm chapter mới

---

## 👥 CHO USER THƯỜNG

### Đăng ký tài khoản

1. Mở app
2. Click **"🔐 Đăng nhập"**
3. Click **"Chưa có tài khoản? Đăng ký"**
4. Nhập:
   - Tên
   - Email
   - Mật khẩu
5. Click **"Đăng ký"**

### Đăng nhập

1. Click **"🔐 Đăng nhập"**
2. Nhập email và mật khẩu
3. Click **"Đăng nhập"**

### Học bình thường

- Tất cả tính năng như cũ
- Flashcards, bài tập, nghe chép, thi viết
- Tiến độ được lưu tự động

### Đồng bộ giữa các thiết bị

**Trên máy tính:**
1. Đăng nhập
2. Học bài, thêm flashcards
3. Tiến độ tự động lưu lên Supabase

**Trên điện thoại:**
1. Đăng nhập cùng tài khoản
2. Tiến độ tự động tải về
3. Tiếp tục học từ nơi đã dừng

### Settings

1. Sidebar → Click **"⚙️ Cài đặt"**
2. Xem thông tin tài khoản
3. Xuất/nhập file backup
4. Cấu hình Gemini AI
5. Thay đổi theme

---

## 🎮 CHO GUEST (KHÔNG ĐĂNG NHẬP)

### Học không cần đăng nhập

1. Mở app
2. Không click đăng nhập
3. Dùng tất cả tính năng bình thường
4. Dữ liệu lưu trong localStorage (trên máy)

### Chuyển từ Guest → User

1. Học một thời gian với Guest mode
2. Click **"🔐 Đăng nhập"**
3. Đăng ký tài khoản
4. Dữ liệu Guest sẽ được giữ lại
5. Từ giờ tiến độ được lưu lên Supabase

---

## ⚙️ SETTINGS PAGE

### Tài khoản

**Nếu đã đăng nhập:**
- Xem avatar, tên, email
- Nút đăng xuất

**Nếu chưa đăng nhập:**
- Thông báo "Bạn đang dùng chế độ Guest"
- Nút đăng nhập

### Đồng bộ & Backup

- **💾 Xuất file backup**: Tải file `.json` về máy
- **📥 Nhập file backup**: Import file backup
- **📊 Kiểm tra bộ nhớ**: Xem dung lượng đã dùng

### Gemini AI

- Click **"🔑 Cấu hình API Key"**
- Nhập Gemini API Key
- Dùng để sửa lỗi OCR, thêm pinyin tự động

### Giao diện

- Chọn theme: Dark hoặc Light
- (Sẽ thêm nhiều tùy chọn sau)

---

## 🔍 KIỂM TRA DATABASE

### Vào Supabase Dashboard

1. https://supabase.com
2. Chọn project `chinese-learning-app`
3. Sidebar → **Table Editor**

### Các bảng quan trọng

**users:**
- Danh sách tất cả users
- Xem role (admin/user)
- Xem last_login

**chapters:**
- Chapters đã được admin đồng bộ
- Tất cả users có thể truy cập

**user_progress:**
- Tiến độ học của từng user
- XP, streak, cards_studied

**user_settings:**
- Cài đặt cá nhân của user
- Gemini API key, theme, etc.

**activity_log:**
- Lịch sử hoạt động
- Dùng để admin xem thống kê

---

## 🐛 XỬ LÝ LỖI

### Lỗi: Không thấy Admin Panel

**Nguyên nhân:** User không phải admin

**Cách sửa:**
1. Vào Supabase → Table Editor → users
2. Tìm user của bạn
3. Sửa `role` thành `admin`
4. Đăng xuất và đăng nhập lại

### Lỗi: "Supabase chưa được cấu hình"

**Nguyên nhân:** Credentials sai

**Cách sửa:**
1. Kiểm tra `js/supabase-client.js`
2. Đảm bảo SUPABASE_URL và SUPABASE_ANON_KEY đúng

### Lỗi: Không đồng bộ được

**Nguyên nhân:** Chưa đăng nhập

**Cách sửa:**
- Đăng nhập trước khi đồng bộ
- Hoặc dùng file backup

---

## ✅ CHECKLIST HOÀN CHỈNH

### Setup
- [ ] Supabase đã setup
- [ ] Admin user đã tạo
- [ ] Đăng ký tài khoản admin
- [ ] Đăng nhập thành công

### Test Admin
- [ ] Thấy Admin Panel trong sidebar
- [ ] Xem được thống kê
- [ ] Xem được danh sách users
- [ ] Xem được activity log
- [ ] Đồng bộ chapters thành công

### Test User
- [ ] Đăng ký user mới thành công
- [ ] Đăng nhập thành công
- [ ] Học flashcard, tiến độ được lưu
- [ ] Đăng nhập trên thiết bị khác, tiến độ đồng bộ

### Test Guest
- [ ] Dùng app không cần đăng nhập
- [ ] Tất cả tính năng hoạt động
- [ ] Đăng ký sau, dữ liệu được giữ

### Test Settings
- [ ] Xem thông tin tài khoản
- [ ] Xuất/nhập backup
- [ ] Cấu hình Gemini AI
- [ ] Thay đổi theme

---

## 🎯 TÍNH NĂNG TIẾP THEO (Tùy chọn)

### Phase 4: User Progress Sync (Nếu cần)
- [ ] Sync flashcards progress real-time
- [ ] Sync XP, streak
- [ ] Conflict resolution

### Phase 5: Social Features (Tương lai)
- [ ] Leaderboard
- [ ] Chia sẻ tiến độ
- [ ] Thách đấu bạn bè

### Phase 6: Premium Features (Tương lai)
- [ ] Không giới hạn flashcards
- [ ] AI tutor cá nhân
- [ ] Offline mode nâng cao

---

**Chúc bạn sử dụng app hiệu quả!** 🎉
