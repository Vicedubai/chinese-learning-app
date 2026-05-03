# 🎯 THIẾT KẾ HỆ THỐNG USER & ADMIN

## 📋 YÊU CẦU

### 1. Admin (Bạn)
- ✅ Đăng nhập bằng tài khoản admin
- ✅ Quản lý toàn bộ database:
  - Thêm/sửa/xóa chương học
  - Thêm/sửa/xóa từ vựng
  - Xem thống kê người dùng
  - Export/Import dữ liệu hàng loạt
- ✅ Có dashboard riêng

### 2. User (Người dùng thường)
- ✅ Đăng nhập bằng email/Google
- ✅ Lưu tiến độ học cá nhân:
  - Flashcards đã học
  - Điểm XP, streak
  - Lịch sử làm bài
- ✅ Đồng bộ giữa các thiết bị

### 3. Guest (Không đăng nhập)
- ✅ Học bình thường
- ✅ Dữ liệu lưu trong localStorage
- ✅ Có thể đăng ký sau để lưu tiến độ

### 4. Settings (Cài đặt)
- ✅ Tập trung tất cả:
  - Đồng bộ
  - Backup
  - Gemini API
  - Tài khoản
  - Giao diện

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### Database Structure (Supabase)

```sql
-- Bảng users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user', -- 'admin' hoặc 'user'
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

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

-- Bảng activity_log (Cho admin xem thống kê)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_chapter ON user_progress(chapter_id);
CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users có thể đọc tất cả chapters
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
```

---

## 🎨 UI/UX DESIGN

### 1. Sidebar (Cập nhật)

```
┌─────────────────────────┐
│ 🈶 Tiếng Trung          │
│ Giáo trình tương tác    │
├─────────────────────────┤
│ 👤 [Tên User]           │ ← Hiện khi đăng nhập
│    Cấp 5 • 1250 XP      │
│    [Đăng xuất]          │
├─────────────────────────┤
│ 🏠 Trang chủ            │
│ 📚 Giáo trình           │
│ 🃏 Flashcard            │
│ 🎧 Nghe chép            │
│ ✏️ Bài tập              │
│ ✍️ Thi viết             │
│ 📊 Chẩn đoán            │
│ 🤖 Trợ lý AI            │
├─────────────────────────┤
│ ⚙️ Cài đặt              │ ← MỚI
├─────────────────────────┤
│ 🔐 Admin Panel          │ ← Chỉ admin thấy
└─────────────────────────┘
```

### 2. Settings Page (Trang cài đặt mới)

```
┌─────────────────────────────────────────┐
│ ⚙️ CÀI ĐẶT                              │
├─────────────────────────────────────────┤
│                                         │
│ 👤 TÀI KHOẢN                            │
│ ┌─────────────────────────────────────┐ │
│ │ 📧 Email: user@example.com          │ │
│ │ 🔑 [Đổi mật khẩu]                   │ │
│ │ 🚪 [Đăng xuất]                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ☁️ ĐỒNG BỘ & BACKUP                    │
│ ┌─────────────────────────────────────┐ │
│ │ ✅ Tự động đồng bộ                  │ │
│ │ 💾 [Xuất file backup]               │ │
│ │ 📥 [Nhập file backup]               │ │
│ │ 📊 Bộ nhớ: 2.5 MB / 5 MB           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 🤖 GEMINI AI                            │
│ ┌─────────────────────────────────────┐ │
│ │ 🔑 API Key: ••••••••••••            │ │
│ │ [Thay đổi]                          │ │
│ │ 📋 [Hướng dẫn lấy API Key]          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 🎨 GIAO DIỆN                            │
│ ┌─────────────────────────────────────┐ │
│ │ 🌙 Theme: [Dark ▼]                  │ │
│ │ 🌐 Ngôn ngữ: [Tiếng Việt ▼]        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 🔔 THÔNG BÁO                            │
│ ┌─────────────────────────────────────┐ │
│ │ ✅ Nhắc nhở học hàng ngày           │ │
│ │ ✅ Thông báo flashcard đến hạn      │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### 3. Admin Panel (Chỉ admin)

```
┌─────────────────────────────────────────┐
│ 🔐 ADMIN PANEL                          │
├─────────────────────────────────────────┤
│                                         │
│ 📊 THỐNG KÊ                             │
│ ┌─────────────────────────────────────┐ │
│ │ 👥 Tổng users: 125                  │ │
│ │ 📚 Tổng chapters: 45                │ │
│ │ 🃏 Tổng flashcards: 2,340           │ │
│ │ 📈 Active users (7 ngày): 87        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 📚 QUẢN LÝ CHƯƠNG                       │
│ ┌─────────────────────────────────────┐ │
│ │ [+ Thêm chương mới]                 │ │
│ │ [📤 Import từ CSV]                  │ │
│ │ [📥 Export tất cả]                  │ │
│ │                                     │ │
│ │ Bài 1: Chào hỏi [✏️] [🗑️]          │ │
│ │ Bài 2: Giới thiệu [✏️] [🗑️]        │ │
│ │ ...                                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 👥 QUẢN LÝ USERS                        │
│ ┌─────────────────────────────────────┐ │
│ │ 🔍 [Tìm kiếm user...]               │ │
│ │                                     │ │
│ │ user1@gmail.com - Cấp 5 [👁️] [🗑️]  │ │
│ │ user2@gmail.com - Cấp 3 [👁️] [🗑️]  │ │
│ │ ...                                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 📊 ACTIVITY LOG                         │
│ ┌─────────────────────────────────────┐ │
│ │ 10:30 - user1 học Bài 5             │ │
│ │ 10:25 - user2 hoàn thành 10 thẻ     │ │
│ │ 10:20 - user3 đăng ký mới           │ │
│ │ ...                                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔐 AUTHENTICATION FLOW

