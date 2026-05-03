# 🔧 XỬ LÝ LỖI NÚT ĐĂNG KÝ KHÔNG HOẠT ĐỘNG

## ⚠️ VẤN ĐỀ

Bạn đang gặp 2 vấn đề:
1. ❌ Nút đăng ký không hoạt động
2. ❌ Không thấy bảng `users` trong Supabase Table Editor

---

## ✅ GIẢI PHÁP

### Nguyên nhân chính: **Chưa tạo tables trong Supabase**

Supabase chỉ lưu thông tin authentication (email/password), nhưng app cần thêm các bảng để lưu thông tin user, progress, settings...

---

## 🚀 BƯỚC 1: TẠO TABLES TRONG SUPABASE (5 phút)

### 1.1. Mở Supabase Dashboard

1. Truy cập: **https://supabase.com**
2. Đăng nhập
3. Chọn project: **chinese-learning-app**

### 1.2. Mở SQL Editor

1. Sidebar bên trái → Click **"SQL Editor"**
2. Click **"New query"**

### 1.3. Chạy Script tạo tất cả tables

**Copy toàn bộ đoạn SQL dưới đây**, paste vào SQL Editor, và click **"Run"**:

```sql
-- ===== TẠO TẤT CẢ TABLES =====

-- 1. Bảng users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- 2. Bảng chapters
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  book_name TEXT,
  page_range TEXT,
  vocab JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Bảng user_progress
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chapter_id TEXT REFERENCES chapters(id),
  cards_studied JSONB DEFAULT '[]'::jsonb,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_study_date DATE,
  sm2_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

-- 4. Bảng user_settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  gemini_api_key TEXT,
  auto_sync BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'vi',
  settings JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Bảng activity_log
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===== TẠO INDEXES =====

CREATE INDEX IF NOT EXISTS idx_chapters_created_by ON chapters(created_by);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_chapter ON user_progress(chapter_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

-- ===== ENABLE ROW LEVEL SECURITY =====

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ===== TẠO POLICIES =====

-- Policy: Ai cũng có thể đọc chapters
DROP POLICY IF EXISTS "Anyone can read chapters" ON chapters;
CREATE POLICY "Anyone can read chapters"
  ON chapters FOR SELECT
  USING (true);

-- Policy: Chỉ admin mới được sửa chapters
DROP POLICY IF EXISTS "Only admin can modify chapters" ON chapters;
CREATE POLICY "Only admin can modify chapters"
  ON chapters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Users chỉ được xem/sửa progress của mình
DROP POLICY IF EXISTS "Users can manage own progress" ON user_progress;
CREATE POLICY "Users can manage own progress"
  ON user_progress FOR ALL
  USING (auth.uid() = user_id);

-- Policy: Users chỉ được xem/sửa settings của mình
DROP POLICY IF EXISTS "Users can manage own settings" ON user_settings;
CREATE POLICY "Users can manage own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id);

-- Policy: Chỉ admin xem được activity log
DROP POLICY IF EXISTS "Only admin can read activity log" ON activity_log;
CREATE POLICY "Only admin can read activity log"
  ON activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Ai cũng có thể tạo activity log
DROP POLICY IF EXISTS "Anyone can create activity log" ON activity_log;
CREATE POLICY "Anyone can create activity log"
  ON activity_log FOR INSERT
  WITH CHECK (true);

-- ===== THÔNG BÁO HOÀN THÀNH =====
SELECT 'All tables created successfully!' AS status;
```

### 1.4. Kiểm tra kết quả

Sau khi chạy xong, bạn sẽ thấy:
- ✅ "Success. 1 row returned"
- ✅ Message: "All tables created successfully!"

---

## 🚀 BƯỚC 2: TẮT XÁC NHẬN EMAIL (1 phút)

### 2.1. Vào Authentication Settings

1. Sidebar → Click **"Authentication"**
2. Click **"Providers"**
3. Tìm **"Email"** → Click để mở

### 2.2. Tắt Email Confirmation

1. Tìm dòng **"Confirm email"**
2. Tắt (OFF) - để test nhanh
3. Click **"Save"**

✅ Bây giờ đăng ký sẽ không cần xác nhận email

---

## 🚀 BƯỚC 3: KIỂM TRA TABLES ĐÃ TẠO (30 giây)

### 3.1. Mở Table Editor

1. Sidebar → Click **"Table Editor"**
2. Bạn sẽ thấy 5 tables:
   - ✅ users
   - ✅ chapters
   - ✅ user_progress
   - ✅ user_settings
   - ✅ activity_log

### 3.2. Kiểm tra bảng users

1. Click vào table **"users"**
2. Bạn sẽ thấy bảng trống (chưa có user nào)
3. Có các cột: id, email, name, role, avatar_url, created_at, last_login

✅ Tables đã sẵn sàng!

---

## 🚀 BƯỚC 4: TEST ĐĂNG KÝ (1 phút)

### 4.1. Mở app

Truy cập: **https://chinese-learning-app-blush.vercel.app**

### 4.2. Mở Console để xem logs

1. Nhấn **F12** (hoặc Ctrl+Shift+I)
2. Click tab **"Console"**
3. Để Console mở

### 4.3. Thử đăng ký

1. Click **"🔐 Đăng nhập"**
2. Click **"Chưa có tài khoản? Đăng ký"**
3. Nhập:
   ```
   Tên: Test User
   Email: test@example.com
   Mật khẩu: test123456
   ```
4. Click **"Đăng ký"**

### 4.4. Xem Console logs

