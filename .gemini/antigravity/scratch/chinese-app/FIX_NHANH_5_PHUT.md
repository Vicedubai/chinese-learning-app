# ⚡ FIX NHANH 5 PHÚT - NÚT ĐĂNG KÝ

## 🎯 MỤC TIÊU

Fix lỗi nút đăng ký không hoạt động trong 5 phút!

---

## 📋 BƯỚC 1: MỞ SUPABASE (30 giây)

1. Vào: **https://supabase.com**
2. Đăng nhập
3. Chọn project: **chinese-learning-app**
4. Sidebar → Click **"SQL Editor"**
5. Click **"New query"**

---

## 📋 BƯỚC 2: CHẠY SQL SCRIPT (2 phút)

### Copy toàn bộ đoạn này:

```sql
-- TẠO TẤT CẢ TABLES
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  gemini_api_key TEXT,
  auto_sync BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'vi',
  settings JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- TẠO INDEXES
CREATE INDEX IF NOT EXISTS idx_chapters_created_by ON chapters(created_by);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_chapter ON user_progress(chapter_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

-- ENABLE RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- TẠO POLICIES
DROP POLICY IF EXISTS "Anyone can read chapters" ON chapters;
CREATE POLICY "Anyone can read chapters" ON chapters FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admin can modify chapters" ON chapters;
CREATE POLICY "Only admin can modify chapters" ON chapters FOR ALL
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

DROP POLICY IF EXISTS "Users can manage own progress" ON user_progress;
CREATE POLICY "Users can manage own progress" ON user_progress FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own settings" ON user_settings;
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only admin can read activity log" ON activity_log;
CREATE POLICY "Only admin can read activity log" ON activity_log FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

DROP POLICY IF EXISTS "Anyone can create activity log" ON activity_log;
CREATE POLICY "Anyone can create activity log" ON activity_log FOR INSERT WITH CHECK (true);

SELECT 'SUCCESS! All tables created!' AS status;
```

### Paste vào SQL Editor và click **"Run"**

✅ Thấy: "Success. 1 row returned" → OK!

---

## 📋 BƯỚC 3: TẮT EMAIL CONFIRMATION (1 phút)

1. Sidebar → **"Authentication"**
2. Click **"Providers"**
3. Click **"Email"**
4. Tắt **"Confirm email"** (OFF)
5. Click **"Save"**

✅ Done!

---

## 📋 BƯỚC 4: KIỂM TRA TABLES (30 giây)

1. Sidebar → **"Table Editor"**
2. Bạn sẽ thấy 5 tables:
   - ✅ users
   - ✅ chapters
   - ✅ user_progress
   - ✅ user_settings
   - ✅ activity_log

✅ Perfect!

---

## 📋 BƯỚC 5: TEST ĐĂNG KÝ (1 phút)

1. Mở app: **https://chinese-learning-app-blush.vercel.app**
2. Nhấn **F12** (mở Console)
3. Click **"🔐 Đăng nhập"**
4. Click **"Chưa có tài khoản? Đăng ký"**
5. Nhập:
   ```
   Tên: Test User
   Email: test@example.com
   Mật khẩu: test123456
   ```
6. Click **"Đăng ký"**

### Kết quả mong đợi:

**Console sẽ hiện:**
```
Signup attempt: {name: "Test User", email: "test@example.com", password: "***"}
Signup response: {...}
✅ Đăng ký thành công! Bạn có thể đăng nhập ngay.
```

**Trên màn hình:**
- ✅ Thông báo "Đăng ký thành công!"
- ✅ Modal đóng lại

---

## 📋 BƯỚC 6: KIỂM TRA USER (30 giây)

1. Quay lại Supabase
2. Sidebar → **"Table Editor"**
3. Click table **"users"**
4. Bạn sẽ thấy user `test@example.com`

✅ Success!

---

## 🎉 HOÀN THÀNH!

Bây giờ bạn có thể:
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập
- ✅ Sử dụng app với user account
- ✅ Hoặc tiếp tục dùng Guest mode

---

## 🔐 TẠO ADMIN USER (BONUS)

Nếu muốn tài khoản admin:

1. Mở SQL Editor
2. Chạy (thay email của bạn):

```sql
INSERT INTO users (email, name, role)
VALUES ('YOUR_EMAIL@gmail.com', 'Admin', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';
```

3. Đăng ký với email đó trên app
4. Đăng nhập → Sẽ thấy **"🔐 Admin Panel"**

---

## 🐛 NẾU VẪN LỖI

### Lỗi: "relation already exists"
→ Bỏ qua, tables đã tồn tại rồi

### Lỗi: "User already registered"
→ Dùng email khác hoặc đăng nhập

### Lỗi: Console không hiện gì
→ Refresh trang (Ctrl+F5) và thử lại

### Lỗi khác
→ Chụp ảnh Console và gửi cho tôi!

---

## 📞 CẦN HỖ TRỢ?

Gửi cho tôi:
1. Screenshot Console (F12)
2. Screenshot Supabase Table Editor
3. Error message

**Tôi sẽ giúp ngay!** 🚀

---

## 📚 TÀI LIỆU CHI TIẾT

Nếu muốn hiểu rõ hơn:
- 📄 `XU_LY_LOI_DANG_KY.md` - Hướng dẫn chi tiết
- 📄 `TOM_TAT_TINH_HUONG.md` - Tóm tắt tình huống
- 📄 `SETUP_SUPABASE_CHI_TIET.md` - Setup từ đầu

---

**Tổng thời gian: 5 phút** ⏱️

**Làm theo từng bước và báo cáo kết quả!** ✅