### 1. Guest → User

```
Guest (localStorage)
  ↓ [Đăng ký/Đăng nhập]
  ↓
Hỏi: "Bạn có muốn lưu tiến độ hiện tại?"
  ↓ [Có]
  ↓
Migrate data từ localStorage → Supabase
  ↓
User (đã đăng nhập)
```

### 2. Login Flow

```
1. Click "Đăng nhập"
2. Chọn:
   - 📧 Email/Password
   - 🔵 Google
   - 📘 Facebook (optional)
3. Đăng nhập thành công
4. Load tiến độ từ Supabase
5. Merge với localStorage (nếu có)
```

### 3. Admin Login

```
1. Đăng nhập bằng email admin
2. Check role = 'admin' trong database
3. Hiện thêm menu "🔐 Admin Panel"
4. Có quyền sửa chapters, xem users
```

---

## 📁 CẤU TRÚC FILE MỚI

```
js/
├── core.js              # Core functions
├── auth.js              # 🆕 Authentication
├── user.js              # 🆕 User management
├── admin.js             # 🆕 Admin functions
├── settings.js          # 🆕 Settings page
├── sync.js              # 🆕 Sync với Supabase
├── library.js           # Library management
├── flashcards.js        # Flashcards
├── exercises.js         # Exercises
├── dictation.js         # Dictation
├── writing.js           # Writing
├── backup.js            # Backup (cũ, giữ lại)
└── auto-sync.js         # Auto-sync (cũ, giữ lại)
```

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: Setup Supabase (1 giờ)
- [ ] Tạo Supabase project
- [ ] Tạo tables
- [ ] Setup authentication
- [ ] Test connection

### Phase 2: Authentication (2 giờ)
- [ ] Tạo `js/auth.js`
- [ ] Login/Signup UI
- [ ] Google OAuth
- [ ] Guest → User migration

### Phase 3: Settings Page (1 giờ)
- [ ] Tạo `js/settings.js`
- [ ] UI Settings page
- [ ] Move backup/sync vào Settings
- [ ] Move Gemini config vào Settings

### Phase 4: User System (2 giờ)
- [ ] Tạo `js/user.js`
- [ ] User profile
- [ ] Progress sync
- [ ] Multi-device support

### Phase 5: Admin Panel (2 giờ)
- [ ] Tạo `js/admin.js`
- [ ] Admin UI
- [ ] Chapter management
- [ ] User management
- [ ] Statistics

### Phase 6: Testing & Polish (1 giờ)
- [ ] Test tất cả flows
- [ ] Fix bugs
- [ ] Optimize performance
- [ ] Deploy

**Tổng thời gian: ~9 giờ**

---

## 💡 TÍNH NĂNG BỔ SUNG

### 1. Social Features (Tương lai)
- Leaderboard (bảng xếp hạng)
- Chia sẻ tiến độ
- Thách đấu bạn bè

### 2. Premium Features (Tương lai)
- Không giới hạn flashcards
- AI tutor cá nhân
- Offline mode nâng cao

### 3. Analytics (Cho admin)
- Biểu đồ người dùng
- Retention rate
- Most studied chapters

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Supabase setup
- [ ] Authentication working
- [ ] Settings page done
- [ ] User system working
- [ ] Admin panel working
- [ ] Guest mode working
- [ ] Data migration working
- [ ] All features in Settings
- [ ] Tested on multiple devices
- [ ] Deployed to production

---

**Bạn có muốn tôi bắt đầu implement không?**
