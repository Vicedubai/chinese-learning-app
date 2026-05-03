# 📊 HƯỚNG DẪN CHỈNH SỬA DATABASE SUPABASE

## 🎯 MỤC LỤC

1. [Tạo Tables (Bảng)](#1-tạo-tables-bảng)
2. [Thêm/Sửa/Xóa Dữ Liệu](#2-thêmsửaxóa-dữ-liệu)
3. [Tạo Admin User](#3-tạo-admin-user)
4. [Xem Dữ Liệu](#4-xem-dữ-liệu)
5. [Backup Database](#5-backup-database)
6. [Xóa Dữ Liệu](#6-xóa-dữ-liệu)

---

## 1. TẠO TABLES (BẢNG)

### Cách 1: Dùng SQL Editor (Khuyến nghị)

#### Bước 1: Mở SQL Editor
1. Vào: **https://supabase.com**
2. Đăng nhập
3. Chọn project: **chinese-learning-app**
4. Sidebar → Click **"SQL Editor"**
5. Click **"New query"**

#### Bước 2: Copy Script Tạo Tất Cả Tables

Paste đoạn này vào và click **"Run"**:

```sql
-- ===== TẠO TẤT CẢ TABLES =====

-- 1. Bảng users (Người dùng)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- 2. Bảng chapters (Chương học)
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

-- 3. Bảng user_progress (Tiến độ học)
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

-- 4. Bảng user_settings (Cài đặt)
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  gemini_api_key TEXT,
  auto_sync BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'vi',
  settings JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Bảng activity_log (Nhật ký hoạt động)
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

-- ===== TẠO POLICIES (Quyền truy cập) =====

-- Ai cũng có thể đọc chapters
DROP POLICY IF EXISTS "Anyone can read chapters" ON chapters;
CREATE POLICY "Anyone can read chapters" ON chapters FOR SELECT USING (true);

-- Chỉ admin mới được sửa chapters
DROP POLICY IF EXISTS "Only admin can modify chapters" ON chapters;
CREATE POLICY "Only admin can modify chapters" ON chapters FOR ALL
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Users chỉ được xem/sửa progress của mình
DROP POLICY IF EXISTS "Users can manage own progress" ON user_progress;
CREATE POLICY "Users can manage own progress" ON user_progress FOR ALL USING (auth.uid() = user_id);

-- Users chỉ được xem/sửa settings của mình
DROP POLICY IF EXISTS "Users can manage own settings" ON user_settings;
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- Chỉ admin xem được activity log
DROP POLICY IF EXISTS "Only admin can read activity log" ON activity_log;
CREATE POLICY "Only admin can read activity log" ON activity_log FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Ai cũng có thể tạo activity log
DROP POLICY IF EXISTS "Anyone can create activity log" ON activity_log;
CREATE POLICY "Anyone can create activity log" ON activity_log FOR INSERT WITH CHECK (true);

-- Thông báo hoàn thành
SELECT 'SUCCESS! All tables created!' AS status;
```

✅ Thấy: **"Success. 1 row returned"** → Hoàn thành!

### Cách 2: Dùng Table Editor (Tạo từng bảng)

1. Sidebar → **"Table Editor"**
2. Click **"New table"**
3. Nhập tên bảng và các cột
4. Click **"Save"**

---

## 2. THÊM/SỬA/XÓA DỮ LIỆU

### A. Dùng Table Editor (Dễ nhất)

#### Thêm dữ liệu mới:
1. Sidebar → **"Table Editor"**
2. Chọn bảng (vd: `users`)
3. Click **"Insert row"**
4. Nhập dữ liệu vào các cột
5. Click **"Save"**

#### Sửa dữ liệu:
1. Click vào dòng muốn sửa
2. Click vào ô muốn sửa
3. Nhập giá trị mới
4. Click **"Save"**

#### Xóa dữ liệu:
1. Click vào dòng muốn xóa
2. Click icon **"Delete"** (thùng rác)
3. Xác nhận xóa

### B. Dùng SQL Editor (Linh hoạt hơn)

#### Thêm dữ liệu:
```sql
-- Thêm user mới
INSERT INTO users (email, name, role)
VALUES ('user@example.com', 'User Name', 'user');

-- Thêm nhiều users cùng lúc
INSERT INTO users (email, name, role) VALUES
  ('user1@example.com', 'User 1', 'user'),
  ('user2@example.com', 'User 2', 'user'),
  ('admin@example.com', 'Admin', 'admin');
```

#### Sửa dữ liệu:
```sql
-- Sửa tên user
UPDATE users 
SET name = 'New Name'
WHERE email = 'user@example.com';

-- Sửa role thành admin
UPDATE users 
SET role = 'admin'
WHERE email = 'admin@example.com';
```

#### Xóa dữ liệu:
```sql
-- Xóa 1 user
DELETE FROM users 
WHERE email = 'user@example.com';

-- Xóa tất cả users có role = 'user'
DELETE FROM users 
WHERE role = 'user';
```

---

## 3. TẠO ADMIN USER

### Cách 1: Tạo Admin Từ User Đã Có

```sql
-- Thay email của bạn vào đây
UPDATE users 
SET role = 'admin'
WHERE email = 'YOUR_EMAIL@gmail.com';
```

### Cách 2: Tạo Admin Mới

```sql
-- Thay email của bạn
INSERT INTO users (email, name, role)
VALUES ('YOUR_EMAIL@gmail.com', 'Admin', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';
```

### Cách 3: Tạo Nhiều Admin

```sql
-- Tạo nhiều admin cùng lúc
INSERT INTO users (email, name, role) VALUES
  ('admin1@example.com', 'Admin 1', 'admin'),
  ('admin2@example.com', 'Admin 2', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';
```

---

## 4. XEM DỮ LIỆU

### A. Dùng Table Editor

1. Sidebar → **"Table Editor"**
2. Chọn bảng muốn xem
3. Xem dữ liệu dạng bảng

### B. Dùng SQL Editor

```sql
-- Xem tất cả users
SELECT * FROM users;

-- Xem chỉ admin users
SELECT * FROM users WHERE role = 'admin';

-- Xem users đã đăng nhập gần đây
SELECT * FROM users 
ORDER BY last_login DESC 
LIMIT 10;

-- Xem tổng số users
SELECT COUNT(*) as total_users FROM users;

-- Xem users và số chương họ đã học
SELECT 
  u.email,
  u.name,
  COUNT(up.chapter_id) as chapters_studied
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
GROUP BY u.id, u.email, u.name;

-- Xem activity log của 1 user
SELECT * FROM activity_log 
WHERE user_id = 'USER_ID_HERE'
ORDER BY created_at DESC;
```

---

## 5. BACKUP DATABASE

### Cách 1: Export từ Table Editor

1. Sidebar → **"Table Editor"**
2. Chọn bảng
3. Click **"..."** (menu)
4. Click **"Download as CSV"**
5. Lưu file

### Cách 2: Export toàn bộ database

1. Sidebar → **"Database"**
2. Click **"Backups"**
3. Click **"Create backup"**
4. Đợi backup hoàn thành
5. Click **"Download"** để tải về

### Cách 3: Dùng SQL để export

```sql
-- Export users sang JSON
SELECT json_agg(users) FROM users;

-- Export chapters sang JSON
SELECT json_agg(chapters) FROM chapters;
```

Copy kết quả và lưu vào file `.json`

---

## 6. XÓA DỮ LIỆU

### ⚠️ CẢNH BÁO: Xóa dữ liệu không thể hoàn tác!

### A. Xóa 1 dòng

```sql
-- Xóa 1 user
DELETE FROM users WHERE email = 'user@example.com';

-- Xóa 1 chapter
DELETE FROM chapters WHERE id = 'chapter-1';
```

### B. Xóa nhiều dòng

```sql
-- Xóa tất cả users không phải admin
DELETE FROM users WHERE role != 'admin';

-- Xóa tất cả activity logs cũ hơn 30 ngày
DELETE FROM activity_log 
WHERE created_at < NOW() - INTERVAL '30 days';
```

### C. Xóa toàn bộ bảng (NGUY HIỂM!)

```sql
-- Xóa tất cả dữ liệu trong bảng (giữ lại cấu trúc)
TRUNCATE TABLE activity_log;

-- Xóa luôn bảng (mất cấu trúc)
DROP TABLE activity_log;
```

### D. Reset toàn bộ database

```sql
-- Xóa tất cả dữ liệu nhưng giữ cấu trúc
TRUNCATE TABLE activity_log CASCADE;
TRUNCATE TABLE user_settings CASCADE;
TRUNCATE TABLE user_progress CASCADE;
TRUNCATE TABLE chapters CASCADE;
TRUNCATE TABLE users CASCADE;
```

---

## 7. CÁC THAO TÁC NÂNG CAO

### A. Thêm cột mới vào bảng

```sql
-- Thêm cột phone vào bảng users
ALTER TABLE users ADD COLUMN phone TEXT;

-- Thêm cột với giá trị mặc định
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
```

### B. Xóa cột

```sql
-- Xóa cột phone
ALTER TABLE users DROP COLUMN phone;
```

### C. Đổi tên cột

```sql
-- Đổi tên cột name thành full_name
ALTER TABLE users RENAME COLUMN name TO full_name;
```

### D. Thay đổi kiểu dữ liệu

```sql
-- Đổi kiểu dữ liệu cột
ALTER TABLE users ALTER COLUMN phone TYPE VARCHAR(20);
```

---

## 8. QUERIES HỮU ÍCH

### A. Thống kê

```sql
-- Tổng số users
SELECT COUNT(*) FROM users;

-- Số users theo role
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;

-- Top 10 users có XP cao nhất
SELECT u.email, u.name, SUM(up.xp) as total_xp
FROM users u
JOIN user_progress up ON u.id = up.user_id
GROUP BY u.id, u.email, u.name
ORDER BY total_xp DESC
LIMIT 10;

-- Số chapters đã tạo
SELECT COUNT(*) FROM chapters;

-- Activity trong 7 ngày qua
SELECT DATE(created_at) as date, COUNT(*) as activities
FROM activity_log
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### B. Tìm kiếm

```sql
-- Tìm user theo email
SELECT * FROM users WHERE email LIKE '%gmail.com%';

-- Tìm chapter theo tên
SELECT * FROM chapters WHERE name ILIKE '%bài 1%';

-- Tìm users chưa đăng nhập
SELECT * FROM users WHERE last_login IS NULL;
```

### C. Cập nhật hàng loạt

```sql
-- Reset XP của tất cả users
UPDATE user_progress SET xp = 0;

-- Đặt tất cả users thành inactive
UPDATE users SET is_active = false WHERE role = 'user';

-- Cập nhật last_login cho users chưa có
UPDATE users 
SET last_login = created_at 
WHERE last_login IS NULL;
```

---

## 9. ADMIN PANEL TRONG APP

Sau khi đăng nhập với tài khoản admin, bạn có thể:

### A. Quản lý Users
1. Vào **Admin Panel** trong app
2. Tab **"Users"**
3. Xem danh sách users
4. Sửa role, xóa users

### B. Quản lý Chapters
1. Tab **"Chapters"**
2. Thêm/sửa/xóa chapters
3. Import từ PDF
4. Export chapters

### C. Xem Activity Logs
1. Tab **"Activity"**
2. Xem hoạt động của users
3. Filter theo user, action, date

---

## 10. TROUBLESHOOTING

### Lỗi: "permission denied"

**Nguyên nhân:** RLS (Row Level Security) chặn

**Cách sửa:**
```sql
-- Tạm thời tắt RLS để test
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Nhớ bật lại sau khi xong
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### Lỗi: "relation does not exist"

**Nguyên nhân:** Bảng chưa được tạo

**Cách sửa:** Chạy lại script tạo tables ở Bước 1

### Lỗi: "duplicate key value"

**Nguyên nhân:** Đang cố thêm dữ liệu trùng (email, id...)

**Cách sửa:** Dùng `ON CONFLICT` để update thay vì insert:
```sql
INSERT INTO users (email, name, role)
VALUES ('user@example.com', 'User', 'user')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;
```

---

## 11. BEST PRACTICES

### ✅ NÊN:
- Backup database trước khi xóa dữ liệu
- Test queries trên 1 dòng trước khi chạy hàng loạt
- Dùng `WHERE` clause khi UPDATE/DELETE
- Dùng transactions cho nhiều thao tác
- Enable RLS để bảo mật

### ❌ KHÔNG NÊN:
- Xóa dữ liệu không có WHERE clause
- Tắt RLS trên production
- Lưu password dạng plain text
- Xóa bảng khi đang có dữ liệu quan trọng

---

## 📞 CẦN HỖ TRỢ?

Nếu gặp vấn đề:
1. Chụp ảnh error message
2. Cho tôi biết bạn đang làm gì
3. Gửi SQL query bạn đã chạy

**Tôi sẽ giúp ngay!** 🚀

---

## 📚 TÀI LIỆU THAM KHẢO

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)
- [SQL Cheat Sheet](https://www.sqltutorial.org/sql-cheat-sheet/)

---

**Bắt đầu với Bước 1 để tạo tables, sau đó khám phá các tính năng khác!** 🎯
