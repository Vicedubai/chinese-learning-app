# 🚀 HƯỚNG DẪN SETUP SUPABASE CHI TIẾT

## 📋 CHUẨN BỊ

- Trình duyệt web
- Email (Gmail khuyến nghị)
- 10 phút

---

## BƯỚC 1: TẠO TÀI KHOẢN SUPABASE (2 phút)

### 1.1. Truy cập Supabase

Mở trình duyệt, vào: **https://supabase.com**

### 1.2. Đăng ký

1. Click **"Start your project"** hoặc **"Sign Up"**
2. Chọn **"Continue with GitHub"** (khuyến nghị)
   - Hoặc dùng email nếu không có GitHub
3. Đăng nhập GitHub và cho phép Supabase truy cập
4. Xác nhận email (nếu dùng email)

✅ **Checkpoint:** Bạn đã vào được Supabase Dashboard

---

## BƯỚC 2: TẠO PROJECT (3 phút)

### 2.1. Tạo Organization (nếu chưa có)

1. Nếu lần đầu, Supabase sẽ hỏi tạo Organization
2. Nhập tên: `My Projects` (hoặc tên bạn thích)
3. Click **"Create organization"**

### 2.2. Tạo Project mới

1. Click **"New project"**
2. Điền thông tin:

```
Organization: My Projects (chọn org vừa tạo)
Name: chinese-learning-app
Database Password: [Tạo password mạnh]
              ⚠️ LƯU LẠI PASSWORD NÀY!
Region: Southeast Asia (Singapore)
Pricing Plan: Free
```

3. Click **"Create new project"**
4. Đợi 2-3 phút để Supabase khởi tạo project

✅ **Checkpoint:** Thấy màn hình "Project is being set up..."

---

## BƯỚC 3: LẤY API CREDENTIALS (1 phút)

### 3.1. Vào Settings

1. Sau khi project khởi tạo xong
2. Sidebar bên trái → Click **"Settings"** (icon ⚙️)
3. Click **"API"**

### 3.2. Copy thông tin

Bạn sẽ thấy 2 thông tin quan trọng:

```
Project URL:
https://xxxxxxxxxxxxx.supabase.co

anon public key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

**📋 LƯU LẠI 2 THÔNG TIN NÀY!**

Tạo file `supabase-credentials.txt` và lưu:

```
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ **Checkpoint:** Đã copy được URL và anon key

---

## BƯỚC 4: TẠO DATABASE TABLES (3 phút)

### 4.1. Mở SQL Editor

1. Sidebar bên trái → Click **"SQL Editor"**
2. Click **"New query"**

### 4.2. Chạy Script 1: Tạo bảng users

Copy và paste đoạn SQL này, sau đó click **"Run"**:

```sql
-- Bảng users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Thêm admin user (thay YOUR_EMAIL bằng email của bạn)
INSERT INTO users (email, name, role)
VALUES ('YOUR_EMAIL@gmail.com', 'Admin', 'admin');
```

⚠️ **QUAN TRỌNG:** Thay `YOUR_EMAIL@gmail.com` bằng email bạn sẽ dùng để đăng nhập!

Click **"Run"** → Thấy "Success. No rows returned"

### 4.3. Chạy Script 2: Tạo bảng chapters

Tạo query mới, paste và run:

```sql
-- Bảng chapters (Admin quản lý)
CREATE TABLE chapters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  book_name TEXT,
  page_range TEXT,
  vocab JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_chapters_created_by ON chapters(created_by);
```

### 4.4. Chạy Script 3: Tạo bảng user_progress

Tạo query mới, paste và run:

```sql
-- Bảng user_progress (Tiến độ cá nhân)
CREATE TABLE user_progress (
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

-- Index
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_chapter ON user_progress(chapter_id);
```

### 4.5. Chạy Script 4: Tạo bảng user_settings

Tạo query mới, paste và run:

```sql
-- Bảng user_settings
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  gemini_api_key TEXT,
  auto_sync BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'vi',
  settings JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.6. Chạy Script 5: Tạo bảng activity_log

Tạo query mới, paste và run:

```sql
-- Bảng activity_log (Cho admin xem thống kê)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);
```

✅ **Checkpoint:** Tất cả 5 scripts chạy thành công

### 4.7. Kiểm tra tables đã tạo

1. Sidebar → Click **"Table Editor"**
2. Bạn sẽ thấy 5 tables:
   - users
   - chapters
   - user_progress
   - user_settings
   - activity_log

---

## BƯỚC 5: SETUP ROW LEVEL SECURITY (2 phút)

### 5.1. Enable RLS

Tạo query mới trong SQL Editor, paste và run:

```sql
-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
```

### 5.2. Tạo Policies

Tạo query mới, paste và run:

```sql
-- Policy: Ai cũng có thể đọc chapters
CREATE POLICY "Anyone can read chapters"
  ON chapters FOR SELECT
  USING (true);