Trong Console, bạn sẽ thấy:

**Nếu thành công:**
```
Signup attempt: {name: "Test User", email: "test@example.com", password: "***"}
Signup response: {user: {...}, session: {...}}
✅ Đăng ký thành công! Bạn có thể đăng nhập ngay.
```

**Nếu lỗi:**
```
Signup attempt: {name: "Test User", email: "test@example.com", password: "***"}
Signup error from Supabase: {message: "...", ...}
❌ Lỗi đăng ký: [error message]
```

---

## 🚀 BƯỚC 5: KIỂM TRA USER ĐÃ TẠO (30 giây)

### 5.1. Quay lại Supabase Dashboard

1. Sidebar → **"Table Editor"**
2. Click table **"users"**

### 5.2. Xem user mới

Bạn sẽ thấy:
- ✅ 1 dòng mới với email `test@example.com`
- ✅ Có id, name, role = 'user'

### 5.3. Kiểm tra Authentication

1. Sidebar → **"Authentication"**
2. Click **"Users"**
3. Bạn sẽ thấy user `test@example.com` trong danh sách

✅ Đăng ký thành công!

---

## 🚀 BƯỚC 6: TẠO ADMIN USER (1 phút)

### 6.1. Mở SQL Editor

1. Sidebar → **"SQL Editor"**
2. Click **"New query"**

### 6.2. Tạo admin user

**Thay `YOUR_EMAIL@gmail.com` bằng email bạn muốn làm admin**, sau đó chạy:

```sql
-- Tạo admin user
INSERT INTO users (email, name, role)
VALUES ('YOUR_EMAIL@gmail.com', 'Admin', 'admin')
ON CONFLICT (email) DO UPDATE
SET role = 'admin';
```

### 6.3. Đăng ký tài khoản admin

1. Quay lại app
2. Đăng ký với email admin (email bạn vừa thay ở trên)
3. Mật khẩu tùy ý (ít nhất 6 ký tự)

### 6.4. Kiểm tra admin

Sau khi đăng nhập với tài khoản admin:
- ✅ Sidebar sẽ hiện **"🔐 Admin Panel"**
- ✅ Click vào để vào trang quản trị

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Chạy SQL script tạo tất cả tables
- [ ] Tắt email confirmation
- [ ] Kiểm tra tables trong Table Editor
- [ ] Test đăng ký tài khoản mới
- [ ] Xem Console logs
- [ ] Kiểm tra user trong Supabase
- [ ] Tạo admin user
- [ ] Test đăng nhập admin
- [ ] Vào Admin Panel

---

## 🐛 XỬ LÝ LỖI

### Lỗi 1: "relation already exists"

**Nguyên nhân:** Tables đã tồn tại

**Cách sửa:** Không sao, script đã có `IF NOT EXISTS`, bỏ qua lỗi này

### Lỗi 2: "User already registered"

**Nguyên nhân:** Email đã được đăng ký

**Cách sửa:** 
- Dùng email khác
- Hoặc đăng nhập với email đó

### Lỗi 3: Console không hiện logs

**Nguyên nhân:** Console chưa mở trước khi click đăng ký

**Cách sửa:**
1. Mở Console (F12)
2. Refresh trang (Ctrl+F5)
3. Thử đăng ký lại

### Lỗi 4: "Invalid API key"

**Nguyên nhân:** Supabase credentials sai

**Cách sửa:**
1. Kiểm tra `js/supabase-client.js`
2. Đảm bảo URL và ANON_KEY đúng
3. Không có dấu cách thừa

### Lỗi 5: Nút đăng ký vẫn không hoạt động

**Cách debug:**
1. Mở Console (F12)
2. Gõ: `SupabaseClient.isConfigured()`
3. Nếu `false` → Credentials sai
4. Nếu `true` → Gửi screenshot Console cho tôi

---

## 📊 KIỂM TRA TOÀN BỘ HỆ THỐNG

### Test 1: Guest Mode
- [ ] Mở app không đăng nhập
- [ ] Thêm flashcard
- [ ] Học bài
- [ ] Dữ liệu lưu trong localStorage

### Test 2: User Registration
- [ ] Đăng ký tài khoản mới
- [ ] Đăng nhập thành công
- [ ] Sidebar hiện thông tin user
- [ ] Có nút đăng xuất

### Test 3: Admin Account
- [ ] Đăng nhập với admin
- [ ] Sidebar hiện "Admin Panel"
- [ ] Vào Admin Panel
- [ ] Thấy danh sách users

### Test 4: Settings Page
- [ ] Click "⚙️ Cài đặt"
- [ ] Thấy 4 sections: Account, Backup, Gemini AI, Theme
- [ ] Thay đổi settings
- [ ] Lưu thành công

---

## 🎯 SAU KHI HOÀN THÀNH

Bạn sẽ có:
- ✅ Supabase database hoạt động đầy đủ
- ✅ Đăng ký/đăng nhập hoạt động
- ✅ Admin account để quản lý
- ✅ Guest mode vẫn hoạt động
- ✅ Settings page sẵn sàng

**Tiếp theo:** Tôi sẽ làm tiếp Settings Page và Admin Panel!

---

## 📞 CẦN HỖ TRỢ?

Nếu vẫn gặp lỗi:
1. Chụp ảnh Console logs (F12)
2. Chụp ảnh Supabase Table Editor
3. Gửi cho tôi kèm:
   - Bước nào bị lỗi
   - Error message trong Console
   - Screenshot

**Tôi sẽ giúp bạn fix ngay!** 🚀
