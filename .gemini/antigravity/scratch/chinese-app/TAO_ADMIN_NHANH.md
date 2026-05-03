# 👑 TẠO ADMIN USER NHANH (2 PHÚT)

## 🎯 MỤC TIÊU

Tạo tài khoản admin để quản lý toàn bộ database và users.

---

## 📋 BƯỚC 1: TẠO TABLES (NẾU CHƯA CÓ)

### Kiểm tra xem đã có tables chưa:

1. Vào: **https://supabase.com**
2. Đăng nhập
3. Chọn project: **chinese-learning-app**
4. Sidebar → **"Table Editor"**

**Nếu thấy 5 tables này → Bỏ qua bước này:**
- ✅ users
- ✅ chapters
- ✅ user_progress
- ✅ user_settings
- ✅ activity_log

**Nếu CHƯA có tables → Làm theo:**

1. Sidebar → **"SQL Editor"**
2. Click **"New query"**
3. Copy script từ file **`FIX_NHANH_5_PHUT.md`** (BƯỚC 2)
4. Paste và click **"Run"**

---

## 📋 BƯỚC 2: TẠO ADMIN USER

### A. Mở SQL Editor

1. Sidebar → **"SQL Editor"**
2. Click **"New query"**

### B. Chạy Script Tạo Admin

**Thay `YOUR_EMAIL@gmail.com` bằng email của bạn:**

```sql
-- Tạo admin user
INSERT INTO users (email, name, role)
VALUES ('YOUR_EMAIL@gmail.com', 'Admin', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';
```

Click **"Run"** → Thấy "Success" → OK!

---

## 📋 BƯỚC 3: ĐĂNG KÝ TÀI KHOẢN TRÊN APP

### A. Mở app

Truy cập: **https://chinese-learning-app-blush.vercel.app**

### B. Đăng ký với email admin

1. Click **"🔐 Đăng nhập"**
2. Click **"Chưa có tài khoản? Đăng ký"**
3. Nhập:
   ```
   Tên: Admin
   Email: YOUR_EMAIL@gmail.com (email bạn vừa dùng ở Bước 2)
   Mật khẩu: [tạo password mạnh, ít nhất 6 ký tự]
   ```
4. Click **"Đăng ký"**

✅ Thấy: "Đăng ký thành công!"

---

## 📋 BƯỚC 4: ĐĂNG NHẬP VỚI ADMIN

1. Click **"🔐 Đăng nhập"**
2. Nhập email và password admin
3. Click **"Đăng nhập"**

### Kết quả:

✅ Sidebar hiện:
- Tên: Admin
- Email: YOUR_EMAIL@gmail.com
- Nút **"🔐 Admin Panel"** xuất hiện

---

## 📋 BƯỚC 5: VÀO ADMIN PANEL

1. Click **"🔐 Admin Panel"** trong sidebar
2. Bạn sẽ thấy:
   - **Users Tab:** Quản lý tất cả users
   - **Chapters Tab:** Quản lý chapters
   - **Activity Tab:** Xem logs
   - **Stats:** Thống kê

---

## 🎉 HOÀN THÀNH!

Bây giờ bạn có thể:

### ✅ Quản lý Users
- Xem danh sách tất cả users
- Sửa role (user → admin hoặc ngược lại)
- Xóa users
- Xem thông tin chi tiết

### ✅ Quản lý Chapters
- Thêm chapters mới
- Sửa chapters
- Xóa chapters
- Import từ PDF
- Export chapters

### ✅ Quản lý Database
- Vào Supabase Dashboard
- Dùng SQL Editor để chạy queries
- Xem/sửa/xóa dữ liệu trực tiếp

### ✅ Xem Thống Kê
- Tổng số users
- Tổng số chapters
- Activity logs
- User progress

---

## 🔐 TẠO THÊM ADMIN (OPTIONAL)

Nếu muốn tạo thêm admin khác:

### Cách 1: Dùng SQL

```sql
-- Tạo nhiều admin cùng lúc
INSERT INTO users (email, name, role) VALUES
  ('admin1@example.com', 'Admin 1', 'admin'),
  ('admin2@example.com', 'Admin 2', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';
```

### Cách 2: Dùng Admin Panel

1. Vào **Admin Panel**
2. Tab **"Users"**
3. Tìm user muốn làm admin
4. Click **"Edit"**
5. Đổi role thành **"admin"**
6. Click **"Save"**

---

## 🔄 CHUYỂN USER THÀNH ADMIN

Nếu đã có user và muốn chuyển thành admin:

```sql
-- Thay email của user
UPDATE users 
SET role = 'admin'
WHERE email = 'user@example.com';
```

---

## 🔄 CHUYỂN ADMIN THÀNH USER

Nếu muốn hạ quyền admin:

```sql
-- Thay email của admin
UPDATE users 
SET role = 'user'
WHERE email = 'admin@example.com';
```

---

## 📊 KIỂM TRA ADMIN

### Cách 1: Dùng SQL

```sql
-- Xem tất cả admin users
SELECT * FROM users WHERE role = 'admin';
```

### Cách 2: Dùng Table Editor

1. Sidebar → **"Table Editor"**
2. Click table **"users"**
3. Tìm dòng có `role = 'admin'`

### Cách 3: Dùng Admin Panel

1. Đăng nhập với admin
2. Vào **Admin Panel**
3. Tab **"Users"**
4. Filter: **"Admin only"**

---

## 🐛 XỬ LÝ LỖI

### Lỗi 1: "User already exists"

**Nguyên nhân:** Email đã được đăng ký

**Cách sửa:**
```sql
-- Chỉ cần update role
UPDATE users 
SET role = 'admin'
WHERE email = 'YOUR_EMAIL@gmail.com';
```

### Lỗi 2: Không thấy "Admin Panel"

**Nguyên nhân:** Role chưa được set đúng

**Cách sửa:**
1. Kiểm tra trong Supabase Table Editor
2. Đảm bảo `role = 'admin'`
3. Đăng xuất và đăng nhập lại

### Lỗi 3: "Permission denied"

**Nguyên nhân:** RLS policies chặn

**Cách sửa:**
```sql
-- Kiểm tra policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Hoặc tạm thời tắt RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

---

## 📞 CẦN HỖ TRỢ?

Nếu gặp vấn đề:
1. Chụp ảnh Supabase Table Editor (bảng users)
2. Chụp ảnh app (sidebar)
3. Cho tôi biết bước nào bị lỗi

**Tôi sẽ giúp ngay!** 🚀

---

## ✅ CHECKLIST

- [ ] Đã có 5 tables trong Supabase
- [ ] Chạy SQL tạo admin user
- [ ] Đăng ký trên app với email admin
- [ ] Đăng nhập thành công
- [ ] Thấy "Admin Panel" trong sidebar
- [ ] Vào được Admin Panel
- [ ] Thấy danh sách users

---

## 🎯 SAU KHI HOÀN THÀNH

Bạn có thể:
- ✅ Quản lý toàn bộ database
- ✅ Thêm/sửa/xóa users
- ✅ Quản lý chapters
- ✅ Xem activity logs
- ✅ Tạo thêm admin khác

---

**Tổng thời gian: 2 phút** ⏱️

**Làm theo từng bước và bạn sẽ có tài khoản admin!** 👑