-- Policy: Chỉ admin mới được sửa chapters
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
CREATE POLICY "Users can manage own progress"
  ON user_progress FOR ALL
  USING (auth.uid() = user_id);

-- Policy: Users chỉ được xem/sửa settings của mình
CREATE POLICY "Users can manage own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id);

-- Policy: Chỉ admin xem được activity log
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
CREATE POLICY "Anyone can create activity log"
  ON activity_log FOR INSERT
  WITH CHECK (true);
```

✅ **Checkpoint:** Tất cả policies đã được tạo

---

## BƯỚC 6: SETUP AUTHENTICATION (2 phút)

### 6.1. Enable Email Authentication

1. Sidebar → Click **"Authentication"**
2. Click **"Providers"**
3. Tìm **"Email"** → Click để mở
4. Đảm bảo **"Enable Email provider"** đã bật (ON)
5. **"Confirm email"** → Tắt (OFF) để test nhanh
   - Sau này có thể bật lại
6. Click **"Save"**

### 6.2. Enable Google OAuth (Optional)

1. Vẫn ở tab **"Providers"**
2. Tìm **"Google"** → Click để mở
3. Bật **"Enable Google provider"**
4. Cần có:
   - Google Client ID
   - Google Client Secret
   
**Tạm thời bỏ qua bước này**, chúng ta sẽ setup sau.

✅ **Checkpoint:** Email authentication đã enable

---

## BƯỚC 7: TEST CONNECTION (1 phút)

### 7.1. Test bằng SQL

Trong SQL Editor, chạy query này:

```sql
-- Test query
SELECT * FROM users;
```

Bạn sẽ thấy 1 dòng admin user đã tạo ở bước 4.2

### 7.2. Test API

Mở trình duyệt, vào URL này (thay YOUR_PROJECT_URL):

```
https://YOUR_PROJECT_URL.supabase.co/rest/v1/chapters
```

Bạn sẽ thấy: `[]` (mảng rỗng) hoặc lỗi authentication → OK!

✅ **Checkpoint:** Database hoạt động!

---

## BƯỚC 8: LƯU THÔNG TIN (1 phút)

### 8.1. Tạo file cấu hình

Tạo file `supabase-config.txt` và lưu:

```
=== SUPABASE CREDENTIALS ===

Project Name: chinese-learning-app
Project URL: https://xxxxxxxxxxxxx.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Database Password: [password bạn đã tạo]

Admin Email: YOUR_EMAIL@gmail.com

=== TABLES CREATED ===
✅ users
✅ chapters
✅ user_progress
✅ user_settings
✅ activity_log

=== AUTHENTICATION ===
✅ Email provider enabled
⏳ Google OAuth (chưa setup)

=== NEXT STEPS ===
1. Gửi file này cho developer
2. Developer sẽ integrate vào app
3. Test đăng nhập
```

### 8.2. Gửi cho tôi

Gửi cho tôi 2 thông tin:
- **SUPABASE_URL**
- **SUPABASE_ANON_KEY**

Tôi sẽ integrate vào app!

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Tạo tài khoản Supabase
- [ ] Tạo project
- [ ] Copy URL và anon key
- [ ] Tạo 5 tables (users, chapters, user_progress, user_settings, activity_log)
- [ ] Enable RLS
- [ ] Tạo policies
- [ ] Enable email authentication
- [ ] Test connection
- [ ] Lưu thông tin
- [ ] Gửi credentials cho developer

---

## 🆘 XỬ LÝ LỖI

### Lỗi: "relation already exists"

**Nguyên nhân:** Table đã tồn tại

**Cách sửa:** Bỏ qua hoặc xóa table cũ:
```sql
DROP TABLE IF EXISTS table_name CASCADE;
```

### Lỗi: "permission denied"

**Nguyên nhân:** RLS chặn

**Cách sửa:** Kiểm tra policies hoặc tạm thời disable RLS:
```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

### Lỗi: "syntax error"

**Nguyên nhân:** Copy sai SQL

**Cách sửa:** Copy lại từ đầu, đảm bảo không bị thiếu ký tự

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Chụp ảnh màn hình lỗi
2. Copy error message
3. Gửi cho tôi kèm:
   - Bước nào bị lỗi
   - Error message
   - Screenshot

---

## 🎯 SAU KHI HOÀN THÀNH

Bạn sẽ có:
- ✅ Supabase project hoạt động
- ✅ Database với 5 tables
- ✅ Authentication ready
- ✅ Admin account đã tạo
- ✅ Credentials để integrate

**Tiếp theo:** Tôi sẽ code phần frontend để kết nối với Supabase này!

---

**Bắt đầu ngay! Mất khoảng 10-15 phút.** 🚀
